import type { AppLocale } from '@/i18n/constants';
import { getCurrentLocale } from '@/i18n';
import { asObject, pickNum, pickStr } from '@/lib/apiJson';
import { pickLocalizedField } from '@/lib/pickLocalizedField';
import type { LocalizedGeoName } from '@/schemas/localizedGeo.schema';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Maps API geo objects or plain strings into bilingual name fields. */
export function mapLocalizedGeoNameFromApi(raw: unknown): LocalizedGeoName | undefined {
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) return undefined;
    return { nameEn: trimmed, nameAr: trimmed };
  }
  if (!isRecord(raw)) return undefined;

  const o = asObject(raw);
  const nameEn = pickStr(o, 'name_en', 'nameEn', 'name', 'title', 'label')?.trim() ?? '';
  const nameAr = pickStr(o, 'name_ar', 'nameAr')?.trim() ?? '';
  if (!nameEn && !nameAr) return undefined;

  const idNum = pickNum(o, 'id');
  const code = pickStr(o, 'code');

  return {
    ...(idNum !== undefined ? { id: Math.trunc(idNum) } : {}),
    ...(code ? { code } : {}),
    nameEn: nameEn || nameAr,
    nameAr: nameAr || nameEn,
  };
}

export function localizedGeoLabel(
  detail: LocalizedGeoName | undefined,
  locale: AppLocale = getCurrentLocale(),
  fallback = '',
): string {
  if (!detail) return fallback;
  return pickLocalizedField({ en: detail.nameEn, ar: detail.nameAr }, locale, fallback);
}

export function formatGeoLocationLine(
  parts: {
    city?: string;
    cityDetail?: LocalizedGeoName;
    region?: string;
    regionDetail?: LocalizedGeoName;
    country?: string;
  },
  locale: AppLocale = getCurrentLocale(),
): string {
  const cityLabel = localizedGeoLabel(parts.cityDetail, locale, parts.city ?? '');
  const regionLabel = localizedGeoLabel(
    parts.regionDetail,
    locale,
    parts.region ?? parts.country ?? '',
  );
  return [cityLabel, regionLabel].filter(Boolean).join(', ');
}

export function geoSearchTokens(detail?: LocalizedGeoName, fallback = ''): string[] {
  const tokens = [fallback, detail?.nameEn, detail?.nameAr].filter(
    (value): value is string => Boolean(value?.trim()),
  );
  return [...new Set(tokens)];
}
