import { AdminEventCard } from '@/components/events/AdminEventCard';
import { EventStatusBadge } from '@/components/events/EventStatusBadge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getApiBaseUrl } from '@/config/env';
import { formatSarCompact } from '@/lib/formatSar';
import { notifyError, notifySuccess } from '@/lib/notify';
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
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Clock, Sparkles, Tag, Ticket, UserCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useParams } from 'react-router-dom';

function resolveMediaUrl(url: string | undefined | null): string | undefined {
  if (!url?.trim()) return undefined;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const base = getApiBaseUrl();
  return `${base}/${url.replace(/^\/+/, '')}`;
}

function formatWhen(iso: string, timeZone?: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
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
  };
}

export function EventDetailPage() {
  const { id = '' } = useParams();
  const q = useGetEventQuery(id, { skip: !id });
  const [approve, approveState] = useApproveEventMutation();
  const [reject, rejectState] = useRejectEventMutation();
  const [feature, featureState] = useFeatureEventMutation();
  const [unfeature, unfeatureState] = useUnfeatureEventMutation();

  const rejectForm = useForm<RejectEventInput>({
    resolver: zodResolver(rejectEventSchema),
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
        <p className="font-semibold text-ink">Event not found or could not be loaded.</p>
        <Link to="/events" className="mt-4 inline-block text-[13px] font-bold text-coral hover:underline">
          ← Back to events
        </Link>
      </div>
    );
  }

  const e = q.data;
  const fill = fillPercent(e.ticketsSold, e.capacity);
  const canApprove = e.apiStatus === 'pending_approval' || e.apiStatus === 'draft';
  const canReject = e.apiStatus === 'pending_approval' || e.apiStatus === 'draft';
  const isCancelled = e.apiStatus === 'cancelled';
  const isPublished = e.apiStatus === 'published';

  return (
    <div className="space-y-8 pb-12">
      <nav aria-label="Breadcrumb">
        <Link to="/events" className="text-[13px] font-bold text-coral hover:underline">
          ← Events catalog
        </Link>
      </nav>

      {/* Hero + actions */}
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
                  Featured
                </span>
              ) : null}
            </div>
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-white/75">
                {e.categoryDetail?.nameEn ?? e.category}
              </p>
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
            <p className="text-[13px] font-medium text-ink-60">
              Review this event and update its status for the storefront.
            </p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Event actions">
              <Button
                type="button"
                variant="dark"
                size="sm"
                disabled={!canApprove || approveState.isLoading}
                loading={approveState.isLoading}
                onClick={async () => {
                  try {
                    await approve(e.id).unwrap();
                    notifySuccess('Event approved and published.');
                  } catch {
                    notifyError('Approve failed.');
                  }
                }}
              >
                Approve & publish
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={e.featured || isCancelled || featureState.isLoading}
                loading={featureState.isLoading}
                onClick={async () => {
                  try {
                    await feature(e.id).unwrap();
                    notifySuccess('Event added to featured.');
                  } catch {
                    notifyError('Feature failed.');
                  }
                }}
              >
                Feature
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
                    notifySuccess('Featuring removed.');
                  } catch {
                    notifyError('Unfeature failed.');
                  }
                }}
              >
                Unfeature
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: 'Tickets sold',
            value: e.ticketsSold.toLocaleString(),
            sub: e.capacity !== null ? `of ${e.capacity.toLocaleString()} capacity` : 'Capacity not set',
            icon: Ticket,
          },
          {
            label: 'Gross revenue',
            value: formatSarCompact(e.revenueSar),
            sub: fill !== null ? `${fill}% fill rate` : 'Fill rate N/A',
            icon: Tag,
          },
          {
            label: 'Rating',
            value: e.ratingCount ? `${e.avgRating.toFixed(1)} ★` : '—',
            sub: e.ratingCount ? `${e.ratingCount} reviews` : 'No ratings yet',
            icon: Sparkles,
          },
          {
            label: 'Attending',
            value: (e.attendingCount ?? 0).toLocaleString(),
            sub: e.waitlistCount ? `${e.waitlistCount} on waitlist` : 'Waitlist empty',
            icon: UserCircle,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-ink-10 bg-white p-4 shadow-card-sm"
          >
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
        {/* Main column */}
        <div className="space-y-6">
          {e.rejectionReason ? (
            <div className="rounded-2xl border border-coral/30 bg-coral/10 px-4 py-3" role="alert">
              <p className="text-[12px] font-bold uppercase tracking-wide text-coral">Rejection reason</p>
              <p className="mt-1 text-[14px] text-ink">{e.rejectionReason}</p>
            </div>
          ) : null}

          <Card className="rounded-3xl border-ink-10 shadow-card-sm">
            <CardHeader>
              <CardTitle className="text-lg font-extrabold">Description</CardTitle>
              <CardDescription>Content shown to buyers once the event is published.</CardDescription>
            </CardHeader>
            <CardContent>
              {e.description ? (
                <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-ink-60">{e.description}</p>
              ) : (
                <p className="text-[14px] text-ink-60">No description provided.</p>
              )}
              {e.excerpt ? (
                <p className="mt-4 rounded-xl bg-ink-5 px-4 py-3 text-[13px] text-ink-60">
                  <span className="font-bold text-ink">Excerpt:</span> {e.excerpt}
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-ink-10 shadow-card-sm">
            <CardHeader>
              <CardTitle className="text-lg font-extrabold">Schedule & location</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-6 sm:grid-cols-2">
                <DetailField
                  label="Starts"
                  value={
                    <>
                      {formatWhen(e.startsAt, e.timezone)}
                      {e.timezone ? (
                        <span className="mt-0.5 block text-[12px] font-medium text-ink-40">{e.timezone}</span>
                      ) : null}
                    </>
                  }
                />
                <DetailField label="Ends" value={formatWhen(e.endsAt, e.timezone)} />
                <DetailField
                  label="City"
                  value={e.city || '—'}
                  className="sm:col-span-2"
                />
                <DetailField label="Venue" value={e.venueName || 'Not specified'} />
                <DetailField label="Address" value={e.venueAddress || '—'} />
              </dl>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-ink-10 shadow-card-sm">
            <CardHeader>
              <CardTitle className="text-lg font-extrabold">Ticketing & layout</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <DetailField label="Layout" value={e.layoutType ?? '—'} mono />
                <DetailField label="Entry mode" value={e.entryMode?.replace(/_/g, ' ') ?? '—'} />
                <DetailField
                  label="Price range (SAR)"
                  value={
                    e.priceMin != null || e.priceMax != null
                      ? `${e.priceMin ?? '—'} – ${e.priceMax ?? '—'}`
                      : '—'
                  }
                  mono
                />
                <DetailField label="Multi-day" value={e.isMultiDay ? 'Yes' : 'No'} />
                <DetailField label="Show talents" value={e.showTalents ? 'Yes' : 'No'} />
                <DetailField label="Show vendors" value={e.showVendors ? 'Yes' : 'No'} />
              </dl>
            </CardContent>
          </Card>

          {canReject ? (
            <Card className="rounded-3xl border-coral/25 shadow-card-sm">
              <CardHeader>
                <CardTitle className="text-lg font-extrabold text-coral">Reject event</CardTitle>
                <CardDescription>
                  Sends the organizer a rejection reason. Use when the listing cannot be approved.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  className="space-y-4"
                  onSubmit={rejectForm.handleSubmit(async (values) => {
                    try {
                      await reject({ id: e.id, body: values }).unwrap();
                      notifySuccess('Event rejected.');
                      rejectForm.reset();
                    } catch {
                      notifyError('Rejection failed.');
                    }
                  })}
                >
                  <label className="block">
                    <span className="text-[12px] font-semibold text-ink-60">Reason (required)</span>
                    <textarea
                      className="mt-1.5 min-h-[96px] w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px] outline-none focus:border-coral focus:ring-2 focus:ring-coral/30"
                      placeholder="Explain what must change before this event can go live…"
                      {...rejectForm.register('reason')}
                    />
                  </label>
                  {rejectForm.formState.errors.reason ? (
                    <p className="text-[12px] font-medium text-coral">
                      {rejectForm.formState.errors.reason.message}
                    </p>
                  ) : null}
                  <Button type="submit" variant="outline" size="sm" loading={rejectState.isLoading}>
                    Reject event
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : null}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <Card className="rounded-3xl border-ink-10 shadow-card-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-coral">
                <Clock size={18} strokeWidth={2} aria-hidden />
                <CardTitle className="text-base font-bold">Timeline</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-[13px]">
                {[
                  ['Submitted', e.submittedAt],
                  ['Published', e.publishedAt],
                  ['Cancelled', e.cancelledAt],
                  ['Created', e.createdAt],
                  ['Updated', e.updatedAt],
                ].map(([label, iso]) =>
                  iso ? (
                    <li key={label} className="flex justify-between gap-3 border-b border-ink-10 pb-3 last:border-0">
                      <span className="font-semibold text-ink-60">{label}</span>
                      <span className="text-right font-mono text-[12px] text-ink">{formatWhen(iso)}</span>
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
                  <CardTitle className="text-base font-bold">Organizer</CardTitle>
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
                {e.organizer.code ? (
                  <p className="font-mono text-[12px] text-ink-60">{e.organizer.code}</p>
                ) : null}
                {e.organizer.contactEmail ? (
                  <p className="text-[13px] text-ink-60">{e.organizer.contactEmail}</p>
                ) : null}
                {e.organizer.contactPhone ? (
                  <p className="text-[13px] text-ink-60">{e.organizer.contactPhone}</p>
                ) : null}
                <Link
                  to={`/approvals/organizers/${e.organizer.id}`}
                  className="inline-block text-[13px] font-bold text-coral hover:underline"
                >
                  View organizer profile →
                </Link>
              </CardContent>
            </Card>
          ) : null}

          {e.categoryDetail ? (
            <Card className="rounded-3xl border-ink-10 shadow-card-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-ink">
                  <Tag size={18} strokeWidth={2} aria-hidden />
                  <CardTitle className="text-base font-bold">Category</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-1 text-[14px]">
                <p className="font-bold text-ink">{e.categoryDetail.nameEn}</p>
                <p className="text-ink-60" dir="rtl">
                  {e.categoryDetail.nameAr}
                </p>
                <p className="font-mono text-[12px] text-ink-40">{e.categoryDetail.slug}</p>
              </CardContent>
            </Card>
          ) : null}

          <Card className="rounded-3xl border-ink-10 shadow-card-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold">Storefront preview</CardTitle>
            </CardHeader>
            <CardContent>
              <AdminEventCard event={toCardRow(e)} className="max-w-full" />
            </CardContent>
          </Card>
        </aside>
      </div>

      {isPublished ? (
        <p className="text-center text-[12px] font-medium text-ink-40">
          This event is live. Use reject only for policy violations; prefer organizer tools for content edits.
        </p>
      ) : null}
    </div>
  );
}
