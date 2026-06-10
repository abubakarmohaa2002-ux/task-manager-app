import Task from "../models/Task.js";


/* ================= CREATE TASK ================= */
export const createTaskController = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const task = await Task.create({
      title,
      description,
      user: req.user.id,
    });

    res.status(201).json({
      message: "Task created successfully",
      task,
    });

  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};


/* ================= UPDATE TASK ================= */
export const updateTaskController = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.title = title || task.title;
    task.description = description || task.description;

    const updatedTask = await task.save();

    res.status(200).json({
      message: "Task updated successfully",
      updatedTask,
    });

  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};


/* ================= DELETE TASK ================= */
export const deleteTaskController = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    await task.deleteOne();

    res.status(200).json({
      message: "Task deleted successfully",
    });

  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};


/* ================= GET ALL TASKS ================= */
export const getAllTaskController = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id });

    res.status(200).json({
      message: "Tasks fetched successfully",
      tasks,
    });

  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};