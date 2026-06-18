import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/i18n', () => ({
  getCurrentLocale: vi.fn(() => 'en'),
  default: { language: 'en' },
}));

describe('buildApiHeaders', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('sets Accept-Language from current locale', async () => {
    const { getCurrentLocale } = await import('@/i18n');
    vi.mocked(getCurrentLocale).mockReturnValue('ar');
    const { buildApiHeaders } = await import('@/lib/apiHeaders');
    const headers = buildApiHeaders();
    expect(headers.get('Accept-Language')).toBe('ar');
    expect(headers.get('Accept')).toBe('application/json');
  });
});

describe('pickLocalizedField', () => {
  it('prefers Arabic when locale is ar', async () => {
    const { pickLocalizedField } = await import('@/lib/pickLocalizedField');
    expect(pickLocalizedField({ en: 'Music', ar: 'موسيقى' }, 'ar')).toBe('موسيقى');
  });

  it('falls back to English when Arabic missing', async () => {
    const { pickLocalizedField } = await import('@/lib/pickLocalizedField');
    expect(pickLocalizedField({ en: 'Music', ar: '' }, 'ar', 'slug')).toBe('Music');
  });

  it('prefers English when locale is en', async () => {
    const { pickLocalizedField } = await import('@/lib/pickLocalizedField');
    expect(pickLocalizedField({ en: 'Music', ar: 'موسيقى' }, 'en')).toBe('Music');
  });
});

describe('eventCategoryLabel', () => {
  it('localizes from categoryDetail', async () => {
    const { eventCategoryLabel } = await import('@/lib/pickLocalizedField');
    expect(
      eventCategoryLabel(
        { category: 'Music', categoryDetail: { nameEn: 'Music', nameAr: 'موسيقى' } },
        'ar',
      ),
    ).toBe('موسيقى');
  });

  it('falls back to category string without detail', async () => {
    const { eventCategoryLabel } = await import('@/lib/pickLocalizedField');
    expect(eventCategoryLabel({ category: 'Music' }, 'en')).toBe('Music');
  });
});
