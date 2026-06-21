import { describe, expect, it } from 'vitest';
import {
  buildCategoryNameSuggestions,
  filterCategoryNameSuggestions,
  lookupCategoryNameCounterpart,
  lookupNameCounterpart,
  TALENT_BADGE_NAME_PAIRS,
  VENDOR_SERVICE_NAME_PAIRS,
  EVENT_CATEGORY_NAME_EN_SUGGESTIONS,
} from '@/lib/categoryNameSuggestions';

describe('categoryNameSuggestions', () => {
  it('merges presets with existing names without duplicates', () => {
    const merged = buildCategoryNameSuggestions(['Music', 'Custom'], EVENT_CATEGORY_NAME_EN_SUGGESTIONS);
    expect(merged).toContain('Music');
    expect(merged).toContain('Concerts');
    expect(merged).toContain('Custom');
    expect(merged.filter((name) => name === 'Music')).toHaveLength(1);
  });

  it('filters suggestions while typing', () => {
    const all = buildCategoryNameSuggestions([], EVENT_CATEGORY_NAME_EN_SUGGESTIONS);
    const matches = filterCategoryNameSuggestions('con', all);
    expect(matches).toContain('Concerts');
    expect(matches).toContain('Conferences');
    expect(filterCategoryNameSuggestions('Concerts', all)).toEqual([]);
  });

  it('maps preset English names to Arabic counterparts', () => {
    expect(lookupCategoryNameCounterpart('Music', 'en')).toBe('موسيقى');
    expect(lookupCategoryNameCounterpart('موسيقى', 'ar')).toBe('Music');
  });

  it('maps talent badge presets both ways', () => {
    expect(lookupNameCounterpart('Singer', 'en', TALENT_BADGE_NAME_PAIRS)).toBe('مغني');
    expect(lookupNameCounterpart('مغني', 'ar', TALENT_BADGE_NAME_PAIRS)).toBe('Singer');
  });

  it('maps vendor service presets both ways', () => {
    expect(lookupNameCounterpart('Catering', 'en', VENDOR_SERVICE_NAME_PAIRS)).toBe('تموين');
    expect(lookupNameCounterpart('تموين', 'ar', VENDOR_SERVICE_NAME_PAIRS)).toBe('Catering');
  });

  it('maps existing category rows when not in presets', () => {
    const existing = [{ nameEn: 'Custom Expo', nameAr: 'معرض مخصص' }];
    expect(lookupCategoryNameCounterpart('Custom Expo', 'en', existing)).toBe('معرض مخصص');
    expect(lookupCategoryNameCounterpart('معرض مخصص', 'ar', existing)).toBe('Custom Expo');
  });

  it('includes at least 20 talent and vendor preset pairs', () => {
    expect(TALENT_BADGE_NAME_PAIRS.length).toBeGreaterThanOrEqual(20);
    expect(VENDOR_SERVICE_NAME_PAIRS.length).toBeGreaterThanOrEqual(20);
  });
});
