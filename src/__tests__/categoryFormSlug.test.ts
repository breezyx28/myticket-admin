import { describe, expect, it } from 'vitest';
import { autoCategorySlugFromEnglishName } from '@/lib/categoryFormSlug';

describe('autoCategorySlugFromEnglishName', () => {
  it('slugifies English names and avoids collisions', () => {
    expect(autoCategorySlugFromEnglishName('Music', [])).toBe('music');
    expect(autoCategorySlugFromEnglishName('Music', ['music'])).toBe('music-2');
  });

  it('can exclude the current row slug when editing', () => {
    expect(autoCategorySlugFromEnglishName('Music', ['music', 'sports'], 'music')).toBe('music');
  });
});
