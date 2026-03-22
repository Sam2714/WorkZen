// src/components/TaskRow.jsx + TaskForm.jsx
// ─────────────────────────────────────────────
// Reusable components shared across All, Active, Done pages
// ─────────────────────────────────────────────

import { useState, useRef } from "react";
import { P } from "../shared";

// ── CHECK ICON ───────────────────────────────
export function CheckIcon() {
  return (
    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
      <path d="M1 4L3.5 6.5L9 1" stroke="#07080d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ── DELETE ICON ──────────────────────────────
function DeleteIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
      <path d="M1 1L10 10M10 1L1 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}

// ── TASK ROW ─────────────────────────────────
export function TaskRow({ task, idx, onToggle, onDelete, onEdit }) {
  const [hov, setHov] = useState(false);
  const p = P[task.priority] || P.medium;
  const done = task.status === "done";
  return (
    <div
      className={`wz-task ${done ? "done" : ""}`}
      style={{ animationDelay:`${idx * 32}ms` }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onDoubleClick={!done && onEdit ? onEdit : undefined}
      title={!done && onEdit ? "Double-click to edit" : ""}
    >
      {/* Checkbox */}
      <div className={`wz-chk ${done ? "done" : ""}`} onClick={onToggle}>
        {done && <CheckIcon />}
      </div>

      {/* Body */}
      <div className="wz-task-body">
        <div className="wz-task-name">{task.title}</div>
        {task.description && <div className="wz-task-desc">{task.description}</div>}
      </div>

      {/* Meta */}
      <div className="wz-task-meta">
        {task.completedAt && done && (
          <span style={{ fontSize:9, color:"var(--t3)", fontFamily:"var(--mono)" }}>
            {new Date(task.completedAt).toLocaleDateString("en", { month:"short", day:"numeric" })}
          </span>
        )}
        <span className="wz-pill" style={{ color:p.color, background:p.bg, borderColor:p.border }}>
          {task.priority}
        </span>
        {onDelete && (
          <button className="wz-del" onClick={onDelete} title="Delete">
            <DeleteIcon />
          </button>
        )}
      </div>
    </div>
  );
}

// ── TASK FORM ────────────────────────────────
export function TaskForm({ onSubmit, editTask, onCancel }) {
  const [title, setTitle] = useState(editTask?.title || "");
  const [desc,  setDesc]  = useState(editTask?.description || "");
  const [prio,  setPrio]  = useState(editTask?.priority || "medium");
  const titleRef = useRef(null);
  const isEdit = !!editTask;

  const submit = () => {
    if (!title.trim()) { titleRef.current?.focus(); return; }
    onSubmit({ title, description: desc, priority: prio });
    if (!isEdit) { setTitle(""); setDesc(""); setPrio("medium"); }
  };

  return (
    <div>
      {/* Title */}
      <div className="wz-field">
        <label className="wz-field-label">Title</label>
        <input ref={titleRef} className="wz-input" placeholder="What needs doing?"
          value={title} onChange={e => setTitle(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit()} />
      </div>

      {/* Notes */}
      <div className="wz-field">
        <label className="wz-field-label">Notes</label>
        <textarea className="wz-input" placeholder="Any context…"
          value={desc} onChange={e => setDesc(e.target.value)} />
      </div>

      {/* Priority */}
      <div className="wz-field">
        <label className="wz-field-label">Priority</label>
        <div className="wz-prio-group">
          {Object.entries(P).map(([k, p]) => (
            <div key={k}
              className={`wz-prio-opt ${prio === k ? "sel" : ""}`}
              style={{ borderColor: prio === k ? p.border : "var(--b1)", background: prio === k ? p.bg : "var(--s2)" }}
              onClick={() => setPrio(k)}
            >
              <div className="wz-prio-dot" style={{ background: prio === k ? p.color : "var(--s5)" }} />
              <span className="wz-prio-lbl" style={{ color: prio === k ? "var(--t2)" : "var(--t3)" }}>{k}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
        <button className={`wz-submit ${isEdit ? "edit" : ""}`} style={{ flex:1 }} onClick={submit}>
          {isEdit ? "Update Task" : "+ Add Task"}
        </button>
        {isEdit && onCancel && (
          <button className="wz-cancel" onClick={onCancel}>cancel</button>
        )}
      </div>
    </div>
  );
}

// ── TOAST ────────────────────────────────────
export function Toast({ msg, color }) {
  return (
    <div className="wz-toast">
      <span className="wz-toast-dot" style={{ background: color, boxShadow:`0 0 6px ${color}` }} />
      {msg}
    </div>
  );
}

// ── MINI RING (progress circle) ───────────────
export function MiniRing({ pct, color, size = 64, sw = 5, label, sub }) {
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const off  = circ - (pct / 100) * circ;
  return (
    <div style={{ position:"relative", width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--s3)" strokeWidth={sw} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={sw}
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={off}
          style={{ transition:"stroke-dashoffset 0.8s cubic-bezier(.4,0,.2,1)" }} />
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
        <span style={{ fontSize:13, fontWeight:700, color, fontFamily:"var(--mono)" }}>{label}</span>
        {sub && <span style={{ fontSize:8, color:"var(--t3)", fontWeight:500, marginTop:1 }}>{sub}</span>}
      </div>
    </div>
  );
}

// ── ACTIVITY CHART ────────────────────────────
export function ActivityChart({ sessions, tasks, streak }) {
  const last7 = Array.from({ length:7 }).map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i); const key = d.toDateString();
    return {
      label: d.toLocaleDateString("en", { weekday:"short" }).slice(0, 2),
      n: sessions.filter(s => new Date(s.date).toDateString() === key).length +
         tasks.filter(t => t.completedAt && new Date(t.completedAt).toDateString() === key).length,
      today: i === 0,
    };
  }).reverse();
  const maxBar = Math.max(...last7.map(d => d.n), 1);

  return (
    <>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
        <span style={{ fontSize:9, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:"var(--t3)", fontFamily:"var(--mono)" }}>
          Activity · 7 days
        </span>
        {streak > 0 && (
          <span style={{ fontSize:11, color:"var(--amber)", fontFamily:"var(--mono)" }}>🔥 {streak}d</span>
        )}
      </div>
      <div className="wz-chart-bars">
        {last7.map((d, i) => (
          <div key={i} className="wz-bar-col">
            <div className="wz-bar-track">
              <div className="wz-bar"
                style={{
                  height:`${Math.max((d.n / maxBar) * 100, d.n > 0 ? 10 : 0)}%`,
                  background: d.today
                    ? "linear-gradient(180deg,var(--violet),var(--blue))"
                    : "linear-gradient(180deg,rgba(167,139,250,0.5),rgba(167,139,250,0.2))",
                  animationDelay:`${i * 45}ms`,
                }}
              />
            </div>
            <span className="wz-bar-day" style={{ color: d.today ? "var(--violet)" : "var(--t3)" }}>{d.label}</span>
          </div>
        ))}
      </div>
    </>
  );
}
