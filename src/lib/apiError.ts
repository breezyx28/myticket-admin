/**
 * Best-effort message from RTK Query / fetch errors (e.g. Laravel 422 JSON).
 */
export function getApiErrorMessage(error: unknown, fallback = 'Request failed.'): string {
  if (typeof error !== 'object' || error === null) return fallback;
  const e = error as { status?: unknown; data?: unknown };
  const data = e.data;
  if (typeof data === 'string' && data.trim()) return data;
  if (data && typeof data === 'object') {
    const o = data as { message?: unknown; error?: unknown; errors?: unknown };
    if (typeof o.message === 'string' && o.message.trim()) return o.message;
    if (typeof o.error === 'string' && o.error.trim()) return o.error;
    if (o.errors && typeof o.errors === 'object') {
      const errors = o.errors as Record<string, unknown>;
      for (const v of Object.values(errors)) {
        if (Array.isArray(v) && typeof v[0] === 'string') return v[0];
        if (typeof v === 'string') return v;
      }
    }
  }
  return fallback;
}
