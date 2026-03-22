import { useState, useEffect, useMemo, useRef, useCallback } from "react";

/* ══════════════════════════════════════════════
   GLOBAL CSS
══════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,700;1,9..144,400&family=IBM+Plex+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500;600&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --s0:#07080d;--s1:#0d0e18;--s2:#12131e;--s3:#181926;--s4:#1e2030;--s5:#262840;
  --b1:rgba(200,210,255,0.06);--b2:rgba(200,210,255,0.11);--b3:rgba(200,210,255,0.18);
  --t1:#eef0f8;--t2:rgba(238,240,248,0.55);--t3:rgba(238,240,248,0.3);--t4:rgba(238,240,248,0.12);
  --amber:#f5a623;--amber2:#e8912a;--amber-dim:rgba(245,166,35,0.12);
  --green:#4ade80;--green-dim:rgba(74,222,128,0.12);
  --red:#fb7185;--red-dim:rgba(251,113,133,0.12);
  --blue:#60a5fa;--blue-dim:rgba(96,165,250,0.12);
  --violet:#a78bfa;--violet-dim:rgba(167,139,250,0.12);
  --sans:'DM Sans',sans-serif;--mono:'IBM Plex Mono',monospace;--serif:'Fraunces',Georgia,serif;
}
html,body{min-height:100%;font-family:var(--sans);background:var(--s0);color:var(--t1);-webkit-font-smoothing:antialiased;overflow-x:hidden}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:var(--s5);border-radius:4px}

@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideR{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:translateX(0)}}
@keyframes barIn{from{transform:scaleY(0);transform-origin:bottom}to{transform:scaleY(1);transform-origin:bottom}}
@keyframes toastSlide{from{opacity:0;transform:translateX(10px)}to{opacity:1;transform:translateX(0)}}
@keyframes glint{0%{left:-100%}100%{left:220%}}
@keyframes pulse{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:1;transform:scale(1.06)}}
@keyframes beat{0%,100%{transform:scale(1)}50%{transform:scale(1.015)}}
@keyframes checkPop{0%{transform:scale(0)}60%{transform:scale(1.25)}100%{transform:scale(1)}}
@keyframes pageIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}

.app{
  min-height:100vh;
  background:
    radial-gradient(ellipse 75% 50% at 12% 0%,rgba(167,139,250,0.08) 0%,transparent 55%),
    radial-gradient(ellipse 55% 40% at 88% 100%,rgba(96,165,250,0.06) 0%,transparent 55%),
    var(--s0);
  display:flex;
}

/* Sidebar */
.sidebar{
  position:fixed;top:0;left:0;bottom:0;width:210px;z-index:50;
  background:rgba(7,8,13,0.95);backdrop-filter:blur(24px);
  border-right:1px solid var(--b1);display:flex;flex-direction:column;
}
.sidebar-logo{padding:20px 18px 16px;border-bottom:1px solid var(--b1);display:flex;align-items:center;gap:10px}
.logo-mark{width:28px;height:28px;border-radius:8px;background:linear-gradient(135deg,var(--violet),var(--blue));display:grid;place-items:center;font-size:13px;box-shadow:0 4px 14px rgba(167,139,250,0.35);flex-shrink:0}
.logo-text{font-family:var(--serif);font-size:16px;font-weight:600;letter-spacing:-0.3px}
.logo-text em{font-style:italic;color:var(--violet)}
.nav{flex:1;padding:10px 8px;display:flex;flex-direction:column;gap:3px;overflow-y:auto}
.nav-section{font-size:9px;font-family:var(--mono);color:var(--t3);letter-spacing:0.1em;text-transform:uppercase;padding:6px 10px 3px;font-weight:700}
.nav-item{
  display:flex;align-items:center;gap:9px;padding:8px 10px;border-radius:9px;border:none;
  background:transparent;color:var(--t2);font-family:var(--sans);font-size:13px;font-weight:500;
  cursor:pointer;transition:all 0.17s;width:100%;text-align:left;
}
.nav-item:hover{background:var(--s2);color:var(--t1)}
.nav-item.active{background:var(--s3);color:var(--t1);border:1px solid var(--b2)}
.nav-icon{font-size:14px;opacity:0.55;transition:opacity 0.17s;flex-shrink:0}
.nav-item.active .nav-icon{opacity:1}
.nav-label{flex:1}
.nav-badge{font-size:9px;font-family:var(--mono);font-weight:600;padding:2px 6px;border-radius:99px;background:var(--s5);color:var(--t3)}
.nav-badge.amber{background:var(--amber-dim);color:var(--amber)}
.nav-badge.green{background:var(--green-dim);color:var(--green)}
.nav-badge.violet{background:var(--violet-dim);color:var(--violet)}
.sidebar-footer{padding:12px 14px;border-top:1px solid var(--b1);font-size:10px;color:var(--t3);font-family:var(--mono);display:flex;align-items:center;gap:6px}
.footer-dot{width:6px;height:6px;border-radius:50%;background:var(--green);box-shadow:0 0 6px var(--green);animation:pulse 2s ease-in-out infinite;flex-shrink:0}

/* Content */
.content{margin-left:210px;min-height:100vh;flex:1}
.page-hdr{position:sticky;top:0;z-index:40;padding:0 26px;height:54px;display:flex;align-items:center;justify-content:space-between;background:rgba(7,8,13,0.88);backdrop-filter:blur(20px);border-bottom:1px solid var(--b1)}
.page-title{font-family:var(--serif);font-size:17px;font-weight:500;letter-spacing:-0.3px}
.page-title em{font-style:italic;color:var(--violet)}
.page-sub{font-size:11px;color:var(--t3);font-family:var(--mono);margin-left:7px}
.page-body{padding:22px 26px;animation:pageIn 0.3s ease both}

/* Panels */
.panel{background:var(--s1);border:1px solid var(--b1);border-radius:16px;overflow:hidden;transition:border-color 0.2s;animation:fadeUp 0.4s ease both}
.panel:hover{border-color:var(--b2)}
.panel-hd{padding:13px 17px;border-bottom:1px solid var(--b1);display:flex;align-items:center;justify-content:space-between}
.panel-title{font-size:10px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:var(--t3);font-family:var(--mono)}
.panel-bd{padding:17px}

/* Stats */
.stats-grid{display:grid;gap:9px}
.stat-card{background:var(--s2);border:1px solid var(--b1);border-radius:11px;padding:13px 15px;transition:all 0.18s;animation:fadeUp 0.4s ease both}
.stat-card:hover{border-color:var(--b2);transform:translateY(-1px)}
.stat-icon{font-size:15px;margin-bottom:7px}
.stat-val{font-size:22px;font-weight:700;font-family:var(--mono);letter-spacing:-1px;line-height:1;margin-bottom:3px}
.stat-lbl{font-size:10px;color:var(--t3);font-weight:600;letter-spacing:0.06em;text-transform:uppercase;font-family:var(--mono)}

/* Form */
.field{display:flex;flex-direction:column;gap:5px;margin-bottom:11px}
.field-label{font-size:10px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:var(--t3);font-family:var(--mono)}
.inp{width:100%;padding:9px 12px;background:var(--s2);border:1px solid var(--b1);border-radius:8px;color:var(--t1);font-family:var(--sans);font-size:13px;outline:none;resize:none;transition:all 0.2s}
.inp::placeholder{color:var(--t4)}
.inp:focus{border-color:rgba(167,139,250,0.45);box-shadow:0 0 0 3px rgba(167,139,250,0.08);background:var(--s3)}
textarea.inp{min-height:58px}
.prio-group{display:flex;gap:6px}
.prio-opt{flex:1;padding:7px 4px;border:1px solid var(--b1);border-radius:8px;background:var(--s2);cursor:pointer;transition:all 0.17s;display:flex;flex-direction:column;align-items:center;gap:4px}
.prio-opt:hover{background:var(--s3);border-color:var(--b2)}
.prio-dot{width:7px;height:7px;border-radius:50%;transition:background 0.18s}
.prio-lbl{font-size:9px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;font-family:var(--mono)}
.submit-btn{width:100%;padding:10px;border:none;border-radius:8px;cursor:pointer;font-family:var(--sans);font-size:13px;font-weight:600;color:#fff;background:linear-gradient(135deg,var(--violet),var(--blue));box-shadow:0 4px 18px rgba(167,139,250,0.25);transition:all 0.2s;position:relative;overflow:hidden}
.submit-btn::after{content:'';position:absolute;top:0;left:-100%;width:60%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent);transform:skewX(-20deg)}
.submit-btn:hover{transform:translateY(-1px);box-shadow:0 6px 26px rgba(167,139,250,0.4)}
.submit-btn:hover::after{animation:glint 0.5s ease forwards}
.submit-btn.edit-mode{background:linear-gradient(135deg,var(--amber),var(--amber2));box-shadow:0 4px 18px rgba(245,166,35,0.25)}
.cancel-btn{font-size:11px;font-family:var(--mono);color:var(--t3);background:none;border:none;cursor:pointer;text-decoration:underline;text-underline-offset:3px;transition:color 0.2s}
.cancel-btn:hover{color:var(--t2)}

/* Tasks */
.task{display:flex;align-items:flex-start;gap:10px;padding:11px 13px;border-radius:11px;border:1px solid var(--b1);background:var(--s2);transition:all 0.17s;animation:slideR 0.28s ease both;cursor:default}
.task:hover{border-color:var(--b2);background:var(--s3);transform:translateX(3px);box-shadow:0 2px 12px rgba(0,0,0,0.3)}
.task.done{opacity:0.4}
.task.done:hover{opacity:0.58}
.chk{width:17px;height:17px;border-radius:5px;flex-shrink:0;margin-top:1px;border:1.5px solid var(--b3);background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.18s}
.chk:hover{border-color:var(--green);background:var(--green-dim)}
.chk.done{background:var(--green);border-color:var(--green)}
.chk.done svg{animation:checkPop 0.22s ease}
.task-body{flex:1;min-width:0}
.task-name{font-size:13px;font-weight:500;line-height:1.35;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:color 0.2s}
.task.done .task-name{text-decoration:line-through;color:var(--t3)}
.task-desc{font-size:11px;color:var(--t3);margin-top:2px;line-height:1.4}
.task-meta{display:flex;align-items:center;gap:5px;flex-shrink:0}
.pill{font-size:9px;font-weight:700;padding:2px 7px;border-radius:99px;border:1px solid;font-family:var(--mono);letter-spacing:0.05em;text-transform:uppercase}
.del-btn{width:24px;height:24px;border-radius:5px;border:1px solid transparent;background:transparent;cursor:pointer;color:var(--t3);display:flex;align-items:center;justify-content:center;transition:all 0.17s;opacity:0}
.task:hover .del-btn{opacity:1}
.del-btn:hover{color:var(--red);border-color:rgba(251,113,133,0.3);background:var(--red-dim)}

/* Group divider */
.group-div{display:flex;align-items:center;gap:8px;font-size:9px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:var(--t3);font-family:var(--mono);margin:13px 0 8px}
.group-div::after{content:'';flex:1;height:1px;background:var(--b1)}

/* Empty */
.empty{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 20px;gap:9px;border:1px dashed var(--b2);border-radius:11px;animation:fadeIn 0.3s ease}
.empty-icon{font-size:28px;opacity:0.4;font-family:var(--mono)}
.empty-title{font-size:13px;font-weight:600;color:var(--t2)}
.empty-sub{font-size:11px;color:var(--t3);text-align:center;max-width:190px;line-height:1.5}

/* Progress bar */
.prog-wrap{background:var(--s3);border-radius:99px;height:3px;overflow:hidden}
.prog-bar{height:100%;border-radius:99px;background:linear-gradient(90deg,var(--violet),var(--green));transition:width 0.7s cubic-bezier(.4,0,.2,1)}

/* Tiles */
.tiles{display:grid;grid-template-columns:1fr 1fr;gap:7px}
.tile{background:var(--s2);border:1px solid var(--b1);border-radius:9px;padding:10px 12px}
.tile-lbl{font-size:9px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--t3);font-family:var(--mono);margin-bottom:4px}
.tile-val{font-size:17px;font-weight:700;font-family:var(--mono)}
.tile-unit{font-size:9px;color:var(--t3);font-family:var(--sans);margin-left:3px;font-weight:400}

/* Chart */
.chart-bars{display:flex;align-items:flex-end;gap:4px;height:50px}
.bar-col{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;height:100%}
.bar-track{flex:1;width:100%;display:flex;align-items:flex-end;border-radius:4px;background:var(--s3);overflow:hidden}
.bar{width:100%;border-radius:4px;transition:height 0.5s;animation:barIn 0.5s ease both}
.bar-day{font-size:8px;color:var(--t3);font-family:var(--mono);text-transform:uppercase;letter-spacing:0.04em}

/* Search */
.search-wrap{position:relative}
.search-ico{position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--t3);font-size:13px;pointer-events:none}
.search-wrap .inp{padding-left:30px;font-size:12px}

/* Toast */
.toast{position:fixed;bottom:20px;right:20px;z-index:400;display:flex;align-items:center;gap:8px;padding:10px 16px;border-radius:10px;background:var(--s3);border:1px solid var(--b2);box-shadow:0 8px 30px rgba(0,0,0,0.5);font-size:12px;font-weight:500;backdrop-filter:blur(20px);animation:toastSlide 0.28s ease}
.toast-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}

/* Focus page */
.focus-center{min-height:calc(100vh - 54px);display:flex;position:relative;overflow:hidden}
.focus-main{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 24px;position:relative}
.focus-ring-wrap{position:relative;width:256px;height:256px;margin-bottom:38px}
.focus-ring-wrap svg{position:absolute;inset:0}
.ring-inner{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}
.ring-phase{font-size:9px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:var(--violet);font-family:var(--mono);margin-bottom:3px}
.ring-time{font-size:54px;font-weight:400;letter-spacing:-3px;font-family:var(--serif);color:var(--t1);line-height:1}
.ring-time.ticking{animation:beat 1s ease-in-out infinite}
.ring-session{font-size:10px;color:var(--t3);font-family:var(--mono);margin-top:5px}
.fc-row{display:flex;gap:9px;margin-bottom:12px}
.fc-btn{padding:9px 22px;border-radius:10px;cursor:pointer;border:1px solid var(--b2);background:var(--s2);color:var(--t2);font-family:var(--sans);font-size:13px;font-weight:600;transition:all 0.2s}
.fc-btn:hover{background:var(--s3);color:var(--t1);transform:translateY(-1px)}
.fc-btn.primary{background:linear-gradient(135deg,var(--violet),var(--blue));color:#fff;border:none;padding:10px 32px;box-shadow:0 6px 24px rgba(167,139,250,0.3)}
.fc-btn.primary:hover{box-shadow:0 10px 32px rgba(167,139,250,0.45);transform:translateY(-2px)}
.fc-btn.danger{border-color:rgba(251,113,133,0.2);color:rgba(251,113,133,0.55)}
.fc-btn.danger:hover{color:var(--red);background:var(--red-dim)}
.fc-hint{font-size:11px;color:var(--t3);font-family:var(--mono);letter-spacing:0.04em}
.fc-done{display:flex;align-items:center;gap:7px;margin-bottom:22px;padding:8px 16px;border-radius:8px;background:var(--green-dim);border:1px solid rgba(74,222,128,0.22);color:var(--green);font-size:12px;font-weight:600;font-family:var(--mono);animation:fadeUp 0.4s ease;position:relative;z-index:1}
.focus-side{width:300px;border-left:1px solid var(--b1);background:var(--s1);display:flex;flex-direction:column;overflow-y:auto}
.focus-side-section{padding:16px 16px 0}
.focus-side-section + .focus-side-section{border-top:1px solid var(--b1);padding-top:16px}
.focus-side-label{font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--t3);font-family:var(--mono);margin-bottom:12px}
`;

/* ══════════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════════ */
const P = {
  high:   { color:"#fb7185", bg:"rgba(251,113,133,0.1)",  border:"rgba(251,113,133,0.28)" },
  medium: { color:"#f5a623", bg:"rgba(245,166,35,0.1)",   border:"rgba(245,166,35,0.28)"  },
  low:    { color:"#4ade80", bg:"rgba(74,222,128,0.1)",   border:"rgba(74,222,128,0.28)"  },
};
const FOCUS_TOTAL = 25 * 60;
const PAGES = ["all","active","done","focus"];

/* ══════════════════════════════════════════════
   HOOKS
══════════════════════════════════════════════ */
function useLS(key, init) {
  const [v, setV] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : init; } catch { return init; }
  });
  const set = useCallback(fn => setV(prev => {
    const next = fn instanceof Function ? fn(prev) : fn;
    try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
    return next;
  }), [key]);
  return [v, set];
}

function useToast() {
  const [toast, setToast] = useState(null);
  const show = useCallback((msg, color = "#4ade80") => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 2600);
  }, []);
  return [toast, show];
}

/* ══════════════════════════════════════════════
   SHARED COMPONENTS
══════════════════════════════════════════════ */
function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className="toast">
      <span className="toast-dot" style={{ background:toast.color, boxShadow:`0 0 6px ${toast.color}` }} />
      {toast.msg}
    </div>
  );
}

function MiniRing({ pct, color, size=64, sw=5, label, sub }) {
  const r=(size-sw)/2, circ=2*Math.PI*r, off=circ-(pct/100)*circ;
  return (
    <div style={{ position:"relative", width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--s3)" strokeWidth={sw}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={sw}
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={off}
          style={{ transition:"stroke-dashoffset 0.8s cubic-bezier(.4,0,.2,1)" }}/>
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
        <span style={{ fontSize:12, fontWeight:700, color, fontFamily:"var(--mono)" }}>{label}</span>
        {sub && <span style={{ fontSize:8, color:"var(--t3)", marginTop:1 }}>{sub}</span>}
      </div>
    </div>
  );
}

function ActivityChart({ sessions, tasks, streak }) {
  const todayKey = new Date().toDateString();
  const last7 = Array.from({length:7}).map((_,i) => {
    const d=new Date(); d.setDate(d.getDate()-(6-i)); const key=d.toDateString();
    return {
      label: d.toLocaleDateString("en",{weekday:"short"}).slice(0,2).toUpperCase(),
      n: sessions.filter(s=>new Date(s.date).toDateString()===key).length +
         tasks.filter(t=>t.completedAt&&new Date(t.completedAt).toDateString()===key).length,
      today: key===todayKey,
    };
  });
  const maxBar = Math.max(...last7.map(d=>d.n), 1);
  return (
    <>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:9 }}>
        <span style={{ fontSize:9, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:"var(--t3)", fontFamily:"var(--mono)" }}>Activity · 7 days</span>
        {streak>0 && <span style={{ fontSize:11, color:"var(--amber)", fontFamily:"var(--mono)" }}>🔥 {streak}d</span>}
      </div>
      <div className="chart-bars">
        {last7.map((d,i) => (
          <div key={i} className="bar-col">
            <div className="bar-track">
              <div className="bar" style={{
                height:`${Math.max((d.n/maxBar)*100, d.n>0?10:0)}%`,
                background: d.today ? "linear-gradient(180deg,var(--violet),var(--blue))" : "linear-gradient(180deg,rgba(167,139,250,0.5),rgba(167,139,250,0.2))",
                animationDelay:`${i*45}ms`,
              }}/>
            </div>
            <span className="bar-day" style={{ color:d.today?"var(--violet)":"var(--t3)" }}>{d.label}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function TaskRow({ task, idx, onToggle, onDelete, onEdit }) {
  const [hov, setHov] = useState(false);
  const p = P[task.priority]||P.medium;
  const done = task.status==="done";
  return (
    <div className={`task ${done?"done":""}`}
      style={{ animationDelay:`${idx*30}ms` }}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      onDoubleClick={!done&&onEdit?onEdit:undefined}
      title={!done&&onEdit?"Double-click to edit":""}>
      <div className={`chk ${done?"done":""}`} onClick={onToggle}>
        {done && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="#07080d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </div>
      <div className="task-body">
        <div className="task-name">{task.title}</div>
        {task.description && <div className="task-desc">{task.description}</div>}
      </div>
      <div className="task-meta">
        {task.completedAt&&done && (
          <span style={{ fontSize:9, color:"var(--t3)", fontFamily:"var(--mono)" }}>
            {new Date(task.completedAt).toLocaleDateString("en",{month:"short",day:"numeric"})}
          </span>
        )}
        <span className="pill" style={{ color:p.color, background:p.bg, borderColor:p.border }}>{task.priority}</span>
        {onDelete && (
          <button className="del-btn" onClick={onDelete} title="Delete">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        )}
      </div>
    </div>
  );
}

function TaskForm({ onSubmit, editTask, onCancel }) {
  const [title,setTitle] = useState(editTask?.title||"");
  const [desc,setDesc]   = useState(editTask?.description||"");
  const [prio,setPrio]   = useState(editTask?.priority||"medium");
  const ref = useRef(null);
  const isEdit = !!editTask;

  const submit = () => {
    if (!title.trim()) { ref.current?.focus(); return; }
    onSubmit({ title, description:desc, priority:prio });
    if (!isEdit) { setTitle(""); setDesc(""); setPrio("medium"); }
  };

  return (
    <div>
      <div className="field">
        <label className="field-label">Title</label>
        <input ref={ref} className="inp" placeholder="What needs doing?"
          value={title} onChange={e=>setTitle(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&submit()}/>
      </div>
      <div className="field">
        <label className="field-label">Notes</label>
        <textarea className="inp" placeholder="Any context…" value={desc} onChange={e=>setDesc(e.target.value)}/>
      </div>
      <div className="field">
        <label className="field-label">Priority</label>
        <div className="prio-group">
          {Object.entries(P).map(([k,p]) => (
            <div key={k} className="prio-opt"
              style={{ borderColor:prio===k?p.border:"var(--b1)", background:prio===k?p.bg:"var(--s2)" }}
              onClick={()=>setPrio(k)}>
              <div className="prio-dot" style={{ background:prio===k?p.color:"var(--s5)" }}/>
              <span className="prio-lbl" style={{ color:prio===k?"var(--t2)":"var(--t3)" }}>{k}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
        <button className={`submit-btn ${isEdit?"edit-mode":""}`} style={{ flex:1 }} onClick={submit}>
          {isEdit?"Update Task":"+ Add Task"}
        </button>
        {isEdit&&onCancel && <button className="cancel-btn" onClick={onCancel}>cancel</button>}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   PAGE: ALL
══════════════════════════════════════════════ */
function AllPage({ tasks, setTasks, sessions }) {
  const [editId,setEditId] = useState(null);
  const [search,setSearch] = useState("");
  const [toast,showToast] = useToast();

  const addTask = d => { setTasks(t=>[...t,{id:Date.now().toString(),...d,status:"pending",createdAt:new Date().toISOString()}]); showToast("Task added ✦"); };
  const updateTask = d => { setTasks(t=>t.map(x=>x.id===editId?{...x,...d}:x)); setEditId(null); showToast("Updated","#60a5fa"); };
  const toggle = id => setTasks(t=>t.map(x=>x.id===id?{...x,status:x.status==="done"?"pending":"done",completedAt:x.status!=="done"?new Date().toISOString():undefined}:x));
  const remove = id => { setTasks(t=>t.filter(x=>x.id!==id)); showToast("Removed","#fb7185"); };

  const total=tasks.length, doneN=tasks.filter(t=>t.status==="done").length, pendN=total-doneN;
  const rate=total?Math.round((doneN/total)*100):0;
  const today=new Date().toDateString();
  const todayDone=tasks.filter(t=>t.completedAt&&new Date(t.completedAt).toDateString()===today).length;
  const todaySess=sessions.filter(s=>new Date(s.date).toDateString()===today).length;
  const streak=useMemo(()=>{let s=0;for(let i=0;i<60;i++){const d=new Date();d.setDate(d.getDate()-i);const k=d.toDateString();if(sessions.some(x=>new Date(x.date).toDateString()===k)||tasks.some(x=>x.completedAt&&new Date(x.completedAt).toDateString()===k))s++;else break}return s},[sessions,tasks]);
  const filtered=useMemo(()=>tasks.filter(t=>t.title.toLowerCase().includes(search.toLowerCase())).sort((a,b)=>a.status===b.status?0:a.status==="done"?1:-1),[tasks,search]);
  const pending=filtered.filter(t=>t.status!=="done"), completed=filtered.filter(t=>t.status==="done");
  const editTask=editId?tasks.find(t=>t.id===editId):null;

  return (
    <>
      <div className="page-hdr">
        <div style={{display:"flex",alignItems:"baseline",gap:7}}>
          <span className="page-title">All <em>Tasks</em></span>
          <span className="page-sub">/ {total} total</span>
        </div>
        <span style={{fontSize:11,color:"var(--t3)",fontFamily:"var(--mono)"}}>double-click to edit</span>
      </div>
      <div className="page-body">
        <div style={{display:"grid",gridTemplateColumns:"265px 1fr",gap:16,alignItems:"start"}}>
          {/* Left */}
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div className="panel">
              <div className="panel-hd"><span className="panel-title">{editId?"editing":"new task"}</span></div>
              <div className="panel-bd">
                <TaskForm key={editId||"new"} editTask={editTask} onSubmit={editId?updateTask:addTask} onCancel={editId?()=>setEditId(null):undefined}/>
              </div>
            </div>
            <div className="panel" style={{animationDelay:"45ms"}}>
              <div className="panel-hd"><span className="panel-title">insights</span></div>
              <div className="panel-bd">
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                  <MiniRing pct={rate} color="var(--violet)" size={60} sw={5} label={`${rate}%`} sub="done"/>
                  <div>
                    <div style={{fontSize:13,fontWeight:600,marginBottom:3}}>{doneN} of {total} done</div>
                    <div style={{fontSize:11,color:"var(--t2)",lineHeight:1.5}}>{pendN>0?`${pendN} remaining`:total>0?"All done 🎉":"Add a task"}</div>
                  </div>
                </div>
                <div className="prog-wrap" style={{marginBottom:12}}><div className="prog-bar" style={{width:`${rate}%`}}/></div>
                <div className="tiles" style={{marginBottom:12}}>
                  {[{l:"Today",v:todayDone,c:"var(--green)"},{l:"Focus",v:todaySess,c:"var(--violet)"},{l:"Streak",v:streak,c:"var(--amber)"},{l:"Rate",v:`${rate}%`,c:"var(--blue)"}].map((x,i)=>(
                    <div key={i} className="tile"><div className="tile-lbl">{x.l}</div><div className="tile-val" style={{color:x.c}}>{x.v}</div></div>
                  ))}
                </div>
                <ActivityChart sessions={sessions} tasks={tasks} streak={streak}/>
              </div>
            </div>
          </div>
          {/* Right */}
          <div className="panel" style={{animationDelay:"65ms"}}>
            <div className="panel-hd">
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span className="panel-title">tasks</span>
                <span style={{fontSize:9,padding:"2px 6px",borderRadius:99,background:"var(--s3)",color:"var(--t3)",fontFamily:"var(--mono)",fontWeight:600}}>{filtered.length}</span>
              </div>
              <div className="search-wrap" style={{width:180}}>
                <span className="search-ico">⌕</span>
                <input className="inp" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…"/>
              </div>
            </div>
            <div className="panel-bd">
              <div className="stats-grid" style={{gridTemplateColumns:"repeat(4,1fr)",marginBottom:16}}>
                {[{icon:"▣",v:total,l:"Total",c:"var(--violet)",d:0},{icon:"◫",v:pendN,l:"Pending",c:"var(--amber)",d:40},{icon:"◆",v:doneN,l:"Done",c:"var(--green)",d:80},{icon:"◎",v:`${rate}%`,l:"Rate",c:"var(--blue)",d:120}].map((s,i)=>(
                  <div key={i} className="stat-card" style={{animationDelay:`${100+s.d}ms`}}>
                    <div className="stat-icon" style={{color:s.c}}>{s.icon}</div>
                    <div className="stat-val" style={{color:s.c}}>{s.v}</div>
                    <div className="stat-lbl">{s.l}</div>
                  </div>
                ))}
              </div>
              {filtered.length===0&&<div className="empty"><div className="empty-icon">{search?"⌕":"◫"}</div><div className="empty-title">{search?"No tasks match":"No tasks yet"}</div><div className="empty-sub">{search?"Try another keyword":"Add your first task"}</div></div>}
              {pending.length>0&&<><div className="group-div">Active · {pending.length}</div><div style={{display:"flex",flexDirection:"column",gap:6}}>{pending.map((t,i)=><TaskRow key={t.id} task={t} idx={i} onToggle={()=>toggle(t.id)} onDelete={()=>remove(t.id)} onEdit={()=>setEditId(t.id)}/>)}</div></>}
              {completed.length>0&&<><div className="group-div" style={{marginTop:14}}>Completed · {completed.length}</div><div style={{display:"flex",flexDirection:"column",gap:6}}>{completed.map((t,i)=><TaskRow key={t.id} task={t} idx={i} onToggle={()=>toggle(t.id)} onDelete={()=>remove(t.id)}/>)}</div></>}
            </div>
          </div>
        </div>
      </div>
      <Toast toast={toast}/>
    </>
  );
}

/* ══════════════════════════════════════════════
   PAGE: ACTIVE
══════════════════════════════════════════════ */
function ActivePage({ tasks, setTasks, sessions }) {
  const [search,setSearch]=useState(""), [prioF,setPrioF]=useState("all"), [showForm,setShowForm]=useState(true);
  const [toast,showToast]=useToast();
  const addTask=d=>{setTasks(t=>[...t,{id:Date.now().toString(),...d,status:"pending",createdAt:new Date().toISOString()}]);showToast("Task added ✦")};
  const complete=id=>{setTasks(t=>t.map(x=>x.id===id?{...x,status:"done",completedAt:new Date().toISOString()}:x));showToast("Done! ✓")};
  const remove=id=>{setTasks(t=>t.filter(x=>x.id!==id));showToast("Removed","#fb7185")};
  const allPending=tasks.filter(t=>t.status!=="done");
  const filtered=useMemo(()=>allPending.filter(t=>{const bs=t.title.toLowerCase().includes(search.toLowerCase());const bp=prioF==="all"||t.priority===prioF;return bs&&bp}).sort((a,b)=>({high:0,medium:1,low:2}[a.priority]||1)-({high:0,medium:1,low:2}[b.priority]||1)),[allPending,search,prioF]);
  const highN=allPending.filter(t=>t.priority==="high").length, medN=allPending.filter(t=>t.priority==="medium").length, lowN=allPending.filter(t=>t.priority==="low").length;
  const streak=useMemo(()=>{let s=0;for(let i=0;i<60;i++){const d=new Date();d.setDate(d.getDate()-i);const k=d.toDateString();if(sessions.some(x=>new Date(x.date).toDateString()===k)||tasks.some(x=>x.completedAt&&new Date(x.completedAt).toDateString()===k))s++;else break}return s},[sessions,tasks]);
  return (
    <>
      <div className="page-hdr">
        <div style={{display:"flex",alignItems:"baseline",gap:7}}><span className="page-title">Active <em>Tasks</em></span><span className="page-sub">/ {allPending.length} pending</span></div>
        <button onClick={()=>setShowForm(f=>!f)} style={{fontSize:11,color:"var(--t3)",background:"var(--s2)",border:"1px solid var(--b1)",borderRadius:7,padding:"4px 11px",cursor:"pointer",fontFamily:"var(--mono)",transition:"all 0.2s"}}>{showForm?"hide form":"+ new task"}</button>
      </div>
      <div className="page-body">
        <div style={{display:"grid",gridTemplateColumns:"265px 1fr",gap:16,alignItems:"start"}}>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {/* Urgency hero */}
            <div style={{background:"linear-gradient(135deg,var(--amber-dim),rgba(245,166,35,0.04))",border:"1px solid rgba(245,166,35,0.15)",borderRadius:14,padding:"18px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:14,animation:"fadeUp 0.4s ease both"}}>
              <div>
                <div style={{fontSize:10,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:"var(--amber)",fontFamily:"var(--mono)",marginBottom:5}}>⚡ needs attention</div>
                <div style={{fontSize:16,fontWeight:700,marginBottom:3}}>{allPending.length===0?"All clear!":allPending.length===1?"1 task waiting":`${allPending.length} tasks waiting`}</div>
                <div style={{fontSize:11,color:"var(--t2)"}}>{allPending.length===0?"Nothing pending. Great work.":`${highN} high · ${medN} med · ${lowN} low`}</div>
              </div>
              <div style={{fontSize:38,fontWeight:800,fontFamily:"var(--mono)",color:"var(--amber)",lineHeight:1,flexShrink:0}}>{allPending.length}</div>
            </div>
            {/* Priority breakdown */}
            <div className="panel" style={{animationDelay:"30ms"}}>
              <div className="panel-hd"><span className="panel-title">by priority</span></div>
              <div className="panel-bd">
                {[{l:"High",n:highN,c:"#fb7185",bg:"rgba(251,113,133,0.1)",bd:"rgba(251,113,133,0.2)"},{l:"Medium",n:medN,c:"var(--amber)",bg:"var(--amber-dim)",bd:"rgba(245,166,35,0.2)"},{l:"Low",n:lowN,c:"var(--green)",bg:"var(--green-dim)",bd:"rgba(74,222,128,0.2)"}].map((p,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 12px",borderRadius:8,border:`1px solid ${p.bd}`,background:p.bg,marginBottom:i<2?7:0}}>
                    <span style={{fontSize:12,fontWeight:600,color:p.c}}>{p.l}</span>
                    <span style={{fontSize:16,fontWeight:700,fontFamily:"var(--mono)",color:p.c}}>{p.n}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="panel" style={{animationDelay:"50ms"}}>
              <div className="panel-hd"><span className="panel-title">activity</span></div>
              <div className="panel-bd"><ActivityChart sessions={sessions} tasks={tasks} streak={streak}/></div>
            </div>
            {showForm&&<div className="panel" style={{animationDelay:"65ms"}}><div className="panel-hd"><span className="panel-title">add task</span></div><div className="panel-bd"><TaskForm onSubmit={addTask}/></div></div>}
          </div>
          {/* Right */}
          <div className="panel" style={{animationDelay:"55ms"}}>
            <div className="panel-hd">
              <div style={{display:"flex",alignItems:"center",gap:8}}><span className="panel-title">pending</span><span style={{fontSize:9,padding:"2px 6px",borderRadius:99,background:"var(--amber-dim)",color:"var(--amber)",fontFamily:"var(--mono)",fontWeight:600}}>{filtered.length}</span></div>
              <div className="search-wrap" style={{width:170}}><span className="search-ico">⌕</span><input className="inp" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…"/></div>
            </div>
            <div className="panel-bd">
              <div style={{display:"flex",gap:5,marginBottom:14,flexWrap:"wrap"}}>
                {[{v:"all",l:"All",c:"var(--t2)"},{v:"high",l:"High",c:"#fb7185"},{v:"medium",l:"Med",c:"var(--amber)"},{v:"low",l:"Low",c:"var(--green)"}].map(f=>(
                  <button key={f.v} onClick={()=>setPrioF(f.v)} style={{padding:"4px 11px",borderRadius:99,border:"1px solid",borderColor:prioF===f.v?f.c:"var(--b1)",background:prioF===f.v?"rgba(255,255,255,0.04)":"transparent",color:prioF===f.v?f.c:"var(--t3)",fontSize:11,fontWeight:600,fontFamily:"var(--mono)",cursor:"pointer",transition:"all 0.17s"}}>{f.l}</button>
                ))}
              </div>
              {filtered.length===0&&<div className="empty"><div className="empty-icon">{allPending.length===0?"✓":"⌕"}</div><div className="empty-title">{allPending.length===0?"All done!":"No tasks match"}</div><div className="empty-sub">{allPending.length===0?"Head to Focus Mode":"Try clearing the filter"}</div></div>}
              {["high","medium","low"].map(pk=>{
                const g=filtered.filter(t=>t.priority===pk); if(!g.length)return null;
                const col={high:"#fb7185",medium:"var(--amber)",low:"var(--green)"}[pk];
                return <div key={pk}><div className="group-div" style={{color:col}}>{pk} · {g.length}</div><div style={{display:"flex",flexDirection:"column",gap:6}}>{g.map((t,i)=><TaskRow key={t.id} task={t} idx={i} onToggle={()=>complete(t.id)} onDelete={()=>remove(t.id)}/>)}</div></div>;
              })}
            </div>
          </div>
        </div>
      </div>
      <Toast toast={toast}/>
    </>
  );
}

/* ══════════════════════════════════════════════
   PAGE: DONE
══════════════════════════════════════════════ */
function DonePage({ tasks, setTasks, sessions }) {
  const [search,setSearch]=useState([]), [toast,showToast]=useToast();
  const restore=id=>{setTasks(t=>t.map(x=>x.id===id?{...x,status:"pending",completedAt:undefined}:x));showToast("Restored","#60a5fa")};
  const remove=id=>{setTasks(t=>t.filter(x=>x.id!==id));showToast("Removed","#fb7185")};
  const allDone=tasks.filter(t=>t.status==="done");
  const total=tasks.length, rate=total?Math.round((allDone.length/total)*100):0;
  const today=new Date().toDateString();
  const todayDone=allDone.filter(t=>t.completedAt&&new Date(t.completedAt).toDateString()===today).length;
  const thisWeek=useMemo(()=>{const c=new Date();c.setDate(c.getDate()-7);return allDone.filter(t=>t.completedAt&&new Date(t.completedAt)>=c).length},[allDone]);
  const streak=useMemo(()=>{let s=0;for(let i=0;i<60;i++){const d=new Date();d.setDate(d.getDate()-i);const k=d.toDateString();if(sessions.some(x=>new Date(x.date).toDateString()===k)||tasks.some(x=>x.completedAt&&new Date(x.completedAt).toDateString()===k))s++;else break}return s},[sessions,tasks]);
  const heatmap=useMemo(()=>{const todayKey=new Date().toDateString();return Array.from({length:14}).map((_,i)=>{const d=new Date();d.setDate(d.getDate()-(13-i));const k=d.toDateString();return{count:allDone.filter(t=>t.completedAt&&new Date(t.completedAt).toDateString()===k).length,today:k===todayKey}})},[allDone]);
  const maxH=Math.max(...heatmap.map(h=>h.count),1);
  const filtered=useMemo(()=>allDone.filter(t=>t.title.toLowerCase().includes((search||"").toLowerCase())).sort((a,b)=>new Date(b.completedAt||0)-new Date(a.completedAt||0)),[allDone,search]);
  const grouped=useMemo(()=>{const g={};filtered.forEach(t=>{const k=t.completedAt?new Date(t.completedAt).toDateString():"Unknown";const lbl=k===today?"Today":k===new Date(Date.now()-86400000).toDateString()?"Yesterday":new Date(t.completedAt).toLocaleDateString("en",{weekday:"short",month:"short",day:"numeric"});if(!g[lbl])g[lbl]=[];g[lbl].push(t)});return g},[filtered,today]);
  const milestones=[1,5,10,25,50,100];
  return (
    <>
      <div className="page-hdr">
        <div style={{display:"flex",alignItems:"baseline",gap:7}}><span className="page-title">Done <em>& Dusted</em></span><span className="page-sub">/ {allDone.length} completed</span></div>
        <span style={{fontSize:11,color:"var(--green)",fontFamily:"var(--mono)",fontWeight:500}}>{rate}% rate</span>
      </div>
      <div className="page-body">
        <div style={{display:"grid",gridTemplateColumns:"265px 1fr",gap:16,alignItems:"start"}}>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={{background:"linear-gradient(135deg,var(--green-dim),rgba(74,222,128,0.04))",border:"1px solid rgba(74,222,128,0.15)",borderRadius:14,padding:"18px 20px",display:"flex",alignItems:"center",gap:16,animation:"fadeUp 0.4s ease both"}}>
              <MiniRing pct={rate} color="var(--green)" size={68} sw={6} label={`${rate}%`} sub="rate"/>
              <div><div style={{fontSize:16,fontWeight:700,marginBottom:3}}>{allDone.length} task{allDone.length!==1?"s":""} done</div><div style={{fontSize:11,color:"var(--t2)"}}>{allDone.length===0?"Complete your first task.":`${todayDone} today · ${thisWeek} this week`}</div></div>
            </div>
            <div className="panel" style={{animationDelay:"28ms"}}>
              <div className="panel-hd"><span className="panel-title">milestones</span></div>
              <div className="panel-bd">
                {milestones.map(m=>{const hit=allDone.length>=m;return(
                  <div key={m} style={{display:"flex",alignItems:"center",gap:9,padding:"7px 0",borderBottom:"1px solid var(--b1)",opacity:hit?1:0.35}}>
                    <span style={{fontSize:13}}>{hit?"✦":"◌"}</span>
                    <span style={{fontSize:12,fontWeight:500,color:hit?"var(--t1)":"var(--t3)",flex:1}}>{m} task{m!==1?"s":""}</span>
                    {hit&&<span style={{fontSize:9,color:"var(--green)",fontFamily:"var(--mono)",fontWeight:700}}>DONE</span>}
                  </div>
                )})}
                {milestones.find(m=>m>allDone.length)&&<div style={{marginTop:9,fontSize:10,color:"var(--t3)",fontFamily:"var(--mono)"}}>{milestones.find(m=>m>allDone.length)-allDone.length} more to next milestone</div>}
              </div>
            </div>
            <div className="panel" style={{animationDelay:"48ms"}}>
              <div className="panel-hd"><span className="panel-title">stats</span></div>
              <div className="panel-bd">
                <div className="tiles">
                  {[{l:"Total",v:allDone.length,c:"var(--green)"},{l:"Today",v:todayDone,c:"var(--violet)"},{l:"Week",v:thisWeek,c:"var(--blue)"},{l:"Streak",v:`${streak}d`,c:"var(--amber)"}].map((s,i)=>(
                    <div key={i} className="tile"><div className="tile-lbl">{s.l}</div><div className="tile-val" style={{color:s.c}}>{s.v}</div></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div className="panel" style={{animationDelay:"45ms"}}>
              <div className="panel-hd"><span className="panel-title">completion heatmap · 14 days</span></div>
              <div className="panel-bd">
                <div style={{display:"flex",gap:4,height:42,alignItems:"flex-end"}}>
                  {heatmap.map((h,i)=>(
                    <div key={i} style={{flex:1,height:"100%",display:"flex",alignItems:"flex-end"}} title={`${h.count} completed`}>
                      <div style={{width:"100%",borderRadius:4,background:h.count===0?"var(--s3)":`rgba(74,222,128,${0.2+(h.count/maxH)*0.8})`,border:h.today?"1px solid rgba(74,222,128,0.4)":"1px solid transparent",animation:`barIn 0.5s ease ${i*25}ms both`,height:`${Math.max((h.count/maxH)*100,h.count>0?12:6)}%`}}/>
                    </div>
                  ))}
                </div>
                <div style={{marginTop:6,fontSize:9,color:"var(--t3)",fontFamily:"var(--mono)"}}>Hover bars for daily counts</div>
              </div>
            </div>
            <div className="panel" style={{animationDelay:"62ms"}}>
              <div className="panel-hd">
                <div style={{display:"flex",alignItems:"center",gap:8}}><span className="panel-title">history</span><span style={{fontSize:9,padding:"2px 6px",borderRadius:99,background:"var(--green-dim)",color:"var(--green)",fontFamily:"var(--mono)",fontWeight:600}}>{filtered.length}</span></div>
                <div className="search-wrap" style={{width:170}}><span className="search-ico">⌕</span><input className="inp" value={search||""} onChange={e=>setSearch(e.target.value)} placeholder="Search…"/></div>
              </div>
              <div className="panel-bd">
                {filtered.length===0&&<div className="empty"><div className="empty-icon">◆</div><div className="empty-title">{search?"No tasks match":"Nothing completed yet"}</div><div className="empty-sub">{search?"Try another keyword":"Complete tasks on the Active page"}</div></div>}
                {Object.entries(grouped).map(([lbl,grp])=>(
                  <div key={lbl}><div className="group-div" style={{color:"var(--green)"}}>{lbl} · {grp.length}</div><div style={{display:"flex",flexDirection:"column",gap:6}}>{grp.map((t,i)=><TaskRow key={t.id} task={t} idx={i} onToggle={()=>restore(t.id)} onDelete={()=>remove(t.id)}/>)}</div></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toast toast={toast}/>
    </>
  );
}

/* ══════════════════════════════════════════════
   PAGE: FOCUS
══════════════════════════════════════════════ */
function FocusPage({ sessions, onAddSession, tasks }) {
  const [rem,setRem]=useState(FOCUS_TOTAL), [running,setRunning]=useState(false), [done,setDone]=useState(false);
  const [linked,setLinked]=useState(""), [notes,setNotes]=useState("");
  const iRef=useRef(null);
  const today=new Date().toDateString();
  const todayN=sessions.filter(s=>new Date(s.date).toDateString()===today).length;
  const totalMin=sessions.length*25;
  const streak=useMemo(()=>{let s=0;for(let i=0;i<60;i++){const d=new Date();d.setDate(d.getDate()-i);if(sessions.some(x=>new Date(x.date).toDateString()===d.toDateString()))s++;else break}return s},[sessions]);
  useEffect(()=>{
    if(running){iRef.current=setInterval(()=>setRem(r=>{if(r<=1){clearInterval(iRef.current);setRunning(false);setDone(true);onAddSession({date:new Date().toISOString(),taskId:linked||null,notes});return 0}return r-1}),1000)}
    else clearInterval(iRef.current);
    return()=>clearInterval(iRef.current);
  },[running,linked,notes,onAddSession]);
  const reset=()=>{setRem(FOCUS_TOTAL);setRunning(false);setDone(false)};
  const mins=Math.floor(rem/60), secs=rem%60;
  const pct=((FOCUS_TOTAL-rem)/FOCUS_TOTAL)*100;
  const r=118, circ=2*Math.PI*r, off=circ-(pct/100)*circ;
  const pendingTasks=tasks.filter(t=>t.status!=="done");
  const recent=[...sessions].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,5);
  return (
    <>
      <div className="page-hdr">
        <div style={{display:"flex",alignItems:"baseline",gap:7}}><span className="page-title">Focus <em>Mode</em></span><span className="page-sub">/ {todayN} session{todayN!==1?"s":""} today</span></div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          {streak>0&&<span style={{fontSize:11,color:"var(--amber)",fontFamily:"var(--mono)"}}>🔥 {streak}-day streak</span>}
          <span style={{fontSize:11,color:"var(--t3)",fontFamily:"var(--mono)"}}>{totalMin}min logged</span>
        </div>
      </div>
      <div className="focus-center">
        {/* Ambient bg */}
        <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none"}}>
          {[{w:650,h:650,t:-220,l:-180,c:"rgba(167,139,250,0.07)",d:"0s"},{w:550,h:550,b:-180,ri:-130,c:"rgba(96,165,250,0.05)",d:"-3.5s"},{w:320,h:320,t:"43%",l:"40%",tf:"translate(-50%,-50%)",c:"rgba(167,139,250,0.04)",d:"-1.8s"}].map((o,i)=>(
            <div key={i} style={{position:"absolute",width:o.w,height:o.h,top:o.t,left:o.l,bottom:o.b,right:o.ri,transform:o.tf,borderRadius:"50%",filter:"blur(75px)",background:`radial-gradient(circle,${o.c} 0%,transparent 70%)`,animation:`pulse 7s ease-in-out infinite`,animationDelay:o.d}}/>
          ))}
        </div>
        {/* Timer center */}
        <div className="focus-main">
          {done&&<div className="fc-done">✦ Session complete — 25 minutes logged</div>}
          <div className="focus-ring-wrap">
            <svg width="256" height="256" viewBox="0 0 256 256" style={{position:"absolute",inset:0}}>
              <defs><linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#a78bfa"/><stop offset="100%" stopColor="#60a5fa"/></linearGradient></defs>
              <g transform="rotate(-90 128 128)">
                <circle cx="128" cy="128" r={r} fill="none" stroke="rgba(200,210,255,0.04)" strokeWidth="2"/>
                <circle cx="128" cy="128" r={r} fill="none" stroke="rgba(167,139,250,0.1)" strokeWidth="3"/>
                <circle cx="128" cy="128" r={r} fill="none" stroke="rgba(167,139,250,0.06)" strokeWidth="13" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={off} style={{transition:"stroke-dashoffset 1s linear"}}/>
                <circle cx="128" cy="128" r={r} fill="none" stroke="url(#rg)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={off} style={{transition:"stroke-dashoffset 1s linear"}}/>
              </g>
            </svg>
            <div className="ring-inner">
              <div className="ring-phase">{done?"✦ done":running?"focusing":"ready"}</div>
              <div className={`ring-time ${running?"ticking":""}`}>{String(mins).padStart(2,"0")}:{String(secs).padStart(2,"0")}</div>
              <div className="ring-session">session {todayN+(done?0:1)} · today</div>
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12,position:"relative",zIndex:1}}>
            <div className="fc-row">
              <button className="fc-btn" onClick={reset}>↺ Reset</button>
              <button className="fc-btn primary" onClick={()=>{setDone(false);setRunning(o=>!o)}}>{running?"⏸ Pause":done?"▶ Again":"▶ Start"}</button>
            </div>
            <div className="fc-hint">{running?"Stay focused — timer is running":done?"Great work! Take a short break.":"25-minute deep work session"}</div>
          </div>
        </div>
        {/* Side panel */}
        <div className="focus-side">
          <div className="focus-side-section">
            <div className="focus-side-label">Session Setup</div>
            <div className="field">
              <label className="field-label">Link to task</label>
              <select value={linked} onChange={e=>setLinked(e.target.value)} style={{width:"100%",padding:"8px 11px",background:"var(--s2)",border:"1px solid var(--b1)",borderRadius:8,color:linked?"var(--t1)":"var(--t3)",fontFamily:"var(--sans)",fontSize:12,outline:"none",appearance:"none",cursor:"pointer"}}>
                <option value="">— None —</option>
                {pendingTasks.map(t=><option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="field-label">Session goal</label>
              <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="What will you accomplish?" className="inp" style={{minHeight:56}}/>
            </div>
            <div className="tiles" style={{marginBottom:16}}>
              {[{l:"Today",v:todayN,c:"var(--violet)",u:"sessions"},{l:"Total",v:`${totalMin}m`,c:"var(--blue)",u:"logged"},{l:"Streak",v:streak,c:"var(--amber)",u:"days"},{l:"All time",v:sessions.length,c:"var(--green)",u:"sessions"}].map((s,i)=>(
                <div key={i} className="tile"><div className="tile-lbl">{s.l}</div><div className="tile-val" style={{color:s.c,fontSize:15}}>{s.v}<span className="tile-unit">{s.u}</span></div></div>
              ))}
            </div>
          </div>
          <div className="focus-side-section" style={{paddingBottom:16}}>
            <div className="focus-side-label">Recent Sessions</div>
            {recent.length===0?(
              <div style={{fontSize:11,color:"var(--t3)",fontFamily:"var(--mono)",textAlign:"center",padding:"16px 0"}}>No sessions yet. Start one →</div>
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:7}}>
                {recent.map((s,i)=>{
                  const lt=s.taskId?tasks.find(t=>t.id===s.taskId):null;
                  const d=new Date(s.date);
                  return(
                    <div key={i} style={{padding:"9px 11px",borderRadius:8,background:"var(--s2)",border:"1px solid var(--b1)",animation:`slideR 0.28s ease ${i*35}ms both`}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:2}}>
                        <span style={{fontSize:11,fontWeight:600,color:"var(--violet)",fontFamily:"var(--mono)"}}>25 min</span>
                        <span style={{fontSize:10,color:"var(--t3)",fontFamily:"var(--mono)"}}>{d.toDateString()===today?"Today":d.toLocaleDateString("en",{month:"short",day:"numeric"})} {d.toLocaleTimeString("en",{hour:"2-digit",minute:"2-digit"})}</span>
                      </div>
                      {lt&&<div style={{fontSize:11,color:"var(--t2)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>↳ {lt.title}</div>}
                      {s.notes&&<div style={{fontSize:10,color:"var(--t3)",marginTop:1,fontStyle:"italic",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>"{s.notes}"</div>}
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

/* ══════════════════════════════════════════════
   ROOT APP
══════════════════════════════════════════════ */
export default function WorkZen() {
  const [tasks,    setTasks]    = useLS("wz_tasks",    []);
  const [sessions, setSessions] = useLS("wz_sessions", []);
  const [page,     setPage]     = useState("all");
  const addSession = useCallback(s=>setSessions(p=>[...p,s]),[setSessions]);

  const pendN   = tasks.filter(t=>t.status!=="done").length;
  const doneN   = tasks.filter(t=>t.status==="done").length;
  const today   = new Date().toDateString();
  const sessN   = sessions.filter(s=>new Date(s.date).toDateString()===today).length;

  const NAV = [
    { id:"all",    icon:"▣", label:"All Tasks",  badge:tasks.length, bc:""       },
    { id:"active", icon:"◫", label:"Active",      badge:pendN,        bc:"amber"  },
    { id:"done",   icon:"◆", label:"Done",        badge:doneN,        bc:"green"  },
    { id:"focus",  icon:"◎", label:"Focus Mode",  badge:sessN>0?`${sessN} today`:null, bc:"violet" },
  ];

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        {/* Sidebar */}
        <nav className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-mark">⚡</div>
            <span className="logo-text">Work<em>Zen</em></span>
          </div>
          <div className="nav">
            <div className="nav-section">Navigation</div>
            {NAV.map(n=>(
              <button key={n.id} className={`nav-item ${page===n.id?"active":""}`} onClick={()=>setPage(n.id)}>
                <span className="nav-icon">{n.icon}</span>
                <span className="nav-label">{n.label}</span>
                {n.badge!==null&&n.badge!==0&&<span className={`nav-badge ${n.bc}`}>{n.badge}</span>}
              </button>
            ))}
          </div>
          <div className="sidebar-footer"><span className="footer-dot"/>prototype · v0.1</div>
        </nav>

        {/* Content */}
        <div className="content">
          {page==="all"    && <AllPage    tasks={tasks} setTasks={setTasks} sessions={sessions}/>}
          {page==="active" && <ActivePage tasks={tasks} setTasks={setTasks} sessions={sessions}/>}
          {page==="done"   && <DonePage   tasks={tasks} setTasks={setTasks} sessions={sessions}/>}
          {page==="focus"  && <FocusPage  sessions={sessions} onAddSession={addSession} tasks={tasks}/>}
        </div>
      </div>
    </>
  );
}
