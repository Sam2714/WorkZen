import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useVoiceCapture } from "./hooks/useVoiceCapture";

/* ══════════════════════════════════════════════
   GLOBAL CSS
══════════════════════════════════════════════ */
const CSS = `
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
  --sans:'Segoe UI Variable','Aptos','Trebuchet MS',sans-serif;
  --mono:'Cascadia Mono','Consolas','Lucida Console',monospace;
  --serif:'Palatino Linotype','Book Antiqua',Georgia,serif;
}
html,body,#root{width:100%;height:100%;min-height:100%}
body{font-family:var(--sans);background:var(--s0);color:var(--t1);-webkit-font-smoothing:antialiased;overflow:auto}
#root{background:var(--s0)}
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

.popup-stage{
  min-height:100vh;
  width:100%;
  display:flex;
  justify-content:flex-end;
  align-items:stretch;
  padding:18px 22px;
  background:
    radial-gradient(ellipse 75% 50% at 12% 0%,rgba(167,139,250,0.08) 0%,transparent 55%),
    radial-gradient(ellipse 55% 40% at 88% 100%,rgba(96,165,250,0.06) 0%,transparent 55%),
    var(--s0);
}
.popup-stage.extension-runtime{
  padding:0;
  min-height:100vh;
  background:var(--s0);
}
.app{
  width:min(430px,100%);
  height:calc(100vh - 36px);
  min-height:680px;
  background:
    radial-gradient(ellipse 75% 50% at 12% 0%,rgba(167,139,250,0.08) 0%,transparent 55%),
    radial-gradient(ellipse 55% 40% at 88% 100%,rgba(96,165,250,0.06) 0%,transparent 55%),
    var(--s0);
  display:flex;
  overflow:hidden;
  border:1px solid var(--b1);
  border-radius:22px;
  box-shadow:0 24px 60px rgba(0,0,0,0.45);
}
.popup-stage.extension-runtime .app{
  width:100%;
  height:100vh;
  min-height:100vh;
  border:none;
  border-radius:0;
  box-shadow:none;
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
.nav-badge.blue{background:var(--blue-dim);color:var(--blue)}
.nav-badge.green{background:var(--green-dim);color:var(--green)}
.nav-badge.violet{background:var(--violet-dim);color:var(--violet)}
.sidebar-footer{padding:12px 14px;border-top:1px solid var(--b1);font-size:10px;color:var(--t3);font-family:var(--mono);display:flex;align-items:center;gap:6px}
.footer-dot{width:6px;height:6px;border-radius:50%;background:var(--green);box-shadow:0 0 6px var(--green);animation:pulse 2s ease-in-out infinite;flex-shrink:0}

/* Content */
.content{margin-left:210px;min-height:100vh;flex:1;overflow-y:auto;overflow-x:hidden}
.page-hdr{position:sticky;top:0;z-index:40;padding:0 26px;height:54px;display:flex;align-items:center;justify-content:space-between;background:rgba(7,8,13,0.88);backdrop-filter:blur(20px);border-bottom:1px solid var(--b1)}
.page-title{font-family:var(--serif);font-size:17px;font-weight:500;letter-spacing:-0.3px}
.page-title em{font-style:italic;color:var(--violet)}
.page-sub{font-size:11px;color:var(--t3);font-family:var(--mono);margin-left:7px}
.page-body{padding:22px 26px;animation:pageIn 0.3s ease both;overflow-x:hidden}

/* Panels */
.panel{background:var(--s1);border:1px solid var(--b1);border-radius:16px;overflow:hidden;transition:border-color 0.2s;animation:fadeUp 0.4s ease both}
.panel:hover{border-color:var(--b2)}
.panel-hd{padding:13px 17px;border-bottom:1px solid var(--b1);display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
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
.toast{position:fixed;bottom:14px;right:14px;z-index:400;display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:10px;background:var(--s3);border:1px solid var(--b2);box-shadow:0 8px 30px rgba(0,0,0,0.5);font-size:12px;font-weight:500;backdrop-filter:blur(20px);animation:toastSlide 0.28s ease;max-width:calc(100vw - 28px)}
.toast-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}

/* Focus page */
.focus-center{min-height:calc(100vh - 54px);display:flex;position:relative;overflow:hidden}
.focus-main{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px 24px;position:relative}
.focus-main-shell{width:min(100%,360px);display:flex;flex-direction:column;align-items:center;justify-content:center;margin:0 auto;position:relative;z-index:1}
.focus-ring-wrap{position:relative;width:256px;height:256px;margin-bottom:38px}
.focus-ring-wrap svg{position:absolute;inset:0}
.ring-inner{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}
.ring-phase{font-size:9px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:var(--violet);font-family:var(--mono);margin-bottom:3px}
.ring-time{font-size:54px;font-weight:400;letter-spacing:-3px;font-family:var(--serif);color:var(--t1);line-height:1}
.ring-time.ticking{animation:beat 1s ease-in-out infinite}
.ring-session{font-size:10px;color:var(--t3);font-family:var(--mono);margin-top:5px}
.focus-controls{width:min(100%,320px);display:flex;flex-direction:column;align-items:center;gap:12px}
.fc-row{width:100%;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
.fc-btn{display:flex;align-items:center;justify-content:center;min-height:48px;padding:9px 22px;border-radius:10px;cursor:pointer;border:1px solid var(--b2);background:var(--s2);color:var(--t2);font-family:var(--sans);font-size:13px;font-weight:600;transition:all 0.2s}
.fc-btn:hover{background:var(--s3);color:var(--t1);transform:translateY(-1px)}
.fc-btn.primary{background:linear-gradient(135deg,var(--violet),var(--blue));color:#fff;border:none;padding:10px 32px;box-shadow:0 6px 24px rgba(167,139,250,0.3)}
.fc-btn.primary:hover{box-shadow:0 10px 32px rgba(167,139,250,0.45);transform:translateY(-2px)}
.fc-btn.danger{border-color:rgba(251,113,133,0.2);color:rgba(251,113,133,0.55)}
.fc-btn.danger:hover{color:var(--red);background:var(--red-dim)}
.fc-hint{max-width:290px;font-size:11px;color:var(--t3);font-family:var(--mono);letter-spacing:0.04em;text-align:center}
.fc-done{display:flex;align-items:center;gap:7px;margin-bottom:22px;padding:8px 16px;border-radius:8px;background:var(--green-dim);border:1px solid rgba(74,222,128,0.22);color:var(--green);font-size:12px;font-weight:600;font-family:var(--mono);animation:fadeUp 0.4s ease;position:relative;z-index:1}
.focus-side{width:300px;border-left:1px solid var(--b1);background:var(--s1);display:flex;flex-direction:column;overflow-y:auto}
.focus-side-section{padding:16px 16px 0}
.focus-side-section + .focus-side-section{border-top:1px solid var(--b1);padding-top:16px}
.focus-side-label{font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--t3);font-family:var(--mono);margin-bottom:12px}

.popup-mode{flex-direction:column}
.popup-mode .sidebar{
  position:sticky;top:0;bottom:auto;left:0;width:100%;height:auto;
  border-right:none;border-top:none;border-bottom:1px solid var(--b1);
  flex-direction:column;justify-content:flex-start;padding:0;
  background:rgba(7,8,13,0.98);
}
.popup-mode .sidebar-logo{display:flex;padding:14px 16px 8px;border-bottom:none}
.popup-mode .nav-section,.popup-mode .sidebar-footer{display:none}
.popup-mode .nav{
  flex-direction:row;width:100%;padding:0 12px 10px;gap:6px;
  align-items:stretch;justify-content:flex-start;overflow-x:auto;overflow-y:hidden;
}
.popup-mode .nav-item{
  position:relative;min-width:84px;flex:1;
  flex-direction:column;align-items:flex-start;gap:4px;
  padding:8px 10px;font-size:10px;border-radius:10px;
  background:var(--s2) !important;border:1px solid transparent !important;
}
.popup-mode .nav-item.active{background:var(--s3) !important;border-color:var(--b2) !important}
.popup-mode .nav-icon{font-size:13px;margin-bottom:0}
.popup-mode .nav-label{font-size:10px;line-height:1.2}
.popup-mode .nav-badge{position:static;font-size:8px;padding:1px 4px}
.popup-mode .content{margin-left:0;min-height:0;flex:1;overflow-y:auto;overflow-x:hidden}
.popup-mode .page-hdr{padding:12px 16px;height:auto;align-items:flex-start;justify-content:flex-start;gap:8px;background:rgba(7,8,13,0.94)}
.popup-mode .page-title{font-size:15px}
.popup-mode .page-sub{display:none}
.popup-mode .page-body{padding:14px}
.popup-mode .panel{background:rgba(13,14,24,0.96);border-color:rgba(200,210,255,0.08)}
.popup-mode .panel-hd{padding:12px 14px;align-items:flex-start}
.popup-mode .panel-bd{padding:14px}
.popup-mode .panel-title,
.popup-mode .field-label,
.popup-mode .tile-lbl,
.popup-mode .stat-lbl,
.popup-mode .focus-side-label{color:rgba(238,240,248,0.42)}
.popup-mode .inp{background:rgba(24,25,38,0.72);border-color:rgba(200,210,255,0.10)}
.popup-mode .inp::placeholder{color:rgba(238,240,248,0.22)}
.popup-mode .search-wrap{width:100% !important}
.popup-mode .search-wrap .inp{width:100%}
.popup-mode .prio-group{flex-wrap:wrap}
.popup-mode .prio-opt{min-width:78px}
.popup-mode .submit-btn{padding:9px}
.popup-mode .page-body > div[style*="display: grid"],
.popup-mode .page-body > div[style*="display:grid"]{grid-template-columns:1fr !important}
.popup-mode .stats-grid{grid-template-columns:repeat(2,1fr) !important}
.popup-mode .stat-card{padding:10px 11px}
.popup-mode .stat-icon{margin-bottom:5px}
.popup-mode .stat-val{font-size:18px}
.popup-mode .stat-lbl{font-size:9px}
.popup-mode .tiles{grid-template-columns:repeat(2,1fr) !important}
.popup-mode .tile{padding:8px 10px}
.popup-mode .tile-val{font-size:15px}
.popup-mode .empty{padding:26px 16px}
.popup-mode .group-div{margin:10px 0 6px}
.popup-mode .task{gap:8px;padding:10px 11px}
.popup-mode .task:hover{transform:none}
.popup-mode .task-name{
  white-space:normal;overflow:hidden;display:-webkit-box;
  -webkit-line-clamp:2;-webkit-box-orient:vertical;
}
.popup-mode .task-desc{
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;
}
.popup-mode .task-meta{gap:4px}
.popup-mode .del-btn{opacity:1}
.popup-mode .empty-sub{color:rgba(238,240,248,0.42)}
.popup-mode .focus-center{flex-direction:column;min-height:auto}
.popup-mode .focus-main{padding:34px 18px 28px;align-items:center;text-align:center}
.popup-mode .focus-main-shell{width:min(100%,320px)}
.popup-mode .focus-ring-wrap{width:min(100%,244px);height:auto;aspect-ratio:1/1;margin:0 auto 24px}
.popup-mode .focus-ring-wrap svg{width:100%;height:100%}
.popup-mode .ring-time{font-size:42px}
.popup-mode .ring-session,.popup-mode .fc-hint{text-align:center}
.popup-mode .fc-done{margin-bottom:16px;padding:8px 12px;font-size:11px;text-align:center}
.popup-mode .focus-controls{width:min(100%,300px)}
.popup-mode .fc-row{width:100%;grid-template-columns:repeat(2,minmax(0,1fr))}
.popup-mode .fc-btn{min-width:0;width:100%;padding:10px 14px}
.popup-mode .fc-btn.primary{padding:10px 14px}
.popup-mode .focus-side{width:100% !important;border-left:none !important;border-top:1px solid var(--b1)}
.popup-mode .focus-side-section{padding:14px 14px 0}
.popup-mode .focus-side-section + .focus-side-section{padding-top:14px}

@media (max-width: 850px) {
  .app { flex-direction: column; }
  .sidebar {
    position: sticky; top: 0; bottom: auto; left: 0; width: 100%; height: auto;
    border-right: none; border-top: none; border-bottom: 1px solid var(--b1);
    flex-direction: column; justify-content: flex-start; padding: 0;
    background: rgba(7,8,13,0.98);
  }
  .sidebar-logo { display: flex; padding: 14px 16px 8px; border-bottom: none; }
  .nav-section, .sidebar-footer { display: none; }
  .nav {
    flex-direction: row; width: 100%; padding: 0 12px 10px; gap: 6px;
    align-items: stretch; justify-content: flex-start; overflow-x: auto; overflow-y: hidden;
  }
  .nav-item {
    position: relative; min-width: 84px; flex: 1;
    flex-direction: column; align-items: flex-start; gap: 4px;
    padding: 8px 10px; font-size: 10px; border-radius: 10px;
    background: var(--s2) !important; border: 1px solid transparent !important;
  }
  .nav-item.active { background: var(--s3) !important; border-color: var(--b2) !important; }
  .nav-icon { font-size: 13px; margin-bottom: 0; }
  .nav-label { font-size: 10px; line-height: 1.2; }
  .nav-badge { position: static; font-size: 8px; padding: 1px 4px; }
  
  .content { margin-left: 0; min-height: 0; }
  .page-hdr { padding: 12px 16px; height: auto; align-items: flex-start; justify-content: flex-start; gap: 8px; }
  .page-title { font-size: 15px; }
  .page-sub { display: none; }
  .page-body { padding: 14px; }
  .panel-hd { padding: 12px 14px; align-items: flex-start; }
  .panel-bd { padding: 14px; }
  .search-wrap { width: 100% !important; }
  .search-wrap .inp { width: 100%; }
  .prio-group { flex-wrap: wrap; }
  .prio-opt { min-width: 78px; }
  .submit-btn { padding: 9px; }
  .stat-card { padding: 10px 11px; }
  .stat-icon { margin-bottom: 5px; }
  .stat-val { font-size: 18px; }
  .stat-lbl { font-size: 9px; }
  .tiles { grid-template-columns: repeat(2, 1fr) !important; }
  .tile { padding: 8px 10px; }
  .tile-val { font-size: 15px; }
  .empty { padding: 26px 16px; }
  .group-div { margin: 10px 0 6px; }
  .task { gap: 8px; padding: 10px 11px; }
  .task:hover { transform: none; }
  .task-name {
    white-space: normal;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  .task-desc {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .task-meta { gap: 4px; }
  .del-btn { opacity: 1; }
  
  /* Force single columns on grids with inline style dimensions */
  .page-body > div[style*="display: grid"],
  .page-body > div[style*="display:grid"] {
    grid-template-columns: 1fr !important;
  }
  .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
  .focus-center { flex-direction: column; min-height: auto; }
  .focus-main { padding: 28px 18px; }
  .focus-ring-wrap { width: 210px; height: 210px; margin-bottom: 24px; }
  .ring-time { font-size: 42px; }
  .ring-session, .fc-hint { text-align: center; }
  .fc-done { margin-bottom: 16px; padding: 8px 12px; font-size: 11px; text-align: center; }
  .fc-row { width: 100%; justify-content: center; flex-wrap: wrap; }
  .fc-btn { flex: 1; min-width: 120px; }
  .focus-side { width: 100% !important; border-left: none !important; border-top: 1px solid var(--b1); }
  .focus-side-section { padding: 14px 14px 0; }
  .focus-side-section + .focus-side-section { padding-top: 14px; }
}

@media (max-width: 360px) {
  .stats-grid { grid-template-columns: 1fr !important; }
  .tiles { grid-template-columns: 1fr !important; }
}
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
const FOCUS_TOTAL_MS = FOCUS_TOTAL * 1000;
const FOCUS_STORAGE_KEY = "wz_focus_state";
const SETTINGS_STORAGE_KEY = "wz_settings";
const LOGS_STORAGE_KEY = "wz_activity_logs";
const EMPTY_FOCUS_STATE = {
  status:"idle",
  startedAt:null,
  endsAt:null,
  remainingMs:FOCUS_TOTAL_MS,
  taskId:"",
  notes:"",
  sessionId:null,
  completedAt:null,
  sessionLoggedAt:null,
};
const DEFAULT_SETTINGS = {
  notifications: {
    focusStart: false,
    focusPause: false,
    focusComplete: true,
    badgePulse: true,
  },
  ai: {
    smartPriority: true,
    voiceCapture: true,
  },
};
const PAGES = ["all","active","observability","done","focus"];

function normalizeSettings(value) {
  const settings = value && typeof value === "object" ? value : {};
  return {
    notifications: {
      ...DEFAULT_SETTINGS.notifications,
      ...(settings.notifications || {}),
    },
    ai: {
      ...DEFAULT_SETTINGS.ai,
      ...(settings.ai || {}),
    },
  };
}

function createLogEntry(kind, message, details = {}) {
  return {
    id: details.id || `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    kind,
    message,
    createdAt: details.createdAt || new Date().toISOString(),
    ...details,
  };
}

function getRelativeTimeLabel(value) {
  const stamp = new Date(value).getTime();
  if (!Number.isFinite(stamp)) return "now";
  const diff = Date.now() - stamp;
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.max(1, Math.floor(diff / 60000))}m ago`;
  if (diff < 86400000) return `${Math.max(1, Math.floor(diff / 3600000))}h ago`;
  return `${Math.max(1, Math.floor(diff / 86400000))}d ago`;
}

function getLogAppearance(kind = "") {
  if (kind.startsWith("focus")) {
    return { label:"Focus", color:"var(--violet)", bg:"var(--violet-dim)", border:"rgba(167,139,250,0.22)" };
  }
  if (kind.startsWith("ai")) {
    return { label:"AI", color:"var(--blue)", bg:"var(--blue-dim)", border:"rgba(96,165,250,0.22)" };
  }
  if (kind.startsWith("settings")) {
    return { label:"Setting", color:"var(--blue)", bg:"rgba(96,165,250,0.08)", border:"rgba(96,165,250,0.2)" };
  }
  if (kind.includes("delete")) {
    return { label:"Removed", color:"var(--red)", bg:"var(--red-dim)", border:"rgba(251,113,133,0.22)" };
  }
  if (kind.includes("complete") || kind.includes("restore")) {
    return { label:"Status", color:"var(--green)", bg:"var(--green-dim)", border:"rgba(74,222,128,0.2)" };
  }
  return { label:"Task", color:"var(--amber)", bg:"var(--amber-dim)", border:"rgba(245,166,35,0.2)" };
}

function buildTaskFromAgentPrompt(prompt, settings) {
  const raw = String(prompt || "").trim();
  if (!raw) return null;

  const smartPriority = normalizeSettings(settings).ai.smartPriority;
  let priority = "medium";
  if (smartPriority) {
    if (/\b(high|urgent|asap|critical)\b/i.test(raw)) priority = "high";
    else if (/\b(low|later|backlog|someday)\b/i.test(raw)) priority = "low";
  }

  const explicitPriority = raw.match(/\bpriority\s*[:=-]?\s*(high|medium|low)\b/i);
  if (explicitPriority) priority = explicitPriority[1].toLowerCase();

  let cleaned = raw
    .replace(/^(please\s+)?(add|create|make)\s+(a\s+)?(task|todo)\s*/i, "")
    .replace(/\bpriority\s*[:=-]?\s*(high|medium|low)\b/ig, "")
    .replace(/\b(high|urgent|asap|critical|low|later|backlog|someday)\s+priority\b/ig, "")
    .replace(/\s+/g, " ")
    .trim();

  let title = cleaned;
  let description = "";

  const noteMatch = cleaned.match(/\b(?:notes?|about|because|details?)\s*[:=-]?\s*(.+)$/i);
  if (noteMatch) {
    description = noteMatch[1].trim();
    title = cleaned.slice(0, noteMatch.index).trim();
  }

  if (title.includes("|")) {
    const [maybeTitle, maybeNotes] = title.split("|");
    title = (maybeTitle || "").trim();
    description = description || (maybeNotes || "").trim();
  }

  const normalizedTitle = title.replace(/^[,.\-:;\s]+|[,.\-:;\s]+$/g, "");
  title = normalizedTitle || raw;

  if (!description && title.split(" ").length > 9) {
    const words = title.split(" ");
    description = words.slice(6).join(" ");
    title = words.slice(0, 6).join(" ");
  }

  return {
    title: title.charAt(0).toUpperCase() + title.slice(1),
    description,
    priority,
  };
}

function buildObservabilityActions(tasks, sessions, logs) {
  const pending = tasks.filter(task => task.status !== "done");
  const todayKey = new Date().toDateString();
  const todaySessions = sessions.filter(session => new Date(session.date).toDateString() === todayKey).length;
  const highPriority = pending.filter(task => task.priority === "high");
  const stalePending = pending.filter(task => {
    const createdAt = new Date(task.createdAt || 0).getTime();
    return Number.isFinite(createdAt) && Date.now() - createdAt > 1000 * 60 * 60 * 48;
  });
  const recentAdds = logs.filter(log => log.kind === "task_created" && Date.now() - new Date(log.createdAt).getTime() < 1000 * 60 * 60 * 12).length;

  const actions = [];
  if (highPriority.length >= 2) {
    actions.push({
      id: "obs-clear-high",
      title: "Clear the high-priority queue",
      description: `${highPriority.length} high-priority tasks are still open.`,
      priority: "high",
    });
  }
  if (pending.length > 0 && todaySessions === 0) {
    actions.push({
      id: "obs-focus-block",
      title: "Plan a 25-minute focus block",
      description: "Tasks are pending and no focus session has been logged today.",
      priority: "medium",
    });
  }
  if (stalePending.length > 0) {
    actions.push({
      id: "obs-stale-followup",
      title: `Follow up on ${stalePending[0].title}`,
      description: `${stalePending.length} pending task${stalePending.length !== 1 ? "s are" : " is"} older than 48 hours.`,
      priority: "medium",
    });
  }
  if (recentAdds >= 3) {
    actions.push({
      id: "obs-backlog-review",
      title: "Review new tasks and trim backlog",
      description: `${recentAdds} tasks were added recently. A quick review can keep the list sharp.`,
      priority: "low",
    });
  }
  return actions.slice(0, 4);
}

/* ══════════════════════════════════════════════
   HOOKS
══════════════════════════════════════════════ */
function useLS(key, init) {
  const hasChromeStorage =
    typeof chrome !== "undefined" &&
    chrome?.storage?.local &&
    typeof chrome.storage.local.get === "function" &&
    typeof chrome.storage.local.set === "function";

  const [v, setV] = useState(() => {
    try {
      const s = localStorage.getItem(key);
      if (!s || s === "undefined" || s === "null") return init;
      const parsed = JSON.parse(s);
      return (parsed === undefined || parsed === null) ? init : parsed;
    } catch {
      return init;
    }
  });
  useEffect(() => {
    if (!hasChromeStorage) return;

    chrome.storage.local.get([key], result => {
      const stored = result?.[key];
      if (stored !== undefined && stored !== null) {
        try {
          localStorage.setItem(key, JSON.stringify(stored));
        } catch {}
        setV(stored);
      }
    });
  }, [hasChromeStorage, key]);
  useEffect(() => {
    if (!hasChromeStorage || !chrome?.storage?.onChanged) return;

    const handleChanges = (changes, areaName) => {
      if (areaName !== "local" || !changes[key]) return;
      const next = changes[key].newValue;
      if (next === undefined || next === null) return;
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {}
      setV(next);
    };

    chrome.storage.onChanged.addListener(handleChanges);
    return () => chrome.storage.onChanged.removeListener(handleChanges);
  }, [hasChromeStorage, key]);
  const set = useCallback(fn => setV(prev => {
    const next = fn instanceof Function ? fn(prev) : fn;
    try {
      localStorage.setItem(key, JSON.stringify(next));
      if (hasChromeStorage) {
        chrome.storage.local.set({ [key]: next });
      }
    } catch {}
    return next;
  }), [hasChromeStorage, key]);
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
  const resolveTier = count => {
    if (count >= 6) {
      return {
        background:"linear-gradient(180deg,#facc15,#f59e0b)",
        glow:"0 0 18px rgba(250,204,21,0.55)",
        text:"#facc15",
        badgeBg:"rgba(250,204,21,0.12)",
        badgeBorder:"rgba(250,204,21,0.28)",
        badgeGlow:"0 0 14px rgba(250,204,21,0.22)",
        label:"Legend run",
      };
    }
    if (count === 5) {
      return {
        background:"linear-gradient(180deg,#a78bfa,#7c3aed)",
        glow:"0 0 16px rgba(167,139,250,0.48)",
        text:"var(--violet)",
        badgeBg:"var(--violet-dim)",
        badgeBorder:"rgba(167,139,250,0.24)",
        badgeGlow:"0 0 12px rgba(167,139,250,0.18)",
        label:"Crushing it",
      };
    }
    if (count === 4) {
      return {
        background:"linear-gradient(180deg,#60a5fa,#2563eb)",
        glow:"0 0 14px rgba(96,165,250,0.42)",
        text:"var(--blue)",
        badgeBg:"var(--blue-dim)",
        badgeBorder:"rgba(96,165,250,0.24)",
        badgeGlow:"0 0 10px rgba(96,165,250,0.16)",
        label:"Level up",
      };
    }
    if (count === 3) {
      return {
        background:"linear-gradient(180deg,#4ade80,#16a34a)",
        glow:"0 0 12px rgba(74,222,128,0.38)",
        text:"var(--green)",
        badgeBg:"var(--green-dim)",
        badgeBorder:"rgba(74,222,128,0.22)",
        badgeGlow:"0 0 8px rgba(74,222,128,0.14)",
        label:"Great pace",
      };
    }
    if (count >= 1) {
      return {
        background:"linear-gradient(180deg,#f5a623,#e8912a)",
        glow:"0 0 10px rgba(245,166,35,0.32)",
        text:"var(--amber)",
        badgeBg:"var(--amber-dim)",
        badgeBorder:"rgba(245,166,35,0.22)",
        badgeGlow:"0 0 7px rgba(245,166,35,0.12)",
        label:"Nice start",
      };
    }
    return {
      background:"linear-gradient(180deg,rgba(200,210,255,0.22),rgba(200,210,255,0.08))",
      glow:"none",
      text:"var(--t3)",
      badgeBg:"rgba(200,210,255,0.06)",
      badgeBorder:"rgba(200,210,255,0.1)",
      badgeGlow:"none",
      label:"Ready to start",
    };
  };
  void sessions;
  const last7 = Array.from({length:7}).map((_,i) => {
    const d=new Date(); d.setDate(d.getDate()-(6-i)); const key=d.toDateString();
    return {
      label: d.toLocaleDateString("en",{weekday:"short"}).slice(0,2).toUpperCase(),
      n: tasks.filter(t=>t.completedAt&&new Date(t.completedAt).toDateString()===key).length,
      today: key===todayKey,
    };
  });
  const maxBar = Math.max(...last7.map(d=>d.n), 1);
  const todayData = last7.find(d=>d.today) || { n:0 };
  const todayTier = resolveTier(todayData.n);
  return (
    <>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, marginBottom:8, flexWrap:"wrap" }}>
        <span style={{ fontSize:9, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", color:"var(--t3)", fontFamily:"var(--mono)" }}>Activity - 7 days</span>
        <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", justifyContent:"flex-end" }}>
          <span style={{ fontSize:10, padding:"4px 9px", borderRadius:99, background:todayTier.badgeBg, border:`1px solid ${todayTier.badgeBorder}`, color:todayTier.text, boxShadow:todayTier.badgeGlow, fontFamily:"var(--mono)", fontWeight:700 }}>
            {todayTier.label}
          </span>
          {streak>0 && <span style={{ fontSize:10, color:"var(--amber)", fontFamily:"var(--mono)" }}>{streak}d streak</span>}
        </div>
      </div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10, gap:8 }}>
        <span style={{ fontSize:10, color:"var(--t3)", fontFamily:"var(--mono)" }}>Today completions</span>
        <span style={{ fontSize:10, color:todayTier.text, fontFamily:"var(--mono)", fontWeight:700 }}>{todayData.n}</span>
      </div>
      <div className="chart-bars">
        {last7.map((d,i) => {
          const tier = resolveTier(d.n);
          return (
            <div key={i} className="bar-col" title={`${d.n} task${d.n===1?"":"s"} completed`}>
              <div className="bar-track" style={{ border:d.today?"1px solid rgba(238,240,248,0.16)":"1px solid transparent", boxShadow:d.today?"inset 0 0 0 1px rgba(238,240,248,0.04)":"none" }}>
                <div className="bar" style={{
                  height:`${Math.max((d.n/maxBar)*100, d.n>0?10:0)}%`,
                  background:tier.background,
                  boxShadow:tier.glow,
                  animationDelay:`${i*45}ms`,
                }}/>
              </div>
              <span className="bar-day" style={{ color:d.today?"var(--t1)":"var(--t3)", fontWeight:d.today?700:500 }}>{d.label}</span>
            </div>
          );
        })}
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

function ToggleRow({ label, hint, checked, onChange, accent = "var(--violet)" }) {
  return (
    <button
      type="button"
      onClick={onChange}
      style={{
        width:"100%",
        display:"flex",
        alignItems:"center",
        justifyContent:"space-between",
        gap:12,
        padding:"10px 12px",
        marginBottom:8,
        borderRadius:10,
        border:`1px solid ${checked ? accent : "var(--b1)"}`,
        background:checked ? "rgba(255,255,255,0.04)" : "var(--s2)",
        color:"var(--t1)",
        cursor:"pointer",
        textAlign:"left",
      }}
    >
      <div style={{ minWidth:0 }}>
        <div style={{ fontSize:12, fontWeight:600 }}>{label}</div>
        <div style={{ fontSize:10, color:"var(--t3)", marginTop:2, lineHeight:1.45 }}>{hint}</div>
      </div>
      <div
        style={{
          width:40,
          height:22,
          borderRadius:99,
          background:checked ? accent : "var(--s4)",
          padding:2,
          transition:"all 0.2s",
          flexShrink:0,
        }}
      >
        <div
          style={{
            width:18,
            height:18,
            borderRadius:"50%",
            background:"#fff",
            transform:checked ? "translateX(18px)" : "translateX(0)",
            transition:"transform 0.2s",
            boxShadow:"0 2px 10px rgba(0,0,0,0.3)",
          }}
        />
      </div>
    </button>
  );
}

function LogFeed({ logs, emptyTitle = "No activity yet", emptySub = "The latest app events will appear here." }) {
  if (!logs.length) {
    return (
      <div className="empty" style={{ padding:"24px 16px" }}>
        <div className="empty-icon">LOG</div>
        <div className="empty-title">{emptyTitle}</div>
        <div className="empty-sub">{emptySub}</div>
      </div>
    );
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      {logs.map(log => {
        const tone = getLogAppearance(log.kind);
        return (
          <div
            key={log.id}
            style={{
              padding:"10px 12px",
              borderRadius:10,
              border:`1px solid ${tone.border}`,
              background:"var(--s2)",
              display:"flex",
              alignItems:"flex-start",
              justifyContent:"space-between",
              gap:12,
            }}
          >
            <div style={{ minWidth:0, flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
                <span
                  style={{
                    fontSize:9,
                    fontFamily:"var(--mono)",
                    padding:"2px 6px",
                    borderRadius:99,
                    background:tone.bg,
                    color:tone.color,
                    border:`1px solid ${tone.border}`,
                    textTransform:"uppercase",
                    letterSpacing:"0.08em",
                    fontWeight:700,
                  }}
                >
                  {tone.label}
                </span>
                {log.taskTitle && (
                  <span style={{ fontSize:10, color:"var(--t3)", fontFamily:"var(--mono)" }}>
                    {log.taskTitle}
                  </span>
                )}
              </div>
              <div style={{ fontSize:12, lineHeight:1.5 }}>{log.message}</div>
            </div>
            <div style={{ fontSize:10, color:"var(--t3)", fontFamily:"var(--mono)", flexShrink:0 }}>
              {getRelativeTimeLabel(log.createdAt)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AgentTaskPanel({ onCreateTask, onLog, onToast, settings }) {
  const [agentInput, setAgentInput] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "intro",
      role: "assistant",
      text: "Describe a task naturally and I will turn it into a task with title, notes, and priority.",
    },
  ]);
  const voiceEnabled = normalizeSettings(settings).ai.voiceCapture;

  const submitPrompt = useCallback((prompt, source = "chat") => {
    const parsed = buildTaskFromAgentPrompt(prompt, settings);
    if (!parsed) return;

    setMessages(prev => [
      ...prev.slice(-5),
      { id:`user-${Date.now()}`, role:"user", text:prompt },
      {
        id:`assistant-${Date.now()}-${source}`,
        role:"assistant",
        text:`Created "${parsed.title}" as a ${parsed.priority} priority task.`,
      },
    ]);
    onCreateTask(parsed, { source:source === "voice" ? "ai-voice" : "ai-chat" });
    setAgentInput("");
  }, [onCreateTask, settings]);

  const voice = useVoiceCapture({
    enabled: voiceEnabled,
    onTranscript: (transcript, details) => {
      setAgentInput(transcript);
      submitPrompt(transcript, "voice");
      if (details?.source === "fallback") {
        onLog?.(
          "voice_remote_transcribed",
          "Recorder fallback sent audio to the backend and created a task.",
          details,
        );
      }
    },
    onEvent: (event) => {
      onLog?.(event.kind, event.message, event.details);

      if (event.kind === "voice_failed") {
        onToast?.(event.message, "#fb7185");
      }
    },
  });

  const voiceChecks = [
    {
      label: "Mic",
      ok: voice.diagnostics.microphonePermission !== "denied",
      detail:
        voice.diagnostics.microphonePermission === "granted"
          ? "ready"
          : voice.diagnostics.microphonePermission === "denied"
            ? "denied"
            : voice.diagnostics.microphonePermission === "prompt"
              ? "needs permission"
              : "unknown",
    },
    {
      label: "Backend",
      ok: voice.diagnostics.backendOnline === true,
      detail:
        voice.diagnostics.backendOnline === true
          ? "online"
          : voice.diagnostics.backendOnline === false
            ? "offline"
            : "checking",
    },
    {
      label: "Transcribe",
      ok: voice.diagnostics.transcriptionConfigured === true,
      detail:
        voice.diagnostics.backendOnline === false
          ? "backend offline"
          : voice.diagnostics.transcriptionConfigured === true
            ? voice.diagnostics.model || "configured"
            : voice.diagnostics.transcriptionConfigured === false
              ? "missing OpenAI key"
              : "checking",
    },
  ];

  return (
    <div className="panel" style={{ animationDelay:"18ms" }}>
      <div className="panel-hd">
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span className="panel-title">AI task agent</span>
          <span style={{ fontSize:9, padding:"2px 6px", borderRadius:99, background:"var(--blue-dim)", color:"var(--blue)", fontFamily:"var(--mono)", fontWeight:700 }}>
            chat + voice
          </span>
        </div>
      </div>
      <div className="panel-bd">
        <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:12 }}>
          {messages.slice(-4).map(message => (
            <div
              key={message.id}
              style={{
                alignSelf:message.role === "user" ? "flex-end" : "stretch",
                background:message.role === "user" ? "rgba(167,139,250,0.14)" : "var(--s2)",
                border:`1px solid ${message.role === "user" ? "rgba(167,139,250,0.24)" : "var(--b1)"}`,
                borderRadius:12,
                padding:"10px 12px",
                fontSize:12,
                lineHeight:1.5,
              }}
            >
              {message.text}
            </div>
          ))}
        </div>

        <div className="field">
          <label className="field-label">Agent prompt</label>
          <textarea
            className="inp"
            value={agentInput}
            onChange={event => setAgentInput(event.target.value)}
            placeholder="Example: add a high priority task to finish the extension publish checklist, notes: verify screenshots and manifest"
            style={{ minHeight:74 }}
          />
        </div>

        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <button
            className="submit-btn"
            style={{ flex:1, background:"linear-gradient(135deg,var(--blue),var(--violet))", boxShadow:"0 4px 18px rgba(96,165,250,0.24)" }}
            onClick={() => submitPrompt(agentInput, "chat")}
          >
            Add with AI
          </button>
          <button
            type="button"
            className="fc-btn"
            onClick={voice.toggleCapture}
            disabled={voice.disabled}
            style={{
              minHeight:40,
              minWidth:96,
              opacity:voice.disabled ? 0.55 : 1,
              borderColor:voice.error
                ? "rgba(251,113,133,0.35)"
                : voice.phase === "transcribing"
                  ? "rgba(96,165,250,0.35)"
                  : voice.isListening
                    ? "rgba(74,222,128,0.35)"
                    : "var(--b1)",
              color:voice.error
                ? "var(--red)"
                : voice.phase === "transcribing"
                  ? "var(--blue)"
                  : voice.isListening
                    ? "var(--green)"
                    : "var(--t2)",
            }}
          >
            {voice.buttonLabel}
          </button>
        </div>
        <div
          style={{
            marginTop:8,
            fontSize:10,
            color:voice.error
              ? "var(--red)"
              : voice.phase === "transcribing"
                ? "var(--blue)"
                : voice.isListening
                  ? "var(--green)"
                  : "var(--t3)",
            fontFamily:"var(--mono)",
            lineHeight:1.5,
          }}
        >
          {voice.helperText}
        </div>
        {voiceEnabled && voice.fallbackSupported && (
          <div style={{ marginTop:8, fontSize:10, color:"var(--t3)", fontFamily:"var(--mono)", lineHeight:1.5 }}>
            Recorder fallback sends a short audio clip to the configured backend for transcription when browser speech recognition is unavailable or fails.
          </div>
        )}
        {voiceEnabled && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,minmax(0,1fr))", gap:8, marginTop:10 }}>
            {voiceChecks.map((item) => (
              <div
                key={item.label}
                style={{
                  padding:"8px 9px",
                  borderRadius:10,
                  border:`1px solid ${item.ok ? "rgba(74,222,128,0.24)" : "rgba(251,113,133,0.18)"}`,
                  background:item.ok ? "var(--green-dim)" : "rgba(251,113,133,0.08)",
                  minWidth:0,
                }}
              >
                <div style={{ fontSize:9, color:item.ok ? "var(--green)" : "var(--red)", fontFamily:"var(--mono)", fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase" }}>
                  {item.label}
                </div>
                <div style={{ fontSize:10, color:item.ok ? "var(--t1)" : "rgba(251,113,133,0.92)", marginTop:4, lineHeight:1.4 }}>
                  {item.detail}
                </div>
              </div>
            ))}
          </div>
        )}
        {voiceEnabled && (
          <div style={{ marginTop:8, display:"flex", justifyContent:"flex-end" }}>
            <button
              type="button"
              onClick={voice.refreshDiagnostics}
              style={{
                background:"transparent",
                border:"none",
                color:"var(--t3)",
                fontSize:10,
                fontFamily:"var(--mono)",
                cursor:"pointer",
                textDecoration:"underline",
                textUnderlineOffset:3,
              }}
            >
              refresh voice checks
            </button>
          </div>
        )}
        {!voiceEnabled && (
          <div style={{ marginTop:8, fontSize:10, color:"var(--t3)", fontFamily:"var(--mono)", lineHeight:1.5 }}>
            Voice capture is currently disabled for this workspace.
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   PAGE: ALL
══════════════════════════════════════════════ */
function AllPage({ tasks, setTasks, sessions, onLog, settings }) {
  const [editId,setEditId] = useState(null);
  const [search,setSearch] = useState("");
  const [toast,showToast] = useToast();

  const addTask = d => { setTasks(t=>[...t,{id:Date.now().toString(),...d,status:"pending",createdAt:new Date().toISOString()}]); showToast("Task added ✦"); };
  const updateTask = d => { setTasks(t=>t.map(x=>x.id===editId?{...x,...d}:x)); setEditId(null); showToast("Updated","#60a5fa"); };
  const toggle = id => setTasks(t=>t.map(x=>x.id===id?{...x,status:x.status==="done"?"pending":"done",completedAt:x.status!=="done"?new Date().toISOString():undefined}:x));
  const remove = id => { setTasks(t=>t.filter(x=>x.id!==id)); showToast("Removed","#fb7185"); };
  const handleTaskCreate = useCallback((data, meta = { source:"manual" }) => {
    const task = { id:Date.now().toString(), ...data, status:"pending", createdAt:new Date().toISOString() };
    setTasks(list => [...list, task]);
    onLog(
      meta.source === "ai-chat" || meta.source === "ai-voice" ? "ai_task_created" : "task_created",
      meta.source === "ai-voice"
        ? `Voice agent added "${task.title}".`
        : meta.source === "ai-chat"
          ? `AI agent added "${task.title}".`
          : `Added task "${task.title}".`,
      { taskId:task.id, taskTitle:task.title, priority:task.priority, source:meta.source },
    );
    showToast(meta.source?.startsWith("ai-") ? "AI task ready" : "Task added");
  }, [onLog, setTasks, showToast]);
  const handleTaskUpdate = useCallback(data => {
    const current = tasks.find(task => task.id === editId);
    updateTask(data);
    if (current) {
      onLog("task_updated", `Updated "${current.title}".`, { taskId:current.id, taskTitle:data.title || current.title });
    }
  }, [editId, onLog, tasks, updateTask]);
  const handleTaskToggle = useCallback(id => {
    const current = tasks.find(task => task.id === id);
    const nextDone = current?.status !== "done";
    toggle(id);
    if (current) {
      onLog(
        nextDone ? "task_completed" : "task_restored",
        nextDone ? `Completed "${current.title}".` : `Moved "${current.title}" back to active.`,
        { taskId:current.id, taskTitle:current.title },
      );
    }
  }, [onLog, tasks, toggle]);
  const handleTaskRemove = useCallback(id => {
    const current = tasks.find(task => task.id === id);
    remove(id);
    if (current) {
      onLog("task_deleted", `Removed "${current.title}".`, { taskId:current.id, taskTitle:current.title });
    }
  }, [onLog, remove, tasks]);

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
                <TaskForm key={editId||"new"} editTask={editTask} onSubmit={editId?handleTaskUpdate:handleTaskCreate} onCancel={editId?()=>setEditId(null):undefined}/>
              </div>
            </div>
            <AgentTaskPanel
              onCreateTask={handleTaskCreate}
              onLog={onLog}
              onToast={showToast}
              settings={settings}
            />
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
              {pending.length>0&&<><div className="group-div">Active · {pending.length}</div><div style={{display:"flex",flexDirection:"column",gap:6}}>{pending.map((t,i)=><TaskRow key={t.id} task={t} idx={i} onToggle={()=>handleTaskToggle(t.id)} onDelete={()=>handleTaskRemove(t.id)} onEdit={()=>setEditId(t.id)}/>)}</div></>}
              {completed.length>0&&<><div className="group-div" style={{marginTop:14}}>Completed · {completed.length}</div><div style={{display:"flex",flexDirection:"column",gap:6}}>{completed.map((t,i)=><TaskRow key={t.id} task={t} idx={i} onToggle={()=>handleTaskToggle(t.id)} onDelete={()=>handleTaskRemove(t.id)}/>)}</div></>}
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
function ActivePage({ tasks, setTasks, sessions, logs, onLog }) {
  const [search,setSearch]=useState(""), [prioF,setPrioF]=useState("all");
  const [toast,showToast]=useToast();
  const complete=id=>{setTasks(t=>t.map(x=>x.id===id?{...x,status:"done",completedAt:new Date().toISOString()}:x));showToast("Done! ✓")};
  const remove=id=>{setTasks(t=>t.filter(x=>x.id!==id));showToast("Removed","#fb7185")};
  const handleComplete = useCallback(id => {
    const current = tasks.find(task => task.id === id);
    complete(id);
    if (current) {
      onLog("task_completed", `Completed "${current.title}" from Active Tasks.`, { taskId:current.id, taskTitle:current.title });
    }
  }, [complete, onLog, tasks]);
  const handleRemove = useCallback(id => {
    const current = tasks.find(task => task.id === id);
    remove(id);
    if (current) {
      onLog("task_deleted", `Removed "${current.title}" from Active Tasks.`, { taskId:current.id, taskTitle:current.title });
    }
  }, [onLog, remove, tasks]);
  const allPending=tasks.filter(t=>t.status!=="done");
  const filtered=useMemo(()=>allPending.filter(t=>{const bs=t.title.toLowerCase().includes(search.toLowerCase());const bp=prioF==="all"||t.priority===prioF;return bs&&bp}).sort((a,b)=>({high:0,medium:1,low:2}[a.priority]||1)-({high:0,medium:1,low:2}[b.priority]||1)),[allPending,search,prioF]);
  const highN=allPending.filter(t=>t.priority==="high").length, medN=allPending.filter(t=>t.priority==="medium").length, lowN=allPending.filter(t=>t.priority==="low").length;
  const streak=useMemo(()=>{let s=0;for(let i=0;i<60;i++){const d=new Date();d.setDate(d.getDate()-i);const k=d.toDateString();if(sessions.some(x=>new Date(x.date).toDateString()===k)||tasks.some(x=>x.completedAt&&new Date(x.completedAt).toDateString()===k))s++;else break}return s},[sessions,tasks]);
  const recentActiveLogs=useMemo(()=>{
    const pendingIds=new Set(allPending.map(task=>task.id));
    return logs.filter(log=>log.taskId ? pendingIds.has(log.taskId) : log.kind.startsWith("task") || log.kind.startsWith("ai")).slice(0,6);
  },[allPending,logs]);
  return (
    <>
      <div className="page-hdr">
        <div style={{display:"flex",alignItems:"baseline",gap:7}}><span className="page-title">Active <em>Tasks</em></span><span className="page-sub">/ {allPending.length} pending</span></div>
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
            <div className="panel" style={{animationDelay:"70ms"}}>
              <div className="panel-hd"><span className="panel-title">tracking log</span></div>
              <div className="panel-bd">
                <LogFeed logs={recentActiveLogs} emptyTitle="No active task events" emptySub="Task changes from the active workflow will appear here." />
              </div>
            </div>
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
                return <div key={pk}><div className="group-div" style={{color:col}}>{pk} · {g.length}</div><div style={{display:"flex",flexDirection:"column",gap:6}}>{g.map((t,i)=><TaskRow key={t.id} task={t} idx={i} onToggle={()=>handleComplete(t.id)} onDelete={()=>handleRemove(t.id)}/>)}</div></div>;
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
function ObservabilityPage({ tasks, setTasks, sessions, logs, onLog, settings }) {
  const [filter, setFilter] = useState("all");
  const [toast, showToast] = useToast();
  const pending = tasks.filter(task => task.status !== "done");
  const completed = tasks.filter(task => task.status === "done");
  const todayKey = new Date().toDateString();
  const highPriority = pending.filter(task => task.priority === "high");
  const todaySessions = sessions.filter(session => new Date(session.date).toDateString() === todayKey).length;
  const todayLogs = logs.filter(log => new Date(log.createdAt).toDateString() === todayKey).length;
  const completionRate = tasks.length ? Math.round((completed.length / tasks.length) * 100) : 0;
  const autoActions = useMemo(() => buildObservabilityActions(tasks, sessions, logs), [logs, sessions, tasks]);
  const prefs = normalizeSettings(settings);
  const observations = [
    {
      label: "Queue pressure",
      value: pending.length === 0 ? "Calm" : pending.length <= 3 ? "Stable" : "Busy",
      sub: pending.length === 0 ? "No pending tasks right now." : `${pending.length} pending, ${highPriority.length} high priority.`,
      color: pending.length > 3 ? "var(--amber)" : "var(--green)",
    },
    {
      label: "Focus coverage",
      value: todaySessions > 0 ? "Covered" : "Missing",
      sub: todaySessions > 0 ? `${todaySessions} session${todaySessions !== 1 ? "s" : ""} logged today.` : "No focus session has been logged today yet.",
      color: todaySessions > 0 ? "var(--violet)" : "var(--amber)",
    },
    {
      label: "Signals",
      value: `${todayLogs} events`,
      sub: todayLogs > 0 ? "Tasks, focus, and settings changes are being tracked." : "No tracked events yet today.",
      color: "var(--blue)",
    },
  ];
  const filteredLogs = useMemo(() => {
    if (filter === "tasks") return logs.filter(log => log.kind.startsWith("task"));
    if (filter === "focus") return logs.filter(log => log.kind.startsWith("focus"));
    if (filter === "ai") return logs.filter(log => log.kind.startsWith("ai"));
    if (filter === "settings") return logs.filter(log => log.kind.startsWith("settings"));
    return logs;
  }, [filter, logs]);

  const createAutoAction = action => {
    const exists = tasks.some(task => task.status !== "done" && task.title.toLowerCase() === action.title.toLowerCase());
    if (exists) {
      showToast("That task already exists", "#60a5fa");
      return;
    }
    const task = {
      id: Date.now().toString(),
      title: action.title,
      description: action.description,
      priority: action.priority,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    setTasks(current => [task, ...current]);
    onLog("task_created", `Observability created "${task.title}".`, { taskId:task.id, taskTitle:task.title, source:"observability" });
    showToast("Observability task added", "#60a5fa");
  };

  return (
    <>
      <div className="page-hdr">
        <div style={{display:"flex",alignItems:"baseline",gap:7}}>
          <span className="page-title">Observ<em>ability</em></span>
          <span className="page-sub">/ automatic task signals</span>
        </div>
        <span style={{fontSize:11,color:"var(--t3)",fontFamily:"var(--mono)"}}>{todayLogs} events today</span>
      </div>
      <div className="page-body">
        <div style={{display:"grid",gridTemplateColumns:"265px 1fr",gap:16,alignItems:"start"}}>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div className="panel">
              <div className="panel-hd"><span className="panel-title">system snapshot</span></div>
              <div className="panel-bd">
                <div className="tiles" style={{marginBottom:12}}>
                  {[{l:"Pending",v:pending.length,c:"var(--amber)"},{l:"Done",v:completed.length,c:"var(--green)"},{l:"Rate",v:`${completionRate}%`,c:"var(--blue)"},{l:"Logs",v:todayLogs,c:"var(--violet)"}].map((item,index)=>(
                    <div key={index} className="tile"><div className="tile-lbl">{item.l}</div><div className="tile-val" style={{color:item.c}}>{item.v}</div></div>
                  ))}
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:9}}>
                  {observations.map(observation => (
                    <div key={observation.label} style={{padding:"10px 12px",borderRadius:10,border:"1px solid var(--b1)",background:"var(--s2)"}}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,marginBottom:4}}>
                        <span style={{fontSize:10,color:"var(--t3)",fontFamily:"var(--mono)",textTransform:"uppercase",letterSpacing:"0.08em"}}>{observation.label}</span>
                        <span style={{fontSize:12,fontWeight:700,color:observation.color}}>{observation.value}</span>
                      </div>
                      <div style={{fontSize:11,color:"var(--t2)",lineHeight:1.45}}>{observation.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="panel" style={{animationDelay:"28ms"}}>
              <div className="panel-hd"><span className="panel-title">focus settings</span></div>
              <div className="panel-bd">
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {[
                    { label:"Start notice", value:prefs.notifications.focusStart ? "on" : "off" },
                    { label:"Pause notice", value:prefs.notifications.focusPause ? "on" : "off" },
                    { label:"Complete popup", value:prefs.notifications.focusComplete ? "on" : "off" },
                    { label:"Toolbar blink", value:prefs.notifications.badgePulse ? "on" : "off" },
                  ].map(item => (
                    <div key={item.label} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid var(--b1)"}}>
                      <span style={{fontSize:12,color:"var(--t2)"}}>{item.label}</span>
                      <span style={{fontSize:10,color:item.value === "on" ? "var(--green)" : "var(--t3)",fontFamily:"var(--mono)",textTransform:"uppercase"}}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div className="panel" style={{animationDelay:"46ms"}}>
              <div className="panel-hd">
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span className="panel-title">automatic tasks</span>
                  <span style={{fontSize:9,padding:"2px 6px",borderRadius:99,background:"var(--blue-dim)",color:"var(--blue)",fontFamily:"var(--mono)",fontWeight:700}}>{autoActions.length}</span>
                </div>
              </div>
              <div className="panel-bd">
                {autoActions.length === 0 ? (
                  <div className="empty">
                    <div className="empty-icon">OBS</div>
                    <div className="empty-title">No follow-up task needed</div>
                    <div className="empty-sub">The current workload looks healthy, so observability is not suggesting a task right now.</div>
                  </div>
                ) : (
                  <div style={{display:"flex",flexDirection:"column",gap:10}}>
                    {autoActions.map(action => (
                      <div key={action.id} style={{padding:"12px 13px",borderRadius:12,border:"1px solid var(--b1)",background:"var(--s2)"}}>
                        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,marginBottom:6}}>
                          <div>
                            <div style={{fontSize:13,fontWeight:700,marginBottom:3}}>{action.title}</div>
                            <div style={{fontSize:11,color:"var(--t2)",lineHeight:1.5}}>{action.description}</div>
                          </div>
                          <span style={{fontSize:9,padding:"2px 6px",borderRadius:99,border:`1px solid ${P[action.priority].border}`,background:P[action.priority].bg,color:P[action.priority].color,fontFamily:"var(--mono)",textTransform:"uppercase",fontWeight:700}}>{action.priority}</span>
                        </div>
                        <button className="submit-btn" style={{padding:"8px 10px"}} onClick={() => createAutoAction(action)}>
                          Create task
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="panel" style={{animationDelay:"64ms"}}>
              <div className="panel-hd">
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span className="panel-title">activity feed</span>
                  <span style={{fontSize:9,padding:"2px 6px",borderRadius:99,background:"var(--s3)",color:"var(--t3)",fontFamily:"var(--mono)",fontWeight:700}}>{filteredLogs.length}</span>
                </div>
                <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                  {[{id:"all",label:"All"},{id:"tasks",label:"Tasks"},{id:"focus",label:"Focus"},{id:"ai",label:"AI"},{id:"settings",label:"Settings"}].map(option => (
                    <button key={option.id} onClick={() => setFilter(option.id)} style={{padding:"4px 9px",borderRadius:99,border:"1px solid",borderColor:filter===option.id?"var(--violet)":"var(--b1)",background:filter===option.id?"rgba(167,139,250,0.08)":"transparent",color:filter===option.id?"var(--violet)":"var(--t3)",fontSize:10,fontWeight:700,fontFamily:"var(--mono)",cursor:"pointer"}}>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="panel-bd">
                <LogFeed logs={filteredLogs.slice(0, 12)} emptyTitle="No matching events" emptySub="Try another filter or create a task to generate new signals." />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toast toast={toast}/>
    </>
  );
}

function DonePage({ tasks, setTasks, sessions }) {
  const [search,setSearch]=useState(""), [toast,showToast]=useToast();
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
function FocusPage({ sessions, onAddSession, tasks, settings, setSettings, onLog }) {
  const extensionRuntime =
    typeof chrome !== "undefined" &&
    Boolean(chrome?.runtime?.id && chrome?.storage?.local);
  const [focusState, setFocusState] = useLS(FOCUS_STORAGE_KEY, EMPTY_FOCUS_STATE);
  const [now, setNow] = useState(Date.now());
  const state = { ...EMPTY_FOCUS_STATE, ...(focusState || {}) };
  const today=new Date().toDateString();
  const todayN=sessions.filter(s=>s?.date && new Date(s.date).toDateString()===today).length;
  const totalMin=sessions.length*25;
  const streak=useMemo(()=>{let s=0;for(let i=0;i<60;i++){const d=new Date();d.setDate(d.getDate()-i);if(sessions.some(x=>x?.date && new Date(x.date).toDateString()===d.toDateString()))s++;else break}return s},[sessions]);
  const remainingMs=state.status==="running"&&state.endsAt?Math.max(state.endsAt-now,0):Math.max(state.remainingMs||FOCUS_TOTAL_MS,0);
  const running=state.status==="running";
  const paused=state.status==="paused";
  const done=state.status==="completed";
  const mins=Math.floor(remainingMs/60000), secs=Math.floor((remainingMs%60000)/1000);
  const pct=((FOCUS_TOTAL_MS-remainingMs)/FOCUS_TOTAL_MS)*100;
  const r=118, circ=2*Math.PI*r, off=circ-(pct/100)*circ;
  const pendingTasks=tasks.filter(t=>t.status!=="done");
  const recent=[...sessions].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,5);
  const notificationSettings = normalizeSettings(settings).notifications;

  const patchFocusState = useCallback(updater => {
    setFocusState(prev => {
      const current = { ...EMPTY_FOCUS_STATE, ...(prev || {}) };
      const next = updater instanceof Function ? updater(current) : updater;
      return { ...current, ...next };
    });
  }, [setFocusState]);

  useEffect(() => {
    setNow(Date.now());
    if (!running) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [running, state.endsAt]);

  useEffect(() => {
    if (extensionRuntime || state.status !== "running" || !state.endsAt || state.sessionLoggedAt) return;
    if (Date.now() < state.endsAt) return;

    const completedAt = state.endsAt;
    const sessionId = state.sessionId || String(completedAt);
    onAddSession({ id:sessionId, date:new Date(completedAt).toISOString(), taskId:state.taskId||null, notes:state.notes||"" });
    onLog("focus_completed", "Focus session completed after 25 minutes.", { source:"focus-preview" });
    patchFocusState({
      status:"completed",
      endsAt:null,
      remainingMs:0,
      completedAt,
      sessionLoggedAt:completedAt,
      sessionId,
    });
  }, [extensionRuntime, state.status, state.endsAt, state.sessionLoggedAt, state.sessionId, state.taskId, state.notes, onAddSession, onLog, patchFocusState]);

  const updateFocusSetting = (key, value) => {
    setSettings(current => ({
      ...current,
      notifications: {
        ...current.notifications,
        [key]: value,
      },
    }));
    onLog("settings_focus_updated", `${value ? "Enabled" : "Disabled"} ${key}.`, { source:"focus-settings" });
  };

  const reset=()=>{patchFocusState({status:"idle",startedAt:null,endsAt:null,remainingMs:FOCUS_TOTAL_MS,sessionId:null,completedAt:null,sessionLoggedAt:null})};
  const toggleFocus=()=>{
    const timestamp=Date.now();
    if(running){
      patchFocusState({status:"paused",endsAt:null,remainingMs:Math.max((state.endsAt||timestamp)-timestamp,0)});
      return;
    }
    const resuming=paused;
    const remaining=resuming?Math.max(state.remainingMs||0,1000):FOCUS_TOTAL_MS;
    patchFocusState({
      status:"running",
      startedAt:resuming?(state.startedAt||timestamp):timestamp,
      endsAt:timestamp+remaining,
      remainingMs:remaining,
      sessionId:resuming?(state.sessionId||String(timestamp)):String(timestamp),
      completedAt:null,
      sessionLoggedAt:null,
    });
  };
  const phaseLabel=done?"done":running?"focusing":paused?"paused":"ready";
  const actionLabel=running?"Pause":paused?"Resume":done?"Again":"Start";
  const hintLabel=running?"Focus session is active across the extension":paused?"Session paused - resume when ready":done?"Great work. Your 25-minute session is complete.":"25-minute deep work session";
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
          {done&&<div className="fc-done">Session complete - 25 minutes logged</div>}
          <div className="focus-main-shell">
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
              <div className="ring-phase">{phaseLabel}</div>
              <div className={`ring-time ${running?"ticking":""}`}>{String(mins).padStart(2,"0")}:{String(secs).padStart(2,"0")}</div>
              <div className="ring-session">session {todayN+(done?0:1)} - today</div>
            </div>
          </div>
          <div className="focus-controls">
            <div className="fc-row">
              <button className="fc-btn" onClick={reset}>Reset</button>
              <button className="fc-btn primary" onClick={toggleFocus}>{actionLabel}</button>
            </div>
            <div className="fc-hint">{hintLabel}</div>
          </div>
          </div>
        </div>
        {/* Side panel */}
        <div className="focus-side">
          <div className="focus-side-section">
            <div className="focus-side-label">Session Setup</div>
            <div className="field">
              <label className="field-label">Link to task</label>
              <select value={state.taskId || ""} onChange={e=>patchFocusState({taskId:e.target.value})} style={{width:"100%",padding:"8px 11px",background:"var(--s2)",border:"1px solid var(--b1)",borderRadius:8,color:(state.taskId || "")?"var(--t1)":"var(--t3)",fontFamily:"var(--sans)",fontSize:12,outline:"none",appearance:"none",cursor:"pointer"}}>
                <option value="">- None -</option>
                {pendingTasks.map(t=><option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="field-label">Session goal</label>
              <textarea value={state.notes || ""} onChange={e=>patchFocusState({notes:e.target.value})} placeholder="What will you accomplish?" className="inp" style={{minHeight:56}}/>
            </div>
            <div className="tiles" style={{marginBottom:16}}>
              {[{l:"Today",v:todayN,c:"var(--violet)",u:"sessions"},{l:"Total",v:`${totalMin}m`,c:"var(--blue)",u:"logged"},{l:"Streak",v:streak,c:"var(--amber)",u:"days"},{l:"Status",v:running?"live":paused?"pause":done?"done":"idle",c:running?"var(--green)":paused?"var(--amber)":"var(--t2)",u:"mode"}].map((s,i)=>(
                <div key={i} className="tile"><div className="tile-lbl">{s.l}</div><div className="tile-val" style={{color:s.c,fontSize:15}}>{s.v}<span className="tile-unit">{s.u}</span></div></div>
              ))}
            </div>
          </div>
          <div className="focus-side-section">
            <div className="focus-side-label">Notifications</div>
            <ToggleRow
              label="Completion popup"
              hint="Show a browser notification when the 25-minute session ends."
              checked={notificationSettings.focusComplete}
              onChange={() => updateFocusSetting("focusComplete", !notificationSettings.focusComplete)}
              accent="var(--green)"
            />
            <ToggleRow
              label="Start notification"
              hint="Notify when a focus session starts from the extension."
              checked={notificationSettings.focusStart}
              onChange={() => updateFocusSetting("focusStart", !notificationSettings.focusStart)}
              accent="var(--blue)"
            />
            <ToggleRow
              label="Pause notification"
              hint="Notify when a running focus session is paused."
              checked={notificationSettings.focusPause}
              onChange={() => updateFocusSetting("focusPause", !notificationSettings.focusPause)}
              accent="var(--amber)"
            />
            <ToggleRow
              label="Toolbar blink"
              hint="Pulse the extension badge while Focus Mode is actively running."
              checked={notificationSettings.badgePulse}
              onChange={() => updateFocusSetting("badgePulse", !notificationSettings.badgePulse)}
              accent="var(--violet)"
            />
            <div style={{fontSize:10,color:"var(--t3)",fontFamily:"var(--mono)",lineHeight:1.5,paddingBottom:4}}>
              {extensionRuntime ? "These settings update the unpacked extension immediately." : "These settings are saved now and will control the extension when it runs in Chrome."}
            </div>
          </div>
          <div className="focus-side-section" style={{paddingBottom:16}}>
            <div className="focus-side-label">Recent Sessions</div>
            {recent.length===0?(
              <div style={{fontSize:11,color:"var(--t3)",fontFamily:"var(--mono)",textAlign:"center",padding:"16px 0"}}>No sessions yet. Start one.</div>
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:7}}>
                {recent.map((s,i)=>{
                  const lt=s.taskId && Array.isArray(tasks) ? tasks.find(t=>t.id===s.taskId) : null;
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
  const [settingsValue, setSettingsValue] = useLS(SETTINGS_STORAGE_KEY, DEFAULT_SETTINGS);
  const [logsValue, setLogsValue] = useLS(LOGS_STORAGE_KEY, []);
  const [page,     setPage]     = useState("all");
  const settings = normalizeSettings(settingsValue);
  const logs = Array.isArray(logsValue) ? logsValue : [];
  const setSettings = useCallback(updater => {
    setSettingsValue(current => normalizeSettings(updater instanceof Function ? updater(normalizeSettings(current)) : updater));
  }, [setSettingsValue]);
  const onLog = useCallback((kind, message, details = {}) => {
    setLogsValue(current => {
      const next = Array.isArray(current) ? current : [];
      return [createLogEntry(kind, message, details), ...next].slice(0, 180);
    });
  }, [setLogsValue]);
  const addSession = useCallback(s=>setSessions(p=>{
    if (s?.id && p.some(x=>x?.id===s.id)) return p;
    return [...p,s];
  }),[setSessions]);
  const isExtensionRuntime =
    typeof window !== "undefined" &&
    /extension:$/.test(window.location.protocol);

  const pendN   = tasks.filter(t=>t.status!=="done").length;
  const doneN   = tasks.filter(t=>t.status==="done").length;
  const today   = new Date().toDateString();
  const sessN   = sessions.filter(s=>new Date(s.date).toDateString()===today).length;
  const obsN    = buildObservabilityActions(tasks, sessions, logs).length;

  const NAV = [
    { id:"all",    icon:"▣", label:"All Tasks",  badge:tasks.length, bc:""       },
    { id:"active", icon:"◫", label:"Active",      badge:pendN,        bc:"amber"  },
    { id:"observability", icon:"OBS", label:"Observability", badge:obsN, bc:"blue" },
    { id:"done",   icon:"◆", label:"Done",        badge:doneN,        bc:"green"  },
    { id:"focus",  icon:"◎", label:"Focus Mode",  badge:sessN>0?`${sessN} today`:null, bc:"violet" },
  ];

  return (
    <>
      <style>{CSS}</style>
      <div className={`popup-stage ${isExtensionRuntime ? "extension-runtime" : "browser-preview"}`}>
      <div className="app popup-mode">
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
          <div className="sidebar-footer"><span className="footer-dot"/>side panel · v0.1</div>
        </nav>

        {/* Content */}
        <div className="content">
          {page==="all"    && <AllPage    tasks={tasks} setTasks={setTasks} sessions={sessions} onLog={onLog} settings={settings}/>}
          {page==="active" && <ActivePage tasks={tasks} setTasks={setTasks} sessions={sessions} logs={logs} onLog={onLog}/>}
          {page==="observability" && <ObservabilityPage tasks={tasks} setTasks={setTasks} sessions={sessions} logs={logs} onLog={onLog} settings={settings}/>}
          {page==="done"   && <DonePage   tasks={tasks} setTasks={setTasks} sessions={sessions}/>}
          {page==="focus"  && <FocusPage  sessions={sessions} onAddSession={addSession} tasks={tasks} settings={settings} setSettings={setSettings} onLog={onLog}/>}
        </div>
      </div>
      </div>
    </>
  );
}
