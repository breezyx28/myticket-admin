export function normalizeListSearch(q: string): string {
  return q.trim().toLowerCase();
}

/** True when search is empty or any field contains the query (case-insensitive). */
export function rowMatchesSearch(q: string, fields: (string | number | undefined | null)[]): boolean {
  const n = normalizeListSearch(q);
  if (!n) return true;
  return fields.some((f) => String(f ?? '').toLowerCase().includes(n));
}
