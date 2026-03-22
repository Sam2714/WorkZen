// src/pages/ActivePage.jsx
// ─────────────────────────────────────────────
// Route: /active
// Only pending tasks — urgency-focused layout
// Create new tasks, complete them, delete
// Priority filtering + search
// ─────────────────────────────────────────────

import { useState, useMemo, useCallback } from "react";
import { TaskRow, TaskForm, Toast, ActivityChart } from "../components";

const PRIO_ORDER = { high:0, medium:1, low:2 };

export default function ActivePage({ tasks, setTasks, sessions }) {
  const [search,     setSearch]     = useState("");
  const [prioFilter, setPrioFilter] = useState("all");
  const [toast,      setToast]      = useState(null);
  const [showForm,   setShowForm]   = useState(true);

  const showToast = useCallback((msg, color = "#4ade80") => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 2600);
  }, []);

  const addTask = ({ title, description, priority }) => {
    setTasks(t => [...t, {
      id: Date.now().toString(), title, description, priority,
      status: "pending", createdAt: new Date().toISOString()
    }]);
    showToast("Task added ✦");
  };

  const complete = id => {
    setTasks(t => t.map(x => x.id === id
      ? { ...x, status:"done", completedAt:new Date().toISOString() }
      : x
    ));
    showToast("Done! ✓", "#4ade80");
  };

  const remove = id => {
    setTasks(t => t.filter(x => x.id !== id));
    showToast("Removed", "#fb7185");
  };

  // ── Only pending tasks ──
  const allPending = tasks.filter(t => t.status !== "done");

  const filtered = useMemo(() => allPending
    .filter(t => {
      const bySearch = t.title.toLowerCase().includes(search.toLowerCase());
      const byPrio   = prioFilter === "all" || t.priority === prioFilter;
      return bySearch && byPrio;
    })
    .sort((a, b) => (PRIO_ORDER[a.priority] || 1) - (PRIO_ORDER[b.priority] || 1)),
    [allPending, search, prioFilter]
  );

  // ── Priority breakdown ──
  const highN   = allPending.filter(t => t.priority === "high").length;
  const medN    = allPending.filter(t => t.priority === "medium").length;
  const lowN    = allPending.filter(t => t.priority === "low").length;
  const total   = tasks.length;
  const doneN   = tasks.filter(t => t.status === "done").length;
  const rate    = total ? Math.round((doneN / total) * 100) : 0;

  const streak = useMemo(() => {
    let s = 0;
    for (let i = 0; i < 60; i++) {
      const d = new Date(); d.setDate(d.getDate() - i); const key = d.toDateString();
      if (sessions.some(x => new Date(x.date).toDateString() === key) ||
          tasks.some(x => x.completedAt && new Date(x.completedAt).toDateString() === key)) s++;
      else break;
    }
    return s;
  }, [sessions, tasks]);

  const PRIO_FILTERS = [
    { val:"all",    label:"All",    color:"var(--t2)"    },
    { val:"high",   label:"High",   color:"#fb7185"      },
    { val:"medium", label:"Med",    color:"var(--amber)" },
    { val:"low",    label:"Low",    color:"var(--green)" },
  ];

  return (
    <>
      <div className="wz-page-header">
        <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
          <span className="wz-page-title">Active <em>Tasks</em></span>
          <span className="wz-page-subtitle">/ {allPending.length} pending</span>
        </div>
        <button
          onClick={() => setShowForm(f => !f)}
          style={{ fontSize:12, color:"var(--t3)", background:"var(--s2)", border:"1px solid var(--b1)",
            borderRadius:8, padding:"5px 12px", cursor:"pointer", fontFamily:"var(--mono)", transition:"all 0.2s" }}
        >
          {showForm ? "hide form" : "+ new task"}
        </button>
      </div>

      <div className="wz-page-body">
        <div style={{ display:"grid", gridTemplateColumns:"280px 1fr", gap:18, alignItems:"start" }}>

          {/* ── LEFT ── */}
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

            {/* Urgency hero */}
            <div className="wz-active-hero">
              <div>
                <div className="wz-urgency">⚡ needs attention</div>
                <h2>{allPending.length === 0 ? "All clear!" : `${allPending.length} task${allPending.length !== 1 ? "s" : ""} waiting`}</h2>
                <p style={{ fontSize:12, color:"var(--t2)" }}>
                  {allPending.length === 0 ? "Nothing pending. Great work." : `${highN} high · ${medN} medium · ${lowN} low priority`}
                </p>
              </div>
              <div className="wz-active-count">{allPending.length}</div>
            </div>

            {/* Priority breakdown */}
            <div className="wz-panel" style={{ animationDelay:"30ms" }}>
              <div className="wz-panel-hd"><span className="wz-panel-title">by priority</span></div>
              <div className="wz-panel-bd">
                {[
                  { label:"High",   count:highN, color:"#fb7185", bg:"rgba(251,113,133,0.1)", border:"rgba(251,113,133,0.2)" },
                  { label:"Medium", count:medN,  color:"var(--amber)", bg:"var(--amber-dim)", border:"rgba(245,166,35,0.2)" },
                  { label:"Low",    count:lowN,  color:"var(--green)", bg:"var(--green-dim)", border:"rgba(74,222,128,0.2)"  },
                ].map((p, i) => (
                  <div key={i} style={{
                    display:"flex", alignItems:"center", justifyContent:"space-between",
                    padding:"10px 13px", borderRadius:9, border:`1px solid ${p.border}`,
                    background:p.bg, marginBottom: i < 2 ? 8 : 0,
                  }}>
                    <span style={{ fontSize:13, fontWeight:600, color:p.color }}>{p.label}</span>
                    <span style={{ fontSize:18, fontWeight:700, fontFamily:"var(--mono)", color:p.color }}>{p.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity */}
            <div className="wz-panel" style={{ animationDelay:"55ms" }}>
              <div className="wz-panel-hd"><span className="wz-panel-title">activity</span></div>
              <div className="wz-panel-bd">
                <ActivityChart sessions={sessions} tasks={tasks} streak={streak} />
                {streak > 0 && (
                  <div style={{ marginTop:10, fontSize:11, color:"var(--t3)", fontFamily:"var(--mono)" }}>
                    🔥 {streak}-day streak · {rate}% overall completion
                  </div>
                )}
              </div>
            </div>

            {/* New task form (collapsible) */}
            {showForm && (
              <div className="wz-panel" style={{ animationDelay:"75ms" }}>
                <div className="wz-panel-hd"><span className="wz-panel-title">add task</span></div>
                <div className="wz-panel-bd">
                  <TaskForm onSubmit={addTask} />
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT: Task list ── */}
          <div className="wz-panel" style={{ animationDelay:"60ms" }}>
            <div className="wz-panel-hd">
              <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                <span className="wz-panel-title">pending</span>
                <span style={{ fontSize:10, padding:"2px 7px", borderRadius:99, background:"var(--amber-dim)", color:"var(--amber)", fontFamily:"var(--mono)", fontWeight:600 }}>
                  {filtered.length}
                </span>
              </div>
              <div className="wz-search" style={{ width:180 }}>
                <span className="wz-search-icon">⌕</span>
                <input className="wz-input" value={search}
                  onChange={e => setSearch(e.target.value)} placeholder="Search…" />
              </div>
            </div>

            <div className="wz-panel-bd">
              {/* Priority filter pills */}
              <div style={{ display:"flex", gap:6, marginBottom:16 }}>
                {PRIO_FILTERS.map(f => (
                  <button key={f.val} onClick={() => setPrioFilter(f.val)}
                    style={{
                      padding:"5px 12px", borderRadius:99, border:"1px solid",
                      borderColor: prioFilter === f.val ? f.color : "var(--b1)",
                      background: prioFilter === f.val ? "rgba(255,255,255,0.04)" : "transparent",
                      color: prioFilter === f.val ? f.color : "var(--t3)",
                      fontSize:11, fontWeight:600, fontFamily:"var(--mono)", cursor:"pointer",
                      transition:"all 0.17s", letterSpacing:"0.04em",
                    }}>
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Empty */}
              {filtered.length === 0 && (
                <div className="wz-empty">
                  <div className="wz-empty-icon">{allPending.length === 0 ? "✓" : "⌕"}</div>
                  <div className="wz-empty-title">
                    {allPending.length === 0 ? "All tasks complete!" : "No tasks match"}
                  </div>
                  <div className="wz-empty-sub">
                    {allPending.length === 0 ? "Head to Focus Mode to log a session" : "Try clearing the filter"}
                  </div>
                </div>
              )}

              {/* Task list grouped by priority */}
              {["high","medium","low"].map(pkey => {
                const group = filtered.filter(t => t.priority === pkey);
                if (group.length === 0) return null;
                const colors = { high:"#fb7185", medium:"var(--amber)", low:"var(--green)" };
                return (
                  <div key={pkey}>
                    <div className="wz-group-div" style={{ color:colors[pkey] }}>
                      {pkey} · {group.length}
                    </div>
                    <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                      {group.map((t, i) => (
                        <TaskRow key={t.id} task={t} idx={i}
                          onToggle={() => complete(t.id)}
                          onDelete={() => remove(t.id)} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {toast && <Toast msg={toast.msg} color={toast.color} />}
    </>
  );
}
