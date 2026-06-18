import type { AppLocale } from '@/i18n/constants';
import { getCurrentLocale } from '@/i18n';

export type LocalizedPair = {
  en?: string | null;
  ar?: string | null;
};

export function pickLocalizedField(
  pair: LocalizedPair,
  locale: AppLocale = getCurrentLocale(),
  fallback = '',
): string {
  const en = pair.en?.trim() ?? '';
  const ar = pair.ar?.trim() ?? '';
  if (locale === 'ar') {
    return ar || en || fallback;
  }
  return en || ar || fallback;
}

export type CategoryLabelSource = {
  category: string;
  categoryDetail?: { nameEn: string; nameAr: string };
};

/** Primary localized category label for list/card views. */
export function eventCategoryLabel(
  source: CategoryLabelSource,
  locale: AppLocale = getCurrentLocale(),
): string {
  if (source.categoryDetail) {
    return pickLocalizedField(
      { en: source.categoryDetail.nameEn, ar: source.categoryDetail.nameAr },
      locale,
      source.category,
    );
  }
  return source.category;
}
