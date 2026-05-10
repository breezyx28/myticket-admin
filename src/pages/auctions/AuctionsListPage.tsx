import { ListFiltersBar } from '@/components/admin/ListFiltersBar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { filterSelectClassName } from '@/lib/adminFilters';
import { notifyError, notifySuccess } from '@/lib/notify';
import { rowMatchesSearch } from '@/lib/listQuery';
import type { AdminAuctionStatus } from '@/schemas/auction.schema';
import {
  useCancelAuctionMutation,
  useFinalizeAuctionMutation,
  useFreezeAuctionMutation,
  useGetAuctionsQuery,
} from '@/services/adminApi';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

export function AuctionsListPage() {
  const { data, isLoading } = useGetAuctionsQuery();
  const [freeze] = useFreezeAuctionMutation();
  const [cancel] = useCancelAuctionMutation();
  const [finalize] = useFinalizeAuctionMutation();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | AdminAuctionStatus>('all');
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return (data ?? []).filter((row) => {
      if (status !== 'all' && row.status !== status) return false;
      return rowMatchesSearch(search, [row.id, row.title, row.organizerName, row.status]);
    });
  }, [data, search, status]);

  const busy = busyId !== null;

  async function run(id: string, okMsg: string, exec: () => Promise<unknown>) {
    setBusyId(id);
    try {
      await exec();
      notifySuccess(okMsg);
    } catch {
      notifyError('Action failed.');
    } finally {
      setBusyId(null);
    }
  }

  function canFreeze(s: AdminAuctionStatus): boolean {
    return s === 'draft' || s === 'scheduled' || s === 'live' || s === 'paused';
  }

  function canCancel(s: AdminAuctionStatus): boolean {
    return s !== 'cancelled' && s !== 'finalized' && s !== 'ended';
  }

  function canFinalize(s: AdminAuctionStatus): boolean {
    return s === 'live';
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-40">Commerce</p>
        <h1 className="text-3xl font-extrabold text-ink">Auctions</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-ink-60">
          Admin auction list from <span className="font-mono text-ink">GET /api/v1/admin/auctions</span> with{' '}
          <span className="font-mono text-ink">freeze</span>, <span className="font-mono text-ink">cancel</span>, and{' '}
          <span className="font-mono text-ink">finalize</span> actions (empty <span className="font-mono text-ink">POST</span> bodies). Per
          API contract, finalize is only valid when the listing is <span className="font-mono text-ink">active</span> (shown here as{' '}
          <span className="font-mono text-ink">live</span>); otherwise expect <span className="font-mono text-ink">422</span>.
        </p>
      </div>

      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">All auctions</CardTitle>
        </CardHeader>
        <CardContent>
          <ListFiltersBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search id, title, organizer, status…"
            className="mb-4"
          >
            <select
              className={filterSelectClassName()}
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
            >
              <option value="all">All statuses</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="live">Live</option>
              <option value="paused">Paused</option>
              <option value="frozen">Frozen</option>
              <option value="ended">Ended</option>
              <option value="cancelled">Cancelled</option>
              <option value="finalized">Finalized</option>
              <option value="sold">Sold</option>
              <option value="expired">Expired</option>
              <option value="removed">Removed</option>
              <option value="unknown">Other</option>
            </select>
          </ListFiltersBar>
          {isLoading ? <p className="text-sm text-ink-60">Loading…</p> : null}
          {!isLoading && filtered.length === 0 ? (
            <p className="mb-3 text-sm font-semibold text-ink-60">No auctions match your search and filters.</p>
          ) : null}
          <div className="admin-table-scroll">
            <table className="w-full min-w-[900px] text-left text-[14px]">
              <thead className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
                <tr>
                  <th className="px-4 py-3">Auction</th>
                  <th className="px-4 py-3">Organizer</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">High bid (SAR)</th>
                  <th className="px-4 py-3">Ends</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} className="border-t border-ink-10 hover:bg-surface-tint">
                    <td className="px-4 py-3">
                      <p className="font-mono text-[12px] font-semibold text-ink-60">{row.id}</p>
                      <Link to={`/auctions/${encodeURIComponent(row.id)}`} className="font-medium text-coral hover:underline">
                        {row.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-ink-60">{row.organizerName}</td>
                    <td className="px-4 py-3 capitalize text-ink-60">{row.status}</td>
                    <td className="px-4 py-3 font-mono text-ink">{row.highBidSar.toLocaleString()}</td>
                    <td className="px-4 py-3 text-[13px] text-ink-60">
                      {new Date(row.endsAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex max-w-[280px] flex-wrap gap-1.5">
                        {canFreeze(row.status) ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={busy}
                            loading={busyId === row.id}
                            onClick={() => void run(row.id, 'Auction frozen.', () => freeze(row.id).unwrap())}
                          >
                            Freeze
                          </Button>
                        ) : null}
                        {canCancel(row.status) ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="danger"
                            disabled={busy}
                            loading={busyId === row.id}
                            onClick={() => {
                              if (!window.confirm('Cancel this auction?')) return;
                              void run(row.id, 'Auction cancelled.', () => cancel(row.id).unwrap());
                            }}
                          >
                            Cancel
                          </Button>
                        ) : null}
                        {canFinalize(row.status) ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="dark"
                            disabled={busy}
                            loading={busyId === row.id}
                            onClick={() => {
                              if (!window.confirm('Finalize this auction?')) return;
                              void run(row.id, 'Auction finalized.', () => finalize(row.id).unwrap());
                            }}
                          >
                            Finalize
                          </Button>
                        ) : null}
                        {!canFreeze(row.status) && !canCancel(row.status) && !canFinalize(row.status) ? (
                          <span className="text-[12px] text-ink-40">—</span>
                        ) : null}
                      </div>
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
