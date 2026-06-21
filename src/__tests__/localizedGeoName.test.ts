import { describe, expect, it } from 'vitest';
import {
  formatGeoLocationLine,
  geoSearchTokens,
  localizedGeoLabel,
  mapLocalizedGeoNameFromApi,
} from '@/lib/localizedGeoName';

describe('mapLocalizedGeoNameFromApi', () => {
  it('maps bilingual geo objects', () => {
    expect(
      mapLocalizedGeoNameFromApi({
        id: 1,
        name: 'Riyadh',
        name_en: 'Riyadh',
        name_ar: 'الرياض',
      }),
    ).toEqual({
      id: 1,
      nameEn: 'Riyadh',
      nameAr: 'الرياض',
    });
  });
});

describe('localizedGeoLabel', () => {
  it('returns Arabic in ar locale', () => {
    expect(
      localizedGeoLabel({ nameEn: 'Riyadh', nameAr: 'الرياض' }, 'ar'),
    ).toBe('الرياض');
  });

  it('returns English in en locale', () => {
    expect(
      localizedGeoLabel({ nameEn: 'Riyadh', nameAr: 'الرياض' }, 'en'),
    ).toBe('Riyadh');
  });
});

describe('formatGeoLocationLine', () => {
  it('joins localized city and region labels', () => {
    expect(
      formatGeoLocationLine(
        {
          cityDetail: { nameEn: 'Dammam', nameAr: 'الدمام' },
          regionDetail: { nameEn: 'Eastern Province', nameAr: 'المنطقة الشرقية' },
        },
        'en',
      ),
    ).toBe('Dammam, Eastern Province');
  });
});

describe('geoSearchTokens', () => {
  it('includes both language variants', () => {
    expect(
      geoSearchTokens({ nameEn: 'Riyadh', nameAr: 'الرياض' }, 'Riyadh'),
    ).toEqual(['Riyadh', 'الرياض']);
  });
});
