// src/pages/FocusPage.jsx
// ─────────────────────────────────────────────
// Route: /focus
// Immersive full-page focus mode
// Pomodoro timer + session logging + task linking
// ─────────────────────────────────────────────

import { useState, useEffect, useMemo, useRef, useCallback } from "react";

const FOCUS_TOTAL = 25 * 60; // 25 minutes in seconds

// ── Ambient orbs (background atmosphere) ──
function AmbientOrbs() {
  return (
    <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none" }}>
      {[
        { w:700, h:700, top:-250, left:-200, color:"rgba(167,139,250,0.07)", delay:"0s"   },
        { w:600, h:600, bottom:-200, right:-150, color:"rgba(96,165,250,0.05)", delay:"-3s" },
        { w:350, h:350, top:"42%", left:"50%", transform:"translate(-50%,-50%)", color:"rgba(167,139,250,0.04)", delay:"-1.8s" },
      ].map((o, i) => (
        <div key={i} style={{
          position:"absolute", width:o.w, height:o.h,
          top:o.top, left:o.left, bottom:o.bottom, right:o.right, transform:o.transform,
          borderRadius:"50%", filter:"blur(80px)",
          background:`radial-gradient(circle,${o.color} 0%,transparent 70%)`,
          animation:`pulse 7s ease-in-out infinite`, animationDelay:o.delay,
        }} />
      ))}
    </div>
  );
}

// ── SVG Timer Ring ──
function TimerRing({ pct }) {
  const r = 120, circ = 2 * Math.PI * r;
  const off = circ - (pct / 100) * circ;
  return (
    <svg width="270" height="270" viewBox="0 0 270 270" style={{ position:"absolute", inset:0 }}>
      <defs>
        <linearGradient id="fgRing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#60a5fa" />
        </linearGradient>
      </defs>
      <g transform="rotate(-90 135 135)">
        <circle cx="135" cy="135" r={r} fill="none" stroke="rgba(200,210,255,0.04)" strokeWidth="2" />
        <circle cx="135" cy="135" r={r} fill="none" stroke="rgba(167,139,250,0.1)"  strokeWidth="3" />
        {/* Glow layer */}
        <circle cx="135" cy="135" r={r} fill="none" stroke="rgba(167,139,250,0.06)" strokeWidth="14"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={off}
          style={{ transition:"stroke-dashoffset 1s linear" }} />
        {/* Main progress */}
        <circle cx="135" cy="135" r={r} fill="none" stroke="url(#fgRing)" strokeWidth="2.5"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={off}
          style={{ transition:"stroke-dashoffset 1s linear" }} />
      </g>
    </svg>
  );
}

export default function FocusPage({ sessions, onAddSession, tasks }) {
  const [rem,     setRem]     = useState(FOCUS_TOTAL);
  const [running, setRunning] = useState(false);
  const [done,    setDone]    = useState(false);
  const [linked,  setLinked]  = useState("");   // linked task id
  const [notes,   setNotes]   = useState("");
  const iRef = useRef(null);

  // ── Timer ──
  useEffect(() => {
    if (running) {
      iRef.current = setInterval(() => setRem(r => {
        if (r <= 1) {
          clearInterval(iRef.current);
          setRunning(false);
          setDone(true);
          onAddSession({
            date: new Date().toISOString(),
            taskId: linked || null,
            notes,
          });
          return 0;
        }
        return r - 1;
      }), 1000);
    } else {
      clearInterval(iRef.current);
    }
    return () => clearInterval(iRef.current);
  }, [running, linked, notes, onAddSession]);

  const reset = () => { setRem(FOCUS_TOTAL); setRunning(false); setDone(false); };

  const today = new Date().toDateString();
  const todayN   = sessions.filter(s => new Date(s.date).toDateString() === today).length;
  const totalMin = sessions.length * 25;

  const streak = useMemo(() => {
    let s = 0;
    for (let i = 0; i < 60; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      if (sessions.some(x => new Date(x.date).toDateString() === d.toDateString())) s++;
      else break;
    }
    return s;
  }, [sessions]);

  const mins = Math.floor(rem / 60);
  const secs = rem % 60;
  const pct  = ((FOCUS_TOTAL - rem) / FOCUS_TOTAL) * 100;
  const pendingTasks = tasks.filter(t => t.status !== "done");

  // Session history (last 5)
  const recentSessions = [...sessions]
    .sort((a,b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <>
      {/* Page header */}
      <div className="wz-page-header">
        <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
          <span className="wz-page-title">Focus <em>Mode</em></span>
          <span className="wz-page-subtitle">/ {todayN} session{todayN !== 1 ? "s" : ""} today</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          {streak > 0 && (
            <span style={{ fontSize:12, color:"var(--amber)", fontFamily:"var(--mono)" }}>🔥 {streak}-day streak</span>
          )}
          <span style={{ fontSize:11, color:"var(--t3)", fontFamily:"var(--mono)" }}>
            {totalMin}min total logged
          </span>
        </div>
      </div>

      {/* Page body */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", minHeight:"calc(100vh - 56px)" }}>

        {/* ── CENTER: Timer ── */}
        <div className="wz-focus-page" style={{ position:"relative" }}>
          <AmbientOrbs />

          {/* Done banner */}
          {done && (
            <div className="wz-fc-done" style={{ position:"relative", zIndex:1 }}>
              ✦ Session complete — 25 minutes logged
            </div>
          )}

          {/* Ring */}
          <div className="wz-focus-ring" style={{ position:"relative", zIndex:1 }}>
            <TimerRing pct={pct} />
            <div className="wz-ring-inner">
              <div className="wz-ring-phase">
                {done ? "✦ done" : running ? "focusing" : "ready"}
              </div>
              <div className={`wz-ring-time ${running ? "ticking" : ""}`}>
                {String(mins).padStart(2,"0")}:{String(secs).padStart(2,"0")}
              </div>
              <div className="wz-ring-session">
                session {todayN + (done ? 0 : 1)} · today
              </div>
            </div>
          </div>

          {/* Controls */}
          <div style={{ position:"relative", zIndex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:14 }}>
            <div className="wz-fc-row">
              <button className="wz-fc-btn" onClick={reset}>↺ Reset</button>
              <button className="wz-fc-btn primary"
                onClick={() => { setDone(false); setRunning(r => !r); }}>
                {running ? "⏸ Pause" : done ? "▶ Again" : "▶ Start"}
              </button>
            </div>
            <div className="wz-fc-hint">
              {running
                ? "Stay focused — the timer is running"
                : done
                  ? "Session logged. Take a break, then start another."
                  : "25-minute deep work session"}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL: Setup + History ── */}
        <div style={{
          borderLeft:"1px solid var(--b1)", background:"var(--s1)",
          display:"flex", flexDirection:"column", gap:0,
          overflowY:"auto",
        }}>

          {/* Session setup */}
          <div style={{ padding:"18px 18px 0" }}>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--t3)", fontFamily:"var(--mono)", marginBottom:14 }}>
              Session Setup
            </div>

            {/* Link to task */}
            <div style={{ marginBottom:12 }}>
              <label style={{ fontSize:10, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--t3)", fontFamily:"var(--mono)", display:"block", marginBottom:6 }}>
                Link to task (optional)
              </label>
              <select value={linked} onChange={e => setLinked(e.target.value)}
                style={{
                  width:"100%", padding:"9px 12px",
                  background:"var(--s2)", border:"1px solid var(--b1)",
                  borderRadius:9, color: linked ? "var(--t1)" : "var(--t3)",
                  fontFamily:"var(--sans)", fontSize:13, outline:"none",
                  appearance:"none", cursor:"pointer",
                }}>
                <option value="">— None —</option>
                {pendingTasks.map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>

            {/* Session notes */}
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:10, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--t3)", fontFamily:"var(--mono)", display:"block", marginBottom:6 }}>
                Session goal
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="What will you accomplish this session?"
                style={{
                  width:"100%", padding:"9px 12px", minHeight:68,
                  background:"var(--s2)", border:"1px solid var(--b1)",
                  borderRadius:9, color:"var(--t1)",
                  fontFamily:"var(--sans)", fontSize:13, outline:"none", resize:"none",
                  transition:"border-color 0.2s, box-shadow 0.2s",
                }}
                onFocus={e => { e.target.style.borderColor="rgba(167,139,250,0.4)"; e.target.style.boxShadow="0 0 0 3px rgba(167,139,250,0.08)"; }}
                onBlur={e  => { e.target.style.borderColor="var(--b1)"; e.target.style.boxShadow="none"; }}
              />
            </div>

            {/* Today's stats */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:18 }}>
              {[
                { label:"Today",   val:todayN,    color:"var(--violet)", unit:"sessions" },
                { label:"Total",   val:`${totalMin}m`, color:"var(--blue)", unit:"focus time" },
                { label:"Streak",  val:streak,    color:"var(--amber)", unit:"days" },
                { label:"Sessions",val:sessions.length, color:"var(--green)", unit:"all time" },
              ].map((s, i) => (
                <div key={i} style={{ background:"var(--s2)", border:"1px solid var(--b1)", borderRadius:9, padding:"10px 12px" }}>
                  <div style={{ fontSize:9, textTransform:"uppercase", letterSpacing:"0.1em", color:"var(--t3)", fontFamily:"var(--mono)", fontWeight:700, marginBottom:4 }}>{s.label}</div>
                  <div style={{ fontSize:17, fontWeight:700, fontFamily:"var(--mono)", color:s.color }}>{s.val}</div>
                  <div style={{ fontSize:9, color:"var(--t3)", fontFamily:"var(--mono)", marginTop:2 }}>{s.unit}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div style={{ height:1, background:"var(--b1)", margin:"0 18px" }} />

          {/* Session history */}
          <div style={{ padding:18 }}>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--t3)", fontFamily:"var(--mono)", marginBottom:14 }}>
              Recent Sessions
            </div>

            {recentSessions.length === 0 ? (
              <div style={{ fontSize:12, color:"var(--t3)", fontFamily:"var(--mono)", textAlign:"center", padding:"20px 0" }}>
                No sessions yet.<br />Start your first one →
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {recentSessions.map((s, i) => {
                  const linkedTask = s.taskId ? tasks.find(t => t.id === s.taskId) : null;
                  const d = new Date(s.date);
                  const isToday = d.toDateString() === today;
                  return (
                    <div key={i} style={{
                      padding:"10px 12px", borderRadius:9,
                      background:"var(--s2)", border:"1px solid var(--b1)",
                      animation:`slideR 0.28s ease ${i*40}ms both`,
                    }}>
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:3 }}>
                        <span style={{ fontSize:11, fontWeight:600, color:"var(--violet)", fontFamily:"var(--mono)" }}>
                          25 min
                        </span>
                        <span style={{ fontSize:10, color:"var(--t3)", fontFamily:"var(--mono)" }}>
                          {isToday ? "Today" : d.toLocaleDateString("en",{month:"short",day:"numeric"})}
                          {" "}{d.toLocaleTimeString("en",{hour:"2-digit",minute:"2-digit"})}
                        </span>
                      </div>
                      {linkedTask && (
                        <div style={{ fontSize:11, color:"var(--t2)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                          ↳ {linkedTask.title}
                        </div>
                      )}
                      {s.notes && (
                        <div style={{ fontSize:11, color:"var(--t3)", marginTop:2, fontStyle:"italic", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                          "{s.notes}"
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
