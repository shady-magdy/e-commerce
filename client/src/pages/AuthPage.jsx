import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

export default function AuthPage({ mode: initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isSignup = mode === 'signup';
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const user = isSignup ? await signup(form) : await login(form);
      // Signup deliberately returns to the home page as requested; admins go to their tools after login.
      navigate(isSignup ? '/' : (user.role === 'admin' ? '/admin' : location.state?.from || '/'), { replace: true });
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  function switchMode() { setMode(isSignup ? 'login' : 'signup'); setError(''); }
  return <section className="auth-layout">
    <div className="auth-image"><div><span className="eyebrow">Atelier — your everyday, considered</span><p>“A good home<br/>is a collection<br/>of little rituals.”</p></div><span className="auth-image-caption">Pieces to keep close</span></div>
    <div className="auth-form-wrap"><div className="auth-form-inner"><span className="eyebrow">{isSignup?'A place for the considered':'Welcome back'}</span><h1>{isSignup?'Create your account':'Sign in'}</h1><p className="auth-intro">{isSignup?'Save your edit, keep your favorites and make your place a little more yours.':'Pick up where you left off and return to your saved pieces.'}</p>
      <form className="auth-form" onSubmit={submit}>
        {isSignup&&<label>Your name<input autoComplete="name" minLength="2" maxLength="100" required value={form.name} onChange={event=>setForm({...form,name:event.target.value})} placeholder="First and last name"/></label>}
        <label>Email address<input type="email" autoComplete="email" required value={form.email} onChange={event=>setForm({...form,email:event.target.value})} placeholder="you@example.com"/></label>
        <label>Password<input type="password" autoComplete={isSignup?'new-password':'current-password'} minLength="8" maxLength="128" required value={form.password} onChange={event=>setForm({...form,password:event.target.value})} placeholder="At least 8 characters"/></label>
        {error&&<p className="error-message" role="alert">{error}</p>}
        <button className="button button-dark auth-submit" disabled={busy}>{busy?'One moment…':isSignup?'Create account':'Sign in'}</button>
      </form>
      <p className="auth-switch">{isSignup?'Already part of Atelier?':'New to Atelier?'} <button onClick={switchMode}>{isSignup?'Sign in':'Create an account'}</button></p>
      <Link to="/" className="auth-back">← Back to the shop</Link>
    </div></div>
  </section>;
}
