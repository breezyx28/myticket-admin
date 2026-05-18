import { adminReadsSourceIsApi } from '@/config/env';

const warned = new Set<string>();

/** When true, reads use in-memory mock state (set `VITE_ADMIN_READS_SOURCE=mock`). */
export function shouldUseMockReads(): boolean {
  return !adminReadsSourceIsApi();
}

export function warnReadFallback(endpointName: string) {
  if (warned.has(endpointName)) return;
  warned.add(endpointName);
  console.warn(
    `[myticket-admin] Read "${endpointName}" falls back to mock data (no GET in Postman export or missing path). See docs/myticket_admin_api_collection_gaps.md.`
  );
}
