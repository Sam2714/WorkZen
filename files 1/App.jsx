// src/App.jsx
// ─────────────────────────────────────────────
// Root app — React Router v6 with sidebar nav
// Routes: /all  /active  /done  /focus
// ─────────────────────────────────────────────

import { useState, useEffect, useMemo, useCallback } from "react";
import { BrowserRouter, Routes, Route, NavLink, useLocation, Navigate } from "react-router-dom";

import { GLOBAL_CSS, useLS } from "./shared";
import AllPage     from "./pages/AllPage";
import ActivePage  from "./pages/ActivePage";
import DonePage    from "./pages/DonePage";
import FocusPage   from "./pages/FocusPage";

// ── Sidebar ──────────────────────────────────
function Sidebar({ tasks, sessions }) {
  const pendingN  = tasks.filter(t => t.status !== "done").length;
  const doneN     = tasks.filter(t => t.status === "done").length;
  const today     = new Date().toDateString();
  const todaySess = sessions.filter(s => new Date(s.date).toDateString() === today).length;

  const navItems = [
    { to:"/all",    icon:"▣", label:"All Tasks",   badge: tasks.length,  badgeClass:"" },
    { to:"/active", icon:"◫", label:"Active",       badge: pendingN,      badgeClass:"amber" },
    { to:"/done",   icon:"◆", label:"Done",         badge: doneN,         badgeClass:"green" },
    { to:"/focus",  icon:"◎", label:"Focus Mode",   badge: todaySess > 0 ? `${todaySess} today` : null, badgeClass:"violet" },
  ];

  return (
    <nav className="wz-sidebar">
      {/* Logo */}
      <div className="wz-sidebar-logo">
        <div className="wz-logo-mark">⚡</div>
        <span className="wz-logo-text">Work<em>Zen</em></span>
      </div>

      {/* Nav */}
      <div className="wz-nav">
        <div style={{ fontSize:9, fontFamily:"var(--mono)", color:"var(--t3)", letterSpacing:"0.1em", textTransform:"uppercase", padding:"6px 12px 4px", fontWeight:700 }}>
          Navigation
        </div>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `wz-nav-item ${isActive ? "active" : ""}`}
          >
            <span className="wz-nav-icon">{item.icon}</span>
            <span className="wz-nav-label">{item.label}</span>
            {item.badge !== null && item.badge !== 0 && (
              <span className={`wz-nav-badge ${item.badgeClass}`}>{item.badge}</span>
            )}
          </NavLink>
        ))}
      </div>

      {/* Footer */}
      <div className="wz-sidebar-footer">
        <span className="wz-footer-dot" />
        prototype · v0.1
      </div>
    </nav>
  );
}

// ── Root ─────────────────────────────────────
function AppRoot() {
  // Shared state — both tasks and sessions live here, passed to all pages
  const [tasks,    setTasks]    = useLS("wz_tasks",    []);
  const [sessions, setSessions] = useLS("wz_sessions", []);

  const addSession = useCallback(s => setSessions(p => [...p, s]), [setSessions]);

  return (
    <div className="wz-app">
      <Sidebar tasks={tasks} sessions={sessions} />
      <div className="wz-content">
        <Routes>
          <Route path="/"       element={<Navigate to="/all" replace />} />
          <Route path="/all"    element={<AllPage    tasks={tasks} setTasks={setTasks} sessions={sessions} />} />
          <Route path="/active" element={<ActivePage tasks={tasks} setTasks={setTasks} sessions={sessions} />} />
          <Route path="/done"   element={<DonePage   tasks={tasks} setTasks={setTasks} sessions={sessions} />} />
          <Route path="/focus"  element={<FocusPage  sessions={sessions} onAddSession={addSession} tasks={tasks} />} />
        </Routes>
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────
export default function App() {
  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <BrowserRouter>
        <AppRoot />
      </BrowserRouter>
    </>
  );
}
