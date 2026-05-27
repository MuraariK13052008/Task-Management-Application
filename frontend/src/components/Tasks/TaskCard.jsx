import React, { useState } from "react";
import { format, isAfter, parseISO, isToday } from "date-fns";
import { useTasks } from "../../context/TaskContext";
import toast from "react-hot-toast";

const PRIORITY_CONFIG = {
  low:    { label: "Low",    color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  medium: { label: "Med",    color: "text-blue-400",    bg: "bg-blue-500/10 border-blue-500/20" },
  high:   { label: "High",   color: "text-orange-400",  bg: "bg-orange-500/10 border-orange-500/20" },
  urgent: { label: "URGENT", color: "text-red-400",     bg: "bg-red-500/10 border-red-500/20" },
};

const STATUS_CONFIG = {
  todo:        { label: "To Do",       color: "text-[var(--text-muted)]",   dot: "bg-[var(--text-muted)]" },
  in_progress: { label: "In Progress", color: "text-blue-400",              dot: "bg-blue-400" },
  done:        { label: "Done",        color: "text-emerald-400",           dot: "bg-emerald-400" },
};

export default function TaskCard({ task, onClick }) {
  const { updateTask, deleteTask } = useTasks();
  const [deleting, setDeleting] = useState(false);

  const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const status = STATUS_CONFIG[task.status] || STATUS_CONFIG.todo;

  const isOverdue =
    task.due_date &&
    task.status !== "done" &&
    isAfter(new Date(), parseISO(task.due_date));

  const isDueToday =
    task.due_date && isToday(parseISO(task.due_date)) && task.status !== "done";

  const handleStatusCycle = async (e) => {
    e.stopPropagation();
    const cycle = { todo: "in_progress", in_progress: "done", done: "todo" };
    const next = cycle[task.status];
    try {
      await updateTask(task.id, { status: next });
      toast.success(`→ ${STATUS_CONFIG[next].label}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    setDeleting(true);
    try {
      await deleteTask(task.id);
      toast.success("Task deleted");
    } catch {
      toast.error("Failed to delete task");
      setDeleting(false);
    }
  };

  return (
    <div
      onClick={onClick}
      className={`card p-4 cursor-pointer hover:border-[var(--border-light)] hover:bg-[var(--bg-hover)] transition-all duration-150 group task-card-enter ${
        deleting ? "opacity-50 pointer-events-none" : ""
      } ${task.priority === "urgent" ? "border-red-500/20" : ""}`}
    >
      {/* Header row */}
      <div className="flex items-start gap-3">
        {/* Status toggle */}
        <button
          onClick={handleStatusCycle}
          title="Cycle status"
          className="mt-0.5 flex-shrink-0 transition-transform hover:scale-110 active:scale-95"
        >
          <div
            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
              task.status === "done"
                ? "bg-emerald-500 border-emerald-500"
                : task.status === "in_progress"
                ? "border-blue-400"
                : "border-[var(--border-light)]"
            }`}
          >
            {task.status === "done" && (
              <svg className="w-2.5 h-2.5 text-stone-900" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </button>

        {/* Title & description */}
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-medium leading-snug ${
              task.status === "done"
                ? "line-through text-[var(--text-muted)]"
                : "text-[var(--text-primary)]"
            }`}
          >
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          )}
        </div>

        {/* Delete button */}
        <button
          onClick={handleDelete}
          className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-red-400 transition-all p-0.5 flex-shrink-0"
          title="Delete task"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Footer row */}
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        {/* Priority badge */}
        <span className={`badge border ${priority.bg} ${priority.color}`}>
          {priority.label}
        </span>

        {/* Tags */}
        {task.tags?.slice(0, 2).map((tag) => (
          <span key={tag} className="badge bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border)]">
            #{tag}
          </span>
        ))}
        {task.tags?.length > 2 && (
          <span className="text-xs text-[var(--text-muted)]">+{task.tags.length - 2}</span>
        )}

        {/* Due date */}
        {task.due_date && (
          <span
            className={`ml-auto text-xs font-display flex items-center gap-1 ${
              isOverdue ? "text-red-400" : isDueToday ? "text-amber-400" : "text-[var(--text-muted)]"
            }`}
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {isOverdue ? "overdue" : isDueToday ? "today" : format(parseISO(task.due_date), "MMM d")}
          </span>
        )}
      </div>
    </div>
  );
}
