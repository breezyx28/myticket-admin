import { setRevenueChartRange } from '@/app/analyticsUiSlice';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatBubble } from '@/components/ui/StatBubble';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { formatSarAxis, formatSarCompact } from '@/lib/formatSar';
import {
  useGetFinancialAnalyticsQuery,
  useGetLeaderboardsQuery,
  useGetPlatformCountersQuery,
} from '@/services/adminApi';
import type { RevenueChartRange } from '@/types/analytics';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

const RANGE_OPTIONS: { id: RevenueChartRange; label: string }[] = [
  { id: '24h', label: '24 hours' },
  { id: '1d', label: '1 day' },
  { id: '7d', label: '7 days' },
  { id: '30d', label: '30 days' },
  { id: '90d', label: '90 days' },
];

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
  const raw = payload[0]?.value;
  const num = typeof raw === 'number' ? raw : Number(raw);
  return (
    <div className="rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
      {label != null ? <p className="mb-1 font-medium text-muted-foreground">{String(label)}</p> : null}
      <p className="font-mono font-semibold tabular-nums text-foreground">
        {formatSarCompact(Number.isFinite(num) ? num : 0)}
      </p>
    </div>
  );
}

export function AnalyticsPage() {
  const dispatch = useAppDispatch();
  const revenueChartRange = useAppSelector((s) => s.analyticsUi.revenueChartRange);
  const fin = useGetFinancialAnalyticsQuery(revenueChartRange);
  const counters = useGetPlatformCountersQuery();
  const boards = useGetLeaderboardsQuery();

  if (fin.isLoading || counters.isLoading || boards.isLoading) return <p className="text-ink-60">Loading…</p>;
  if (!fin.data || !counters.data || !boards.data) return null;

  const breakdownChart = (fin.data.revenueBreakdownByCategory ?? []).map((row) => ({
    key: row.categoryKey,
    label: row.label,
    revenueSar: row.revenueSar,
  }));
  const revenueByDay = fin.data.revenueByDay ?? [];
  const hasTrend = revenueByDay.length > 0;
  const hasBreakdown = breakdownChart.length > 0;

  return (
    <div className="space-y-10">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-40">Insights</p>
        <h1 className="text-3xl font-extrabold text-ink">Analytics</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-ink-60">
          Financial totals use <span className="font-mono text-ink">GET /api/v1/admin/analytics/financial?range=…</span>
          . Charts fill when the API returns time series or category breakdown; otherwise an empty state is shown.
          Leaderboards use <span className="font-mono text-ink">GET …/analytics/leaderboards</span>.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[12px] font-semibold text-ink-60">Financial window</span>
        {RANGE_OPTIONS.map((opt) => (
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
          API window: <span className="font-mono text-ink">{fin.data.range ?? revenueChartRange}</span>
          {fin.data.since ? (
            <>
              {' '}
              · since <span className="font-mono text-ink">{fin.data.since}</span>
            </>
          ) : null}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatBubble
          label="Platform revenue (mapped)"
          value={formatSarCompact(fin.data.totalRevenueSar)}
          color="bg-ink text-white"
        />
        <StatBubble label="Fees collected" value={formatSarCompact(fin.data.platformFeesSar)} color="bg-lemon text-ink" />
        <StatBubble label="Refunds" value={formatSarCompact(fin.data.refundsSar)} color="bg-mint text-ink" />
        <StatBubble
          label="Payouts pending"
          value={formatSarCompact(fin.data.payoutsPendingSar)}
          color="bg-coral text-white"
        />
      </div>

      {fin.data.ordersPaidCount !== undefined || fin.data.ordersPaidTotalAmount !== undefined ? (
        <div className="grid gap-4 md:grid-cols-2">
          {fin.data.ordersPaidCount !== undefined ? (
            <StatBubble
              label="Orders paid (count)"
              value={fin.data.ordersPaidCount.toLocaleString()}
              color="bg-ink-5 text-ink"
            />
          ) : null}
          {fin.data.ordersPaidTotalAmount !== undefined ? (
            <StatBubble
              label="Orders paid (amount)"
              value={formatSarCompact(fin.data.ordersPaidTotalAmount)}
              color="bg-ink-5 text-ink"
            />
          ) : null}
        </div>
      ) : null}

      <Card className="rounded-3xl border-ink-10 shadow-card-md">
        <CardHeader>
          <CardTitle className="text-lg">Revenue trend ({revenueChartRange})</CardTitle>
          <CardDescription>Daily series when provided by the API.</CardDescription>
        </CardHeader>
        <CardContent>
          {hasTrend ? (
            <ChartContainer
              className="h-[320px] w-full"
              config={{
                revenueSar: { label: 'Revenue SAR', color: 'var(--color-coral)' },
              }}
            >
              <AreaChart data={revenueByDay} margin={{ left: 12, right: 12 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={56}
                  tickFormatter={(v) => formatSarAxis(Number(v))}
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
            <p className="py-12 text-center text-[14px] text-ink-60">No revenue-by-day series in this response.</p>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-ink-10 shadow-card-md">
        <CardHeader>
          <CardTitle className="text-lg">Revenue by category</CardTitle>
          <CardDescription>Populated when the API returns a breakdown array.</CardDescription>
        </CardHeader>
        <CardContent>
          {hasBreakdown ? (
            <ChartContainer
              className="h-[300px] w-full"
              config={{
                revenueSar: { label: 'Revenue SAR', color: 'var(--color-indigo)' },
              }}
            >
              <BarChart data={breakdownChart} layout="vertical" margin={{ left: 8, right: 12 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} tickFormatter={(v) => formatSarAxis(Number(v))} />
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
            <p className="py-12 text-center text-[14px] text-ink-60">No category breakdown in this response.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-3xl border-ink-10 shadow-card-sm">
          <CardHeader>
            <CardTitle className="text-lg">Users by role</CardTitle>
            <CardDescription>
              Derived from <span className="font-mono">GET /dashboard/counters</span> when the API returns only flat
              totals (role split may be partial until the backend adds breakdown fields).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-[14px] text-ink-60">
            <p>Guest: {counters.data.usersByRole.guest.toLocaleString()}</p>
            <p>Talent: {counters.data.usersByRole.talent.toLocaleString()}</p>
            <p>Vendor: {counters.data.usersByRole.vendor.toLocaleString()}</p>
            <p>Organizer: {counters.data.usersByRole.organizer.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-ink-10 shadow-card-sm">
          <CardHeader>
            <CardTitle className="text-lg">Events by status</CardTitle>
            <CardDescription>Mock-only — same note as users by role.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-[14px] text-ink-60">
            <p>Active: {counters.data.eventsByStatus.active}</p>
            <p>Ended: {counters.data.eventsByStatus.ended}</p>
            <p>Cancelled: {counters.data.eventsByStatus.cancelled}</p>
            <p>Archived: {counters.data.eventsByStatus.archived}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-3xl border-ink-10 shadow-card-sm">
          <CardHeader>
            <CardTitle className="text-lg">Top events (GMV)</CardTitle>
            {boards.data.generatedAt ? (
              <CardDescription className="font-mono text-[12px]">Generated {boards.data.generatedAt}</CardDescription>
            ) : null}
          </CardHeader>
          <CardContent className="admin-table-scroll">
            {boards.data.events.length === 0 ? (
              <p className="py-8 text-center text-[14px] text-ink-60">No events in this leaderboard response.</p>
            ) : (
              <table className="w-full min-w-[640px] text-left text-[13px]">
                <thead className="text-[11px] font-bold uppercase text-ink-40">
                  <tr>
                    <th className="pb-2 pr-2">Code</th>
                    <th className="pb-2 pr-2">Id</th>
                    <th className="pb-2 pr-2">Title</th>
                    <th className="pb-2 pr-2">Revenue gross</th>
                    <th className="pb-2 pr-2">Status</th>
                    <th className="pb-2">Organizer</th>
                  </tr>
                </thead>
                <tbody>
                  {boards.data.events.map((row) => (
                    <tr key={row.id} className="border-t border-ink-10">
                      <td className="py-2 pr-2 font-mono text-[12px] text-ink-60">{row.code || '—'}</td>
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
            <CardTitle className="text-lg">Top organizers (GMV)</CardTitle>
          </CardHeader>
          <CardContent className="admin-table-scroll">
            {boards.data.organizers.length === 0 ? (
              <p className="py-8 text-center text-[14px] text-ink-60">No organizer rows in this response.</p>
            ) : (
              <table className="w-full min-w-[400px] text-left text-[13px]">
                <thead className="text-[11px] font-bold uppercase text-ink-40">
                  <tr>
                    <th className="pb-2 pr-2">Name</th>
                    <th className="pb-2">Revenue gross</th>
                  </tr>
                </thead>
                <tbody>
                  {boards.data.organizers.map((row) => (
                    <tr key={row.organizerId} className="border-t border-ink-10">
                      <td className="py-2 pr-2 font-semibold text-ink">{row.displayName}</td>
                      <td className="py-2 font-mono text-ink-60">{formatSarCompact(row.totalRevenueGross)}</td>
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
