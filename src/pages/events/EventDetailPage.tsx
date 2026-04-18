import { AdminEventCard } from '@/components/events/AdminEventCard';
import { EventStatusBadge } from '@/components/events/EventStatusBadge';
import { AdminSection } from '@/components/layout/AdminSection';
import { formatSarCompact } from '@/lib/formatSar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetEventQuery } from '@/services/adminApi';
import { Link, useParams } from 'react-router-dom';
import { Ban, CalendarRange, MapPin, Sparkles, Ticket, TrendingUp } from 'lucide-react';

export function EventDetailPage() {
  const { id = '' } = useParams();
  const q = useGetEventQuery(id, { skip: !id });

  if (q.isLoading) return <p className="text-ink-60">Loading…</p>;
  if (!q.data) {
    return (
      <div className="rounded-3xl border border-ink-10 bg-white p-8">
        <p className="font-semibold text-ink">Event not found.</p>
        <Link to="/events" className="mt-4 inline-block font-bold text-coral hover:underline">
          Back
        </Link>
      </div>
    );
  }

  const e = q.data;
  const fill = Math.min(100, Math.round((e.ticketsSold / e.capacity) * 100));

  return (
    <div className="space-y-10">
      <div>
        <Link to="/events" className="text-[13px] font-bold text-coral hover:underline">
          ← Events
        </Link>
        <div className="mt-4 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="overflow-hidden rounded-[32px] border border-ink-10 shadow-card-lg">
            <div className="relative aspect-[21/9] min-h-[200px] w-full bg-ink-5 lg:aspect-auto lg:min-h-[280px]">
              <img src={e.coverImageUrl} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-tr from-ink/80 via-ink/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-white/80">{e.category}</p>
                  <h1 className="mt-2 text-3xl font-extrabold leading-tight text-white md:text-4xl">{e.title}</h1>
                  <p className="mt-2 text-[14px] font-semibold text-white/90">{e.organizerName}</p>
                </div>
                <span className="rounded-full bg-white/95 p-1 shadow-card-sm ring-1 ring-white/40">
                  <EventStatusBadge status={e.status} />
                </span>
              </div>
            </div>
          </div>
          <Card className="rounded-[32px] border-ink-10 shadow-card-md">
            <CardHeader>
              <CardTitle className="text-xl font-extrabold">Executive readout</CardTitle>
              <CardDescription>Snapshot metrics for leadership reviews (mock).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-ink-10 bg-surface-tint p-4">
                  <p className="text-[10px] font-extrabold uppercase tracking-wide text-ink-40">Fill rate</p>
                  <p className={`mt-1 font-mono text-2xl font-black ${fill >= 88 ? 'text-mint' : 'text-ink'}`}>{fill}%</p>
                </div>
                <div className="rounded-2xl border border-ink-10 bg-surface-tint p-4">
                  <p className="text-[10px] font-extrabold uppercase tracking-wide text-ink-40">Avg rating</p>
                  <p className="mt-1 font-mono text-2xl font-black text-coral">{e.avgRating.toFixed(1)} ★</p>
                </div>
                <div className="rounded-2xl border border-ink-10 bg-surface-tint p-4">
                  <p className="text-[10px] font-extrabold uppercase tracking-wide text-ink-40">Revenue</p>
                  <p className="mt-1 font-mono text-xl font-black text-ink">{formatSarCompact(e.revenueSar)}</p>
                </div>
                <div className="rounded-2xl border border-ink-10 bg-surface-tint p-4">
                  <p className="text-[10px] font-extrabold uppercase tracking-wide text-ink-40">Check-in success</p>
                  <p
                    className={`mt-1 font-mono text-2xl font-black ${
                      e.successRatePercent >= 95 ? 'text-mint' : e.successRatePercent >= 88 ? 'text-ink' : 'text-amber'
                    }`}
                  >
                    {e.status === 'cancelled' ? '—' : `${e.successRatePercent}%`}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  to="/events/featured"
                  className="inline-flex items-center gap-2 rounded-full border border-ink-10 bg-white px-4 py-2 text-[13px] font-bold text-ink hover:border-coral/40"
                >
                  <Sparkles size={16} strokeWidth={2} className="text-coral" />
                  Featuring controls
                </Link>
                <Link
                  to="/events/cancellations"
                  className="inline-flex items-center gap-2 rounded-full border border-ink-10 bg-white px-4 py-2 text-[13px] font-bold text-ink hover:border-coral/40"
                >
                  <Ban size={16} strokeWidth={2} className="text-coral" />
                  Cancellation desk
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AdminSection
        eyebrow="Venue & schedule"
        title="Logistics"
        description="Everything an on-call admin needs before paging an organizer."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="rounded-3xl border-ink-10 shadow-card-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-coral">
                <MapPin size={18} strokeWidth={2} />
                <CardTitle className="text-base font-bold">Venue</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-extrabold text-ink">{e.venueName}</p>
              <p className="mt-1 text-[14px] font-semibold text-ink-60">{e.city}</p>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-ink-10 shadow-card-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-coral">
                <CalendarRange size={18} strokeWidth={2} />
                <CardTitle className="text-base font-bold">Schedule</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-[14px] font-semibold text-ink-60">
              <p>
                <span className="text-ink">Starts:</span> {new Date(e.startsAt).toLocaleString()}
              </p>
              <p>
                <span className="text-ink">Ends:</span> {new Date(e.endsAt).toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-ink-10 shadow-card-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-coral">
                <Ticket size={18} strokeWidth={2} />
                <CardTitle className="text-base font-bold">Capacity</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="font-mono text-3xl font-black text-ink">{e.ticketsSold.toLocaleString()}</p>
              <p className="mt-1 text-[13px] font-semibold text-ink-60">
                of {e.capacity.toLocaleString()} seats ·{' '}
                <span className="font-bold text-ink">{e.capacity - e.ticketsSold}</span> remaining
              </p>
            </CardContent>
          </Card>
        </div>
      </AdminSection>

      <AdminSection
        divider
        eyebrow="Card preview"
        title="Operator card"
        description="This is the same AdminEventCard component used on the overview and cancellation flows for visual continuity."
      >
        <AdminEventCard event={e} className="max-w-xl" />
      </AdminSection>

      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="text-coral" size={20} strokeWidth={2} />
            <CardTitle className="text-lg font-bold">Narrative notes</CardTitle>
          </div>
          <CardDescription>Placeholder for AI summaries, chargeback counts, and refund exposure.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-2 pl-5 text-[14px] text-ink-60">
            <li>No payout holds detected on this organizer (mock).</li>
            <li>Customer sentiment trending {e.avgRating >= 4.5 ? 'positive' : 'neutral'} vs. similar events.</li>
            <li>Refund policy window closes 48h before doors (product placeholder).</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
