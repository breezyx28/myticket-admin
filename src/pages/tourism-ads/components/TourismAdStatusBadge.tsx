import { cn } from '@/lib/utils';
import type { TourismAdStatus } from '@/schemas/tourismAd.schema';
import { useTranslation } from 'react-i18next';

const styles: Record<TourismAdStatus, string> = {
  draft: 'bg-ink-5 text-ink-60 border border-ink-10',
  pending_review: 'bg-amber/15 text-amber border border-amber/40',
  published: 'bg-mint/20 text-ink border border-mint/50',
  rejected: 'bg-coral/15 text-coral border border-coral/40',
  withdrawn: 'bg-ink-5 text-ink-60 border border-ink-10',
  archived: 'bg-ink-5 text-ink-40 border border-ink-10',
};

export function TourismAdStatusBadge({ status }: { status: TourismAdStatus }) {
  const { t } = useTranslation('operations');

  return (
    <span
      className={cn(
        'inline-flex rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide',
        styles[status],
      )}
    >
      {t(`tourismAds.status.${status}`)}
    </span>
  );
}
