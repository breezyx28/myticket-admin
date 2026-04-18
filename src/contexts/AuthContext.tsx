import { DEMO_ADMIN_EMAIL } from '@/config/demoAuth';
import { AuthContext, type AuthContextValue, type SessionUser } from '@/contexts/adminAuthContext';
import { useCallback, useMemo, useState, type ReactNode } from 'react';

const SESSION_KEY = 'myticket_admin_session_v1';

function loadSession(): SessionUser | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

function saveSession(u: SessionUser | null) {
  if (!u) sessionStorage.removeItem(SESSION_KEY);
  else sessionStorage.setItem(SESSION_KEY, JSON.stringify(u));
}

/** Demo: `DEMO_ADMIN_EMAIL` / password OR any email containing "+admin" */
function resolveDemoAdmin(email: string): boolean {
  const e = email.trim().toLowerCase();
  return e === DEMO_ADMIN_EMAIL.toLowerCase() || e.includes('+admin');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(() => loadSession());

  const signIn = useCallback((params: { email: string; password: string }) => {
    const email = params.email.trim();
    if (!email || params.password.length < 4) return { ok: false as const, reason: 'invalid' as const };
    if (!resolveDemoAdmin(email)) return { ok: false as const, reason: 'not_admin' as const };
    const next: SessionUser = {
      email,
      name: email.split('@')[0] ?? 'Admin',
      role: 'admin',
    };
    setUser(next);
    saveSession(next);
    return { ok: true as const };
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    saveSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      signIn,
      signOut,
    }),
    [user, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
