// ─────────────────────────────────────────────
// src/shared.js
// Design tokens, hooks, store — shared across all pages
// ─────────────────────────────────────────────

// ── GLOBAL CSS ──────────────────────────────
export const GLOBAL_CSS = `
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
  --sans:'DM Sans',sans-serif;
  --mono:'IBM Plex Mono',monospace;
  --serif:'Fraunces',Georgia,serif;
}
html,body{min-height:100%;font-family:var(--sans);background:var(--s0);color:var(--t1);-webkit-font-smoothing:antialiased;overflow-x:hidden}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:var(--s5);border-radius:4px}

@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideR{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:translateX(0)}}
@keyframes barIn{from{transform:scaleY(0);transform-origin:bottom}to{transform:scaleY(1);transform-origin:bottom}}
@keyframes toastSlide{from{opacity:0;transform:translateX(10px)}to{opacity:1;transform:translateX(0)}}
@keyframes glint{0%{left:-100%}100%{left:220%}}
@keyframes pulse{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:1;transform:scale(1.06)}}
@keyframes beat{0%,100%{transform:scale(1)}50%{transform:scale(1.015)}}
@keyframes checkPop{0%{transform:scale(0)}60%{transform:scale(1.25)}100%{transform:scale(1)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes pageIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

/* ── App shell ── */
.wz-app{
  min-height:100vh;
  background:
    radial-gradient(ellipse 75% 50% at 12% 0%,rgba(167,139,250,0.08) 0%,transparent 55%),
    radial-gradient(ellipse 55% 40% at 88% 100%,rgba(96,165,250,0.06) 0%,transparent 55%),
    var(--s0);
}

/* ── Sidebar nav ── */
.wz-sidebar{
  position:fixed;top:0;left:0;bottom:0;width:220px;z-index:50;
  background:rgba(7,8,13,0.92);backdrop-filter:blur(24px);
  border-right:1px solid var(--b1);
  display:flex;flex-direction:column;padding:0;
}
.wz-sidebar-logo{
  padding:22px 20px 18px;
  border-bottom:1px solid var(--b1);
  display:flex;align-items:center;gap:10px;
}
.wz-logo-mark{
  width:30px;height:30px;border-radius:8px;
  background:linear-gradient(135deg,var(--violet),var(--blue));
  display:grid;place-items:center;font-size:14px;
  box-shadow:0 4px 14px rgba(167,139,250,0.35);
  flex-shrink:0;
}
.wz-logo-text{font-family:var(--serif);font-size:17px;font-weight:600;letter-spacing:-0.3px}
.wz-logo-text em{font-style:italic;color:var(--violet)}

.wz-nav{flex:1;padding:12px 10px;display:flex;flex-direction:column;gap:4px;overflow-y:auto}
.wz-nav-item{
  display:flex;align-items:center;gap:10px;
  padding:9px 12px;border-radius:10px;border:none;
  background:transparent;color:var(--t2);
  font-family:var(--sans);font-size:13px;font-weight:500;
  cursor:pointer;transition:all 0.18s;text-decoration:none;
  width:100%;text-align:left;
}
.wz-nav-item:hover{background:var(--s2);color:var(--t1)}
.wz-nav-item.active{background:var(--s3);color:var(--t1);border:1px solid var(--b2)}
.wz-nav-item.active .wz-nav-icon{opacity:1}
.wz-nav-icon{font-size:15px;opacity:0.5;transition:opacity 0.18s;flex-shrink:0}
.wz-nav-label{flex:1}
.wz-nav-badge{
  font-size:9px;font-family:var(--mono);font-weight:600;
  padding:2px 6px;border-radius:99px;background:var(--s5);color:var(--t3);
}
.wz-nav-badge.amber{background:var(--amber-dim);color:var(--amber)}
.wz-nav-badge.green{background:var(--green-dim);color:var(--green)}
.wz-nav-badge.violet{background:var(--violet-dim);color:var(--violet)}

.wz-sidebar-footer{
  padding:14px 16px;border-top:1px solid var(--b1);
  font-size:10px;color:var(--t3);font-family:var(--mono);
  display:flex;align-items:center;gap:6px;
}
.wz-footer-dot{width:6px;height:6px;border-radius:50%;background:var(--green);box-shadow:0 0 6px var(--green);animation:pulse 2s ease-in-out infinite}

/* ── Main content area ── */
.wz-content{margin-left:220px;min-height:100vh}
.wz-page-header{
  position:sticky;top:0;z-index:40;
  padding:0 28px;height:56px;
  display:flex;align-items:center;justify-content:space-between;
  background:rgba(7,8,13,0.85);backdrop-filter:blur(20px);
  border-bottom:1px solid var(--b1);
}
.wz-page-title{font-family:var(--serif);font-size:18px;font-weight:500;letter-spacing:-0.3px}
.wz-page-title em{font-style:italic;color:var(--violet)}
.wz-page-subtitle{font-size:11px;color:var(--t3);font-family:var(--mono);margin-left:8px}

.wz-page-body{padding:24px 28px;animation:pageIn 0.35s ease both}

/* ── Cards / Panels ── */
.wz-panel{
  background:var(--s1);border:1px solid var(--b1);border-radius:16px;overflow:hidden;
  animation:fadeUp 0.4s ease both;transition:border-color 0.2s;
}
.wz-panel:hover{border-color:var(--b2)}
.wz-panel-hd{padding:14px 18px;border-bottom:1px solid var(--b1);display:flex;align-items:center;justify-content:space-between}
.wz-panel-title{font-size:10px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:var(--t3);font-family:var(--mono)}
.wz-panel-bd{padding:18px}

/* ── Stats ── */
.wz-stats{display:grid;gap:10px}
.wz-stat{
  background:var(--s2);border:1px solid var(--b1);border-radius:12px;padding:14px 16px;
  transition:all 0.18s;animation:fadeUp 0.4s ease both;
}
.wz-stat:hover{border-color:var(--b2);transform:translateY(-1px)}
.wz-stat-icon{font-size:16px;margin-bottom:8px}
.wz-stat-val{font-size:24px;font-weight:700;font-family:var(--mono);letter-spacing:-1px;line-height:1;margin-bottom:4px}
.wz-stat-lbl{font-size:10px;color:var(--t3);font-weight:600;letter-spacing:0.06em;text-transform:uppercase;font-family:var(--mono)}

/* ── Form elements ── */
.wz-field{display:flex;flex-direction:column;gap:6px;margin-bottom:12px}
.wz-field-label{font-size:10px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:var(--t3);font-family:var(--mono)}
.wz-input{
  width:100%;padding:10px 13px;
  background:var(--s2);border:1px solid var(--b1);border-radius:9px;
  color:var(--t1);font-family:var(--sans);font-size:14px;outline:none;resize:none;
  transition:border-color 0.2s,box-shadow 0.2s,background 0.2s;
}
.wz-input::placeholder{color:var(--t4)}
.wz-input:focus{border-color:rgba(167,139,250,0.45);box-shadow:0 0 0 3px rgba(167,139,250,0.08);background:var(--s3)}
textarea.wz-input{min-height:60px}

/* Priority picker */
.wz-prio-group{display:flex;gap:7px}
.wz-prio-opt{
  flex:1;padding:8px 5px;border:1px solid var(--b1);border-radius:9px;
  background:var(--s2);cursor:pointer;transition:all 0.17s;
  display:flex;flex-direction:column;align-items:center;gap:5px;
}
.wz-prio-opt:hover{background:var(--s3);border-color:var(--b2)}
.wz-prio-dot{width:8px;height:8px;border-radius:50%;transition:background 0.18s}
.wz-prio-lbl{font-size:9px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--t3);font-family:var(--mono)}

/* Submit button */
.wz-submit{
  width:100%;padding:11px;border:none;border-radius:9px;cursor:pointer;
  font-family:var(--sans);font-size:14px;font-weight:600;color:#fff;
  background:linear-gradient(135deg,var(--violet),var(--blue));
  box-shadow:0 4px 18px rgba(167,139,250,0.25);
  transition:all 0.2s;position:relative;overflow:hidden;
}
.wz-submit::after{content:'';position:absolute;top:0;left:-100%;width:60%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.12),transparent);transform:skewX(-20deg)}
.wz-submit:hover{transform:translateY(-1px);box-shadow:0 6px 26px rgba(167,139,250,0.4)}
.wz-submit:hover::after{animation:glint 0.5s ease forwards}
.wz-submit.edit{background:linear-gradient(135deg,var(--amber),var(--amber2));box-shadow:0 4px 18px rgba(245,166,35,0.25)}

/* ── Task rows ── */
.wz-task{
  display:flex;align-items:flex-start;gap:11px;padding:12px 14px;
  border-radius:12px;border:1px solid var(--b1);background:var(--s2);
  transition:all 0.17s;animation:slideR 0.28s ease both;cursor:default;
}
.wz-task:hover{border-color:var(--b2);background:var(--s3);transform:translateX(3px);box-shadow:0 2px 12px rgba(0,0,0,0.3)}
.wz-task.done{opacity:0.4}
.wz-task.done:hover{opacity:0.58}
.wz-chk{
  width:18px;height:18px;border-radius:5px;flex-shrink:0;margin-top:1px;
  border:1.5px solid var(--b3);background:transparent;cursor:pointer;
  display:flex;align-items:center;justify-content:center;transition:all 0.18s;
}
.wz-chk:hover{border-color:var(--green);background:var(--green-dim)}
.wz-chk.done{background:var(--green);border-color:var(--green)}
.wz-chk.done svg{animation:checkPop 0.22s ease}
.wz-task-body{flex:1;min-width:0}
.wz-task-name{font-size:14px;font-weight:500;line-height:1.35;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;transition:color 0.2s}
.wz-task.done .wz-task-name{text-decoration:line-through;color:var(--t3)}
.wz-task-desc{font-size:12px;color:var(--t3);margin-top:2px;line-height:1.4}
.wz-task-meta{display:flex;align-items:center;gap:6px;flex-shrink:0}
.wz-pill{font-size:9px;font-weight:700;padding:2px 8px;border-radius:99px;border:1px solid;font-family:var(--mono);letter-spacing:0.05em;text-transform:uppercase}
.wz-del{
  width:26px;height:26px;border-radius:6px;border:1px solid transparent;
  background:transparent;cursor:pointer;color:var(--t3);font-size:12px;
  display:flex;align-items:center;justify-content:center;transition:all 0.17s;opacity:0;
}
.wz-task:hover .wz-del{opacity:1}
.wz-del:hover{color:var(--red);border-color:rgba(251,113,133,0.3);background:var(--red-dim)}

/* ── Group divider ── */
.wz-group-div{
  display:flex;align-items:center;gap:8px;
  font-size:9px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;
  color:var(--t3);font-family:var(--mono);margin:14px 0 8px;
}
.wz-group-div::after{content:'';flex:1;height:1px;background:var(--b1)}

/* ── Empty state ── */
.wz-empty{
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  padding:44px 20px;gap:10px;border:1px dashed var(--b2);border-radius:12px;
  animation:fadeIn 0.3s ease;
}
.wz-empty-icon{font-size:30px;opacity:0.4;font-family:var(--mono)}
.wz-empty-title{font-size:14px;font-weight:600;color:var(--t2)}
.wz-empty-sub{font-size:12px;color:var(--t3);text-align:center;max-width:200px;line-height:1.5}

/* ── Progress bar ── */
.wz-prog-wrap{background:var(--s3);border-radius:99px;height:3px;overflow:hidden}
.wz-prog-bar{height:100%;border-radius:99px;background:linear-gradient(90deg,var(--violet),var(--green));transition:width 0.7s cubic-bezier(.4,0,.2,1)}

/* ── Insight tiles ── */
.wz-tiles{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.wz-tile{background:var(--s2);border:1px solid var(--b1);border-radius:10px;padding:11px 13px}
.wz-tile-lbl{font-size:9px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--t3);font-family:var(--mono);margin-bottom:5px}
.wz-tile-val{font-size:18px;font-weight:700;font-family:var(--mono)}
.wz-tile-unit{font-size:10px;color:var(--t3);font-family:var(--sans);margin-left:3px;font-weight:400}

/* ── Chart ── */
.wz-chart-bars{display:flex;align-items:flex-end;gap:5px;height:52px}
.wz-bar-col{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;height:100%}
.wz-bar-track{flex:1;width:100%;display:flex;align-items:flex-end;border-radius:4px;background:var(--s3);overflow:hidden}
.wz-bar{width:100%;border-radius:4px;transition:height 0.5s;animation:barIn 0.5s ease both}
.wz-bar-day{font-size:8px;color:var(--t3);font-family:var(--mono);text-transform:uppercase;letter-spacing:0.04em}

/* ── Search ── */
.wz-search{position:relative}
.wz-search-icon{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:var(--t3);font-size:14px;pointer-events:none}
.wz-search .wz-input{padding-left:32px;font-size:13px}

/* ── Cancel link ── */
.wz-cancel{font-size:11px;font-family:var(--mono);color:var(--t3);background:none;border:none;cursor:pointer;text-decoration:underline;text-underline-offset:3px;transition:color 0.2s}
.wz-cancel:hover{color:var(--t2)}

/* ── Toast ── */
.wz-toast{
  position:fixed;bottom:22px;right:22px;z-index:400;
  display:flex;align-items:center;gap:9px;padding:11px 17px;border-radius:11px;
  background:var(--s3);border:1px solid var(--b2);box-shadow:0 8px 30px rgba(0,0,0,0.5);
  font-size:13px;font-weight:500;backdrop-filter:blur(20px);
  animation:toastSlide 0.28s ease;
}
.wz-toast-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}

/* ── Focus page specific ── */
.wz-focus-page{
  min-height:calc(100vh - 56px);
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  padding:40px 28px;
  background:radial-gradient(ellipse 70% 55% at 50% 40%,rgba(167,139,250,0.07) 0%,transparent 65%);
}
.wz-focus-ring{position:relative;width:260px;height:260px;margin-bottom:40px}
.wz-focus-ring svg{position:absolute;inset:0}
.wz-ring-phase{font-size:9px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:var(--violet);font-family:var(--mono);margin-bottom:4px}
.wz-ring-time{font-size:56px;font-weight:400;letter-spacing:-3px;font-family:var(--serif);color:var(--t1);line-height:1}
.wz-ring-time.ticking{animation:beat 1s ease-in-out infinite}
.wz-ring-session{font-size:11px;color:var(--t3);font-family:var(--mono);margin-top:6px}
.wz-ring-inner{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}
.wz-fc-row{display:flex;gap:10px;margin-bottom:14px}
.wz-fc-btn{
  padding:10px 24px;border-radius:11px;cursor:pointer;border:1px solid var(--b2);
  background:var(--s2);color:var(--t2);font-family:var(--sans);font-size:13px;font-weight:600;transition:all 0.2s;
}
.wz-fc-btn:hover{background:var(--s3);color:var(--t1);transform:translateY(-1px)}
.wz-fc-btn.primary{background:linear-gradient(135deg,var(--violet),var(--blue));color:#fff;border:none;padding:11px 34px;font-size:14px;box-shadow:0 6px 24px rgba(167,139,250,0.3)}
.wz-fc-btn.primary:hover{box-shadow:0 10px 32px rgba(167,139,250,0.45);transform:translateY(-2px)}
.wz-fc-btn.danger{border-color:rgba(251,113,133,0.2);color:rgba(251,113,133,0.6)}
.wz-fc-btn.danger:hover{color:var(--red);background:var(--red-dim)}
.wz-fc-hint{font-size:11px;color:var(--t3);font-family:var(--mono);letter-spacing:0.04em}
.wz-fc-done{
  display:flex;align-items:center;gap:8px;margin-bottom:24px;
  padding:9px 18px;border-radius:9px;
  background:var(--green-dim);border:1px solid rgba(74,222,128,0.22);
  color:var(--green);font-size:12px;font-weight:600;font-family:var(--mono);
  animation:fadeUp 0.4s ease;
}

/* ── Done page specific ── */
.wz-done-hero{
  background:linear-gradient(135deg,var(--green-dim),rgba(74,222,128,0.05));
  border:1px solid rgba(74,222,128,0.15);border-radius:16px;
  padding:24px;margin-bottom:18px;display:flex;align-items:center;gap:18px;
}
.wz-done-ring-wrap{flex-shrink:0;position:relative;width:72px;height:72px}
.wz-done-hero-text h2{font-size:18px;font-weight:700;margin-bottom:4px}
.wz-done-hero-text p{font-size:13px;color:var(--t2);line-height:1.5}

/* ── Active page specific ── */
.wz-active-hero{
  background:linear-gradient(135deg,var(--amber-dim),rgba(245,166,35,0.04));
  border:1px solid rgba(245,166,35,0.15);border-radius:16px;
  padding:20px 24px;margin-bottom:18px;display:flex;align-items:center;justify-content:space-between;gap:16px;
}
.wz-urgency{font-size:11px;font-family:var(--mono);color:var(--amber);letter-spacing:0.06em;margin-bottom:6px;text-transform:uppercase;font-weight:600}
.wz-active-hero h2{font-size:17px;font-weight:700;margin-bottom:3px}
.wz-active-hero p{font-size:12px;color:var(--t2)}
.wz-active-count{font-size:40px;font-weight:800;font-family:var(--mono);color:var(--amber);line-height:1;flex-shrink:0}

/* ── Kbd hint ── */
.wz-kbd{display:inline-flex;align-items:center;justify-content:center;padding:1px 5px;border-radius:4px;border:1px solid var(--b2);background:var(--s3);font-size:9px;font-family:var(--mono);color:var(--t3);line-height:1.5}
`;

// ── PRIORITY CONFIG ──────────────────────────
export const P = {
  high:   { color:"#fb7185", bg:"rgba(251,113,133,0.1)",  border:"rgba(251,113,133,0.28)" },
  medium: { color:"#f5a623", bg:"rgba(245,166,35,0.1)",   border:"rgba(245,166,35,0.28)"  },
  low:    { color:"#4ade80", bg:"rgba(74,222,128,0.1)",   border:"rgba(74,222,128,0.28)"  },
};

// ── LOCAL STORAGE HOOK ───────────────────────
export function useLS(key, init) {
  const { useState, useCallback } = require("react");
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
