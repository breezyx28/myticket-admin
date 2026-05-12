import type { SessionUser } from '@/contexts/adminAuthContext';

const SESSION_KEY_V1 = 'myticket_admin_session_v1';
const SESSION_KEY_V2 = 'myticket_admin_session_v2';

export type PersistedAdminSessionV2 = {
  v: 2;
  user: SessionUser;
  accessToken: string | null;
  refreshToken: string | null;
};

function isSessionUser(x: unknown): x is SessionUser {
  if (!x || typeof x !== 'object') return false;
  const o = x as Record<string, unknown>;
  return typeof o.email === 'string' && typeof o.name === 'string' && typeof o.role === 'string';
}

function parseV2(raw: string): PersistedAdminSessionV2 | null {
  try {
    const j = JSON.parse(raw) as unknown;
    if (!j || typeof j !== 'object') return null;
    const o = j as Record<string, unknown>;
    if (o.v !== 2 || !isSessionUser(o.user)) return null;
    return {
      v: 2,
      user: o.user,
      accessToken: typeof o.accessToken === 'string' ? o.accessToken : null,
      refreshToken: typeof o.refreshToken === 'string' ? o.refreshToken : null,
    };
  } catch {
    return null;
  }
}

/** Migrate legacy demo-only session (no tokens). */
function tryMigrateV1(): PersistedAdminSessionV2 | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY_V1);
    if (!raw) return null;
    const j = JSON.parse(raw) as unknown;
    if (!isSessionUser(j)) return null;
    const next: PersistedAdminSessionV2 = {
      v: 2,
      user: j,
      accessToken: null,
      refreshToken: null,
    };
    sessionStorage.removeItem(SESSION_KEY_V1);
    sessionStorage.setItem(SESSION_KEY_V2, JSON.stringify(next));
    return next;
  } catch {
    return null;
  }
}

export function loadPersistedSession(): PersistedAdminSessionV2 | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY_V2);
    if (raw) {
      const s = parseV2(raw);
      if (s) return s;
    }
    return tryMigrateV1();
  } catch {
    return null;
  }
}

export function savePersistedSession(s: PersistedAdminSessionV2) {
  sessionStorage.setItem(SESSION_KEY_V2, JSON.stringify(s));
}

export function clearPersistedSession() {
  sessionStorage.removeItem(SESSION_KEY_V2);
  sessionStorage.removeItem(SESSION_KEY_V1);
}

export function getAccessToken(): string | null {
  return loadPersistedSession()?.accessToken ?? null;
}

export function getRefreshToken(): string | null {
  return loadPersistedSession()?.refreshToken ?? null;
}

export function updateSessionTokens(accessToken: string | null, refreshToken: string | null) {
  const cur = loadPersistedSession();
  if (!cur) return;
  savePersistedSession({
    ...cur,
    accessToken,
    refreshToken: refreshToken ?? cur.refreshToken,
  });
}

/** Merge into persisted `user` (e.g. after profile PATCH). */
export function patchPersistedSessionUser(patch: Partial<SessionUser>) {
  const cur = loadPersistedSession();
  if (!cur) return;
  savePersistedSession({
    ...cur,
    user: { ...cur.user, ...patch },
  });
}
