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

export type PendingActionPlaceholderKind =
  | 'role_application'
  | 'talent_profile'
  | 'event'
  | 'support'
  | 'moderation'
  | 'tourism_ad';

/** Stable card art when pending-action API rows omit `image_url`. */
export function pendingActionPlaceholderUrl(kind: PendingActionPlaceholderKind): string {
  return `https://picsum.photos/seed/myticket-pending-${kind}/800/360`;
}

/** Live GETs unless explicitly set to `mock` (opt-out). */
export function adminReadsSourceIsApi(): boolean {
  const raw = String(import.meta.env.VITE_ADMIN_READS_SOURCE ?? 'api').trim().toLowerCase();
  return raw !== 'mock';
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
