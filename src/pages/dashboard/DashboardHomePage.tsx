import { AdminEventCard } from '@/components/events/AdminEventCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatBubble } from '@/components/ui/StatBubble';
import { AdminSection } from '@/components/layout/AdminSection';
import { useCountUp } from '@/hooks/useCountUp';
import {
  useGetDashboardCountersQuery,
  useGetEventsQuery,
  useGetPendingActionsQuery,
} from '@/services/adminApi';
import { Link } from 'react-router-dom';
import { Activity, ArrowRight, Cpu, Radio } from 'lucide-react';

function formatInt(n: number) {
  return n.toLocaleString();
}

export function DashboardHomePage() {
  const counters = useGetDashboardCountersQuery();
  const pending = useGetPendingActionsQuery();
  const events = useGetEventsQuery();

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
      </div>

      <AdminSection
        eyebrow="Operations"
        title="Dashboard counters"
        description="Users, events, support, moderation, roles, and payouts — aligned to the admin API handoff."
      >
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
        description="Synthetic uptime and pipeline signals — swap for Datadog / CloudWatch cards when wired."
      >
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="rounded-3xl border-ink-10 shadow-card-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-coral">
                <Radio size={18} strokeWidth={2} />
                <CardTitle className="text-base font-bold">API availability</CardTitle>
              </div>
              <CardDescription>Last rolling 24h (placeholder)</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-mono text-3xl font-black text-mint">99.98%</p>
              <p className="mt-2 text-[13px] font-semibold text-ink-60">0 incidents · checkout latency p95 412ms</p>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-ink-10 shadow-card-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-ink">
                <Cpu size={18} strokeWidth={2} />
                <CardTitle className="text-base font-bold">Webhooks</CardTitle>
              </div>
              <CardDescription>Organizer + finance callbacks</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-mono text-3xl font-black text-ink">100%</p>
              <p className="mt-2 text-[13px] font-semibold text-ink-60">12.4k delivered · 6 retries resolved</p>
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
        description="Highest-signal events with imagery, fill rate, and satisfaction proxies — same card component used in featured tooling."
      >
        {events.isLoading ? <p className="text-sm text-ink-60">Loading…</p> : null}
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
        description="Each card shows the owning surface, SLA hint, and a contextual visual so operators can triage faster."
      >
        <div className="grid gap-4 md:grid-cols-1 xl:grid-cols-3">
          {pending.isLoading ? <p className="text-sm text-ink-60">Loading…</p> : null}
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
