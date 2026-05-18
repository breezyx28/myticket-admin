/** Normalized Vite env accessors (no trailing slash on API base). */

export const PRODUCTION_API_BASE_URL = 'https://myticket-api.kat-jr.com';

function stripTrailingSlashes(s: string): string {
  return s.replace(/\/+$/, '');
}

export function getApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL ?? '';
  const trimmed = stripTrailingSlashes(String(raw).trim());
  return trimmed || PRODUCTION_API_BASE_URL;
}

/** Fallback media paths when the API omits image/video URLs. */
export function placeholderAssetUrl(path: string): string {
  const segment = path.replace(/^\/+/, '');
  return `${PRODUCTION_API_BASE_URL}/${segment}`;
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
