import { setRevenueChartRange } from '@/app/analyticsUiSlice';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatBubble } from '@/components/ui/StatBubble';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { getCurrentLocale } from '@/i18n';
import { formatSarAxis, formatSarCompact } from '@/lib/formatSar';
import { formatDateTime, formatNumber } from '@/lib/localeFormat';
import {
  useGetFinancialAnalyticsQuery,
  useGetLeaderboardsQuery,
  useGetPlatformCountersQuery,
} from '@/services/adminApi';
import type { RevenueChartRange } from '@/types/analytics';
import { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

const RANGE_IDS: RevenueChartRange[] = ['24h', '1d', '7d', '30d', '90d'];

function SarRevenueTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ value?: unknown }>;
  label?: string | number;
}) {
  if (!active || !payload?.length) return null;
  const locale = getCurrentLocale();
  const raw = payload[0]?.value;
  const num = typeof raw === 'number' ? raw : Number(raw);
  return (
    <div className="rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
      {label != null ? <p className="mb-1 font-medium text-muted-foreground">{String(label)}</p> : null}
      <p className="font-mono font-semibold tabular-nums text-foreground">
        {formatSarCompact(Number.isFinite(num) ? num : 0, locale)}
      </p>
    </div>
  );
}

export function AnalyticsPage() {
  const { t } = useTranslation(['insights', 'common']);
  const locale = getCurrentLocale();
  const dispatch = useAppDispatch();
  const revenueChartRange = useAppSelector((s) => s.analyticsUi.revenueChartRange);
  const fin = useGetFinancialAnalyticsQuery(revenueChartRange);
  const counters = useGetPlatformCountersQuery();
  const boards = useGetLeaderboardsQuery();

  const rangeOptions = useMemo(
    () => RANGE_IDS.map((id) => ({ id, label: t(`insights:analytics.range.${id}`) })),
    [t],
  );

  if (fin.isLoading || counters.isLoading || boards.isLoading) {
    return <p className="text-ink-60">{t('common:loading')}</p>;
  }
  if (!fin.data || !counters.data || !boards.data) return null;

  const breakdownChart = (fin.data.revenueBreakdownByCategory ?? []).map((row) => ({
    key: row.categoryKey,
    label: row.label,
    revenueSar: row.revenueSar,
  }));
  const revenueByDay = fin.data.revenueByDay ?? [];
  const hasTrend = revenueByDay.length > 0;
  const hasBreakdown = breakdownChart.length > 0;
  const empty = t('common:none');

  return (
    <div className="space-y-10">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-40">{t('insights:analytics.eyebrow')}</p>
        <h1 className="text-3xl font-extrabold text-ink">{t('insights:analytics.title')}</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-ink-60">
          <Trans
            i18nKey="insights:analytics.subtitle"
            components={[
              <span key="1" className="font-mono text-ink" />,
              <span key="2" className="font-mono text-ink" />,
            ]}
          />
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[12px] font-semibold text-ink-60">{t('insights:analytics.financialWindow')}</span>
        {rangeOptions.map((opt) => (
          <Button
            key={opt.id}
            type="button"
            size="sm"
            variant={revenueChartRange === opt.id ? 'dark' : 'outline'}
            onClick={() => dispatch(setRevenueChartRange(opt.id))}
          >
            {opt.label}
          </Button>
        ))}
      </div>

      {fin.data.range || fin.data.since ? (
        <p className="text-[13px] text-ink-60">
          {t('insights:analytics.apiWindow')}{' '}
          <span className="font-mono text-ink">{fin.data.range ?? revenueChartRange}</span>
          {fin.data.since ? (
            <>
              {' '}
              · {t('insights:analytics.since')}{' '}
              <span className="font-mono text-ink">{fin.data.since}</span>
            </>
          ) : null}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatBubble
          label={t('insights:analytics.stats.platformRevenue')}
          value={formatSarCompact(fin.data.totalRevenueSar, locale)}
          color="bg-ink text-white"
        />
        <StatBubble
          label={t('insights:analytics.stats.feesCollected')}
          value={formatSarCompact(fin.data.platformFeesSar, locale)}
          color="bg-lemon text-ink"
        />
        <StatBubble
          label={t('insights:analytics.stats.refunds')}
          value={formatSarCompact(fin.data.refundsSar, locale)}
          color="bg-mint text-ink"
        />
        <StatBubble
          label={t('insights:analytics.stats.payoutsPending')}
          value={formatSarCompact(fin.data.payoutsPendingSar, locale)}
          color="bg-coral text-white"
        />
      </div>

      {fin.data.ordersPaidCount !== undefined || fin.data.ordersPaidTotalAmount !== undefined ? (
        <div className="grid gap-4 md:grid-cols-2">
          {fin.data.ordersPaidCount !== undefined ? (
            <StatBubble
              label={t('insights:analytics.stats.ordersPaidCount')}
              value={formatNumber(fin.data.ordersPaidCount, locale)}
              color="bg-ink-5 text-ink"
            />
          ) : null}
          {fin.data.ordersPaidTotalAmount !== undefined ? (
            <StatBubble
              label={t('insights:analytics.stats.ordersPaidAmount')}
              value={formatSarCompact(fin.data.ordersPaidTotalAmount, locale)}
              color="bg-ink-5 text-ink"
            />
          ) : null}
        </div>
      ) : null}

      <Card className="rounded-3xl border-ink-10 shadow-card-md">
        <CardHeader>
          <CardTitle className="text-lg">
            {t('insights:analytics.revenueTrend.title', { range: revenueChartRange })}
          </CardTitle>
          <CardDescription>{t('insights:analytics.revenueTrend.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {hasTrend ? (
            <ChartContainer
              className="h-[320px] w-full"
              config={{
                revenueSar: { label: t('insights:analytics.chart.revenueSar'), color: 'var(--color-coral)' },
              }}
            >
              <AreaChart data={revenueByDay} margin={{ left: 12, right: 12 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={56}
                  tickFormatter={(v) => formatSarAxis(Number(v), locale)}
                />
                <ChartTooltip content={SarRevenueTooltip} />
                <Area
                  dataKey="revenueSar"
                  name="revenueSar"
                  type="monotone"
                  fill="var(--color-coral)"
                  fillOpacity={0.2}
                  stroke="var(--color-coral)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          ) : (
            <p className="py-12 text-center text-[14px] text-ink-60">{t('insights:analytics.revenueTrend.empty')}</p>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-ink-10 shadow-card-md">
        <CardHeader>
          <CardTitle className="text-lg">{t('insights:analytics.revenueByCategory.title')}</CardTitle>
          <CardDescription>{t('insights:analytics.revenueByCategory.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {hasBreakdown ? (
            <ChartContainer
              className="h-[300px] w-full"
              config={{
                revenueSar: { label: t('insights:analytics.chart.revenueSar'), color: 'var(--color-indigo)' },
              }}
            >
              <BarChart data={breakdownChart} layout="vertical" margin={{ left: 8, right: 12 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => formatSarAxis(Number(v), locale)}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={120}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                />
                <ChartTooltip content={SarRevenueTooltip} />
                <Bar dataKey="revenueSar" name="revenueSar" fill="var(--color-indigo)" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ChartContainer>
          ) : (
            <p className="py-12 text-center text-[14px] text-ink-60">
              {t('insights:analytics.revenueByCategory.empty')}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-3xl border-ink-10 shadow-card-sm">
          <CardHeader>
            <CardTitle className="text-lg">{t('insights:analytics.usersByRole.title')}</CardTitle>
            <CardDescription>
              <Trans
                i18nKey="insights:analytics.usersByRole.description"
                components={[<span key="1" className="font-mono" />]}
              />
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-[14px] text-ink-60">
            <p>
              {t('insights:analytics.usersByRole.guest')}: {formatNumber(counters.data.usersByRole.guest, locale)}
            </p>
            <p>
              {t('insights:analytics.usersByRole.talent')}: {formatNumber(counters.data.usersByRole.talent, locale)}
            </p>
            <p>
              {t('insights:analytics.usersByRole.vendor')}: {formatNumber(counters.data.usersByRole.vendor, locale)}
            </p>
            <p>
              {t('insights:analytics.usersByRole.organizer')}:{' '}
              {formatNumber(counters.data.usersByRole.organizer, locale)}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-ink-10 shadow-card-sm">
          <CardHeader>
            <CardTitle className="text-lg">{t('insights:analytics.eventsByStatus.title')}</CardTitle>
            <CardDescription>{t('insights:analytics.eventsByStatus.description')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-[14px] text-ink-60">
            <p>
              {t('insights:analytics.eventsByStatus.active')}: {counters.data.eventsByStatus.active}
            </p>
            <p>
              {t('insights:analytics.eventsByStatus.ended')}: {counters.data.eventsByStatus.ended}
            </p>
            <p>
              {t('insights:analytics.eventsByStatus.cancelled')}: {counters.data.eventsByStatus.cancelled}
            </p>
            <p>
              {t('insights:analytics.eventsByStatus.archived')}: {counters.data.eventsByStatus.archived}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-3xl border-ink-10 shadow-card-sm">
          <CardHeader>
            <CardTitle className="text-lg">{t('insights:analytics.leaderboards.topEventsTitle')}</CardTitle>
            {boards.data.generatedAt ? (
              <CardDescription className="font-mono text-[12px]">
                {t('insights:analytics.leaderboards.generated', {
                  date: formatDateTime(boards.data.generatedAt, locale),
                })}
              </CardDescription>
            ) : null}
          </CardHeader>
          <CardContent className="admin-table-scroll">
            {boards.data.events.length === 0 ? (
              <p className="py-8 text-center text-[14px] text-ink-60">
                {t('insights:analytics.leaderboards.noEvents')}
              </p>
            ) : (
              <table className="w-full min-w-[640px] text-left text-[13px]">
                <thead className="text-[11px] font-bold uppercase text-ink-40">
                  <tr>
                    <th className="pb-2 pr-2">{t('insights:analytics.leaderboards.columns.code')}</th>
                    <th className="pb-2 pr-2">{t('insights:analytics.leaderboards.columns.id')}</th>
                    <th className="pb-2 pr-2">{t('insights:analytics.leaderboards.columns.title')}</th>
                    <th className="pb-2 pr-2">{t('insights:analytics.leaderboards.columns.revenueGross')}</th>
                    <th className="pb-2 pr-2">{t('insights:analytics.leaderboards.columns.status')}</th>
                    <th className="pb-2">{t('insights:analytics.leaderboards.columns.organizer')}</th>
                  </tr>
                </thead>
                <tbody>
                  {boards.data.events.map((row) => (
                    <tr key={row.id} className="border-t border-ink-10">
                      <td className="py-2 pr-2 font-mono text-[12px] text-ink-60">{row.code || empty}</td>
                      <td className="py-2 pr-2 font-mono text-[12px] text-ink-60">{row.id}</td>
                      <td className="py-2 pr-2 font-semibold text-ink">{row.title}</td>
                      <td className="py-2 pr-2 font-mono text-ink-60">{row.revenueGross}</td>
                      <td className="py-2 pr-2 capitalize text-ink-60">{row.status}</td>
                      <td className="py-2 font-mono text-[12px] text-ink-60">{row.organizerId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-ink-10 shadow-card-sm">
          <CardHeader>
            <CardTitle className="text-lg">{t('insights:analytics.leaderboards.topOrganizersTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="admin-table-scroll">
            {boards.data.organizers.length === 0 ? (
              <p className="py-8 text-center text-[14px] text-ink-60">
                {t('insights:analytics.leaderboards.noOrganizers')}
              </p>
            ) : (
              <table className="w-full min-w-[400px] text-left text-[13px]">
                <thead className="text-[11px] font-bold uppercase text-ink-40">
                  <tr>
                    <th className="pb-2 pr-2">{t('insights:analytics.leaderboards.columns.name')}</th>
                    <th className="pb-2">{t('insights:analytics.leaderboards.columns.revenueGross')}</th>
                  </tr>
                </thead>
                <tbody>
                  {boards.data.organizers.map((row) => (
                    <tr key={row.organizerId} className="border-t border-ink-10">
                      <td className="py-2 pr-2 font-semibold text-ink">{row.displayName}</td>
                      <td className="py-2 font-mono text-ink-60">
                        {formatSarCompact(row.totalRevenueGross, locale)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
