import { getApiBaseUrl } from '@/config/env';
import { buildApiHeaders } from '@/lib/apiHeaders';
import { clearPersistedSession, getAccessToken, getRefreshToken, updateSessionTokens } from '@/lib/authSession';
import { parseAdminRefreshToken } from '@/schemas/api/auth.dto';
import type { BaseQueryApi, BaseQueryFn, FetchArgs } from '@reduxjs/toolkit/query';
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const adminFetchBaseQuery = fetchBaseQuery({
  baseUrl: getApiBaseUrl(),
  prepareHeaders: (headers) => {
    const merged = buildApiHeaders(headers);
    merged.forEach((value, key) => headers.set(key, value));
    return headers;
  },
});

async function tryRefreshAccess(api: BaseQueryApi): Promise<boolean> {
  const access = getAccessToken();
  const refresh = getRefreshToken();
  /** Handoff: Bearer only, no body — use current access for rotation, else stored refresh as Bearer. */
  const bearer = access || refresh;
  if (!bearer) return false;
  const base = getApiBaseUrl();
  if (!base) return false;

  const res = await fetch(`${base}/api/v1/admin/auth/refresh`, {
    method: 'POST',
    headers: buildApiHeaders(undefined, { bearer }),
  });
  if (!res.ok) {
    clearPersistedSession();
    return false;
  }
  let json: unknown;
  try {
    json = await res.json();
  } catch {
    return false;
  }
  const parsed = parseAdminRefreshToken(json);
  if (!parsed) return false;
  updateSessionTokens(parsed.accessToken, refresh);
  void api;
  return true;
}

export const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, unknown> = async (args, api, extraOptions) => {
  let result = await adminFetchBaseQuery(args, api, extraOptions);
  const status = typeof result.error === 'object' && result.error && 'status' in result.error ? result.error.status : null;
  if (status === 401 && (getAccessToken() || getRefreshToken())) {
    const ok = await tryRefreshAccess(api);
    if (ok) result = await adminFetchBaseQuery(args, api, extraOptions);
  }
  return result;
};

/** Logout best-effort: clear local session even if the network call fails. */
export async function postAdminLogout(): Promise<void> {
  const base = getApiBaseUrl();
  const token = getAccessToken();
  if (!base || !token) return;
  try {
    await fetch(`${base}/api/v1/admin/auth/logout`, {
      method: 'POST',
      headers: buildApiHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({}),
    });
  } catch {
    /* ignore */
  }
}

export function sessionHasApiCredentials(): boolean {
  return Boolean(getAccessToken());
}
