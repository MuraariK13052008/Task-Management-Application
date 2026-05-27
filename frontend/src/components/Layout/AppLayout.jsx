import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)]">
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Mobile topbar */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-display text-sm font-medium text-amber-500 tracking-wide">
            TaskFlow
          </span>
        </header>

        <main className="flex-1 overflow-auto scrollbar-thin">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
