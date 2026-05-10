import { ListFiltersBar } from '@/components/admin/ListFiltersBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { filterSelectClassName } from '@/lib/adminFilters';
import { rowMatchesSearch } from '@/lib/listQuery';
import type { AdminOrderStatus } from '@/schemas/order.schema';
import { useGetOrdersQuery } from '@/services/adminApi';
import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';

function statusLabel(s: AdminOrderStatus): string {
  return s === 'unknown' ? 'Other' : s.replace(/_/g, ' ');
}

export function OrdersListPage() {
  const { data, isLoading } = useGetOrdersQuery();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | AdminOrderStatus>('all');

  const filtered = useMemo(() => {
    return (data ?? []).filter((row) => {
      if (status !== 'all' && row.status !== status) return false;
      return rowMatchesSearch(search, [row.id, row.buyerLabel, row.eventTitle, row.status]);
    });
  }, [data, search, status]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-40">Commerce</p>
        <h1 className="text-3xl font-extrabold text-ink">Orders</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-ink-60">
          Ticket purchases across the platform. Refunds from this screen use the admin force-refund endpoint when API
          credentials are configured.
        </p>
      </div>
      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">All orders</CardTitle>
        </CardHeader>
        <CardContent>
          <ListFiltersBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search id, buyer, event, status…"
            className="mb-4"
          >
            <select
              className={filterSelectClassName()}
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
            >
              <option value="all">All statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="refunded">Refunded</option>
              <option value="cancelled">Cancelled</option>
              <option value="failed">Failed</option>
              <option value="unknown">Other</option>
            </select>
          </ListFiltersBar>
          {isLoading ? <p className="text-sm text-ink-60">Loading…</p> : null}
          {!isLoading && filtered.length === 0 ? (
            <p className="mb-3 text-sm font-semibold text-ink-60">No orders match your search and filters.</p>
          ) : null}
          <div className="admin-table-scroll">
            <table className="w-full min-w-[720px] text-left text-[14px]">
              <thead className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Buyer</th>
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Total (SAR)</th>
                  <th className="px-4 py-3">Tickets</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} className="border-t border-ink-10 hover:bg-surface-tint">
                    <td className="px-4 py-3 font-mono text-[13px] font-semibold text-ink">{row.id}</td>
                    <td className="px-4 py-3 text-ink-60">{row.buyerLabel}</td>
                    <td className="px-4 py-3 font-medium text-ink">{row.eventTitle}</td>
                    <td className="px-4 py-3 capitalize text-ink-60">{statusLabel(row.status)}</td>
                    <td className="px-4 py-3 font-mono text-ink">{row.totalSar.toLocaleString()}</td>
                    <td className="px-4 py-3 text-ink-60">{row.ticketCount}</td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/orders/${row.id}`} className="font-semibold text-coral hover:underline">
                        View
                      </Link>
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
