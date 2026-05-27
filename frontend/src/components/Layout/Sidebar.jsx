import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTasks } from "../../context/TaskContext";
import toast from "react-hot-toast";

const NAV_ITEMS = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    to: "/tasks",
    label: "My Tasks",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const { user, logout } = useAuth();
  const { stats, socket } = useTasks();
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Signed out");
    navigate("/login");
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[var(--border)]">
        <div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-stone-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <span className="font-display font-medium text-amber-500 tracking-wide text-sm">
          TaskFlow
        </span>
        {/* Socket status indicator */}
        <div className="ml-auto flex items-center gap-1.5">
          <div
            className={`w-1.5 h-1.5 rounded-full pulse-dot ${
              socket?.connected ? "bg-emerald-500" : "bg-[var(--text-muted)]"
            }`}
          />
          <span className="text-xs text-[var(--text-muted)]">
            {socket?.connected ? "live" : "off"}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                isActive
                  ? "bg-amber-500/10 text-amber-500 font-medium"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
              }`
            }
          >
            {item.icon}
            {item.label}
            {item.to === "/tasks" && stats?.todo > 0 && (
              <span className="ml-auto badge bg-amber-500/15 text-amber-500 text-xs">
                {stats.todo}
              </span>
            )}
          </NavLink>
        ))}

        {/* Stats summary */}
        {stats && (
          <div className="mt-4 mx-1 p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]">
            <p className="text-xs text-[var(--text-muted)] mb-2 font-medium uppercase tracking-wider">
              Overview
            </p>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-[var(--text-secondary)]">Total</span>
                <span className="font-display text-[var(--text-primary)]">{stats.total}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[var(--text-secondary)]">In Progress</span>
                <span className="font-display text-blue-400">{stats.in_progress}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[var(--text-secondary)]">Done</span>
                <span className="font-display text-emerald-400">{stats.done}</span>
              </div>
              {stats.urgent_pending > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-red-400">Urgent</span>
                  <span className="font-display text-red-400">{stats.urgent_pending}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* User info */}
      <div className="border-t border-[var(--border)] p-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-900 font-bold text-sm flex-shrink-0"
            style={{ backgroundColor: user?.avatar_color || "#f59e0b" }}
          >
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--text-primary)] truncate">
              {user?.username}
            </p>
            <p className="text-xs text-[var(--text-muted)] truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="text-[var(--text-muted)] hover:text-red-400 transition-colors p-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-[var(--bg-secondary)] border-r border-[var(--border)] h-screen sticky top-0 flex-shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <aside className="relative w-56 bg-[var(--bg-secondary)] border-r border-[var(--border)] h-full z-10 animate-slide-in">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
