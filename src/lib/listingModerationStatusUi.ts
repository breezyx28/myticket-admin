import type { ListingModerationRow } from '@/schemas/moderation.schema';

/** Tailwind classes for listing moderation queue status chips. */
export function listingModerationStatusBadgeClass(
  status: ListingModerationRow['status'],
): string {
  switch (status) {
    case 'queued':
      return 'bg-amber-100 text-amber-950 ring-1 ring-amber-200/80';
    case 'claimed':
      return 'bg-sky-100 text-sky-950 ring-1 ring-sky-200/80';
    case 'actioned':
      return 'bg-emerald-100 text-emerald-950 ring-1 ring-emerald-200/80';
    case 'rejected':
      return 'bg-zinc-200 text-zinc-900 ring-1 ring-zinc-300/80';
    case 'escalated':
      return 'bg-rose-100 text-rose-950 ring-1 ring-rose-200/80';
    default:
      return 'bg-ink-5 text-ink-60 ring-1 ring-ink-10';
  }
}
