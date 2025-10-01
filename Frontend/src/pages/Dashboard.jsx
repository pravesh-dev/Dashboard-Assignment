import { useContext, useEffect, useState } from "react";
import api from "../utils/api";
import { AuthContext } from "../context/AuthContext";
import { FaEdit, FaTrash, FaRegSquare, FaCheckSquare } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ title: "", description: "" });
  const [loading, setLoading] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("recents");

  // Fetch tasks on mount
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await api.get("/auth/tasks");
        setTasks(res.data);
      } catch (err) {
        if (err.response?.status === 401) {
          logout(); // Session expired or user is not logged in
        }
      }
    };

    fetchTasks();
  }, []);

  // Add or Update task
  const addTask = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setLoading(true);
    try {
      if (editingTaskId) {
        const res = await api.put(`/auth/tasks/${editingTaskId}`, form);
        setTasks(
          tasks.map((task) => (task._id === editingTaskId ? res.data : task))
        );
        setEditingTaskId(null);
      } else {
        const res = await api.post("/auth/tasks", form);
        setTasks([...tasks, res.data]);
      }
      setForm({ title: "", description: "" });
    } catch (err) {
      console.error("Error adding/updating task:", err);
      if (err.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  // Toggle complete status of a task
  const toggleTask = async (id, isCompleted) => {
    try {
      const res = await api.put(`/auth/tasks/${id}`, {
        isCompleted: !isCompleted,
      });
      setTasks(tasks.map((t) => (t._id === id ? res.data : t)));
    } catch (err) {
      console.error("Error toggling task:", err);
      if (err.response?.status === 401) {
        logout();
      }
    }
  };

  // Set form for editing a task
  const editTask = (task) => {
    setForm({ title: task.title, description: task.description || "" });
    setEditingTaskId(task._id);
  };

  // Delete task
  const deleteTask = async (id) => {
    try {
      await api.delete(`/auth/tasks/${id}`);
      setTasks(tasks.filter((task) => task._id !== id));
    } catch (err) {
      console.error("Error deleting task:", err);
      if (err.response?.status === 401) {
        logout();
      }
    }
  };

  // Filter tasks based on the current filter state
  const filteredTasks = tasks.filter((task) => {
    if (filter === "completed") {
      return task.isCompleted;
    }
    if (filter === "incomplete") {
      return !task.isCompleted;
    }
    return true; // "all" filter
  });

  const searchedTasks = filteredTasks.filter(
    (task) =>
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.description?.toLowerCase().includes(search.toLowerCase())
  );

  // Apply sorting based on creation time from _id
  const sortedTasks = [...searchedTasks].sort((a, b) => {
    const getTimestampFromId = (id) => {
      // MongoDB ObjectId's first 4 bytes represent the creation timestamp
      // Convert hex string to integer, then to milliseconds
      return new Date(parseInt(id.substring(0, 8), 16) * 1000).getTime();
    };

    const timeA = getTimestampFromId(a._id);
    const timeB = getTimestampFromId(b._id);

    if (sortBy === "recents") {
      return timeB - timeA; // Newest first
    } else {
      return timeA - timeB; // Oldest first
    }
  });

  return (
    <div>
      <div className="flex justify-between items-center w-full border-b border-white/20 h-16 px-2 sm:px-6">
        <div className="flex flex-col leading-[0.70rem]">
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-[#405858] to-[#4000a0] text-transparent bg-clip-text">
            Dashboard
          </h1>
          <h2 className="text-base leading-[0.70rem] text-gray-300">
            Welcome{" "}
            <span className="capitalize font-semibold text-purple-300">
              {user.username}
            </span>
          </h2>
        </div>
        <Link
          to="/profile"
          className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold text-gray-300"
        >
          {user.username ? user.username.charAt(0).toUpperCase() : "U"}
        </Link>
      </div>

      <div className="w-full flex px-2 sm:px-6 flex-col sm:flex-row">
        {/* Add Task */}
        <form
          className="flex flex-col gap-3 w-full sm:w-[40%] lg:w-[28%] h-max mt-10 py-5 xs:py-10 sm:py-6 md:py-14 px-3 xs:px-10 sm:px-1 md:px-5 mr-6 bg-[#0b0e12] border border-white/20"
          onSubmit={addTask}
        >
          <h1 className="text-lg font-semibold self-center text-white mb-4">
            Add new task here
          </h1>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Enter title"
            className="border px-2 py-2 text-white placeholder:text-white/60 border-none outline-none bg-[#05070A]"
            required
          />
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Description (optional)"
            className="w-full h-40 px-2 py-1 text-white placeholder:text-white/60 border-none outline-none bg-[#05070A] resize-none"
          ></textarea>
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 transition-colors text-white cursor-pointer px-3 py-2 mt-2 disabled:opacity-50"
          >
            {loading
              ? editingTaskId
                ? "Updating..."
                : "Adding..."
              : editingTaskId
              ? "Update Task"
              : "Add Task"}
          </button>
        </form>

        <div className="border-none sm:border-l py-10 px-1 sm:px-5 md:px-10 border-white/20 w-full sm:w-[60%] lg:w-[72%] h-[42.5rem] overflow-auto">
          {/* New div for search input and sort dropdown */}
          <div className="flex justify-between items-center mb-4">
            <div className="w-3/4 mr-4">
              {" "}
              {/* Div for search input */}
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tasks..."
                className="w-full px-3 py-2 bg-[#05070A] text-white placeholder:text-white/60 border border-white/20 rounded-md outline-none"
              />
            </div>
            <div className="w-1/4 bg-[#05070A] px-3 border border-white/20 rounded-md ">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full py-2 text-xs md:text-base text-white bg-[#05070A] border-none outline-none"
              >
                <option value="recents">Recents</option>
                <option value="oldests">Oldests</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded-sm text-xs ${
                filter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              } transition-colors`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("incomplete")}
              className={`px-3 py-1 rounded-sm text-xs ${
                filter === "incomplete"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              } transition-colors`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter("completed")}
              className={`px-3 py-1 rounded-sm text-xs ${
                filter === "completed"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              } transition-colors`}
            >
              Completed
            </button>
          </div>

          {sortedTasks.length === 0 && (
            <p className="text-gray-500 mt-2 text-center">
              {filter === "all" && "No tasks yet. Add one!"}
              {filter === "incomplete" && "No active tasks."}
              {filter === "completed" && "No completed tasks."}
            </p>
          )}

          {/* Task List */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedTasks.map((task) => (
              <div
                key={task._id}
                className="flex flex-col justify-between border border-white/20 p-2 sm:p-4 bg-[#0b0e12] rounded-md relative"
              >
                <button
                  onClick={() => toggleTask(task._id, task.isCompleted)}
                  className="cursor-pointer text-xs sm:text-base absolute top-1 right-1"
                  aria-label={
                    task.isCompleted ? "Mark as incomplete" : "Mark as complete"
                  }
                >
                  {task.isCompleted ? (
                    <FaCheckSquare className="text-green-600" />
                  ) : (
                    <FaRegSquare className="text-green-700" />
                  )}
                </button>
                <span
                  className={`text-sm sm:text-lg font-medium ${
                    task.isCompleted
                      ? "line-through text-gray-500"
                      : "text-white"
                  }`}
                >
                  {task.title}
                </span>
                {task.description && (
                  <p
                    className={`text-xs sm:text-sm mt-2 ${
                      task.isCompleted
                        ? "line-through text-gray-600"
                        : "text-gray-300"
                    }`}
                  >
                    {task.description}
                  </p>
                )}

                <div className="flex justify-end items-center gap-3 mt-2">
                  <button
                    onClick={() => editTask(task)}
                    className="text-blue-500 text-xs sm:text-base cursor-pointer rounded-md hover:text-blue-700 transition-colors flex items-center justify-center"
                    aria-label="Edit task"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => deleteTask(task._id)}
                    className="text-red-500 text-xs sm:text-base cursor-pointer self-end rounded-md hover:text-red-800 transition-colors flex items-center justify-center"
                    aria-label="Delete task"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
