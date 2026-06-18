import type { AppLocale } from '@/i18n/constants';
import { getCurrentLocale } from '@/i18n';

function intlLocale(locale: AppLocale): string {
  return locale === 'ar' ? 'ar-SA' : 'en-US';
}

export function formatDateTime(
  value: string | number | Date,
  locale: AppLocale = getCurrentLocale(),
  options?: Intl.DateTimeFormatOptions,
): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(intlLocale(locale), options);
}

export function formatDate(
  value: string | number | Date,
  locale: AppLocale = getCurrentLocale(),
  options?: Intl.DateTimeFormatOptions,
): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(intlLocale(locale), options);
}

export function formatNumber(
  value: number,
  locale: AppLocale = getCurrentLocale(),
  options?: Intl.NumberFormatOptions,
): string {
  if (!Number.isFinite(value)) return '—';
  return value.toLocaleString(intlLocale(locale), options);
}
