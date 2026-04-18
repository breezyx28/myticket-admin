import { setRevenueChartRange } from '@/app/analyticsUiSlice';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

function formatLeaderMetric(row: { value: number; metric: string }) {
  const m = row.metric.toLowerCase();
  if (m.includes('sar') || m.includes('revenue')) return formatSarCompact(row.value);
  return `${row.value.toLocaleString()} ${row.metric}`;
}

export function AnalyticsPage() {
  const dispatch = useAppDispatch();
  const revenueChartRange = useAppSelector((s) => s.analyticsUi.revenueChartRange);
  const fin = useGetFinancialAnalyticsQuery(revenueChartRange);
  const counters = useGetPlatformCountersQuery();
  const boards = useGetLeaderboardsQuery();

  if (fin.isLoading || counters.isLoading || boards.isLoading) return <p className="text-ink-60">Loading…</p>;
  if (!fin.data || !counters.data || !boards.data) return null;

  const breakdownChart = fin.data.revenueBreakdownByCategory.map((row) => ({
    key: row.categoryKey,
    label: row.label,
    revenueSar: row.revenueSar,
  }));

  return (
    <div className="space-y-10">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-40">Insights</p>
        <h1 className="text-3xl font-extrabold text-ink">Analytics</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-ink-60">
          Sprint 4: period selector drives the revenue trend (mock series). Totals stay platform-wide; the chart reflects
          the selected window.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[12px] font-semibold text-ink-60">Revenue chart range</span>
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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatBubble
          label="Platform revenue (all-time mock)"
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

      <Card className="rounded-3xl border-ink-10 shadow-card-md">
        <CardHeader>
          <CardTitle className="text-lg">Revenue trend ({revenueChartRange})</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            className="h-[320px] w-full"
            config={{
              revenueSar: { label: 'Revenue SAR', color: 'var(--color-coral)' },
            }}
          >
            <AreaChart data={fin.data.revenueByDay} margin={{ left: 12, right: 12 }}>
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
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-ink-10 shadow-card-md">
        <CardHeader>
          <CardTitle className="text-lg">Revenue by category (mock breakdown)</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-3xl border-ink-10 shadow-card-sm">
          <CardHeader>
            <CardTitle className="text-lg">Users by role</CardTitle>
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
          </CardHeader>
          <CardContent className="space-y-2 text-[14px] text-ink-60">
            <p>Active: {counters.data.eventsByStatus.active}</p>
            <p>Ended: {counters.data.eventsByStatus.ended}</p>
            <p>Cancelled: {counters.data.eventsByStatus.cancelled}</p>
            <p>Archived: {counters.data.eventsByStatus.archived}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {(['topEvents', 'topOrganizers', 'topCategories'] as const).map((key) => (
          <Card key={key} className="rounded-3xl border-ink-10 shadow-card-sm">
            <CardHeader>
              <CardTitle className="text-lg capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(boards.data?.[key] ?? []).map((row) => (
                <div key={row.id} className="flex items-center justify-between rounded-2xl bg-surface-tint px-3 py-2">
                  <span className="text-[13px] font-semibold text-ink">{row.label}</span>
                  <span className="font-mono text-[13px] text-ink-60">{formatLeaderMetric(row)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
