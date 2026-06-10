import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createTaskController,
  updateTaskController,
  deleteTaskController,
  getAllTaskController
} from "../controllers/taskController.js";

const taskRouter = express.Router();

// ✅ CREATE TASK
taskRouter.post("/", authMiddleware, createTaskController);

// ✅ GET ALL TASKS
taskRouter.get("/", authMiddleware, getAllTaskController);

// ✅ UPDATE TASK
taskRouter.put("/:id", authMiddleware, updateTaskController);

// ✅ DELETE TASK
taskRouter.delete("/:id", authMiddleware, deleteTaskController);

export default taskRouter;