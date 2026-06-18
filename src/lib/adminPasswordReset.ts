import { getApiBaseUrl } from '@/config/env';
import { buildApiHeaders } from '@/lib/apiHeaders';
import { tError } from '@/lib/i18nMessage';

async function readErrorMessage(res: Response): Promise<string> {
  let msg = tError('requestFailedStatus', { status: res.status });
  try {
    const j: unknown = await res.json();
    if (j && typeof j === 'object' && 'message' in j && typeof (j as { message: unknown }).message === 'string') {
      msg = (j as { message: string }).message;
    }
  } catch {
    /* ignore */
  }
  return msg;
}

/** `POST /api/v1/admin/auth/password/forgot` — public, no bearer token. */
export async function postAdminPasswordForgot(email: string): Promise<void> {
  const base = getApiBaseUrl();
  if (!base) throw new Error(tError('apiNotConfigured'));
  const res = await fetch(`${base}/api/v1/admin/auth/password/forgot`, {
    method: 'POST',
    headers: buildApiHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
}

/** `POST /api/v1/admin/auth/password/reset` — public, no bearer token. */
export async function postAdminPasswordReset(token: string, password: string): Promise<void> {
  const base = getApiBaseUrl();
  if (!base) throw new Error(tError('apiNotConfigured'));
  const res = await fetch(`${base}/api/v1/admin/auth/password/reset`, {
    method: 'POST',
    headers: buildApiHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ token, password }),
  });
  if (!res.ok) throw new Error(await readErrorMessage(res));
}
