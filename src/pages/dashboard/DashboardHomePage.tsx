import { AdminEventCard } from '@/components/events/AdminEventCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatBubble } from '@/components/ui/StatBubble';
import { AdminSection } from '@/components/layout/AdminSection';
import { useCountUp } from '@/hooks/useCountUp';
import { formatDateTime, formatNumber } from '@/lib/localeFormat';
import {
  useGetAdminHealthQuery,
  useGetDashboardCountersQuery,
  useGetEventsQuery,
  useGetPendingActionsQuery,
} from '@/services/adminApi';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Activity, ArrowRight, Cpu, Radio } from 'lucide-react';

function healthStatusTone(status: string): string {
  const s = status.toLowerCase();
  if (s === 'ok' || s === 'healthy' || s === 'up') return 'text-mint';
  if (s === 'degraded' || s === 'warning') return 'text-amber';
  return 'text-coral';
}

export function DashboardHomePage() {
  const { t } = useTranslation('dashboard');
  const counters = useGetDashboardCountersQuery();
  const pending = useGetPendingActionsQuery();
  const events = useGetEventsQuery();
  const health = useGetAdminHealthQuery();

  const c = counters.data;
  const empty = t('common:none');

  const usersTotal = useCountUp(c?.usersTotal ?? null);
  const usersSuspended = useCountUp(c?.usersSuspended ?? null);
  const eventsPendingApproval = useCountUp(c?.eventsPendingApproval ?? null);
  const eventsPublished = useCountUp(c?.eventsPublished ?? null);
  const supportCasesOpenPipeline = useCountUp(c?.supportCasesOpenPipeline ?? null);
  const listingModerationQueuedOrInReview = useCountUp(c?.listingModerationQueuedOrInReview ?? null);
  const roleApplicationsSubmitted = useCountUp(c?.roleApplicationsSubmitted ?? null);
  const payoutsHeld = useCountUp(c?.payoutsHeld ?? null);
  const tourismAdsPendingReview = useCountUp(c?.tourismAdsPendingReview ?? null);

  const spotlight = events.data?.slice(0, 3) ?? [];

  return (
    <div className="space-y-12">
      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-ink-40">{t('home.eyebrow')}</p>
        <h1 className="mt-1 text-4xl font-extrabold tracking-tight text-ink">{t('home.title')}</h1>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-ink-60">
          <Trans
            i18nKey="home.subtitle"
            components={[<span key="1" className="font-mono text-ink" />]}
          />
        </p>
        {counters.isError ? (
          <p className="mt-3 rounded-xl bg-coral/15 px-4 py-3 text-[13px] font-semibold text-ink">
            {t('home.countersError')}
          </p>
        ) : null}
      </div>

      <AdminSection
        eyebrow={t('sections.operations.eyebrow')}
        title={t('sections.operations.title')}
        description={t('sections.operations.description')}
      >
        {counters.isLoading ? <p className="text-sm text-ink-60">{t('home.loadingCounters')}</p> : null}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatBubble
            label={t('counters.usersTotal')}
            value={c ? formatNumber(usersTotal) : empty}
            color="bg-ink text-white"
          />
          <StatBubble
            label={t('counters.usersSuspended')}
            value={c ? formatNumber(usersSuspended) : empty}
            color="bg-lemon text-ink"
          />
          <StatBubble
            label={t('counters.eventsPendingApproval')}
            value={c ? formatNumber(eventsPendingApproval) : empty}
            color="bg-mint text-ink"
          />
          <StatBubble
            label={t('counters.eventsPublished')}
            value={c ? formatNumber(eventsPublished) : empty}
            color="bg-coral text-white"
          />
          <StatBubble
            label={t('counters.supportCasesOpenPipeline')}
            value={c ? formatNumber(supportCasesOpenPipeline) : empty}
            color="bg-ink text-white"
          />
          <StatBubble
            label={t('counters.listingModerationQueuedOrInReview')}
            value={c ? formatNumber(listingModerationQueuedOrInReview) : empty}
            color="bg-lemon text-ink"
          />
          <StatBubble
            label={t('counters.roleApplicationsSubmitted')}
            value={c ? formatNumber(roleApplicationsSubmitted) : empty}
            color="bg-mint text-ink"
          />
          <StatBubble
            label={t('counters.payoutsHeld')}
            value={c ? formatNumber(payoutsHeld) : empty}
            color="bg-coral text-white"
          />
          <Link to="/tourism-ads?tab=review" className="block">
            <StatBubble
              label={t('counters.tourismAdsPendingReview')}
              value={c ? formatNumber(tourismAdsPendingReview) : empty}
              color="bg-ink text-white"
            />
          </Link>
        </div>
      </AdminSection>

      <AdminSection
        divider
        eyebrow={t('sections.reliability.eyebrow')}
        title={t('sections.reliability.title')}
        description={t('sections.reliability.description')}
      >
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="rounded-3xl border-ink-10 shadow-card-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-coral">
                <Radio size={18} strokeWidth={2} />
                <CardTitle className="text-base font-bold">{t('health.apiAvailability')}</CardTitle>
              </div>
              <CardDescription>
                {health.data?.checkedAt
                  ? t('health.checkedAt', { date: formatDateTime(health.data.checkedAt) })
                  : t('health.adminHealthEndpoint')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {health.isLoading ? <p className="text-sm text-ink-60">{t('common:loading')}</p> : null}
              {health.isError ? (
                <p className="text-[13px] font-semibold text-coral">{t('health.unavailable')}</p>
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
                <CardTitle className="text-base font-bold">{t('health.supportPipeline')}</CardTitle>
              </div>
              <CardDescription>{t('health.supportPipelineDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-mono text-3xl font-black text-ink">
                {c ? formatNumber(supportCasesOpenPipeline) : empty}
              </p>
              <p className="mt-2 text-[13px] font-semibold text-ink-60">
                <Link to="/support" className="font-bold text-coral hover:underline">
                  {t('health.openSupportInbox')}
                </Link>
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-ink-10 shadow-card-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-ink-60">
                <Activity size={18} strokeWidth={2} />
                <CardTitle className="text-base font-bold">{t('health.riskQueue')}</CardTitle>
              </div>
              <CardDescription>{t('health.riskQueueDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-mono text-3xl font-black text-amber">
                {c ? formatNumber(listingModerationQueuedOrInReview) : empty}
              </p>
              <p className="mt-2 text-[13px] font-semibold text-ink-60">
                <Link to="/moderation/listings" className="font-bold text-coral hover:underline">
                  {t('health.openListingsModeration')}
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </AdminSection>

      <AdminSection
        divider
        eyebrow={t('sections.catalog.eyebrow')}
        title={t('sections.catalog.title')}
        description={t('sections.catalog.description')}
      >
        {events.isLoading ? <p className="text-sm text-ink-60">{t('common:loading')}</p> : null}
        {events.isError ? (
          <p className="text-sm font-semibold text-coral">{t('home.eventsError')}</p>
        ) : null}
        {!events.isLoading && !events.isError && spotlight.length === 0 ? (
          <p className="text-sm text-ink-60">{t('home.noEvents')}</p>
        ) : null}
        <div className="grid gap-6 lg:grid-cols-3">
          {spotlight.map((ev) => (
            <AdminEventCard key={ev.id} event={ev} />
          ))}
        </div>
        <Link to="/events" className="mt-4 inline-flex text-[14px] font-bold text-coral hover:underline">
          {t('home.browseCatalog')}
        </Link>
      </AdminSection>

      <AdminSection
        divider
        eyebrow={t('sections.queues.eyebrow')}
        title={t('sections.queues.title')}
        description={t('sections.queues.description')}
      >
        {pending.isLoading ? <p className="text-sm text-ink-60">{t('common:loading')}</p> : null}
        {pending.isError ? (
          <p className="text-sm font-semibold text-coral">{t('home.pendingActionsError')}</p>
        ) : null}
        {!pending.isLoading && !pending.isError && (pending.data?.length ?? 0) === 0 ? (
          <p className="text-sm text-ink-60">{t('home.noPendingActions')}</p>
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
                    <span className="text-coral">{t('pending.highPriority')}</span>
                  ) : (
                    <span className="text-ink-60">{t('pending.standard')}</span>
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
                  {t('pending.openWorkflow')}
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
