import React, { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { useTasks } from "../../context/TaskContext";
import { tasksAPI } from "../../api/client";
import toast from "react-hot-toast";

const PRIORITIES = ["low", "medium", "high", "urgent"];
const STATUSES = ["todo", "in_progress", "done"];

const STATUS_LABELS = { todo: "To Do", in_progress: "In Progress", done: "Done" };
const PRIORITY_COLORS = {
  low: "text-emerald-400", medium: "text-blue-400",
  high: "text-orange-400", urgent: "text-red-400",
};

export default function TaskModal({ task, onClose, onSave }) {
  const { createTask, updateTask } = useTasks();
  const isEdit = Boolean(task);
  const inputRef = useRef(null);

  const [form, setForm] = useState({
    title: task?.title || "",
    description: task?.description || "",
    status: task?.status || "todo",
    priority: task?.priority || "medium",
    due_date: task?.due_date || "",
    tags: task?.tags || [],
  });
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    inputRef.current?.focus();
    if (isEdit) {
      tasksAPI.getById(task.id).then(({ data }) => setComments(data.comments || []));
    }
  }, [isEdit, task?.id]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const addTag = (e) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const tag = tagInput.trim().replace(/,/g, "").toLowerCase();
      if (!form.tags.includes(tag) && form.tags.length < 5) {
        setForm((p) => ({ ...p, tags: [...p.tags, tag] }));
      }
      setTagInput("");
    }
  };

  const removeTag = (tag) =>
    setForm((p) => ({ ...p, tags: p.tags.filter((t) => t !== tag) }));

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error("Title required");
      return;
    }
    setSaving(true);
    try {
      const data = { ...form, due_date: form.due_date || null };
      if (isEdit) {
        await updateTask(task.id, data);
        toast.success("Task updated");
      } else {
        await createTask(data);
        toast.success("Task created");
      }
      onSave?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.error || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const { data } = await tasksAPI.addComment(task.id, { content: newComment.trim() });
      setComments((p) => [...p, data.comment]);
      setNewComment("");
    } catch {
      toast.error("Failed to add comment");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-scale-in shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">
            {isEdit ? "Edit task" : "New task"}
          </h2>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs (edit mode only) */}
        {isEdit && (
          <div className="flex border-b border-[var(--border)] px-5">
            {["details", "comments"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2.5 px-1 mr-4 text-xs font-medium uppercase tracking-wider border-b-2 -mb-px transition-colors ${
                  activeTab === tab
                    ? "border-amber-500 text-amber-500"
                    : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                }`}
              >
                {tab}{tab === "comments" && comments.length > 0 && ` (${comments.length})`}
              </button>
            ))}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-5">
          {activeTab === "details" ? (
            <div className="space-y-4">
              {/* Title */}
              <div>
                <input
                  ref={inputRef}
                  name="title"
                  className="input text-base font-medium"
                  placeholder="Task title…"
                  value={form.title}
                  onChange={handleChange}
                  maxLength={200}
                />
              </div>

              {/* Description */}
              <div>
                <textarea
                  name="description"
                  className="input resize-none"
                  placeholder="Add description (optional)…"
                  rows={3}
                  value={form.description}
                  onChange={handleChange}
                />
              </div>

              {/* Status + Priority row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">
                    Status
                  </label>
                  <select
                    name="status"
                    className="input text-sm"
                    value={form.status}
                    onChange={handleChange}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">
                    Priority
                  </label>
                  <select
                    name="priority"
                    className={`input text-sm font-medium ${PRIORITY_COLORS[form.priority]}`}
                    value={form.priority}
                    onChange={handleChange}
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p} className="text-[var(--text-primary)]">
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Due date */}
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">
                  Due date
                </label>
                <input
                  name="due_date"
                  type="date"
                  className="input text-sm"
                  value={form.due_date}
                  onChange={handleChange}
                  min={format(new Date(), "yyyy-MM-dd")}
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">
                  Tags (max 5)
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {form.tags.map((tag) => (
                    <span
                      key={tag}
                      className="badge bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-secondary)] flex items-center gap-1"
                    >
                      #{tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="text-[var(--text-muted)] hover:text-red-400"
                      >×</button>
                    </span>
                  ))}
                </div>
                {form.tags.length < 5 && (
                  <input
                    className="input text-sm"
                    placeholder="Type tag and press Enter…"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={addTag}
                  />
                )}
              </div>
            </div>
          ) : (
            /* Comments tab */
            <div className="space-y-3">
              {comments.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)] text-center py-6">
                  No comments yet
                </p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="flex gap-3">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-stone-900 font-bold text-xs flex-shrink-0"
                      style={{ backgroundColor: c.avatar_color || "#f59e0b" }}
                    >
                      {c.username?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 bg-[var(--bg-secondary)] rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-[var(--text-primary)]">{c.username}</span>
                        <span className="text-xs text-[var(--text-muted)] font-display">
                          {format(new Date(c.created_at), "MMM d, h:mm a")}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--text-secondary)]">{c.content}</p>
                    </div>
                  </div>
                ))
              )}

              <div className="flex gap-2 mt-4">
                <input
                  className="input text-sm flex-1"
                  placeholder="Add comment…"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                />
                <button onClick={handleAddComment} className="btn-primary px-3">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[var(--border)]">
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving || !form.title.trim()}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving…
              </span>
            ) : (
              isEdit ? "Save changes" : "Create task"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
