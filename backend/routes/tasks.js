const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { statements } = require("../db/database");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// All task routes require authentication
router.use(authenticate);

// GET /api/tasks - Get all tasks for user
router.get("/", (req, res) => {
  try {
    const { status, priority, search } = req.query;
    let tasks = statements.getTasksByUser.all(req.user.id);

    // Parse tags from JSON string
    tasks = tasks.map((t) => ({ ...t, tags: JSON.parse(t.tags || "[]") }));

    // Apply filters
    if (status) tasks = tasks.filter((t) => t.status === status);
    if (priority) tasks = tasks.filter((t) => t.priority === priority);
    if (search) {
      const q = search.toLowerCase();
      tasks = tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }

    res.json({ tasks });
  } catch (err) {
    console.error("Get tasks error:", err);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

// GET /api/tasks/stats - Dashboard stats
router.get("/stats", (req, res) => {
  try {
    const stats = statements.getTaskStats.get(req.user.id);
    res.json({ stats });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// GET /api/tasks/:id - Get single task
router.get("/:id", (req, res) => {
  try {
    const task = statements.getTaskById.get(req.params.id, req.user.id);
    if (!task) return res.status(404).json({ error: "Task not found" });

    const comments = statements.getComments.all(task.id);
    res.json({ task: { ...task, tags: JSON.parse(task.tags || "[]") }, comments });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch task" });
  }
});

// POST /api/tasks - Create task
router.post("/", (req, res) => {
  try {
    const { title, description, status, priority, due_date, tags } = req.body;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({ error: "Task title is required" });
    }

    if (title.length > 200) {
      return res.status(400).json({ error: "Title too long (max 200 chars)" });
    }

    const taskId = uuidv4();
    const taskTags = Array.isArray(tags) ? JSON.stringify(tags) : "[]";

    statements.createTask.run(
      taskId,
      title.trim(),
      description || "",
      status || "todo",
      priority || "medium",
      due_date || null,
      taskTags,
      req.user.id
    );

    const task = statements.getTaskById.get(taskId, req.user.id);
    const fullTask = { ...task, tags: JSON.parse(task.tags || "[]") };

    // Emit socket event
    req.io?.to(req.user.id).emit("task:created", fullTask);

    res.status(201).json({ task: fullTask, message: "Task created" });
  } catch (err) {
    console.error("Create task error:", err);
    res.status(500).json({ error: "Failed to create task" });
  }
});

// PUT /api/tasks/:id - Update task
router.put("/:id", (req, res) => {
  try {
    const existing = statements.getTaskById.get(req.params.id, req.user.id);
    if (!existing) return res.status(404).json({ error: "Task not found" });

    const { title, description, status, priority, due_date, tags } = req.body;

    if (title !== undefined && title.trim().length === 0) {
      return res.status(400).json({ error: "Title cannot be empty" });
    }

    const updatedTitle = title?.trim() || existing.title;
    const taskTags = Array.isArray(tags) ? JSON.stringify(tags) : existing.tags;

    statements.updateTask.run(
      updatedTitle,
      description ?? existing.description,
      status || existing.status,
      priority || existing.priority,
      due_date !== undefined ? due_date : existing.due_date,
      taskTags,
      req.params.id,
      req.user.id
    );

    const task = statements.getTaskById.get(req.params.id, req.user.id);
    const fullTask = { ...task, tags: JSON.parse(task.tags || "[]") };

    // Emit socket event
    req.io?.to(req.user.id).emit("task:updated", fullTask);

    res.json({ task: fullTask, message: "Task updated" });
  } catch (err) {
    console.error("Update task error:", err);
    res.status(500).json({ error: "Failed to update task" });
  }
});

// DELETE /api/tasks/:id - Delete task
router.delete("/:id", (req, res) => {
  try {
    const existing = statements.getTaskById.get(req.params.id, req.user.id);
    if (!existing) return res.status(404).json({ error: "Task not found" });

    statements.deleteTask.run(req.params.id, req.user.id);

    // Emit socket event
    req.io?.to(req.user.id).emit("task:deleted", { id: req.params.id });

    res.json({ message: "Task deleted", id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete task" });
  }
});

// POST /api/tasks/:id/comments - Add comment
router.post("/:id/comments", (req, res) => {
  try {
    const task = statements.getTaskById.get(req.params.id, req.user.id);
    if (!task) return res.status(404).json({ error: "Task not found" });

    const { content } = req.body;
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: "Comment content required" });
    }

    const commentId = uuidv4();
    statements.addComment.run(commentId, req.params.id, req.user.id, content.trim());

    const comments = statements.getComments.all(req.params.id);
    const newComment = comments.find((c) => c.id === commentId);

    req.io?.to(req.user.id).emit("comment:added", { taskId: req.params.id, comment: newComment });

    res.status(201).json({ comment: newComment });
  } catch (err) {
    res.status(500).json({ error: "Failed to add comment" });
  }
});

module.exports = router;
