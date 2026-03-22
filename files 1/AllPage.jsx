// src/pages/AllPage.jsx
// ─────────────────────────────────────────────
// Route: /all
// Shows every task — create, edit, delete, complete
// Full insights sidebar + activity chart
// ─────────────────────────────────────────────

import { useState, useMemo, useCallback } from "react";
import { TaskRow, TaskForm, Toast, MiniRing, ActivityChart } from "../components";

export default function AllPage({ tasks, setTasks, sessions }) {
  const [editId,  setEditId]  = useState(null);
  const [search,  setSearch]  = useState("");
  const [toast,   setToast]   = useState(null);

  const showToast = useCallback((msg, color = "#4ade80") => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 2600);
  }, []);

  // ── Task actions ──
  const addTask = ({ title, description, priority }) => {
    setTasks(t => [...t, {
      id: Date.now().toString(), title, description, priority,
      status: "pending", createdAt: new Date().toISOString()
    }]);
    showToast("Task added ✦");
  };

  const updateTask = ({ title, description, priority }) => {
    setTasks(t => t.map(x => x.id === editId ? { ...x, title, description, priority } : x));
    setEditId(null);
    showToast("Task updated", "#60a5fa");
  };

  const toggle = id => {
    setTasks(t => t.map(x => x.id === id
      ? { ...x, status: x.status === "done" ? "pending" : "done", completedAt: x.status !== "done" ? new Date().toISOString() : undefined }
      : x
    ));
  };

  const remove = id => {
    setTasks(t => t.filter(x => x.id !== id));
    showToast("Removed", "#fb7185");
  };

  // ── Stats ──
  const total  = tasks.length;
  const doneN  = tasks.filter(t => t.status === "done").length;
  const pendN  = total - doneN;
  const rate   = total ? Math.round((doneN / total) * 100) : 0;
  const today  = new Date().toDateString();
  const todayDone = tasks.filter(t => t.completedAt && new Date(t.completedAt).toDateString() === today).length;
  const todaySess = sessions.filter(s => new Date(s.date).toDateString() === today).length;

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

  // ── Filtered tasks ──
  const filtered = useMemo(() => tasks
    .filter(t => t.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === "done" ? 1 : -1;
      return ({ high:0, medium:1, low:2 }[a.priority] || 1) - ({ high:0, medium:1, low:2 }[b.priority] || 1);
    }), [tasks, search]);

  const pending   = filtered.filter(t => t.status !== "done");
  const completed = filtered.filter(t => t.status === "done");
  const editTask  = editId ? tasks.find(t => t.id === editId) : null;

  return (
    <>
      {/* Page header */}
      <div className="wz-page-header">
        <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
          <span className="wz-page-title">All <em>Tasks</em></span>
          <span className="wz-page-subtitle">/ {total} total</span>
        </div>
        <div style={{ fontSize:11, color:"var(--t3)", fontFamily:"var(--mono)" }}>
          <span className="wz-kbd">⌘K</span> search &nbsp; <span className="wz-kbd">↵</span> add
        </div>
      </div>

      <div className="wz-page-body">
        <div style={{ display:"grid", gridTemplateColumns:"280px 1fr", gap:18, alignItems:"start" }}>

          {/* ── LEFT: Form + Insights ── */}
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

            {/* Form */}
            <div className="wz-panel" style={{ animationDelay:"0ms" }}>
              <div className="wz-panel-hd">
                <span className="wz-panel-title">{editId ? "editing task" : "new task"}</span>
              </div>
              <div className="wz-panel-bd">
                <TaskForm
                  key={editId || "new"}
                  editTask={editTask}
                  onSubmit={editId ? updateTask : addTask}
                  onCancel={editId ? () => setEditId(null) : undefined}
                />
              </div>
            </div>

            {/* Insights */}
            <div className="wz-panel" style={{ animationDelay:"50ms" }}>
              <div className="wz-panel-hd">
                <span className="wz-panel-title">insights</span>
              </div>
              <div className="wz-panel-bd">
                {/* Ring + summary */}
                <div style={{ display:"flex", alignItems:"center", gap:13, marginBottom:14 }}>
                  <MiniRing pct={rate} color="var(--violet)" size={62} sw={5} label={`${rate}%`} sub="done" />
                  <div>
                    <div style={{ fontSize:14, fontWeight:600, marginBottom:3 }}>{doneN} of {total} done</div>
                    <div style={{ fontSize:12, color:"var(--t2)", lineHeight:1.5 }}>
                      {pendN > 0 ? `${pendN} remaining` : total > 0 ? "All complete 🎉" : "No tasks yet"}
                    </div>
                  </div>
                </div>
                <div className="wz-prog-wrap" style={{ marginBottom:14 }}>
                  <div className="wz-prog-bar" style={{ width:`${rate}%` }} />
                </div>

                {/* Tiles */}
                <div className="wz-tiles" style={{ marginBottom:14 }}>
                  <div className="wz-tile">
                    <div className="wz-tile-lbl">Today</div>
                    <div className="wz-tile-val" style={{ color:"var(--green)" }}>{todayDone}<span className="wz-tile-unit">tasks</span></div>
                  </div>
                  <div className="wz-tile">
                    <div className="wz-tile-lbl">Focus</div>
                    <div className="wz-tile-val" style={{ color:"var(--violet)" }}>{todaySess}<span className="wz-tile-unit">sessions</span></div>
                  </div>
                  <div className="wz-tile">
                    <div className="wz-tile-lbl">Streak</div>
                    <div className="wz-tile-val" style={{ color:"var(--amber)" }}>{streak}<span className="wz-tile-unit">days</span></div>
                  </div>
                  <div className="wz-tile">
                    <div className="wz-tile-lbl">Rate</div>
                    <div className="wz-tile-val" style={{ color:"var(--blue)" }}>{rate}<span style={{ fontSize:13 }}>%</span></div>
                  </div>
                </div>

                <ActivityChart sessions={sessions} tasks={tasks} streak={streak} />
              </div>
            </div>
          </div>

          {/* ── RIGHT: Task list ── */}
          <div className="wz-panel" style={{ animationDelay:"70ms" }}>
            <div className="wz-panel-hd">
              <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                <span className="wz-panel-title">tasks</span>
                <span style={{ fontSize:10, padding:"2px 7px", borderRadius:99, background:"var(--s3)", color:"var(--t3)", fontFamily:"var(--mono)", fontWeight:600 }}>
                  {filtered.length}
                </span>
              </div>
              {/* Search */}
              <div className="wz-search" style={{ width:200 }}>
                <span className="wz-search-icon">⌕</span>
                <input className="wz-input" value={search}
                  onChange={e => setSearch(e.target.value)} placeholder="Search…" />
              </div>
            </div>

            <div className="wz-panel-bd">
              {/* Stat row */}
              <div className="wz-stats" style={{ gridTemplateColumns:"repeat(4,1fr)", marginBottom:18 }}>
                {[
                  { icon:"▣", val:total,   label:"Total",   color:"var(--violet)", delay:0   },
                  { icon:"◫", val:pendN,   label:"Pending", color:"var(--amber)",  delay:40  },
                  { icon:"◆", val:doneN,   label:"Done",    color:"var(--green)",  delay:80  },
                  { icon:"◎", val:`${rate}%`, label:"Rate", color:"var(--blue)",   delay:120 },
                ].map((s, i) => (
                  <div key={i} className="wz-stat" style={{ animationDelay:`${100+s.delay}ms` }}>
                    <div className="wz-stat-icon" style={{ color:s.color }}>{s.icon}</div>
                    <div className="wz-stat-val" style={{ color:s.color }}>{s.val}</div>
                    <div className="wz-stat-lbl">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Empty */}
              {filtered.length === 0 && (
                <div className="wz-empty">
                  <div className="wz-empty-icon">{search ? "⌕" : "◫"}</div>
                  <div className="wz-empty-title">{search ? "No tasks match" : "No tasks yet"}</div>
                  <div className="wz-empty-sub">{search ? "Try a different keyword" : "Add your first task using the form"}</div>
                </div>
              )}

              {/* Pending group */}
              {pending.length > 0 && (
                <>
                  <div className="wz-group-div">Active · {pending.length}</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                    {pending.map((t, i) => (
                      <TaskRow key={t.id} task={t} idx={i}
                        onToggle={() => toggle(t.id)}
                        onDelete={() => remove(t.id)}
                        onEdit={() => setEditId(t.id)} />
                    ))}
                  </div>
                </>
              )}

              {/* Completed group */}
              {completed.length > 0 && (
                <>
                  <div className="wz-group-div" style={{ marginTop:16 }}>Completed · {completed.length}</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                    {completed.map((t, i) => (
                      <TaskRow key={t.id} task={t} idx={i}
                        onToggle={() => toggle(t.id)}
                        onDelete={() => remove(t.id)} />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {toast && <Toast msg={toast.msg} color={toast.color} />}
    </>
  );
}
