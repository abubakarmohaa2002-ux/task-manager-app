import express from "express";
import authRouter from "./authRoutes.js";
import taskRouter from "./taskRoutes.js";

const rootRouter = express.Router();

// ✅ auth routes
rootRouter.use("/auth", authRouter);

// ✅ task routes
rootRouter.use("/tasks", taskRouter);

export default rootRouter;

