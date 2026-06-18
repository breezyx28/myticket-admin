export const LOCALE_STORAGE_KEY = 'myticket_admin_locale';
export const SUPPORTED_LOCALES = ['en', 'ar'] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: AppLocale = 'en';

export function normalizeLocale(raw: string | null | undefined): AppLocale {
  const v = (raw ?? '').trim().toLowerCase();
  if (v === 'ar' || v.startsWith('ar-')) return 'ar';
  return 'en';
}
