import { cn } from '@/lib/utils';
import type { TourismAdStatus } from '@/schemas/tourismAd.schema';

const styles: Record<TourismAdStatus, string> = {
  draft: 'bg-ink-5 text-ink-60 border border-ink-10',
  pending_review: 'bg-amber/15 text-amber border border-amber/40',
  published: 'bg-mint/20 text-ink border border-mint/50',
  rejected: 'bg-coral/15 text-coral border border-coral/40',
  withdrawn: 'bg-ink-5 text-ink-60 border border-ink-10',
  archived: 'bg-ink-5 text-ink-40 border border-ink-10',
};

const labels: Record<TourismAdStatus, string> = {
  draft: 'Draft',
  pending_review: 'Pending review',
  published: 'Published',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
  archived: 'Archived',
};

export function TourismAdStatusBadge({ status }: { status: TourismAdStatus }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide',
        styles[status],
      )}
    >
      {labels[status]}
    </span>
  );
}
