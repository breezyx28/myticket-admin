export type CategoryNamePair = { en: string; ar: string };

type LocalizedCategoryName = { nameEn: string; nameAr: string };

/** Bilingual preset pairs for event category name suggestions. */
export const EVENT_CATEGORY_NAME_PAIRS: readonly CategoryNamePair[] = [
  { en: 'Arts & Culture', ar: 'فنون وثقافة' },
  { en: 'Business', ar: 'أعمال' },
  { en: 'Charity', ar: 'خيرية' },
  { en: 'Comedy', ar: 'كوميديا' },
  { en: 'Community', ar: 'مجتمع' },
  { en: 'Competitions', ar: 'مسابقات' },
  { en: 'Concerts', ar: 'حفلات' },
  { en: 'Conferences', ar: 'مؤتمرات' },
  { en: 'Education', ar: 'تعليم' },
  { en: 'Exhibitions', ar: 'معارض' },
  { en: 'Family', ar: 'عائلي' },
  { en: 'Fashion', ar: 'موضة' },
  { en: 'Festivals', ar: 'مهرجانات' },
  { en: 'Film & Cinema', ar: 'سينما' },
  { en: 'Food & Drink', ar: 'طعام وشراب' },
  { en: 'Gaming', ar: 'ألعاب' },
  { en: 'Health & Wellness', ar: 'صحة وعافية' },
  { en: 'Kids', ar: 'أطفال' },
  { en: 'Literature', ar: 'أدب' },
  { en: 'Movies', ar: 'أفلام' },
  { en: 'Music', ar: 'موسيقى' },
  { en: 'Nightlife', ar: 'حياة ليلية' },
  { en: 'Outdoor', ar: 'فعاليات خارجية' },
  { en: 'Performing Arts', ar: 'فنون أدائية' },
  { en: 'Religion', ar: 'دين' },
  { en: 'Sports', ar: 'رياضة' },
  { en: 'Technology', ar: 'تكنولوجيا' },
  { en: 'Theatre', ar: 'مسرح' },
  { en: 'Travel', ar: 'سفر' },
  { en: 'Virtual Events', ar: 'فعاليات افتراضية' },
  { en: 'Workshops', ar: 'ورش عمل' },
];

/** Bilingual preset pairs for talent badge categories. */
export const TALENT_BADGE_NAME_PAIRS: readonly CategoryNamePair[] = [
  { en: 'Singer', ar: 'مغني' },
  { en: 'DJ', ar: 'دي جي' },
  { en: 'Musician', ar: 'موسيقي' },
  { en: 'Band', ar: 'فرقة موسيقية' },
  { en: 'Vocalist', ar: 'مطرب' },
  { en: 'Rapper', ar: 'رابر' },
  { en: 'Poet', ar: 'شاعر' },
  { en: 'Magician', ar: 'ساحر' },
  { en: 'Dancer', ar: 'راقص' },
  { en: 'Choreographer', ar: 'مصمم رقص' },
  { en: 'Comedian', ar: 'كوميدي' },
  { en: 'Actor', ar: 'ممثل' },
  { en: 'Host', ar: 'مقدم' },
  { en: 'MC', ar: 'محكم' },
  { en: 'Street performer', ar: 'فنان شارع' },
  { en: 'Influencer', ar: 'مؤثر' },
  { en: 'Photographer', ar: 'مصور' },
  { en: 'Videographer', ar: 'مصور فيديو' },
  { en: 'Artist', ar: 'فنان' },
  { en: 'Painter', ar: 'رسام' },
  { en: 'Calligrapher', ar: 'خطاط' },
  { en: 'Fashion model', ar: 'عارض أزياء' },
  { en: 'Makeup artist', ar: 'فنان مكياج' },
  { en: 'Stylist', ar: 'مصمم أزياء' },
  { en: 'Fitness trainer', ar: 'مدرب لياقة' },
  { en: 'Yoga instructor', ar: 'مدرب يوغا' },
  { en: 'Speaker', ar: 'متحدث' },
  { en: 'Motivational speaker', ar: 'محفز' },
  { en: 'Chef demo', ar: 'عرض طبخ' },
  { en: 'Kids entertainer', ar: 'مُسلٍّ للأطفال' },
  { en: 'Illusionist', ar: 'فنان الوهم' },
];

/** Bilingual preset pairs for vendor service categories. */
export const VENDOR_SERVICE_NAME_PAIRS: readonly CategoryNamePair[] = [
  { en: 'Catering', ar: 'تموين' },
  { en: 'AV & production', ar: 'صوت وإنتاج' },
  { en: 'Mobile coffee bar', ar: 'بار قهوة متنقل' },
  { en: 'Security', ar: 'أمن' },
  { en: 'Cleaning', ar: 'تنظيف' },
  { en: 'Ticketing', ar: 'تذاكر' },
  { en: 'Ushering', ar: 'مرافقة' },
  { en: 'Photography', ar: 'تصوير' },
  { en: 'Videography', ar: 'تصوير فيديو' },
  { en: 'Live streaming', ar: 'بث مباشر' },
  { en: 'Stage design', ar: 'تصميم مسرح' },
  { en: 'Lighting', ar: 'إضاءة' },
  { en: 'Sound engineering', ar: 'هندسة صوت' },
  { en: 'Decoration', ar: 'ديكور' },
  { en: 'Floral design', ar: 'تنسيق زهور' },
  { en: 'Furniture rental', ar: 'تأجير أثاث' },
  { en: 'Tent rental', ar: 'تأجير خيام' },
  { en: 'Power supply', ar: 'مولدات كهرباء' },
  { en: 'Wi-Fi & IT', ar: 'شبكات وتقنية' },
  { en: 'Registration desk', ar: 'مكتب تسجيل' },
  { en: 'Valet parking', ar: 'صف سيارات' },
  { en: 'Transport & logistics', ar: 'نقل ولوجستيات' },
  { en: 'Translation', ar: 'ترجمة' },
  { en: 'Signage', ar: 'لافتات' },
  { en: 'Merchandise', ar: 'بضائع ترويجية' },
  { en: 'Food trucks', ar: 'شاحنات طعام' },
  { en: 'Bar service', ar: 'خدمة بار' },
  { en: 'First aid', ar: 'إسعافات أولية' },
  { en: 'Waste management', ar: 'إدارة نفايات' },
  { en: 'Insurance', ar: 'تأمين' },
  { en: 'Event staffing', ar: 'طاقم فعاليات' },
];

export const EVENT_CATEGORY_NAME_EN_SUGGESTIONS = EVENT_CATEGORY_NAME_PAIRS.map((pair) => pair.en);
export const EVENT_CATEGORY_NAME_AR_SUGGESTIONS = EVENT_CATEGORY_NAME_PAIRS.map((pair) => pair.ar);
export const TALENT_BADGE_NAME_EN_SUGGESTIONS = TALENT_BADGE_NAME_PAIRS.map((pair) => pair.en);
export const TALENT_BADGE_NAME_AR_SUGGESTIONS = TALENT_BADGE_NAME_PAIRS.map((pair) => pair.ar);
export const VENDOR_SERVICE_NAME_EN_SUGGESTIONS = VENDOR_SERVICE_NAME_PAIRS.map((pair) => pair.en);
export const VENDOR_SERVICE_NAME_AR_SUGGESTIONS = VENDOR_SERVICE_NAME_PAIRS.map((pair) => pair.ar);

export function lookupNameCounterpart(
  name: string,
  from: 'en' | 'ar',
  pairs: readonly CategoryNamePair[],
  existing: LocalizedCategoryName[] = [],
): string | null {
  const trimmed = name.trim();
  if (!trimmed) return null;

  const enToAr = new Map(pairs.map((pair) => [pair.en.toLowerCase(), pair.ar] as const));
  const arToEn = new Map(pairs.map((pair) => [pair.ar, pair.en] as const));

  if (from === 'en') {
    const preset = enToAr.get(trimmed.toLowerCase());
    if (preset) return preset;
    const row = existing.find((c) => c.nameEn.trim().toLowerCase() === trimmed.toLowerCase());
    return row?.nameAr?.trim() || null;
  }

  const preset = arToEn.get(trimmed);
  if (preset) return preset;
  const row = existing.find((c) => c.nameAr.trim() === trimmed);
  return row?.nameEn?.trim() || null;
}

/** @deprecated Use `lookupNameCounterpart` with `EVENT_CATEGORY_NAME_PAIRS`. */
export function lookupCategoryNameCounterpart(
  name: string,
  from: 'en' | 'ar',
  existing: LocalizedCategoryName[] = [],
): string | null {
  return lookupNameCounterpart(name, from, EVENT_CATEGORY_NAME_PAIRS, existing);
}

export function buildCategoryNameSuggestions(existing: string[], presets: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];

  for (const name of [...presets, ...existing]) {
    const trimmed = name.trim();
    if (!trimmed || seen.has(trimmed.toLowerCase())) continue;
    seen.add(trimmed.toLowerCase());
    out.push(trimmed);
  }

  return out.sort((a, b) => a.localeCompare(b));
}

export function filterCategoryNameSuggestions(query: string, suggestions: string[], limit = 8): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return suggestions.slice(0, limit);

  return suggestions
    .filter((name) => name.toLowerCase().includes(q) && name.toLowerCase() !== q)
    .slice(0, limit);
}

export function namePairsForBadgeKind(kind: 'talent' | 'vendor'): readonly CategoryNamePair[] {
  return kind === 'talent' ? TALENT_BADGE_NAME_PAIRS : VENDOR_SERVICE_NAME_PAIRS;
}

export function nameEnPresetsForBadgeKind(kind: 'talent' | 'vendor'): readonly string[] {
  return kind === 'talent' ? TALENT_BADGE_NAME_EN_SUGGESTIONS : VENDOR_SERVICE_NAME_EN_SUGGESTIONS;
}

export function nameArPresetsForBadgeKind(kind: 'talent' | 'vendor'): readonly string[] {
  return kind === 'talent' ? TALENT_BADGE_NAME_AR_SUGGESTIONS : VENDOR_SERVICE_NAME_AR_SUGGESTIONS;
}
