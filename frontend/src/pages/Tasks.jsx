import React, { useState } from "react";
import { useTasks } from "../context/TaskContext";
import { useDebounce } from "../hooks/useDebounce";
import TaskCard from "../components/Tasks/TaskCard";
import TaskModal from "../components/Tasks/TaskModal";

const STATUSES = [
  { key: "todo",        label: "To Do",       dot: "bg-[var(--text-muted)]" },
  { key: "in_progress", label: "In Progress", dot: "bg-blue-400" },
  { key: "done",        label: "Done",        dot: "bg-emerald-400" },
];

const PRIORITIES = ["low", "medium", "high", "urgent"];

const PRIORITY_COLORS = {
  low: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  medium: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  high: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  urgent: "text-red-400 bg-red-500/10 border-red-500/20",
};

export default function Tasks() {
  const { tasks, loading, filter, setFilter } = useTasks();
  const [showCreate, setShowCreate] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [viewMode, setViewMode] = useState("kanban"); // 'kanban' | 'list'

  const debouncedSearch = useDebounce(searchInput, 300);

  // Apply debounced search to filter
  React.useEffect(() => {
    setFilter((p) => ({ ...p, search: debouncedSearch }));
  }, [debouncedSearch, setFilter]);

  const getColumnTasks = (status) =>
    tasks.filter((t) => t.status === status);

  const clearFilters = () => {
    setFilter({ status: "", priority: "", search: "" });
    setSearchInput("");
  };

  const hasFilters = filter.status || filter.priority || filter.search;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">My Tasks</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            {tasks.length} task{tasks.length !== 1 ? "s" : ""}
            {hasFilters ? " (filtered)" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-0.5">
            {["kanban", "list"].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-md text-xs transition-all ${
                  viewMode === mode
                    ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm"
                    : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                }`}
              >
                {mode === "kanban" ? (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                )}
              </button>
            ))}
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New task
          </button>
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap gap-2 mb-6">
        {/* Search */}
        <div className="relative flex-1 min-w-48 max-w-64">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            className="input pl-8 text-sm"
            placeholder="Search tasks…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        {/* Priority filter */}
        <select
          className="input text-sm w-auto"
          value={filter.priority}
          onChange={(e) => setFilter((p) => ({ ...p, priority: e.target.value }))}
        >
          <option value="">All priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
          ))}
        </select>

        {/* Clear filters */}
        {hasFilters && (
          <button onClick={clearFilters} className="btn-ghost text-xs">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear
          </button>
        )}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, col) => (
            <div key={col} className="space-y-2">
              <div className="h-4 w-24 bg-[var(--bg-card)] rounded animate-pulse mb-3" />
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card p-4 animate-pulse">
                  <div className="h-3 bg-[var(--bg-hover)] rounded w-3/4 mb-2" />
                  <div className="h-2 bg-[var(--bg-hover)] rounded w-1/2" />
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Kanban view */}
      {!loading && viewMode === "kanban" && (
        <div className="grid md:grid-cols-3 gap-4">
          {STATUSES.map((col) => {
            const colTasks = getColumnTasks(col.key);
            return (
              <div key={col.key} className="flex flex-col min-h-0">
                {/* Column header */}
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${col.dot}`} />
                  <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                    {col.label}
                  </span>
                  <span className="ml-auto text-xs font-display text-[var(--text-muted)]">
                    {colTasks.length}
                  </span>
                </div>

                {/* Tasks */}
                <div className="space-y-2 flex-1">
                  {colTasks.length === 0 ? (
                    <div
                      className="border-2 border-dashed border-[var(--border)] rounded-xl p-6 text-center cursor-pointer hover:border-[var(--border-light)] transition-colors"
                      onClick={() => setShowCreate(true)}
                    >
                      <p className="text-xs text-[var(--text-muted)]">Empty</p>
                    </div>
                  ) : (
                    colTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onClick={() => setEditTask(task)}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List view */}
      {!loading && viewMode === "list" && (
        <div>
          {tasks.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-[var(--text-muted)] mb-4">
                {hasFilters ? "No tasks match your filters" : "No tasks yet"}
              </p>
              {!hasFilters && (
                <button onClick={() => setShowCreate(true)} className="btn-primary">
                  Create your first task
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {/* Group by status */}
              {STATUSES.map((col) => {
                const colTasks = getColumnTasks(col.key);
                if (colTasks.length === 0) return null;
                return (
                  <div key={col.key}>
                    <div className="flex items-center gap-2 py-2 px-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${col.dot}`} />
                      <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                        {col.label}
                      </span>
                      <span className="text-xs font-display text-[var(--text-muted)]">
                        ({colTasks.length})
                      </span>
                    </div>
                    <div className="space-y-1.5 ml-3 pl-3 border-l border-[var(--border)]">
                      {colTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onClick={() => setEditTask(task)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showCreate && <TaskModal onClose={() => setShowCreate(false)} />}
      {editTask && (
        <TaskModal
          task={editTask}
          onClose={() => setEditTask(null)}
        />
      )}
    </div>
  );
}
