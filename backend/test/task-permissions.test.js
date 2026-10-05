import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { once } from "node:events";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, beforeEach, describe, it } from "node:test";
import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import Task from "../models/Task.js";
import User from "../models/User.js";

// Never load a developer's .env or connect to an existing database.
const testSecret = randomBytes(32).toString("hex");
const isolatedEnvironment = {
  JWT_SECRET: testSecret,
  MONGO_URI: "mongodb://127.0.0.1:1/unused_task_permissions_test",
  NODE_ENV: "test",
  DOTENV_CONFIG_QUIET: "true",
  MONGOMS_DEBUG: "false",
};
const originalEnvironment = Object.fromEntries(
  Object.keys(isolatedEnvironment).map((key) => [key, process.env[key]])
);
Object.assign(process.env, isolatedEnvironment);

const originalDirectory = process.cwd();
const temporaryDirectory = await mkdtemp(join(tmpdir(), "task-permissions-test-"));
let rootRouter;
try {
  process.chdir(temporaryDirectory);
  rootRouter = (await import("../routes/index.js")).default;
} finally {
  process.chdir(originalDirectory);
  await rm(temporaryDirectory, { recursive: true, force: true });
}

describe("task permissions with real MongoDB", { concurrency: false }, () => {
  let mongo;
  let server;
  let baseUrl;
  let userA;
  let userB;

  before(async (context) => {
    assert.equal(mongoose.connection.readyState, 0);
    // This package starts an actual mongod process, not a persistence mock.
    mongo = await MongoMemoryServer.create({
      binary: { version: "8.2.6" },
      instance: {
        ip: "127.0.0.1",
        storageEngine: "wiredTiger",
        // TCP loopback is sufficient; avoid Unix sockets in restricted containers.
        args: process.platform === "win32" ? [] : ["--nounixsocket"],
      },
    });
    await mongoose.connect(mongo.getUri(), {
      dbName: `task_permissions_${randomBytes(12).toString("hex")}`,
      serverSelectionTimeoutMS: 5000,
    });
    await Promise.all([User.init(), Task.init()]);
    const { version } = await mongoose.connection.db.admin().command({ buildInfo: 1 });
    const { parsed } = await mongoose.connection.db.admin().command({ getCmdLineOpts: 1 });
    assert.equal(version, "8.2.6");
    assert.equal(parsed.storage.engine, "wiredTiger");
    context.diagnostic(`Persistence: real MongoDB ${version}, ${parsed.storage.engine}; no model mocks`);

    const app = express();
    app.use(express.json());
    // The actual root router mounts the actual auth and protected task routes.
    app.use("/api", rootRouter);
    server = app.listen(0, "127.0.0.1");
    await once(server, "listening");
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  }, { timeout: 180000 });

  beforeEach(async () => {
    await Task.deleteMany({});
    await User.deleteMany({});
    userA = await registerAndLogin("a");
    userB = await registerAndLogin("b");
  });

  after(async () => {
    try {
      if (server) {
        await new Promise((resolve, reject) => {
          server.close((error) => (error ? reject(error) : resolve()));
          server.closeAllConnections();
        });
      }
    } finally {
      try {
        await mongoose.disconnect();
      } finally {
        try {
          if (mongo) await mongo.stop();
        } finally {
          for (const [key, value] of Object.entries(originalEnvironment)) {
            if (value === undefined) delete process.env[key];
            else process.env[key] = value;
          }
        }
      }
    }
  });

  async function request(method, path, token, body) {
    const headers = {};
    if (token !== undefined) headers["auth-token"] = token;
    if (body !== undefined) headers["Content-Type"] = "application/json";
    const response = await fetch(`${baseUrl}/api${path}`, {
      method,
      headers,
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      signal: AbortSignal.timeout(5000),
    });
    return { status: response.status, body: await response.json() };
  }

  async function registerAndLogin(label) {
    const account = {
      name: `Permission User ${label.toUpperCase()}`,
      email: `permissions-${label}@example.invalid`,
      password: randomBytes(24).toString("hex"),
    };
    const registered = await request("POST", "/auth/register", undefined, account);
    assert.equal(registered.status, 201, "Fixture registration must succeed");
    assert.deepEqual(Object.keys(registered.body), ["message"]);
    const loggedIn = await request("POST", "/auth/login", undefined, {
      email: account.email,
      password: account.password,
    });
    assert.equal(loggedIn.status, 200, "Fixture login must succeed");
    assert.deepEqual(Object.keys(loggedIn.body).sort(), ["message", "token"]);
    assert.equal(typeof loggedIn.body.token, "string");
    const stored = await User.findOne({ email: account.email }).lean();
    assert.ok(stored, "Fixture user must be persisted in MongoDB");
    const claims = jwt.verify(loggedIn.body.token, testSecret);
    assert.equal(claims.id, stored._id.toString());
    return { id: stored._id.toString(), token: loggedIn.body.token };
  }

  async function createTask(user, values = {}) {
    const result = await request("POST", "/tasks", user.token, {
      title: "Original task",
      description: "Original description",
      ...values,
    });
    assert.equal(result.status, 201, "Authenticated task creation must succeed");
    assert.ok(mongoose.isValidObjectId(result.body.task._id));
    return result.body.task;
  }

  async function storedTask(id) {
    return Task.findById(id).lean();
  }

  async function taskSnapshot() {
    // Includes owner, contents, timestamps and database version to catch side effects.
    return Task.find({}).sort({ _id: 1 }).lean();
  }

  it("owner can create, list, update and delete their task with stored-data verification", async () => {
    const created = await createTask(userA, { title: "Owner task" });
    let stored = await storedTask(created._id);
    assert.ok(stored);
    assert.equal(stored.title, "Owner task");
    assert.equal(stored.description, "Original description");
    assert.equal(stored.user.toString(), userA.id);
    assert.equal(await Task.countDocuments({}), 1);

    let listed = await request("GET", "/tasks", userA.token);
    assert.equal(listed.status, 200);
    assert.deepEqual(listed.body.tasks.map((task) => task._id), [created._id]);
    assert.equal(listed.body.tasks[0].title, stored.title);
    assert.equal(listed.body.tasks[0].description, stored.description);
    assert.equal(listed.body.tasks[0].user, userA.id);

    const updated = await request("PUT", `/tasks/${created._id}`, userA.token, {
      title: "Updated title",
      description: "Updated description",
    });
    assert.equal(updated.status, 200);
    assert.equal(updated.body.updatedTask._id, created._id);
    stored = await storedTask(created._id);
    assert.equal(stored.title, "Updated title");
    assert.equal(stored.description, "Updated description");
    assert.equal(stored.user.toString(), userA.id);
    listed = await request("GET", "/tasks", userA.token);
    assert.equal(listed.status, 200);
    assert.equal(listed.body.tasks[0].title, "Updated title");
    assert.equal(listed.body.tasks[0].description, "Updated description");

    const deleted = await request("DELETE", `/tasks/${created._id}`, userA.token);
    assert.equal(deleted.status, 200);
    assert.equal(await storedTask(created._id), null);
    assert.equal(await Task.countDocuments({}), 0);
    listed = await request("GET", "/tasks", userA.token);
    assert.equal(listed.status, 200);
    assert.deepEqual(listed.body.tasks, []);
  });

  it("two users only list their own tasks", async () => {
    const aTasks = [
      await createTask(userA, { title: "A first" }),
      await createTask(userA, { title: "A second" }),
    ];
    const bTask = await createTask(userB, { title: "B only" });
    const beforeList = await taskSnapshot();
    for (const [user, expected] of [[userA, aTasks], [userB, [bTask]]]) {
      const result = await request("GET", "/tasks", user.token);
      assert.equal(result.status, 200);
      assert.deepEqual(
        result.body.tasks.map((task) => task._id).sort(),
        expected.map((task) => task._id).sort()
      );
      assert.ok(result.body.tasks.every((task) => task.user === user.id));
    }
    assert.equal(await Task.countDocuments({ user: userA.id }), 2);
    assert.equal(await Task.countDocuments({ user: userB.id }), 1);
    assert.deepEqual(await taskSnapshot(), beforeList);
  });

  for (const method of ["PUT", "DELETE"]) {
    it(`user B cannot ${method} user A's task; denied request leaves stored data unchanged`, async () => {
      const task = await createTask(userA);
      const beforeAttempt = await taskSnapshot();
      const result = await request(method, `/tasks/${task._id}`, userB.token,
        method === "PUT" ? { title: "Unauthorized change", description: "Unauthorized change" } : undefined);
      assert.equal(result.status, 404);
      assert.deepEqual(result.body, { message: "Task not found" });
      assert.deepEqual(await taskSnapshot(), beforeAttempt);
      const listed = await request("GET", "/tasks", userA.token);
      assert.equal(listed.status, 200);
      assert.deepEqual(listed.body.tasks.map((item) => item._id), [task._id]);
    });
  }

  const rejectedTokens = {
    missing: () => undefined,
    malformed: () => "not-a-jwt",
    "invalid signature": () => jwt.sign({ id: userA.id }, randomBytes(32), { expiresIn: "1d" }),
    expired: () => jwt.sign({ id: userA.id }, testSecret, { expiresIn: -60 }),
  };
  for (const [label, getToken] of Object.entries(rejectedTokens)) {
    for (const method of ["POST", "GET", "PUT", "DELETE"]) {
      it(`${label} token cannot authorize ${method} tasks; stored data remains unchanged`, async () => {
        const task = await createTask(userA);
        const beforeAttempt = await taskSnapshot();
        const token = getToken();
        if (label === "expired") {
          assert.throws(() => jwt.verify(token, testSecret), { name: "TokenExpiredError" });
        } else if (label === "invalid signature") {
          assert.throws(() => jwt.verify(token, testSecret), { name: "JsonWebTokenError", message: "invalid signature" });
        }
        const path = ["PUT", "DELETE"].includes(method) ? `/tasks/${task._id}` : "/tasks";
        const body = ["POST", "PUT"].includes(method)
          ? { title: "Unauthorized change", description: "Unauthorized change" }
          : undefined;
        const result = await request(method, path, token, body);
        assert.equal(result.status, 401);
        assert.deepEqual(result.body, {
          message: label === "missing" ? "No token, authorization denied" : "Invalid token",
        });
        assert.ok(!("tasks" in result.body), "Denied list requests must not return task data");
        assert.deepEqual(await taskSnapshot(), beforeAttempt);
      });
    }
  }

  it("creating with another user's ownership field stores the authenticated owner", async () => {
    const created = await createTask(userA, { user: userB.id });
    assert.equal(created.user, userA.id);
    const stored = await storedTask(created._id);
    assert.equal(stored.user.toString(), userA.id);
    assert.equal(await Task.countDocuments({}), 1);
    const bList = await request("GET", "/tasks", userB.token);
    assert.equal(bList.status, 200);
    assert.deepEqual(bList.body.tasks, []);
  });

  it("updating with another user's ownership field changes allowed contents without transferring ownership", async () => {
    const task = await createTask(userA);
    const result = await request("PUT", `/tasks/${task._id}`, userA.token, {
      title: "Allowed update",
      description: "Allowed description",
      user: userB.id,
    });
    assert.equal(result.status, 200);
    assert.equal(result.body.updatedTask.user, userA.id);
    const stored = await storedTask(task._id);
    assert.equal(stored.user.toString(), userA.id);
    assert.equal(stored.title, "Allowed update");
    assert.equal(stored.description, "Allowed description");
    assert.equal(await Task.countDocuments({}), 1);
    const aList = await request("GET", "/tasks", userA.token);
    const bList = await request("GET", "/tasks", userB.token);
    assert.equal(aList.status, 200);
    assert.deepEqual(aList.body.tasks.map((item) => item._id), [task._id]);
    assert.equal(bList.status, 200);
    assert.deepEqual(bList.body.tasks, []);
    assert.equal((await request("DELETE", `/tasks/${task._id}`, userB.token)).status, 404);
    assert.deepEqual(await storedTask(task._id), stored);
  });
});
