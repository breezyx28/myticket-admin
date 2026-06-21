import { AdminEventCard } from '@/components/events/AdminEventCard';
import { EventStatusBadge } from '@/components/events/EventStatusBadge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getApiBaseUrl } from '@/config/env';
import { getCurrentLocale } from '@/i18n';
import { formatSarCompact } from '@/lib/formatSar';
import { formatDateTime, formatNumber } from '@/lib/localeFormat';
import { localizedGeoLabel } from '@/lib/localizedGeoName';
import { notifyError, notifySuccess } from '@/lib/notify';
import { pickLocalizedField, eventCategoryLabel } from '@/lib/pickLocalizedField';
import { cn } from '@/lib/utils';
import type { AdminEventDetail, AdminEventRow } from '@/schemas/event.schema';
import { rejectEventSchema, type RejectEventInput } from '@/schemas/event.schema';
import {
  useApproveEventMutation,
  useFeatureEventMutation,
  useGetEventQuery,
  useRejectEventMutation,
  useUnfeatureEventMutation,
} from '@/services/adminApi';
import { i18nZodResolver } from '@/lib/i18nZodResolver';
import { Building2, Clock, Sparkles, Tag, Ticket, UserCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';

function resolveMediaUrl(url: string | undefined | null): string | undefined {
  if (!url?.trim()) return undefined;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const base = getApiBaseUrl();
  return `${base}/${url.replace(/^\/+/, '')}`;
}

function formatWhen(iso: string, locale: ReturnType<typeof getCurrentLocale>, timeZone?: string) {
  return formatDateTime(iso, locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
    ...(timeZone ? { timeZone } : {}),
  });
}

function fillPercent(sold: number, capacity: number | null) {
  if (capacity === null || capacity <= 0) return null;
  return Math.min(100, Math.round((sold / capacity) * 100));
}

function DetailField({
  label,
  value,
  mono,
  className,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('min-w-0', className)}>
      <dt className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-40">{label}</dt>
      <dd
        className={cn(
          'mt-1 text-[14px] font-semibold leading-snug text-ink',
          mono && 'font-mono text-[13px] font-medium',
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function toCardRow(e: AdminEventDetail): AdminEventRow {
  return {
    id: e.id,
    title: e.title,
    organizerName: e.organizerName,
    status: e.status,
    startsAt: e.startsAt,
    endsAt: e.endsAt,
    ticketsSold: e.ticketsSold,
    capacity: e.capacity ?? Math.max(e.ticketsSold, 1),
    revenueSar: e.revenueSar,
    avgRating: e.avgRating,
    successRatePercent: e.successRatePercent,
    category: e.category,
    venueName: e.venueName || '—',
    city: e.city || '—',
    coverImageUrl: e.coverImageUrl,
    featured: e.featured,
    ...(e.categoryDetail ? { categoryDetail: e.categoryDetail } : {}),
    ...(e.cityDetail ? { cityDetail: e.cityDetail } : {}),
  };
}

export function EventDetailPage() {
  const { t } = useTranslation(['operations', 'common']);
  const locale = getCurrentLocale();
  const { id = '' } = useParams();
  const q = useGetEventQuery(id, { skip: !id });
  const [approve, approveState] = useApproveEventMutation();
  const [reject, rejectState] = useRejectEventMutation();
  const [feature, featureState] = useFeatureEventMutation();
  const [unfeature, unfeatureState] = useUnfeatureEventMutation();

  const rejectForm = useForm<RejectEventInput>({
    resolver: i18nZodResolver(rejectEventSchema),
    defaultValues: { reason: '' },
  });

  if (q.isLoading) {
    return (
      <div className="space-y-6" aria-busy="true">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-ink-5" />
        <div className="h-64 animate-pulse rounded-3xl bg-ink-5" />
        <div className="grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-3xl bg-ink-5" />
          ))}
        </div>
      </div>
    );
  }

  if (q.isError || !q.data) {
    return (
      <div className="rounded-3xl border border-ink-10 bg-white p-8">
        <p className="font-semibold text-ink">{t('operations:events.detail.notFound')}</p>
        <Link to="/events" className="mt-4 inline-block text-[13px] font-bold text-coral hover:underline">
          {t('operations:events.detail.backToEvents')}
        </Link>
      </div>
    );
  }

  const e = q.data;
  const fill = fillPercent(e.ticketsSold, e.capacity);
  const canApprove = e.apiStatus === 'pending_approval' || e.apiStatus === 'draft';
  const canReject = e.apiStatus === 'pending_approval' || e.apiStatus === 'draft';
  const isPublished = e.apiStatus === 'published';
  const categoryLabel = eventCategoryLabel(
    {
      category: e.category,
      categoryDetail: e.categoryDetail,
    },
    locale,
  );
  const yesNo = (v: boolean) => (v ? t('common:yes') : t('common:no'));

  return (
    <div className="space-y-8 pb-12">
      <nav aria-label={t('common:breadcrumb')}>
        <Link to="/events" className="text-[13px] font-bold text-coral hover:underline">
          {t('operations:events.detail.breadcrumb')}
        </Link>
      </nav>

      <div className="overflow-hidden rounded-[28px] border border-ink-10 bg-white shadow-card-md">
        <div className="relative min-h-[220px] bg-ink-5 lg:min-h-[280px]">
          <img src={e.coverImageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/40 to-ink/10" />
          <div className="relative flex min-h-[220px] flex-col justify-end gap-4 p-6 lg:min-h-[280px] lg:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/15 px-2.5 py-1 font-mono text-[11px] font-bold text-white backdrop-blur-sm">
                {e.code}
              </span>
              <EventStatusBadge status={e.status} apiStatus={e.apiStatus} />
              {e.featured ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-lemon px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-ink">
                  <Sparkles size={12} strokeWidth={2} aria-hidden />
                  {t('operations:events.featuredBadge')}
                </span>
              ) : null}
            </div>
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-white/75">{categoryLabel}</p>
              <h1 className="mt-1 text-3xl font-extrabold leading-tight tracking-tight text-white md:text-4xl">
                {e.title}
              </h1>
              <p className="mt-2 text-[14px] font-semibold text-white/90">
                {e.organizer?.displayName ?? e.organizerName}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-ink-10 bg-surface-tint/50 px-4 py-4 lg:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <p className="text-[13px] font-medium text-ink-60">{t('operations:events.detail.reviewHint')}</p>
            <div className="flex flex-wrap gap-2" role="group" aria-label={t('operations:events.detail.actionsLabel')}>
              <Button
                type="button"
                variant="dark"
                size="sm"
                disabled={!canApprove || approveState.isLoading}
                loading={approveState.isLoading}
                onClick={async () => {
                  try {
                    await approve(e.id).unwrap();
                    notifySuccess(t('operations:events.detail.notifyApproved'));
                  } catch {
                    notifyError(t('operations:events.detail.notifyApproveFailed'));
                  }
                }}
              >
                {t('operations:events.detail.approvePublish')}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={e.featured || e.apiStatus === 'cancelled' || featureState.isLoading}
                loading={featureState.isLoading}
                onClick={async () => {
                  try {
                    await feature(e.id).unwrap();
                    notifySuccess(t('operations:events.detail.notifyFeatured'));
                  } catch {
                    notifyError(t('operations:events.detail.notifyFeatureFailed'));
                  }
                }}
              >
                {t('operations:events.detail.feature')}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!e.featured || unfeatureState.isLoading}
                loading={unfeatureState.isLoading}
                onClick={async () => {
                  try {
                    await unfeature(e.id).unwrap();
                    notifySuccess(t('operations:events.detail.notifyUnfeatured'));
                  } catch {
                    notifyError(t('operations:events.detail.notifyUnfeatureFailed'));
                  }
                }}
              >
                {t('operations:events.detail.unfeature')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: t('operations:events.detail.kpiTicketsSold'),
            value: formatNumber(e.ticketsSold, locale),
            sub:
              e.capacity !== null
                ? t('operations:events.detail.kpiCapacityOf', { count: formatNumber(e.capacity, locale) })
                : t('operations:events.detail.kpiCapacityNotSet'),
            icon: Ticket,
          },
          {
            label: t('operations:events.detail.kpiGrossRevenue'),
            value: formatSarCompact(e.revenueSar),
            sub:
              fill !== null
                ? t('operations:events.detail.kpiFillRate', { percent: fill })
                : t('operations:events.detail.kpiFillRateNa'),
            icon: Tag,
          },
          {
            label: t('operations:events.detail.kpiRating'),
            value: e.ratingCount ? `${e.avgRating.toFixed(1)} ★` : t('common:none'),
            sub: e.ratingCount
              ? t('operations:events.detail.kpiReviews', { count: formatNumber(e.ratingCount, locale) })
              : t('operations:events.detail.kpiNoRatings'),
            icon: Sparkles,
          },
          {
            label: t('operations:events.detail.kpiAttending'),
            value: formatNumber(e.attendingCount ?? 0, locale),
            sub: e.waitlistCount
              ? t('operations:events.detail.kpiWaitlist', { count: formatNumber(e.waitlistCount, locale) })
              : t('operations:events.detail.kpiWaitlistEmpty'),
            icon: UserCircle,
          },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-ink-10 bg-white p-4 shadow-card-sm">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-ink-40">{stat.label}</p>
              <stat.icon size={16} strokeWidth={2} className="shrink-0 text-coral" aria-hidden />
            </div>
            <p className="mt-2 font-mono text-2xl font-black text-ink">{stat.value}</p>
            <p className="mt-1 text-[12px] font-medium text-ink-60">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          {e.rejectionReason ? (
            <div className="rounded-2xl border border-coral/30 bg-coral/10 px-4 py-3" role="alert">
              <p className="text-[12px] font-bold uppercase tracking-wide text-coral">
                {t('operations:events.detail.rejectionReason')}
              </p>
              <p className="mt-1 text-[14px] text-ink">{e.rejectionReason}</p>
            </div>
          ) : null}

          <Card className="rounded-3xl border-ink-10 shadow-card-sm">
            <CardHeader>
              <CardTitle className="text-lg font-extrabold">{t('operations:events.detail.descriptionTitle')}</CardTitle>
              <CardDescription>{t('operations:events.detail.descriptionSub')}</CardDescription>
            </CardHeader>
            <CardContent>
              {e.description ? (
                <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-ink-60">{e.description}</p>
              ) : (
                <p className="text-[14px] text-ink-60">{t('operations:events.detail.noDescription')}</p>
              )}
              {e.excerpt ? (
                <p className="mt-4 rounded-xl bg-ink-5 px-4 py-3 text-[13px] text-ink-60">
                  <span className="font-bold text-ink">{t('operations:events.detail.excerpt')}</span> {e.excerpt}
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-ink-10 shadow-card-sm">
            <CardHeader>
              <CardTitle className="text-lg font-extrabold">{t('operations:events.detail.scheduleTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-6 sm:grid-cols-2">
                <DetailField
                  label={t('operations:events.detail.starts')}
                  value={
                    <>
                      {formatWhen(e.startsAt, locale, e.timezone)}
                      {e.timezone ? (
                        <span className="mt-0.5 block text-[12px] font-medium text-ink-40">{e.timezone}</span>
                      ) : null}
                    </>
                  }
                />
                <DetailField label={t('operations:events.detail.ends')} value={formatWhen(e.endsAt, locale, e.timezone)} />
                <DetailField
                  label={t('operations:events.detail.city')}
                  value={localizedGeoLabel(e.cityDetail, locale, e.city || t('common:none'))}
                  className="sm:col-span-2"
                />
                <DetailField
                  label={t('operations:events.detail.venue')}
                  value={e.venueName || t('operations:events.detail.venueNotSpecified')}
                />
                <DetailField label={t('operations:events.detail.address')} value={e.venueAddress || t('common:none')} />
              </dl>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-ink-10 shadow-card-sm">
            <CardHeader>
              <CardTitle className="text-lg font-extrabold">{t('operations:events.detail.ticketingTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <DetailField label={t('operations:events.detail.layout')} value={e.layoutType ?? t('common:none')} mono />
                <DetailField
                  label={t('operations:events.detail.entryMode')}
                  value={e.entryMode?.replace(/_/g, ' ') ?? t('common:none')}
                />
                <DetailField
                  label={t('operations:events.detail.priceRange')}
                  value={
                    e.priceMin != null || e.priceMax != null
                      ? `${e.priceMin ?? t('common:none')} – ${e.priceMax ?? t('common:none')}`
                      : t('common:none')
                  }
                  mono
                />
                <DetailField label={t('operations:events.detail.multiDay')} value={yesNo(!!e.isMultiDay)} />
                <DetailField label={t('operations:events.detail.showTalents')} value={yesNo(!!e.showTalents)} />
                <DetailField label={t('operations:events.detail.showVendors')} value={yesNo(!!e.showVendors)} />
              </dl>
            </CardContent>
          </Card>

          {canReject ? (
            <Card className="rounded-3xl border-coral/25 shadow-card-sm">
              <CardHeader>
                <CardTitle className="text-lg font-extrabold text-coral">{t('operations:events.detail.rejectTitle')}</CardTitle>
                <CardDescription>{t('operations:events.detail.rejectDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  className="space-y-4"
                  onSubmit={rejectForm.handleSubmit(async (values) => {
                    try {
                      await reject({ id: e.id, body: values }).unwrap();
                      notifySuccess(t('operations:events.detail.notifyRejected'));
                      rejectForm.reset();
                    } catch {
                      notifyError(t('operations:events.detail.notifyRejectFailed'));
                    }
                  })}
                >
                  <label className="block">
                    <span className="text-[12px] font-semibold text-ink-60">{t('operations:events.detail.reasonLabel')}</span>
                    <textarea
                      className="mt-1.5 min-h-[96px] w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px] outline-none focus:border-coral focus:ring-2 focus:ring-coral/30"
                      placeholder={t('operations:events.detail.reasonPlaceholder')}
                      {...rejectForm.register('reason')}
                    />
                  </label>
                  {rejectForm.formState.errors.reason ? (
                    <p className="text-[12px] font-medium text-coral">{rejectForm.formState.errors.reason.message}</p>
                  ) : null}
                  <Button type="submit" variant="outline" size="sm" loading={rejectState.isLoading}>
                    {t('operations:events.detail.rejectButton')}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <Card className="rounded-3xl border-ink-10 shadow-card-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-coral">
                <Clock size={18} strokeWidth={2} aria-hidden />
                <CardTitle className="text-base font-bold">{t('operations:events.detail.timeline')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-[13px]">
                {[
                  [t('operations:events.detail.timelineSubmitted'), e.submittedAt],
                  [t('operations:events.detail.timelinePublished'), e.publishedAt],
                  [t('operations:events.detail.timelineCancelled'), e.cancelledAt],
                  [t('operations:events.detail.timelineCreated'), e.createdAt],
                  [t('operations:events.detail.timelineUpdated'), e.updatedAt],
                ].map(([label, iso]) =>
                  iso ? (
                    <li key={label} className="flex justify-between gap-3 border-b border-ink-10 pb-3 last:border-0">
                      <span className="font-semibold text-ink-60">{label}</span>
                      <span className="text-right font-mono text-[12px] text-ink">{formatWhen(iso, locale)}</span>
                    </li>
                  ) : null,
                )}
              </ul>
            </CardContent>
          </Card>

          {e.organizer ? (
            <Card className="rounded-3xl border-ink-10 shadow-card-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-ink">
                  <Building2 size={18} strokeWidth={2} aria-hidden />
                  <CardTitle className="text-base font-bold">{t('operations:events.detail.organizer')}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {e.organizer.logoUrl ? (
                  <img
                    src={resolveMediaUrl(e.organizer.logoUrl)}
                    alt=""
                    className="h-12 w-12 rounded-xl border border-ink-10 object-cover"
                  />
                ) : null}
                <p className="text-[15px] font-extrabold text-ink">{e.organizer.displayName}</p>
                {e.organizer.code ? <p className="font-mono text-[12px] text-ink-60">{e.organizer.code}</p> : null}
                {e.organizer.contactEmail ? <p className="text-[13px] text-ink-60">{e.organizer.contactEmail}</p> : null}
                {e.organizer.contactPhone ? <p className="text-[13px] text-ink-60">{e.organizer.contactPhone}</p> : null}
                <Link
                  to={`/approvals/organizers/${e.organizer.id}`}
                  className="inline-block text-[13px] font-bold text-coral hover:underline"
                >
                  {t('operations:events.detail.viewOrganizer')}
                </Link>
              </CardContent>
            </Card>
          ) : null}

          {e.categoryDetail ? (
            <Card className="rounded-3xl border-ink-10 shadow-card-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-ink">
                  <Tag size={18} strokeWidth={2} aria-hidden />
                  <CardTitle className="text-base font-bold">{t('operations:events.detail.category')}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-1 text-[14px]">
                <p className="font-bold text-ink">
                  {pickLocalizedField({ en: e.categoryDetail.nameEn, ar: e.categoryDetail.nameAr }, locale)}
                </p>
                <p className="font-mono text-[12px] text-ink-40">{e.categoryDetail.slug}</p>
              </CardContent>
            </Card>
          ) : null}

          <Card className="rounded-3xl border-ink-10 shadow-card-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">{t('operations:events.detail.storefrontPreview')}</CardTitle>
            </CardHeader>
            <CardContent>
              <AdminEventCard event={toCardRow(e)} className="max-w-full" />
            </CardContent>
          </Card>
        </aside>
      </div>

      {isPublished ? (
        <p className="text-center text-[12px] font-medium text-ink-40">{t('operations:events.detail.publishedHint')}</p>
      ) : null}
    </div>
  );
}
