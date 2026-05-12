import type { SupportThread } from '@/schemas/support.schema';

/** Tailwind classes for support case status chips (list + detail). */
export function supportStatusBadgeClass(status: SupportThread['status']): string {
  switch (status) {
    case 'open':
      return 'bg-amber-100 text-amber-950 ring-1 ring-amber-200/80';
    case 'in_progress':
      return 'bg-sky-100 text-sky-950 ring-1 ring-sky-200/80';
    case 'resolved':
      return 'bg-emerald-100 text-emerald-950 ring-1 ring-emerald-200/80';
    default:
      return 'bg-ink-5 text-ink-60 ring-1 ring-ink-10';
  }
}

export function supportPriorityBadgeClass(
  priority: NonNullable<SupportThread['priority']>,
): string {
  switch (priority) {
    case 'urgent':
      return 'bg-rose-100 text-rose-900 ring-1 ring-rose-200';
    case 'high':
      return 'bg-orange-100 text-orange-950 ring-1 ring-orange-200/80';
    case 'normal':
      return 'bg-slate-100 text-slate-800 ring-1 ring-slate-200';
    case 'low':
      return 'bg-zinc-100 text-zinc-700 ring-1 ring-zinc-200';
    default:
      return 'bg-ink-5 text-ink-60 ring-1 ring-ink-10';
  }
}
