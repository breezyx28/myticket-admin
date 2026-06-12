import { DEMO_ADMIN_EMAIL } from '@/config/demoAuth';
import { allowDemoAuth, adminLoginOtp, adminLoginPhone, getApiBaseUrl } from '@/config/env';
import {
  AuthContext,
  type AuthContextValue,
  type SessionUser,
  type SignInFailureReason,
} from '@/contexts/adminAuthContext';
import { destroyAdminEcho } from '@/lib/realtime/echo';
import {
  clearPersistedSession,
  loadPersistedSession,
  patchPersistedSessionUser,
  savePersistedSession,
  type PersistedAdminSessionV2,
} from '@/lib/authSession';
import { postAdminLogout } from '@/services/adminFetchBaseQuery';
import { parseAdminLoginTokens, parseAdminLoginUser } from '@/schemas/api/auth.dto';
import { useCallback, useMemo, useState, type ReactNode } from 'react';

/** Demo: `DEMO_ADMIN_EMAIL` / password OR any email containing "+admin" */
function resolveDemoAdmin(email: string): boolean {
  const e = email.trim().toLowerCase();
  return e === DEMO_ADMIN_EMAIL.toLowerCase() || e.includes('+admin');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(() => loadPersistedSession()?.user ?? null);

  const signIn = useCallback(async (params: { email: string; password: string }) => {
    const email = params.email.trim();
    if (!email || params.password.length < 4) return { ok: false as const, reason: 'invalid' as const };

    if (allowDemoAuth() && resolveDemoAdmin(email)) {
      const nextUser: SessionUser = {
        email,
        name: email.split('@')[0] ?? 'Admin',
        role: 'admin',
      };
      const session: PersistedAdminSessionV2 = {
        v: 2,
        user: nextUser,
        accessToken: null,
        refreshToken: null,
      };
      savePersistedSession(session);
      setUser(nextUser);
      return { ok: true as const };
    }

    const base = getApiBaseUrl();
    if (!base) {
      return { ok: false as const, reason: 'server' as const };
    }

    const body: Record<string, string> = {
      email,
      password: params.password,
    };
    const phone = adminLoginPhone();
    const otp = adminLoginOtp();
    if (phone !== undefined) body.phone = phone;
    if (otp !== undefined) body.otp = otp;
    if (!('phone' in body)) body.phone = '';
    if (!('otp' in body)) body.otp = '';

    let res: Response;
    try {
      res = await fetch(`${base}/api/v1/admin/auth/login`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
    } catch {
      return { ok: false as const, reason: 'network' as const };
    }

    let json: unknown;
    try {
      json = await res.json();
    } catch {
      json = null;
    }

    if (!res.ok) {
      const reason: SignInFailureReason = res.status >= 500 ? 'server' : 'credentials';
      return { ok: false as const, reason };
    }

    const tokens = parseAdminLoginTokens(json);
    if (!tokens) {
      return { ok: false as const, reason: 'session' as const };
    }

    const nextUser = parseAdminLoginUser(json, email);
    savePersistedSession({
      v: 2,
      user: nextUser,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken ?? null,
    });
    setUser(nextUser);
    return { ok: true as const };
  }, []);

  const signOut = useCallback(() => {
    void postAdminLogout();
    destroyAdminEcho();
    clearPersistedSession();
    setUser(null);
  }, []);

  const updateUser = useCallback((patch: Partial<SessionUser>) => {
    setUser((u) => (u ? { ...u, ...patch } : null));
    patchPersistedSessionUser(patch);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      signIn,
      signOut,
      updateUser,
    }),
    [user, signIn, signOut, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
