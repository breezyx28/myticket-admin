/** Normalized Vite env accessors (no trailing slash on API base). */

function stripTrailingSlashes(s: string): string {
  return s.replace(/\/+$/, '');
}

export function getApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL ?? '';
  return stripTrailingSlashes(String(raw).trim());
}

/** When true, list/detail queries use Postman-documented GET paths once added; otherwise in-memory mock. */
export function adminReadsSourceIsApi(): boolean {
  return import.meta.env.VITE_ADMIN_READS_SOURCE === 'api';
}

/** Local UI sign-in without calling the API (email heuristic). */
export function allowDemoAuth(): boolean {
  return import.meta.env.VITE_ALLOW_DEMO_AUTH === 'true';
}

export function adminLoginPhone(): string | undefined {
  const v = import.meta.env.VITE_ADMIN_LOGIN_PHONE;
  return v === undefined || v === '' ? undefined : String(v);
}

export function adminLoginOtp(): string | undefined {
  const v = import.meta.env.VITE_ADMIN_LOGIN_OTP;
  return v === undefined || v === '' ? undefined : String(v);
}
