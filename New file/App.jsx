// src/App.jsx — Updated with Auth + Real API hooks
import { useState, useCallback } from 'react';
import { AuthProvider, useAuth } from './store/authStore';
import ProtectedRoute from './components/ProtectedRoute';
import { useTasks }   from './hooks/useTasks';
import { useSessions } from './hooks/useSessions';

// ── Page imports (keep your existing page files) ────────────
import AllPage    from './pages/AllPage';
import ActivePage from './pages/ActivePage';
import DonePage   from './pages/DonePage';
import FocusPage  from './pages/FocusPage';

// Inline global CSS (import from your existing shared.js)
import { GLOBAL_CSS } from './shared';

// ── Sidebar ──────────────────────────────────────────────────
function Sidebar({ page, setPage, tasks, sessions }) {
  const { user, logout } = useAuth();
  const pendingN  = tasks.filter(t => t.status !== 'done').length;
  const doneN     = tasks.filter(t => t.status === 'done').length;
  const today     = new Date().toDateString();
  const todaySess = sessions.filter(s => {
    const d = s.date || s.createdAt;
    return d && new Date(d).toDateString() === today;
  }).length;

  const NAV = [
    { id:'all',    icon:'▣', label:'All Tasks',  badge:tasks.length, bc:''       },
    { id:'active', icon:'◫', label:'Active',      badge:pendingN,     bc:'amber'  },
    { id:'done',   icon:'◆', label:'Done',        badge:doneN,        bc:'green'  },
    { id:'focus',  icon:'◎', label:'Focus Mode',  badge:todaySess > 0 ? `${todaySess} today` : null, bc:'violet' },
  ];

  return (
    <nav style={{
      position:'fixed',top:0,left:0,bottom:0,width:210,zIndex:50,
      background:'rgba(7,8,13,0.97)',backdropFilter:'blur(24px)',
      borderRight:'1px solid rgba(200,210,255,0.07)',
      display:'flex',flexDirection:'column',fontFamily:"'DM Sans',sans-serif",
    }}>
      {/* Logo */}
      <div style={{padding:'20px 18px 16px',borderBottom:'1px solid rgba(200,210,255,0.07)',display:'flex',alignItems:'center',gap:10}}>
        <div style={{width:28,height:28,borderRadius:8,background:'linear-gradient(135deg,#a78bfa,#60a5fa)',display:'grid',placeItems:'center',fontSize:13,boxShadow:'0 4px 14px rgba(167,139,250,0.35)'}}>⚡</div>
        <span style={{fontFamily:"'Fraunces',serif",fontSize:16,fontWeight:600,letterSpacing:'-.3px',color:'#eef0f8'}}>
          Work<em style={{fontStyle:'italic',color:'#a78bfa'}}>Zen</em>
        </span>
      </div>

      {/* Nav */}
      <div style={{flex:1,padding:'10px 8px',display:'flex',flexDirection:'column',gap:3,overflowY:'auto'}}>
        <div style={{fontSize:9,fontFamily:"'IBM Plex Mono',monospace",color:'rgba(238,240,248,0.3)',letterSpacing:'0.1em',textTransform:'uppercase',padding:'6px 10px 3px',fontWeight:700}}>Navigation</div>
        {NAV.map(n => (
          <button key={n.id} onClick={() => setPage(n.id)}
            style={{
              display:'flex',alignItems:'center',gap:9,padding:'8px 10px',borderRadius:9,
              border:page===n.id?'1px solid rgba(200,210,255,0.13)':'1px solid transparent',
              background:page===n.id?'rgba(24,25,38,1)':'transparent',
              color:page===n.id?'#eef0f8':'rgba(238,240,248,0.55)',
              fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:500,
              cursor:'pointer',transition:'all .17s',width:'100%',textAlign:'left',
            }}>
            <span style={{fontSize:14,opacity:page===n.id?1:.5}}>{n.icon}</span>
            <span style={{flex:1}}>{n.label}</span>
            {n.badge !== null && n.badge !== 0 && (
              <span style={{
                fontSize:9,fontFamily:"'IBM Plex Mono',monospace",fontWeight:700,
                padding:'2px 6px',borderRadius:99,
                background:n.bc==='amber'?'rgba(245,166,35,0.13)':n.bc==='green'?'rgba(74,222,128,0.13)':n.bc==='violet'?'rgba(167,139,250,0.13)':'rgba(38,40,64,1)',
                color:n.bc==='amber'?'#f5a623':n.bc==='green'?'#4ade80':n.bc==='violet'?'#a78bfa':'rgba(238,240,248,0.3)',
              }}>{n.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* User + logout */}
      <div style={{padding:'12px 14px',borderTop:'1px solid rgba(200,210,255,0.07)'}}>
        <div style={{fontSize:11,color:'rgba(238,240,248,0.55)',marginBottom:6,fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
          {user?.name || 'User'}
        </div>
        <button onClick={logout} style={{
          width:'100%',padding:'6px 10px',borderRadius:7,
          border:'1px solid rgba(200,210,255,0.07)',
          background:'transparent',color:'rgba(238,240,248,0.3)',
          fontFamily:"'DM Sans',sans-serif",fontSize:11,cursor:'pointer',
          transition:'all .18s',textAlign:'left',
        }}
        onMouseEnter={e=>{e.target.style.color='#fb7185';e.target.style.borderColor='rgba(251,113,133,0.2)'}}
        onMouseLeave={e=>{e.target.style.color='rgba(238,240,248,0.3)';e.target.style.borderColor='rgba(200,210,255,0.07)'}}>
          Sign out
        </button>
      </div>
    </nav>
  );
}

// ── Main app (inside auth) ───────────────────────────────────
function AppInner() {
  const [page, setPage] = useState('all');
  const taskHook    = useTasks();
  const sessionHook = useSessions();

  const { tasks, loading: tLoad } = taskHook;
  const { sessions, insights, logSession } = sessionHook;

  // Loading state
  if (tLoad) {
    return (
      <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#07080d',color:'rgba(238,240,248,0.4)',fontFamily:"'IBM Plex Mono',monospace",fontSize:13}}>
        Loading WorkZen…
      </div>
    );
  }

  const sharedProps = { tasks, setTasks: null, sessions, taskHook, sessionHook };

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div className="app">
        <Sidebar page={page} setPage={setPage} tasks={tasks} sessions={sessions} />
        <div className="content">
          {page === 'all'    && <AllPage    tasks={tasks} taskHook={taskHook} sessions={sessions} insights={insights} />}
          {page === 'active' && <ActivePage tasks={tasks} taskHook={taskHook} sessions={sessions} />}
          {page === 'done'   && <DonePage   tasks={tasks} taskHook={taskHook} sessions={sessions} />}
          {page === 'focus'  && <FocusPage  sessions={sessions} onAddSession={logSession} tasks={tasks} insights={insights} />}
        </div>
      </div>
    </>
  );
}

// ── Root with AuthProvider ───────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <AppInner />
      </ProtectedRoute>
    </AuthProvider>
  );
}
