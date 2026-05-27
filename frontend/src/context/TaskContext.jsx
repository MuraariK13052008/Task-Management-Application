import React, {
  createContext, useContext, useState, useCallback, useEffect,
} from "react";
import { tasksAPI } from "../api/client";
import { useSocket } from "../hooks/useSocket";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const TaskContext = createContext(null);

export const TaskProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({ status: "", priority: "", search: "" });

  const socket = useSocket(token);

  const fetchTasks = useCallback(async (params = {}) => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await tasksAPI.getAll(params);
      setTasks(data.tasks);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchStats = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await tasksAPI.getStats();
      setStats(data.stats);
    } catch {}
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchTasks();
      fetchStats();
    } else {
      setTasks([]);
      setStats(null);
    }
  }, [user, fetchTasks, fetchStats]);

  // Real-time socket handlers
  useEffect(() => {
    if (!socket) return;

    socket.on("task:created", (task) => {
      setTasks((prev) => [task, ...prev]);
      fetchStats();
      toast.success("New task created");
    });

    socket.on("task:updated", (task) => {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
      fetchStats();
    });

    socket.on("task:deleted", ({ id }) => {
      setTasks((prev) => prev.filter((t) => t.id !== id));
      fetchStats();
    });

    return () => {
      socket.off("task:created");
      socket.off("task:updated");
      socket.off("task:deleted");
    };
  }, [socket, fetchStats]);

  const createTask = async (taskData) => {
    const { data } = await tasksAPI.create(taskData);
    // Optimistic update handled via socket event
    return data.task;
  };

  const updateTask = async (id, taskData) => {
    const { data } = await tasksAPI.update(id, taskData);
    return data.task;
  };

  const deleteTask = async (id) => {
    await tasksAPI.delete(id);
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter.status && task.status !== filter.status) return false;
    if (filter.priority && task.priority !== filter.priority) return false;
    if (filter.search) {
      const q = filter.search.toLowerCase();
      return task.title.toLowerCase().includes(q) || task.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <TaskContext.Provider
      value={{
        tasks: filteredTasks,
        allTasks: tasks,
        stats,
        loading,
        filter,
        setFilter,
        fetchTasks,
        fetchStats,
        createTask,
        updateTask,
        deleteTask,
        socket,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error("useTasks must be used within TaskProvider");
  return ctx;
};
