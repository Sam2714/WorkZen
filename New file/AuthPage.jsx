// src/pages/AuthPage.jsx
// Login + Register — switches between both modes
import { useState } from 'react';
import { useAuth } from '../store/authStore';

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,700;1,9..144,400&family=IBM+Plex+Mono:wght@400;500&family=DM+Sans:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --s0:#07080d;--s1:#0d0e18;--s2:#12131e;--s3:#181926;--s5:#262840;
  --b1:rgba(200,210,255,0.07);--b2:rgba(200,210,255,0.13);
  --t1:#eef0f8;--t2:rgba(238,240,248,0.55);--t3:rgba(238,240,248,0.3);--t4:rgba(238,240,248,0.12);
  --violet:#a78bfa;--vdim:rgba(167,139,250,0.13);
  --green:#4ade80;--red:#fb7185;--rdim:rgba(251,113,133,0.12);
  --sans:'DM Sans',sans-serif;--mono:'IBM Plex Mono',monospace;--serif:'Fraunces',Georgia,serif;
}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes glint{0%{left:-100%}100%{left:220%}}
.auth-shell{min-height:100vh;background:radial-gradient(ellipse 70% 50% at 20% 0%,rgba(167,139,250,0.1) 0%,transparent 55%),radial-gradient(ellipse 50% 40% at 80% 100%,rgba(96,165,250,0.07) 0%,transparent 55%),var(--s0);display:flex;align-items:center;justify-content:center;padding:24px;font-family:var(--sans);color:var(--t1)}
.auth-card{width:100%;max-width:400px;background:var(--s1);border:1px solid var(--b1);border-radius:20px;overflow:hidden;animation:fadeUp .4s ease both}
.auth-top{padding:28px 28px 0;text-align:center}
.auth-logo{display:inline-flex;align-items:center;gap:9px;margin-bottom:24px}
.auth-logo-mark{width:30px;height:30px;border-radius:8px;background:linear-gradient(135deg,#a78bfa,#60a5fa);display:grid;place-items:center;font-size:14px;box-shadow:0 4px 14px rgba(167,139,250,0.35)}
.auth-logo-text{font-family:var(--serif);font-size:17px;font-weight:600;letter-spacing:-.3px}
.auth-logo-text em{font-style:italic;color:var(--violet)}
.auth-heading{font-family:var(--serif);font-size:22px;font-weight:500;letter-spacing:-.4px;margin-bottom:6px}
.auth-heading em{font-style:italic;color:var(--violet)}
.auth-sub{font-size:13px;color:var(--t2);margin-bottom:0}
.auth-tabs{display:flex;gap:0;margin:20px 28px 0;background:var(--s2);border:1px solid var(--b1);border-radius:10px;padding:3px}
.auth-tab{flex:1;padding:7px;border-radius:7px;border:none;background:transparent;color:var(--t2);font-family:var(--sans);font-size:13px;font-weight:500;cursor:pointer;transition:all .18s}
.auth-tab:hover{color:var(--t1)}
.auth-tab.on{background:var(--s4,#1e2030);color:var(--t1);box-shadow:0 1px 4px rgba(0,0,0,.5)}
.auth-body{padding:20px 28px 28px;display:flex;flex-direction:column;gap:13px}
.auth-field{display:flex;flex-direction:column;gap:5px}
.auth-label{font-size:10px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--t3);font-family:var(--mono)}
.auth-input{width:100%;padding:10px 13px;background:var(--s2);border:1px solid var(--b1);border-radius:8px;color:var(--t1);font-family:var(--sans);font-size:14px;outline:none;transition:all .2s}
.auth-input::placeholder{color:var(--t4)}
.auth-input:focus{border-color:rgba(167,139,250,.45);box-shadow:0 0 0 3px rgba(167,139,250,.08);background:var(--s3)}
.auth-btn{width:100%;padding:11px;border:none;border-radius:8px;cursor:pointer;font-family:var(--sans);font-size:14px;font-weight:600;color:#fff;background:linear-gradient(135deg,#a78bfa,#60a5fa);box-shadow:0 4px 18px rgba(167,139,250,.25);transition:all .2s;position:relative;overflow:hidden;margin-top:2px}
.auth-btn::after{content:'';position:absolute;top:0;left:-100%;width:60%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.12),transparent);transform:skewX(-20deg)}
.auth-btn:hover{transform:translateY(-1px);box-shadow:0 6px 26px rgba(167,139,250,.4)}
.auth-btn:hover::after{animation:glint .5s ease forwards}
.auth-btn:disabled{opacity:.6;cursor:not-allowed;transform:none}
.auth-error{font-size:12px;color:var(--red);background:var(--rdim);border:1px solid rgba(251,113,133,.2);border-radius:7px;padding:9px 12px;text-align:center}
.auth-divider{text-align:center;font-size:11px;color:var(--t3);font-family:var(--mono);margin:2px 0}
`;

export default function AuthPage({ onAuth }) {
  const [mode,     setMode]     = useState('login');
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const { login, register, loading, error } = useAuth();

  const submit = async (e) => {
    e.preventDefault();
    let result;
    if (mode === 'login') {
      result = await login({ email, password });
    } else {
      result = await register({ name, email, password });
    }
    if (result.ok && onAuth) onAuth();
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="auth-shell">
        <div className="auth-card">
          <div className="auth-top">
            <div className="auth-logo">
              <div className="auth-logo-mark">⚡</div>
              <span className="auth-logo-text">Work<em>Zen</em></span>
            </div>
            <div className="auth-heading">
              {mode === 'login' ? <>Welcome <em>back</em></> : <>Get <em>started</em></>}
            </div>
            <div className="auth-sub">
              {mode === 'login' ? 'Sign in to continue your work' : 'Create your WorkZen account'}
            </div>
          </div>

          <div className="auth-tabs">
            <button className={`auth-tab ${mode === 'login' ? 'on' : ''}`} onClick={() => setMode('login')}>Sign In</button>
            <button className={`auth-tab ${mode === 'register' ? 'on' : ''}`} onClick={() => setMode('register')}>Register</button>
          </div>

          <form className="auth-body" onSubmit={submit}>
            {mode === 'register' && (
              <div className="auth-field">
                <label className="auth-label">Full Name</label>
                <input className="auth-input" placeholder="Sam Sharma" value={name}
                  onChange={e => setName(e.target.value)} required />
              </div>
            )}
            <div className="auth-field">
              <label className="auth-label">Email</label>
              <input className="auth-input" type="email" placeholder="sam@email.com" value={email}
                onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="auth-field">
              <label className="auth-label">Password</label>
              <input className="auth-input" type="password" placeholder="Min. 6 characters" value={password}
                onChange={e => setPassword(e.target.value)} required minLength={6} />
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>

            <div className="auth-divider">
              {mode === 'login' ? "Don't have an account? Click Register above" : 'Already have an account? Click Sign In above'}
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
