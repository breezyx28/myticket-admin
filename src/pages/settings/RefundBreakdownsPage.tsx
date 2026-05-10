import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetRefundBreakdownsQuery } from '@/services/adminApi';
import { Link } from 'react-router-dom';

export function RefundBreakdownsPage() {
  const q = useGetRefundBreakdownsQuery();

  if (q.isLoading) return <p className="text-ink-60">Loading…</p>;
  if (!q.data) return <p className="text-ink-60">No data.</p>;

  const { rows, totalRefundedSar } = q.data;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-40">Platform</p>
        <h1 className="text-3xl font-extrabold text-ink">Refund breakdowns</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-ink-60">
          Aggregated refund volume from <span className="font-mono text-ink">GET /api/v1/admin/finance/refund-breakdowns</span>.
          Row shape is normalized from common Laravel list patterns; confirm field names with your API when going live.
        </p>
      </div>

      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">Total refunded (reported)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-mono text-4xl font-black text-ink">{totalRefundedSar.toLocaleString()} SAR</p>
          <p className="mt-2 text-[13px] text-ink-60">
            If the API omits a total, this figure is the sum of the breakdown rows below.
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg">By segment</CardTitle>
          <Link to="/refunds" className="text-[13px] font-semibold text-coral hover:underline">
            View refund requests →
          </Link>
        </CardHeader>
        <CardContent>
          <div className="admin-table-scroll">
            <table className="w-full min-w-[560px] text-left text-[14px]">
              <thead className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
                <tr>
                  <th className="px-4 py-3">Segment</th>
                  <th className="px-4 py-3">Refunds</th>
                  <th className="px-4 py-3">Amount (SAR)</th>
                  <th className="px-4 py-3">Share</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const share = totalRefundedSar > 0 ? (row.amountSar / totalRefundedSar) * 100 : 0;
                  return (
                    <tr key={row.key} className="border-t border-ink-10 hover:bg-surface-tint">
                      <td className="px-4 py-3 font-medium text-ink">{row.label}</td>
                      <td className="px-4 py-3 font-mono text-ink-60">{row.refundCount}</td>
                      <td className="px-4 py-3 font-mono text-ink">{row.amountSar.toLocaleString()}</td>
                      <td className="px-4 py-3 text-ink-60">{share.toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
