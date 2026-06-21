import { suggestUniqueCategorySlug } from '@/schemas/api/adminMappers';

export function autoCategorySlugFromEnglishName(
  nameEn: string,
  existingSlugs: readonly string[],
  excludeSlug?: string,
): string {
  const pool = excludeSlug ? existingSlugs.filter((slug) => slug !== excludeSlug) : existingSlugs;
  return suggestUniqueCategorySlug(nameEn.trim() || 'category', pool);
}
