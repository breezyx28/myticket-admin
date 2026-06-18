import type { AppLocale } from '@/i18n/constants';
import { getCurrentLocale } from '@/i18n';

/**
 * Compact SAR display for UI: `900 SAR`, `1K SAR`, `1.2K SAR`, `428K SAR`, `1M SAR`, `12.4M SAR`.
 */
export function formatSarCompact(sar: number, locale: AppLocale = getCurrentLocale()): string {
  const intl = locale === 'ar' ? 'ar-SA' : 'en-US';
  if (!Number.isFinite(sar) || sar < 0) return '—';
  const n = Math.round(sar);
  if (n === 0) return locale === 'ar' ? '0 ر.س' : '0 SAR';
  if (n < 1000) return locale === 'ar' ? `${n.toLocaleString(intl)} ر.س` : `${n.toLocaleString(intl)} SAR`;

  if (n < 1_000_000) {
    const k = n / 1000;
    const rounded = Math.round(k * 10) / 10;
    const str = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1).replace(/\.0$/, '');
    return locale === 'ar' ? `${str} ألف ر.س` : `${str}K SAR`;
  }

  const m = n / 1_000_000;
  const rounded = Math.round(m * 10) / 10;
  const str = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1).replace(/\.0$/, '');
  return locale === 'ar' ? `${str} مليون ر.س` : `${str}M SAR`;
}

/** Shorter tick label for charts (drops trailing currency). */
export function formatSarAxis(sar: number, locale?: AppLocale): string {
  const compact = formatSarCompact(sar, locale);
  return compact.replace(/\s*(SAR|ر\.س)$/, '').replace(/\s+(ألف|مليون)\s+ر\.س$/, '');
}
