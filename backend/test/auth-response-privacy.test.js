import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { once } from "node:events";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, afterEach, before, beforeEach, describe, it, mock } from "node:test";
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Use a fresh signing key and prevent dotenv from reading a developer's .env.
const testSecret = randomBytes(32).toString("hex");
const isolatedEnvironment = {
  JWT_SECRET: testSecret,
  MONGO_URI: "mongodb://127.0.0.1:1/unused_auth_privacy_test",
  NODE_ENV: "test",
  DOTENV_CONFIG_QUIET: "true",
};
const originalEnvironment = Object.fromEntries(
  Object.keys(isolatedEnvironment).map((key) => [key, process.env[key]])
);
Object.assign(process.env, isolatedEnvironment);

const originalDirectory = process.cwd();
const temporaryDirectory = await mkdtemp(join(tmpdir(), "auth-privacy-test-"));
let authRouter;
try {
  process.chdir(temporaryDirectory);
  authRouter = (await import("../routes/authRoutes.js")).default;
} finally {
  process.chdir(originalDirectory);
  await rm(temporaryDirectory, { recursive: true, force: true });
}

function assertPrivateResponse(body, password, passwordHash) {
  function inspect(value) {
    if (!value || typeof value !== "object") return;
    for (const [key, child] of Object.entries(value)) {
      assert.ok(!/password/i.test(key), "Response must not contain password fields");
      inspect(child);
    }
  }
  inspect(body);
  const serialized = JSON.stringify(body);
  assert.ok(!serialized.includes(password), "Response must not contain the password");
  assert.ok(!serialized.includes(passwordHash), "Response must not contain the stored hash");
}

describe("authentication response privacy", { concurrency: false }, () => {
  let server;
  let baseUrl;
  let users;
  let account;

  before(async () => {
    const app = express();
    app.use(express.json());
    app.use("/api/auth", authRouter);
    server = app.listen(0, "127.0.0.1");
    await once(server, "listening");
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  beforeEach(() => {
    assert.equal(User.db.readyState, 0, "Tests must not connect to a database");
    users = new Map();
    account = {
      name: "Privacy Test User",
      email: "privacy-test@example.invalid",
      password: randomBytes(24).toString("hex"),
    };

    // Stub persistence only. Exercise the real router, controller, bcrypt and JWT.
    mock.method(User, "findOne", async ({ email }) => users.get(email) ?? null);
    mock.method(User, "create", async (values) => {
      const user = new User({
        ...values,
        _id: "507f1f77bcf86cd799439011",
        createdAt: new Date("2026-01-01T00:00:00Z"),
        updatedAt: new Date("2026-01-01T00:00:00Z"),
        __v: 7,
      });
      users.set(user.email, user);
      return user;
    });
  });

  afterEach(() => mock.restoreAll());

  after(async () => {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
      server.closeAllConnections();
    });
    for (const [key, value] of Object.entries(originalEnvironment)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  async function post(path, body) {
    const response = await fetch(`${baseUrl}/api/auth/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return { status: response.status, body: await response.json() };
  }

  it("registers a user with a hashed password without returning user data", async () => {
    const result = await post("register", account);
    assert.equal(result.status, 201);
    assert.equal(result.body.message, "User created successfully");

    const stored = users.get(account.email);
    assert.ok(stored, "Registration must create a user");
    assert.ok(stored.password !== account.password, "Stored password must be hashed");
    assert.ok(await bcrypt.compare(account.password, stored.password));
    assertPrivateResponse(result.body, account.password, stored.password);
    assert.deepEqual(Object.keys(result.body), ["message"]);
  });

  it("logs in a registered user with a valid one-day JWT without returning user data", async () => {
    assert.equal((await post("register", account)).status, 201);
    const result = await post("login", {
      email: account.email,
      password: account.password,
    });
    assert.equal(result.status, 200);
    assert.equal(result.body.message, "User login successful");
    assert.equal(typeof result.body.token, "string");

    const stored = users.get(account.email);
    assertPrivateResponse(result.body, account.password, stored.password);
    assert.deepEqual(Object.keys(result.body).sort(), ["message", "token"]);

    const claims = jwt.verify(result.body.token, testSecret);
    assert.equal(claims.id, stored._id.toString());
    assert.equal(claims.exp - claims.iat, 24 * 60 * 60);
    assert.deepEqual(Object.keys(claims).sort(), ["exp", "iat", "id"]);
    assertPrivateResponse(claims, account.password, stored.password);
  });

  it("still rejects an incorrect password without issuing a token", async () => {
    assert.equal((await post("register", account)).status, 201);
    const result = await post("login", {
      email: account.email,
      password: randomBytes(24).toString("hex"),
    });
    assert.equal(result.status, 400);
    assert.equal(result.body.message, "Invalid password");
    assertPrivateResponse(result.body, account.password, users.get(account.email).password);
    assert.deepEqual(Object.keys(result.body), ["message"]);
  });
});
