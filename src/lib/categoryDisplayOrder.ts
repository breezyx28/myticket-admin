type OrderedCategory = {
  id: string;
  displayOrder?: number;
};

/** Smallest unused non-negative integer in the sequence starting at 0. */
export function suggestNextCategoryDisplayOrder(existingOrders: readonly number[]): number {
  const taken = new Set(
    existingOrders.filter((order) => Number.isInteger(order) && order >= 0 && order <= 65535),
  );
  let candidate = 0;
  while (taken.has(candidate) && candidate < 65535) {
    candidate += 1;
  }
  return candidate;
}

export function ordersFromCategories(
  items: readonly OrderedCategory[],
  excludeId?: string,
): number[] {
  return items
    .filter((item) => item.id !== excludeId)
    .map((item) => item.displayOrder)
    .filter((order): order is number => typeof order === 'number' && Number.isFinite(order));
}

export function resolveCategoryDisplayOrder(
  value: number | undefined,
  existingOrders: readonly number[],
): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.min(65535, Math.max(0, Math.trunc(value)));
  }
  return suggestNextCategoryDisplayOrder(existingOrders);
}
