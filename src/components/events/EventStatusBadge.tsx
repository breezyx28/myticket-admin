import { cn } from '@/lib/utils';

const apiStatusClass: Record<string, string> = {
  draft: 'border border-ink-10 bg-ink-5 text-ink-60',
  pending_approval: 'border border-amber/40 bg-amber/15 font-bold text-ink',
  published: 'border border-mint/50 bg-mint/20 text-ink',
  active: 'border border-mint/50 bg-mint/20 text-ink',
  ended: 'border border-ink-10 bg-ink-5 text-ink-60',
  cancelled: 'border border-coral/40 bg-coral/15 font-bold text-coral',
  archived: 'border border-ink-10 bg-white text-ink-40',
};

const lifecycleClass: Record<string, string> = {
  active: 'border border-mint/50 bg-mint/20 text-ink',
  ended: 'border border-ink-10 bg-ink-5 text-ink-60',
  cancelled: 'border border-coral/40 bg-coral/15 font-bold text-coral',
  archived: 'border border-ink-10 bg-white text-ink-40',
};

function formatStatusLabel(status: string): string {
  return status.replace(/_/g, ' ');
}

export function EventStatusBadge({
  status,
  apiStatus,
}: {
  status?: string;
  apiStatus?: string;
}) {
  const key = (apiStatus ?? status ?? 'unknown').toLowerCase();
  const label = formatStatusLabel(apiStatus ?? status ?? 'unknown');
  const tone = apiStatusClass[key] ?? lifecycleClass[key] ?? 'border border-ink-10 bg-ink-5 text-ink-60';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em]',
        tone,
      )}
    >
      {label}
    </span>
  );
}
