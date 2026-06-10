import axios from "axios";
import React, { useEffect, useState } from "react";

const TaskPage = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingTask, setEditingTask] = useState(null);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("auth-token");

  // ✅ Fetch all tasks
  const fetchAllTasks = async () => {
    try {
      const res = await axios.get(
        "https://task-manager-app-1-e9px.onrender.com/api/tasks/",
        {
          headers: {
            "auth-token": token,
          },
        }
      );
      setTasks(res.data.tasks);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  useEffect(() => {
    fetchAllTasks();
  }, []);

  // ✅ Add task
  const handleAddTask = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(
        "https://task-manager-app-1-e9px.onrender.com/api/tasks/",
        { title, description },
        {
          headers: {
            "auth-token": token,
          },
        }
      );

      setTitle("");
      setDescription("");
      setMessage("✅ Task added successfully!");
      fetchAllTasks();

      setTimeout(() => setMessage(""), 2000);

    } catch (error) {
      console.error("Create error:", error.response?.data || error);
    }

    setLoading(false);
  };

  // ✅ Update task
  const handleUpdateTask = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put(
        `https://task-manager-app-1-e9px.onrender.com/api/tasks/${editingTask._id}`,
        { title, description },
        {
          headers: {
            "auth-token": token,
          },
        }
      );

      setTitle("");
      setDescription("");
      setEditingTask(null);
      fetchAllTasks();

    } catch (error) {
      console.error("Update error:", error.response?.data || error);
    }

    setLoading(false);
  };

  // ✅ Delete task
  const handleDeleteTask = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this task?");
    if (!confirmDelete) return;

    try {
      await axios.delete(
        `https://task-manager-app-1-e9px.onrender.com/api/tasks/${id}`,
        {
          headers: {
            "auth-token": token,
          },
        }
      );

      setMessage("🗑️ Task deleted!");
      fetchAllTasks();

      setTimeout(() => setMessage(""), 2000);

    } catch (error) {
      console.error("Delete error:", error.response?.data || error);
    }
  };

  // ✅ Edit
  const startEditing = (task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
  };

  // ✅ Logout
  const handleLogout = () => {
    localStorage.removeItem("auth-token");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">

      {/* ✅ HEADER */}
      <div className="flex justify-between items-center w-full max-w-3xl mb-6">
        <h1 className="text-4xl font-bold text-gray-800">
          Task Manager
        </h1>

        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {/* ✅ FORM */}
      <form
        onSubmit={editingTask ? handleUpdateTask : handleAddTask}
        className="bg-white shadow-md rounded-lg p-6 w-full max-w-3xl"
      >
        <input
          type="text"
          placeholder="Task title"
          className="border w-full p-2 mb-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Task description"
          className="border w-full p-2 mb-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 w-full rounded transition"
        >
          {loading
            ? "Processing..."
            : editingTask
            ? "Update Task"
            : "Add Task"}
        </button>

        {message && (
          <p className="text-green-600 mt-3 font-medium">
            {message}
          </p>
        )}
      </form>

      {/* ✅ TASK LIST */}
      <div className="w-full max-w-3xl mt-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          Your Tasks
        </h2>

        {tasks.length === 0 ? (
          <p className="text-center text-gray-500 mt-6 text-lg">
            🎉 No tasks yet. Add your first task!
          </p>
        ) : (
          tasks.map((task) => (
            <div
              key={task._id}
              className="bg-white shadow-md rounded-lg p-4 mb-3 flex justify-between items-center hover:shadow-lg transition transform hover:scale-[1.02]"
            >
              <div>
                <h3 className="font-bold text-lg text-gray-800">
                  {task.title}
                </h3>
                <p className="text-gray-600">
                  {task.description}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => startEditing(task)}
                  className="bg-yellow-400 hover:bg-yellow-500 px-3 py-1 rounded text-sm"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDeleteTask(task._id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default TaskPage;
