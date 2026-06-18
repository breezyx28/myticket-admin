import { formatSarCompact } from '@/lib/formatSar';
import { formatDateTime, formatNumber } from '@/lib/localeFormat';
import { getCurrentLocale } from '@/i18n';
import { eventCategoryLabel } from '@/lib/pickLocalizedField';
import { cn } from '@/lib/utils';
import type { AdminEventRow } from '@/schemas/event.schema';
import { Calendar, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { EventStatusBadge } from './EventStatusBadge';

function fillPercent(sold: number, cap: number) {
  if (cap <= 0) return 0;
  return Math.min(100, Math.round((sold / cap) * 100));
}

function formatEventRange(startsAt: string, endsAt: string, locale: ReturnType<typeof getCurrentLocale>) {
  const s = new Date(startsAt);
  const e = new Date(endsAt);
  const sameDay = s.toDateString() === e.toDateString();
  const dOpts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  const tOpts: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
  if (sameDay) {
    return `${formatDateTime(s, locale, { ...dOpts, ...tOpts })} – ${formatDateTime(e, locale, tOpts)}`;
  }
  return `${formatDateTime(s, locale, dOpts)} → ${formatDateTime(e, locale, dOpts)}`;
}

function MiniStat({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border border-ink-10 bg-white/90 px-2.5 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
      <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-ink-40">{label}</p>
      <p className={cn('mt-0.5 font-mono text-[14px] font-black leading-none text-ink', valueClass)}>{value}</p>
    </div>
  );
}

export type AdminEventCardProps = {
  event: AdminEventRow;
  className?: string;
  /** Renders the card as a full-width select control */
  selectable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
  /** Footer link to event detail */
  showDetailLink?: boolean;
  /** Dim card when false (e.g. not eligible for cancellation) */
  eligible?: boolean;
  eligibilityHint?: string;
};

export function AdminEventCard({
  event,
  className,
  selectable,
  selected,
  onSelect,
  showDetailLink = true,
  eligible = true,
  eligibilityHint,
}: AdminEventCardProps) {
  const { t } = useTranslation(['operations', 'common']);
  const locale = getCurrentLocale();
  const fill = fillPercent(event.ticketsSold, event.capacity);
  const categoryLabel = eventCategoryLabel(event, locale);

  const inner = (
    <>
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-ink-5">
        <img src={event.coverImageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <EventStatusBadge status={event.status} />
          {event.featured ? (
            <span className="rounded-full border border-coral/40 bg-coral/20 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-ink">
              {t('operations:events.featuredBadge')}
            </span>
          ) : null}
          {!eligible ? (
            <span className="rounded-full border border-ink-10 bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-ink-60">
              {eligibilityHint ?? t('operations:events.card.viewOnly')}
            </span>
          ) : null}
        </div>
        <div className="absolute bottom-3 left-3 right-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/90">{categoryLabel}</p>
          <p className="mt-1 line-clamp-2 text-lg font-extrabold leading-tight text-white drop-shadow-sm">{event.title}</p>
        </div>
      </div>

      <div className={cn('space-y-3 p-4', !eligible && 'opacity-80')}>
        <div>
          <p className="text-[13px] font-bold text-ink">{event.organizerName}</p>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-ink-60">
            <span className="inline-flex items-center gap-1 font-semibold text-ink">
              <Calendar size={13} strokeWidth={2} className="text-coral" />
              {formatEventRange(event.startsAt, event.endsAt, locale)}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin size={13} strokeWidth={2} className="text-coral" />
              {event.venueName}, {event.city}
            </span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <MiniStat
            label={t('operations:events.card.ticketsSold')}
            value={formatNumber(event.ticketsSold, locale)}
          />
          <MiniStat
            label={t('operations:events.card.fillRate')}
            value={`${fill}%`}
            valueClass={fill >= 88 ? 'text-mint' : fill >= 55 ? 'text-ink' : 'text-amber'}
          />
          <MiniStat
            label={t('operations:events.card.revenue')}
            value={formatSarCompact(event.revenueSar)}
            valueClass="text-coral"
          />
          <MiniStat
            label={t('operations:events.card.avgRating')}
            value={`${event.avgRating.toFixed(1)} ★`}
            valueClass="font-black text-ink"
          />
        </div>

        <div className="flex items-center justify-between gap-3 rounded-2xl border border-ink-10 bg-gradient-to-r from-mint/15 via-white to-lemon/20 px-3 py-2.5">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-ink-40">
              {t('operations:events.card.checkInSuccess')}
            </p>
            <p className="text-[11px] font-semibold text-ink-60">{t('operations:events.card.checkInSub')}</p>
          </div>
          <p
            className={cn(
              'font-mono text-xl font-black tabular-nums',
              event.successRatePercent >= 95 ? 'text-mint' : event.successRatePercent >= 88 ? 'text-ink' : 'text-amber'
            )}
          >
            {event.status === 'cancelled' ? t('common:none') : `${event.successRatePercent}%`}
          </p>
        </div>

        {showDetailLink ? (
          <Link
            to={`/events/${event.id}`}
            className="inline-flex text-[13px] font-bold text-coral hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {t('operations:events.card.openRecord')}
          </Link>
        ) : null}
      </div>
    </>
  );

  if (selectable && onSelect) {
    return (
      <button
        type="button"
        onClick={onSelect}
        disabled={!eligible}
        className={cn(
          'w-full overflow-hidden rounded-3xl border bg-white text-left shadow-card-sm transition-all',
          selected ? 'border-coral ring-2 ring-coral/30' : 'border-ink-10 hover:border-coral/35 hover:shadow-card-md',
          !eligible && 'cursor-not-allowed opacity-70 hover:border-ink-10 hover:shadow-card-sm',
          className
        )}
      >
        {inner}
      </button>
    );
  }

  return <div className={cn('overflow-hidden rounded-3xl border border-ink-10 bg-white shadow-card-sm', className)}>{inner}</div>;
}
