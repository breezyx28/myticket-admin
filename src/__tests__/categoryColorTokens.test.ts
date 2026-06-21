import { describe, expect, it } from 'vitest';
import {
  CATEGORY_COLOR_TOKENS,
  isKnownCategoryColorToken,
  resolveCategoryColorTokenHex,
} from '@/lib/categoryColorTokens';

describe('categoryColorTokens', () => {
  it('resolves known theme tokens', () => {
    expect(resolveCategoryColorTokenHex('coral')).toBe('#ff6b4a');
    expect(resolveCategoryColorTokenHex('primary')).toBe('#ff6b4a');
    expect(resolveCategoryColorTokenHex('accent')).toBe('#3355ff');
  });

  it('falls back for unknown tokens', () => {
    expect(resolveCategoryColorTokenHex('custom-brand')).toBe('#888888');
    expect(isKnownCategoryColorToken('custom-brand')).toBe(false);
  });

  it('includes API handoff semantic tokens', () => {
    const tokens = CATEGORY_COLOR_TOKENS.map((entry) => entry.token);
    expect(tokens).toContain('primary');
    expect(tokens).toContain('accent');
    expect(tokens).toContain('rose');
    expect(tokens.length).toBeGreaterThan(30);
  });
});
