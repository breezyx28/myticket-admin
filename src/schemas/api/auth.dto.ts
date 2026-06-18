import { z } from 'zod';
import { tCommon } from '@/lib/i18nMessage';

/** Accept common Laravel / SPA token envelope shapes. */
export function parseAdminLoginTokens(json: unknown): { accessToken: string; refreshToken?: string } | null {
  if (!json || typeof json !== 'object') return null;
  const root = json as Record<string, unknown>;
  const data = root.data;
  const inner: Record<string, unknown> =
    data !== null && typeof data === 'object' && !Array.isArray(data) ? (data as Record<string, unknown>) : root;

  const access =
    (typeof inner.access_token === 'string' && inner.access_token) ||
    (typeof inner.token === 'string' && inner.token) ||
    (typeof inner.accessToken === 'string' && inner.accessToken) ||
    undefined;
  if (!access) return null;

  const refresh =
    (typeof inner.refresh_token === 'string' && inner.refresh_token) ||
    (typeof inner.refreshToken === 'string' && inner.refreshToken) ||
    undefined;

  return { accessToken: access, refreshToken: refresh };
}

/** Handoff: `POST /auth/refresh` returns `{ "token": "<new_plain_text_token>" }` (may be under `data`). */
export function parseAdminRefreshToken(json: unknown): { accessToken: string } | null {
  if (!json || typeof json !== 'object') return null;
  const root = json as Record<string, unknown>;
  const data = root.data;
  const inner: Record<string, unknown> =
    data !== null && typeof data === 'object' && !Array.isArray(data) ? (data as Record<string, unknown>) : root;
  const token =
    (typeof inner.token === 'string' && inner.token) ||
    (typeof root.token === 'string' && root.token) ||
    (typeof inner.access_token === 'string' && inner.access_token) ||
    undefined;
  if (!token) return null;
  return { accessToken: token };
}

const userShape = z
  .object({
    id: z.union([z.string(), z.number()]).optional(),
    email: z.string().email().optional(),
    name: z.string().optional(),
    full_name: z.string().optional(),
    display_name: z.string().optional(),
    role: z.string().optional(),
    profile_image_url: z.string().optional(),
    avatar_url: z.string().optional(),
  })
  .passthrough();

function pickAvatarUrl(...sources: (Record<string, unknown> | undefined)[]): string | undefined {
  for (const src of sources) {
    if (!src) continue;
    for (const key of ['profile_image_url', 'avatar_url', 'profileImageUrl', 'avatarUrl'] as const) {
      const v = src[key];
      if (typeof v === 'string' && v.trim()) return v.trim();
    }
  }
  return undefined;
}

export function parseAdminLoginUser(
  json: unknown,
  fallbackEmail: string,
): { id?: string; email: string; name: string; role: 'admin'; avatarUrl?: string } {
  if (!json || typeof json !== 'object') {
    return { email: fallbackEmail, name: fallbackEmail.split('@')[0] ?? tCommon('appNameAdmin'), role: 'admin' };
  }
  const pickId = (raw: unknown): string | undefined => {
    if (typeof raw === 'string' && raw.trim()) return raw.trim();
    if (typeof raw === 'number' && Number.isFinite(raw)) return String(Math.trunc(raw));
    return undefined;
  };
  const root = json as Record<string, unknown>;
  const data = root.data;
  const inner =
    data !== null && typeof data === 'object' && !Array.isArray(data) ? (data as Record<string, unknown>) : root;
  const userRaw = inner.user ?? inner.admin ?? inner.profile;
  const parsed = userShape.safeParse(userRaw);
  const email =
    (parsed.success && parsed.data.email) ||
    (typeof inner.email === 'string' && inner.email) ||
    fallbackEmail;
  const name =
    (parsed.success && (parsed.data.name || parsed.data.display_name || parsed.data.full_name)) ||
    (typeof inner.name === 'string' && inner.name) ||
    email.split('@')[0] ||
    tCommon('appNameAdmin');
  const id =
    (parsed.success && pickId(parsed.data.id)) ||
    pickId(inner.id) ||
    pickId(inner.user_id);
  const avatarUrl = pickAvatarUrl(
    parsed.success ? (parsed.data as Record<string, unknown>) : undefined,
    userRaw && typeof userRaw === 'object' && !Array.isArray(userRaw)
      ? (userRaw as Record<string, unknown>)
      : undefined,
    inner,
  );
  return {
    ...(id ? { id } : {}),
    email,
    name,
    role: 'admin',
    ...(avatarUrl ? { avatarUrl } : {}),
  };
}
