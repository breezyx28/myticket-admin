import i18n from '@/i18n';

/** Translate outside React (API errors, mappers, lib helpers). */
export function tNs(ns: string, key: string, options?: Record<string, unknown>): string {
  return i18n.t(key, { ns, ...options });
}

export function tError(key: string, options?: Record<string, unknown>): string {
  return tNs('errors', key, options);
}

export function tCommon(key: string, options?: Record<string, unknown>): string {
  return tNs('common', key, options);
}

export function tFallback(key: string, options?: Record<string, unknown>): string {
  return tCommon(`fallback.${key}`, options);
}

export function tMapperListError(key: string): string {
  return tError(`mapperList.${key}`);
}

export function getDefaultAdminActionPostBody(): string {
  return tNs('insights', 'guide.minimalBody.json');
}
