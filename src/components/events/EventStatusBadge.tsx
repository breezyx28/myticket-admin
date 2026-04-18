import { cn } from '@/lib/utils';
import type { AdminEventRow } from '@/schemas/event.schema';

const statusClass: Record<AdminEventRow['status'], string> = {
  active: 'border border-mint/50 bg-mint/20 text-ink',
  ended: 'border border-ink-10 bg-ink-5 text-ink-60',
  cancelled: 'border border-coral/40 bg-coral/15 font-bold text-coral',
  archived: 'border border-ink-10 bg-white text-ink-40',
};

export function EventStatusBadge({ status }: { status: AdminEventRow['status'] }) {
  const label = status.replace('_', ' ');
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em]',
        statusClass[status]
      )}
    >
      {label}
    </span>
  );
}
