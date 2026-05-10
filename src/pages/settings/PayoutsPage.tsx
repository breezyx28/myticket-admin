import { ListFiltersBar } from '@/components/admin/ListFiltersBar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { filterSelectClassName } from '@/lib/adminFilters';
import { notifyError, notifySuccess } from '@/lib/notify';
import { rowMatchesSearch } from '@/lib/listQuery';
import type { PayoutStatus } from '@/schemas/payout.schema';
import {
  useApprovePayoutMutation,
  useGetPayoutsQuery,
  useMarkPayoutFailedMutation,
  useMarkPayoutPaidMutation,
  useMarkPayoutProcessingMutation,
  useRejectPayoutMutation,
} from '@/services/adminApi';
import { useMemo, useState } from 'react';

export function PayoutsPage() {
  const { data, isLoading } = useGetPayoutsQuery();
  const [approve] = useApprovePayoutMutation();
  const [reject] = useRejectPayoutMutation();
  const [markProcessing] = useMarkPayoutProcessingMutation();
  const [markPaid] = useMarkPayoutPaidMutation();
  const [markFailed] = useMarkPayoutFailedMutation();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | PayoutStatus>('all');
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return (data ?? []).filter((row) => {
      if (status !== 'all' && row.status !== status) return false;
      return rowMatchesSearch(search, [
        row.id,
        row.organizerName,
        row.eventTitle,
        row.reference,
        row.status,
      ]);
    });
  }, [data, search, status]);

  const busy = busyId !== null;

  async function runAction(id: string, okMsg: string, exec: () => Promise<unknown>) {
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

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-40">Platform</p>
        <h1 className="text-3xl font-extrabold text-ink">Organizer payouts</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-ink-60">
          Queue from <span className="font-mono text-ink">GET /api/v1/admin/finance/payouts</span> with the Postman
          lifecycle actions (approve → processing → paid / failed, or reject). Reject may include an optional{' '}
          <span className="font-mono text-ink">reason</span> in the JSON body; an empty{' '}
          <span className="font-mono text-ink">{'{}'}</span> is valid.
        </p>
      </div>

      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">Payouts</CardTitle>
        </CardHeader>
        <CardContent>
          <ListFiltersBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search id, organizer, event, reference…"
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
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="rejected">Rejected</option>
              <option value="unknown">Other</option>
            </select>
          </ListFiltersBar>
          {isLoading ? <p className="text-sm text-ink-60">Loading…</p> : null}
          {!isLoading && filtered.length === 0 ? (
            <p className="mb-3 text-sm font-semibold text-ink-60">No payouts match your search and filters.</p>
          ) : null}
          <div className="admin-table-scroll">
            <table className="w-full min-w-[960px] text-left text-[14px]">
              <thead className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
                <tr>
                  <th className="px-4 py-3">Payout</th>
                  <th className="px-4 py-3">Organizer</th>
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Amount (SAR)</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} className="border-t border-ink-10 hover:bg-surface-tint">
                    <td className="px-4 py-3 font-mono text-[13px] font-semibold text-ink">{row.id}</td>
                    <td className="px-4 py-3 font-medium text-ink">{row.organizerName}</td>
                    <td className="px-4 py-3 text-ink-60">{row.eventTitle ?? '—'}</td>
                    <td className="px-4 py-3 capitalize text-ink-60">{row.status}</td>
                    <td className="px-4 py-3 font-mono text-ink">{row.amountSar.toLocaleString()}</td>
                    <td className="px-4 py-3 text-[13px] text-ink-60">
                      {new Date(row.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex max-w-[320px] flex-wrap gap-1.5">
                        {row.status === 'pending' ? (
                          <>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={busy}
                              loading={busyId === row.id}
                              onClick={() => void runAction(row.id, 'Payout approved.', () => approve(row.id).unwrap())}
                            >
                              Approve
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="danger"
                              disabled={busy}
                              loading={busyId === row.id}
                              onClick={() => {
                                if (!window.confirm('Reject this payout?')) return;
                                const reason = window.prompt('Rejection reason (optional):', '')?.trim();
                                void runAction(row.id, 'Payout rejected.', () =>
                                  reject({ id: row.id, reason: reason || undefined }).unwrap()
                                );
                              }}
                            >
                              Reject
                            </Button>
                          </>
                        ) : null}
                        {row.status === 'approved' ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={busy}
                            loading={busyId === row.id}
                            onClick={() =>
                              void runAction(row.id, 'Marked as processing.', () =>
                                markProcessing(row.id).unwrap()
                              )
                            }
                          >
                            Mark processing
                          </Button>
                        ) : null}
                        {row.status === 'processing' ? (
                          <>
                            <Button
                              type="button"
                              size="sm"
                              variant="dark"
                              disabled={busy}
                              loading={busyId === row.id}
                              onClick={() =>
                                void runAction(row.id, 'Marked as paid.', () => markPaid(row.id).unwrap())
                              }
                            >
                              Mark paid
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="danger"
                              disabled={busy}
                              loading={busyId === row.id}
                              onClick={() => {
                                if (!window.confirm('Mark payout as failed?')) return;
                                void runAction(row.id, 'Marked as failed.', () => markFailed(row.id).unwrap());
                              }}
                            >
                              Mark failed
                            </Button>
                          </>
                        ) : null}
                        {row.status === 'paid' || row.status === 'failed' || row.status === 'rejected' ? (
                          <span className="text-[12px] text-ink-40">—</span>
                        ) : null}
                        {row.status === 'unknown' ? (
                          <span className="text-[12px] text-ink-40">Review in API</span>
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
