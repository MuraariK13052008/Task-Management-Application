import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTasks } from "../context/TaskContext";
import { format, isAfter, parseISO, isToday } from "date-fns";
import TaskModal from "../components/Tasks/TaskModal";
import TaskCard from "../components/Tasks/TaskCard";

const StatCard = ({ label, value, color, icon }) => (
  <div className="card p-4 flex items-center gap-4">
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-display font-medium text-[var(--text-primary)]">{value ?? "—"}</p>
      <p className="text-xs text-[var(--text-secondary)] mt-0.5">{label}</p>
    </div>
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const { tasks, stats, loading } = useTasks();
  const [showCreate, setShowCreate] = useState(false);
  const [editTask, setEditTask] = useState(null);

  const urgentTasks = tasks.filter((t) => t.priority === "urgent" && t.status !== "done");
  const overdueTasks = tasks.filter(
    (t) =>
      t.due_date &&
      t.status !== "done" &&
      isAfter(new Date(), parseISO(t.due_date)) &&
      !isToday(parseISO(t.due_date))
  );
  const recentTasks = [...tasks].slice(0, 5);

  const completionRate =
    stats?.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">
            Good{" "}
            {new Date().getHours() < 12
              ? "morning"
              : new Date().getHours() < 18
              ? "afternoon"
              : "evening"}
            ,{" "}
            <span className="text-amber-500">{user?.username}</span>
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">
            {format(new Date(), "EEEE, MMMM d")}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="btn-primary"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New task
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <StatCard
          label="Total tasks"
          value={stats?.total}
          color="bg-amber-500/10"
          icon={
            <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        <StatCard
          label="In progress"
          value={stats?.in_progress}
          color="bg-blue-500/10"
          icon={
            <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />
        <StatCard
          label="Completed"
          value={stats?.done}
          color="bg-emerald-500/10"
          icon={
            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Completion"
          value={`${completionRate}%`}
          color="bg-purple-500/10"
          icon={
            <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
          }
        />
      </div>

      {/* Progress bar */}
      {stats?.total > 0 && (
        <div className="card p-4 mb-6">
          <div className="flex justify-between text-xs text-[var(--text-secondary)] mb-2">
            <span>Overall progress</span>
            <span className="font-display text-amber-500">{completionRate}%</span>
          </div>
          <div className="h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <div className="flex gap-4 mt-3 text-xs text-[var(--text-muted)]">
            <span>{stats.todo} to do</span>
            <span>{stats.in_progress} in progress</span>
            <span>{stats.done} done</span>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Urgent tasks */}
        {urgentTasks.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 pulse-dot" />
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                Urgent ({urgentTasks.length})
              </h2>
            </div>
            <div className="space-y-2">
              {urgentTasks.slice(0, 3).map((task) => (
                <TaskCard key={task.id} task={task} onClick={() => setEditTask(task)} />
              ))}
            </div>
          </div>
        )}

        {/* Overdue tasks */}
        {overdueTasks.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                Overdue ({overdueTasks.length})
              </h2>
            </div>
            <div className="space-y-2">
              {overdueTasks.slice(0, 3).map((task) => (
                <TaskCard key={task.id} task={task} onClick={() => setEditTask(task)} />
              ))}
            </div>
          </div>
        )}

        {/* Recent tasks */}
        <div className={urgentTasks.length === 0 && overdueTasks.length === 0 ? "md:col-span-2" : ""}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Recent tasks</h2>
            <Link to="/tasks" className="text-xs text-amber-500 hover:text-amber-400 transition-colors">
              View all →
            </Link>
          </div>
          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card p-4 animate-pulse">
                  <div className="h-3 bg-[var(--bg-hover)] rounded w-3/4 mb-2" />
                  <div className="h-2 bg-[var(--bg-hover)] rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : recentTasks.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-[var(--text-muted)] text-sm mb-3">No tasks yet</p>
              <button onClick={() => setShowCreate(true)} className="btn-primary text-xs">
                Create your first task
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {recentTasks.map((task) => (
                <TaskCard key={task.id} task={task} onClick={() => setEditTask(task)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showCreate && <TaskModal onClose={() => setShowCreate(false)} />}
      {editTask && (
        <TaskModal task={editTask} onClose={() => setEditTask(null)} />
      )}
    </div>
  );
}
