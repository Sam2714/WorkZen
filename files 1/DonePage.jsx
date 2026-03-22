// src/pages/DonePage.jsx
// ─────────────────────────────────────────────
// Route: /done
// Completed task history — restore, delete, stats
// Completion heatmap + achievement milestones
// ─────────────────────────────────────────────

import { useState, useMemo, useCallback } from "react";
import { TaskRow, Toast, MiniRing } from "../components";

export default function DonePage({ tasks, setTasks, sessions }) {
  const [search, setSearch] = useState("");
  const [toast,  setToast]  = useState(null);

  const showToast = useCallback((msg, color = "#4ade80") => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 2600);
  }, []);

  const restore = id => {
    setTasks(t => t.map(x => x.id === id ? { ...x, status:"pending", completedAt:undefined } : x));
    showToast("Restored to active", "#60a5fa");
  };

  const remove = id => {
    setTasks(t => t.filter(x => x.id !== id));
    showToast("Removed", "#fb7185");
  };

  // ── Stats ──
  const allDone = tasks.filter(t => t.status === "done");
  const total   = tasks.length;
  const rate    = total ? Math.round((allDone.length / total) * 100) : 0;

  const today = new Date().toDateString();
  const todayDone  = allDone.filter(t => t.completedAt && new Date(t.completedAt).toDateString() === today).length;
  const thisWeek = useMemo(() => {
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 7);
    return allDone.filter(t => t.completedAt && new Date(t.completedAt) >= cutoff).length;
  }, [allDone]);

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

  // ── Last 14 days heatmap ──
  const heatmap = useMemo(() => Array.from({ length:14 }).map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i); const key = d.toDateString();
    const count = allDone.filter(t => t.completedAt && new Date(t.completedAt).toDateString() === key).length;
    return { label:d.toLocaleDateString("en",{weekday:"short",month:"short",day:"numeric"}), count, today:i===0 };
  }).reverse(), [allDone]);
  const maxHeat = Math.max(...heatmap.map(h => h.count), 1);

  // ── Filtered ──
  const filtered = useMemo(() => allDone
    .filter(t => t.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.completedAt || 0) - new Date(a.completedAt || 0)),
    [allDone, search]
  );

  // Group by date
  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach(t => {
      const key = t.completedAt ? new Date(t.completedAt).toDateString() : "Unknown";
      const label = key === today ? "Today"
        : key === new Date(Date.now()-86400000).toDateString() ? "Yesterday"
        : new Date(t.completedAt).toLocaleDateString("en",{weekday:"long",month:"short",day:"numeric"});
      if (!groups[label]) groups[label] = [];
      groups[label].push(t);
    });
    return groups;
  }, [filtered, today]);

  // Milestone thresholds
  const milestones = [1,5,10,25,50,100];
  const nextMilestone = milestones.find(m => m > allDone.length) || null;

  return (
    <>
      <div className="wz-page-header">
        <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
          <span className="wz-page-title">Done <em>&amp; Dusted</em></span>
          <span className="wz-page-subtitle">/ {allDone.length} completed</span>
        </div>
        <div style={{ fontSize:11, color:"var(--green)", fontFamily:"var(--mono)", fontWeight:500 }}>
          {rate}% completion rate
        </div>
      </div>

      <div className="wz-page-body">
        <div style={{ display:"grid", gridTemplateColumns:"280px 1fr", gap:18, alignItems:"start" }}>

          {/* ── LEFT ── */}
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

            {/* Hero card */}
            <div className="wz-done-hero">
              <div className="wz-done-ring-wrap">
                <MiniRing pct={rate} color="var(--green)" size={72} sw={6} label={`${rate}%`} sub="rate" />
              </div>
              <div className="wz-done-hero-text">
                <h2>{allDone.length} task{allDone.length !== 1 ? "s" : ""} done</h2>
                <p>
                  {allDone.length === 0
                    ? "Complete your first task to see it here."
                    : `${todayDone} today · ${thisWeek} this week`}
                </p>
              </div>
            </div>

            {/* Milestone card */}
            <div className="wz-panel" style={{ animationDelay:"30ms" }}>
              <div className="wz-panel-hd"><span className="wz-panel-title">milestones</span></div>
              <div className="wz-panel-bd">
                {milestones.map(m => {
                  const hit = allDone.length >= m;
                  return (
                    <div key={m} style={{
                      display:"flex", alignItems:"center", gap:10, padding:"8px 0",
                      borderBottom:"1px solid var(--b1)", opacity: hit ? 1 : 0.35,
                    }}>
                      <span style={{ fontSize:14 }}>{hit ? "✦" : "◌"}</span>
                      <span style={{ fontSize:13, fontWeight:500, color: hit ? "var(--t1)" : "var(--t3)", flex:1 }}>
                        {m} task{m !== 1 ? "s" : ""} completed
                      </span>
                      {hit && <span style={{ fontSize:9, color:"var(--green)", fontFamily:"var(--mono)", fontWeight:700 }}>DONE</span>}
                    </div>
                  );
                })}
                {nextMilestone && (
                  <div style={{ marginTop:10, fontSize:11, color:"var(--t3)", fontFamily:"var(--mono)" }}>
                    {nextMilestone - allDone.length} more to reach {nextMilestone} ✦
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="wz-panel" style={{ animationDelay:"55ms" }}>
              <div className="wz-panel-hd"><span className="wz-panel-title">stats</span></div>
              <div className="wz-panel-bd">
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  {[
                    { label:"Total done",  val:allDone.length, color:"var(--green)"  },
                    { label:"Today",       val:todayDone,      color:"var(--violet)" },
                    { label:"This week",   val:thisWeek,       color:"var(--blue)"   },
                    { label:"Streak",      val:`${streak}d`,   color:"var(--amber)"  },
                  ].map((s, i) => (
                    <div key={i} className="wz-tile">
                      <div className="wz-tile-lbl">{s.label}</div>
                      <div className="wz-tile-val" style={{ color:s.color }}>{s.val}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT ── */}
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

            {/* Completion heatmap */}
            <div className="wz-panel" style={{ animationDelay:"50ms" }}>
              <div className="wz-panel-hd"><span className="wz-panel-title">completion — last 14 days</span></div>
              <div className="wz-panel-bd">
                <div style={{ display:"flex", gap:4, height:44, alignItems:"flex-end" }}>
                  {heatmap.map((h, i) => (
                    <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4, height:"100%", position:"relative" }}
                      title={`${h.label}: ${h.count} completed`}>
                      <div style={{
                        flex:1, width:"100%", borderRadius:4,
                        background: h.count === 0
                          ? "var(--s3)"
                          : `rgba(74,222,128,${0.2 + (h.count / maxHeat) * 0.8})`,
                        border: h.today ? "1px solid rgba(74,222,128,0.4)" : "1px solid transparent",
                        transition:"background 0.3s",
                        animation:`barIn 0.5s ease ${i*30}ms both`,
                      }} />
                      {i % 4 === 0 && (
                        <span style={{ fontSize:7, color:"var(--t3)", fontFamily:"var(--mono)", textTransform:"uppercase" }}>
                          {new Date(Date.now() - (13 - i) * 86400000).toLocaleDateString("en",{month:"numeric",day:"numeric"})}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <div style={{ marginTop:6, fontSize:10, color:"var(--t3)", fontFamily:"var(--mono)" }}>
                  Hover bars to see daily counts
                </div>
              </div>
            </div>

            {/* Task history */}
            <div className="wz-panel" style={{ animationDelay:"70ms" }}>
              <div className="wz-panel-hd">
                <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                  <span className="wz-panel-title">history</span>
                  <span style={{ fontSize:10, padding:"2px 7px", borderRadius:99, background:"var(--green-dim)", color:"var(--green)", fontFamily:"var(--mono)", fontWeight:600 }}>
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
                {filtered.length === 0 && (
                  <div className="wz-empty">
                    <div className="wz-empty-icon">◆</div>
                    <div className="wz-empty-title">{search ? "No tasks match" : "Nothing completed yet"}</div>
                    <div className="wz-empty-sub">{search ? "Try a different keyword" : "Complete tasks from the Active page"}</div>
                  </div>
                )}

                {Object.entries(grouped).map(([dateLabel, group]) => (
                  <div key={dateLabel}>
                    <div className="wz-group-div" style={{ color:"var(--green)" }}>
                      {dateLabel} · {group.length}
                    </div>
                    <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                      {group.map((t, i) => (
                        <div key={t.id} style={{ position:"relative" }}>
                          <TaskRow task={t} idx={i}
                            onToggle={() => restore(t.id)}
                            onDelete={() => remove(t.id)} />
                          {/* Restore hint */}
                          <div style={{
                            position:"absolute", right:44, top:"50%", transform:"translateY(-50%)",
                            fontSize:9, color:"var(--t3)", fontFamily:"var(--mono)", opacity:0,
                            transition:"opacity 0.2s", pointerEvents:"none",
                          }}
                          className="restore-hint">
                            click ✓ to restore
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {toast && <Toast msg={toast.msg} color={toast.color} />}
    </>
  );
}
