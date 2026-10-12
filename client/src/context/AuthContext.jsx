import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    api('/auth/me').then(data => { if (active) setUser(data.user); })
      .catch(() => { if (active) setUser(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const value = useMemo(() => ({
    user, loading,
    async login(credentials) { const data = await api('/auth/login', { method: 'POST', body: credentials }); setUser(data.user); return data.user; },
    async signup(details) { const data = await api('/auth/signup', { method: 'POST', body: details }); setUser(data.user); return data.user; },
    async logout() { await api('/auth/logout', { method: 'POST' }); setUser(null); },
    refresh: async () => { try { const data = await api('/auth/me'); setUser(data.user); return data.user; } catch { setUser(null); return null; } },
  }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider');
  return value;
}
