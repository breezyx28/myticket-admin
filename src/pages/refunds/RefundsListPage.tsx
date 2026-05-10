import { ListFiltersBar } from '@/components/admin/ListFiltersBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { filterSelectClassName } from '@/lib/adminFilters';
import { rowMatchesSearch } from '@/lib/listQuery';
import type { AdminRefundStatus } from '@/schemas/refund.schema';
import { useGetRefundsQuery } from '@/services/adminApi';
import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';

function statusLabel(s: AdminRefundStatus): string {
  return s === 'unknown' ? 'Other' : s;
}

export function RefundsListPage() {
  const { data, isLoading } = useGetRefundsQuery();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | AdminRefundStatus>('all');

  const filtered = useMemo(() => {
    return (data ?? []).filter((row) => {
      if (status !== 'all' && row.status !== status) return false;
      return rowMatchesSearch(search, [
        row.id,
        row.orderId,
        row.requestedByLabel,
        row.eventTitle,
        row.reason,
        row.status,
      ]);
    });
  }, [data, search, status]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-40">Commerce</p>
        <h1 className="text-3xl font-extrabold text-ink">Refunds</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-ink-60">
          Refund requests and outcomes from <span className="font-mono text-ink">GET /api/v1/admin/refunds</span>. When an
          order link exists, open the order for force-refund and related context.
        </p>
      </div>
      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">All refunds</CardTitle>
        </CardHeader>
        <CardContent>
          <ListFiltersBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search id, order, requester, reason…"
            className="mb-4"
          >
            <select
              className={filterSelectClassName()}
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
              <option value="failed">Failed</option>
              <option value="unknown">Other</option>
            </select>
          </ListFiltersBar>
          {isLoading ? <p className="text-sm text-ink-60">Loading…</p> : null}
          {!isLoading && filtered.length === 0 ? (
            <p className="mb-3 text-sm font-semibold text-ink-60">No refunds match your search and filters.</p>
          ) : null}
          <div className="admin-table-scroll">
            <table className="w-full min-w-[800px] text-left text-[14px]">
              <thead className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
                <tr>
                  <th className="px-4 py-3">Refund</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Amount (SAR)</th>
                  <th className="px-4 py-3">Requester</th>
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Order</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} className="border-t border-ink-10 hover:bg-surface-tint">
                    <td className="px-4 py-3 font-mono text-[13px] font-semibold text-ink">{row.id}</td>
                    <td className="px-4 py-3 capitalize text-ink-60">{statusLabel(row.status)}</td>
                    <td className="px-4 py-3 font-mono text-ink">{row.amountSar.toLocaleString()}</td>
                    <td className="px-4 py-3 text-ink-60">{row.requestedByLabel}</td>
                    <td className="px-4 py-3 text-ink-60">{row.eventTitle ?? '—'}</td>
                    <td className="max-w-[220px] px-4 py-3 text-[13px] text-ink-60">{row.reason}</td>
                    <td className="px-4 py-3">
                      {row.orderId ? (
                        <Link to={`/orders/${row.orderId}`} className="font-mono font-semibold text-coral hover:underline">
                          {row.orderId}
                        </Link>
                      ) : (
                        <span className="text-ink-40">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
