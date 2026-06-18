import { getCurrentLocale } from '@/i18n';
import { getAccessToken } from '@/lib/authSession';

export function buildApiHeaders(init?: HeadersInit, options?: { bearer?: string | null }): Headers {
  const headers = new Headers(init);
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }
  headers.set('Accept-Language', getCurrentLocale());
  const token = options?.bearer ?? getAccessToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return headers;
}
