import { AdminEventCard } from '@/components/events/AdminEventCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatBubble } from '@/components/ui/StatBubble';
import { AdminSection } from '@/components/layout/AdminSection';
import { useCountUp } from '@/hooks/useCountUp';
import {
  useGetAdminHealthQuery,
  useGetDashboardCountersQuery,
  useGetEventsQuery,
  useGetPendingActionsQuery,
} from '@/services/adminApi';
import { Link } from 'react-router-dom';
import { Activity, ArrowRight, Cpu, Radio } from 'lucide-react';

function formatInt(n: number) {
  return n.toLocaleString();
}

function healthStatusTone(status: string): string {
  const s = status.toLowerCase();
  if (s === 'ok' || s === 'healthy' || s === 'up') return 'text-mint';
  if (s === 'degraded' || s === 'warning') return 'text-amber';
  return 'text-coral';
}

export function DashboardHomePage() {
  const counters = useGetDashboardCountersQuery();
  const pending = useGetPendingActionsQuery();
  const events = useGetEventsQuery();
  const health = useGetAdminHealthQuery();

  const c = counters.data;

  const usersTotal = useCountUp(c?.usersTotal ?? null);
  const usersSuspended = useCountUp(c?.usersSuspended ?? null);
  const eventsPendingApproval = useCountUp(c?.eventsPendingApproval ?? null);
  const eventsPublished = useCountUp(c?.eventsPublished ?? null);
  const supportCasesOpenPipeline = useCountUp(c?.supportCasesOpenPipeline ?? null);
  const listingModerationQueuedOrInReview = useCountUp(c?.listingModerationQueuedOrInReview ?? null);
  const roleApplicationsSubmitted = useCountUp(c?.roleApplicationsSubmitted ?? null);
  const payoutsHeld = useCountUp(c?.payoutsHeld ?? null);

  const spotlight = events.data?.slice(0, 3) ?? [];

  return (
    <div className="space-y-12">
      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-ink-40">Dashboard</p>
        <h1 className="mt-1 text-4xl font-extrabold tracking-tight text-ink">Platform snapshot</h1>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink-60">
          Operational counters from <span className="font-mono text-ink">GET /api/v1/admin/dashboard/counters</span> —
          same underlying signals as summary, formatted for executive scanning.
        </p>
        {counters.isError ? (
          <p className="mt-3 rounded-xl bg-coral/15 px-4 py-3 text-[13px] font-semibold text-ink">
            Could not load dashboard counters from the API.
          </p>
        ) : null}
      </div>

      <AdminSection
        eyebrow="Operations"
        title="Dashboard counters"
        description="Users, events, support, moderation, roles, and payouts — aligned to the admin API handoff."
      >
        {counters.isLoading ? <p className="text-sm text-ink-60">Loading counters…</p> : null}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatBubble label="Users (total)" value={c ? formatInt(usersTotal) : '—'} color="bg-ink text-white" />
          <StatBubble label="Users suspended" value={c ? formatInt(usersSuspended) : '—'} color="bg-lemon text-ink" />
          <StatBubble
            label="Events pending approval"
            value={c ? formatInt(eventsPendingApproval) : '—'}
            color="bg-mint text-ink"
          />
          <StatBubble label="Events published" value={c ? formatInt(eventsPublished) : '—'} color="bg-coral text-white" />
          <StatBubble
            label="Support cases (open pipeline)"
            value={c ? formatInt(supportCasesOpenPipeline) : '—'}
            color="bg-ink text-white"
          />
          <StatBubble
            label="Listing moderation (queued / in review)"
            value={c ? formatInt(listingModerationQueuedOrInReview) : '—'}
            color="bg-lemon text-ink"
          />
          <StatBubble
            label="Role applications submitted"
            value={c ? formatInt(roleApplicationsSubmitted) : '—'}
            color="bg-mint text-ink"
          />
          <StatBubble label="Payouts held" value={c ? formatInt(payoutsHeld) : '—'} color="bg-coral text-white" />
        </div>
      </AdminSection>

      <AdminSection
        divider
        eyebrow="Reliability"
        title="Operational health"
        description="Live status from GET /api/v1/admin/health when API read mode is enabled."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="rounded-3xl border-ink-10 shadow-card-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-coral">
                <Radio size={18} strokeWidth={2} />
                <CardTitle className="text-base font-bold">API availability</CardTitle>
              </div>
              <CardDescription>
                {health.data?.checkedAt
                  ? `Checked ${new Date(health.data.checkedAt).toLocaleString()}`
                  : 'Admin health endpoint'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {health.isLoading ? <p className="text-sm text-ink-60">Loading…</p> : null}
              {health.isError ? (
                <p className="text-[13px] font-semibold text-coral">Health check unavailable.</p>
              ) : null}
              {health.data ? (
                <>
                  <p className={`font-mono text-3xl font-black capitalize ${healthStatusTone(health.data.status)}`}>
                    {health.data.status}
                  </p>
                  {health.data.message ? (
                    <p className="mt-2 text-[13px] font-semibold text-ink-60">{health.data.message}</p>
                  ) : null}
                </>
              ) : null}
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-ink-10 shadow-card-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-ink">
                <Cpu size={18} strokeWidth={2} />
                <CardTitle className="text-base font-bold">Support pipeline</CardTitle>
              </div>
              <CardDescription>Open cases from dashboard counters</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-mono text-3xl font-black text-ink">
                {c ? formatInt(supportCasesOpenPipeline) : '—'}
              </p>
              <p className="mt-2 text-[13px] font-semibold text-ink-60">
                <Link to="/support" className="font-bold text-coral hover:underline">
                  Open support inbox →
                </Link>
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-ink-10 shadow-card-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-ink-60">
                <Activity size={18} strokeWidth={2} />
                <CardTitle className="text-base font-bold">Risk queue</CardTitle>
              </div>
              <CardDescription>Trust & safety backlog</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-mono text-3xl font-black text-amber">
                {c ? formatInt(listingModerationQueuedOrInReview) : '—'}
              </p>
              <p className="mt-2 text-[13px] font-semibold text-ink-60">
                <Link to="/moderation/listings" className="font-bold text-coral hover:underline">
                  Open listings moderation →
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </AdminSection>

      <AdminSection
        divider
        eyebrow="Live catalog"
        title="Spotlight events"
        description="Recent events from GET /api/v1/admin/events."
      >
        {events.isLoading ? <p className="text-sm text-ink-60">Loading…</p> : null}
        {events.isError ? (
          <p className="text-sm font-semibold text-coral">Could not load events from the API.</p>
        ) : null}
        {!events.isLoading && !events.isError && spotlight.length === 0 ? (
          <p className="text-sm text-ink-60">No events returned.</p>
        ) : null}
        <div className="grid gap-6 lg:grid-cols-3">
          {spotlight.map((ev) => (
            <AdminEventCard key={ev.id} event={ev} />
          ))}
        </div>
        <Link to="/events" className="mt-4 inline-flex text-[14px] font-bold text-coral hover:underline">
          Browse full catalog →
        </Link>
      </AdminSection>

      <AdminSection
        divider
        eyebrow="Queues"
        title="Pending actions"
        description="Grouped buckets from GET /api/v1/admin/dashboard/pending-actions."
      >
        {pending.isLoading ? <p className="text-sm text-ink-60">Loading…</p> : null}
        {pending.isError ? (
          <p className="text-sm font-semibold text-coral">Could not load pending actions from the API.</p>
        ) : null}
        {!pending.isLoading && !pending.isError && (pending.data?.length ?? 0) === 0 ? (
          <p className="text-sm text-ink-60">No pending actions in the queue.</p>
        ) : null}
        <div className="grid gap-4 md:grid-cols-1 xl:grid-cols-3">
          {pending.data?.map((item) => (
            <Link
              key={item.id}
              to={item.href}
              className="group flex flex-col overflow-hidden rounded-3xl border border-ink-10 bg-white shadow-card-sm transition-all hover:-translate-y-0.5 hover:border-coral/40 hover:shadow-card-md"
            >
              <div className="relative h-36 w-full overflow-hidden bg-ink-5">
                <img src={item.imageUrl} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]" />
                <div className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-ink">
                  {item.priority === 'high' ? (
                    <span className="text-coral">High priority</span>
                  ) : (
                    <span className="text-ink-60">Standard</span>
                  )}
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-3 p-4">
                <div>
                  <p className="text-[15px] font-extrabold text-ink">{item.title}</p>
                  <p className="mt-1 text-[13px] text-ink-60">{item.subtitle}</p>
                  <p className="mt-2 text-[12px] font-bold text-mint">{item.dueLabel}</p>
                </div>
                <span className="mt-auto inline-flex items-center gap-2 text-[13px] font-bold text-coral">
                  Open workflow
                  <ArrowRight size={16} strokeWidth={2} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </AdminSection>
    </div>
  );
}
