import { describe, expect, it } from 'vitest';
import {
  ordersFromCategories,
  resolveCategoryDisplayOrder,
  suggestNextCategoryDisplayOrder,
} from '@/lib/categoryDisplayOrder';

describe('suggestNextCategoryDisplayOrder', () => {
  it('returns 1 when 0 is already taken', () => {
    expect(suggestNextCategoryDisplayOrder([0])).toBe(1);
  });

  it('returns 0 when only high unordered values exist', () => {
    expect(suggestNextCategoryDisplayOrder([7])).toBe(0);
  });

  it('fills the lowest gap in sparse sequences', () => {
    expect(suggestNextCategoryDisplayOrder([0, 2, 7])).toBe(1);
  });

  it('returns 3 when 0, 1, and 2 are taken', () => {
    expect(suggestNextCategoryDisplayOrder([0, 1, 2, 7])).toBe(3);
  });
});

describe('resolveCategoryDisplayOrder', () => {
  it('uses the provided value when set', () => {
    expect(resolveCategoryDisplayOrder(5, [0, 1])).toBe(5);
  });

  it('suggests the next gap when empty', () => {
    expect(resolveCategoryDisplayOrder(undefined, [0, 2, 7])).toBe(1);
  });
});

describe('ordersFromCategories', () => {
  it('excludes the row being edited', () => {
    const items = [
      { id: '1', displayOrder: 0 },
      { id: '2', displayOrder: 7 },
    ];
    expect(ordersFromCategories(items, '2')).toEqual([0]);
    expect(suggestNextCategoryDisplayOrder(ordersFromCategories(items, '2'))).toBe(1);
  });
});
