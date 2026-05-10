import { ListFiltersBar } from '@/components/admin/ListFiltersBar';
import { filterSelectClassName } from '@/lib/adminFilters';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { rowMatchesSearch } from '@/lib/listQuery';
import { notifyError, notifySuccess } from '@/lib/notify';
import type { ListingModerationRow } from '@/schemas/moderation.schema';
import {
  useClaimListingModerationMutation,
  useEscalateListingModerationMutation,
  useGetListingModerationQuery,
  useMarkListingModerationReviewedMutation,
  useRejectListingModerationMutation,
  useReleaseListingModerationMutation,
} from '@/services/adminApi';
import { useMemo, useState } from 'react';

export function ListingsPage() {
  const { data, isLoading } = useGetListingModerationQuery();
  const [markReviewed, markState] = useMarkListingModerationReviewedMutation();
  const [claim, claimState] = useClaimListingModerationMutation();
  const [release, releaseState] = useReleaseListingModerationMutation();
  const [reject, rejectState] = useRejectListingModerationMutation();
  const [escalate, escalateState] = useEscalateListingModerationMutation();
  const [search, setSearch] = useState('');
  const [kind, setKind] = useState<'all' | ListingModerationRow['kind']>('all');
  const [status, setStatus] = useState<'all' | ListingModerationRow['status']>('all');

  const filtered = useMemo(() => {
    return (data ?? []).filter((row) => {
      if (kind !== 'all' && row.kind !== kind) return false;
      if (status !== 'all' && row.status !== status) return false;
      return rowMatchesSearch(search, [row.title, row.ownerEmail, row.flagReason, row.id]);
    });
  }, [data, search, kind, status]);

  const mutLoading =
    markState.isLoading ||
    claimState.isLoading ||
    releaseState.isLoading ||
    rejectState.isLoading ||
    escalateState.isLoading;

  async function run(okMsg: string, exec: () => Promise<unknown>) {
    try {
      await exec();
      notifySuccess(okMsg);
    } catch {
      notifyError('Action failed.');
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-40">Trust & safety</p>
        <h1 className="text-3xl font-extrabold text-ink">Listing moderation</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-ink-60">
          Queue aligned to Postman: <span className="font-mono text-ink">claim</span>,{' '}
          <span className="font-mono text-ink">release</span>, <span className="font-mono text-ink">approve</span>,{' '}
          <span className="font-mono text-ink">reject</span>, and <span className="font-mono text-ink">escalate</span>.
        </p>
      </div>
      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <ListFiltersBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search listing, owner, flag reason…"
            className="mb-4"
          >
            <select className={filterSelectClassName()} value={kind} onChange={(e) => setKind(e.target.value as typeof kind)}>
              <option value="all">All kinds</option>
              <option value="talent">Talent</option>
              <option value="vendor">Vendor</option>
            </select>
            <select
              className={filterSelectClassName()}
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
            >
              <option value="all">All queue states</option>
              <option value="queued">Queued</option>
              <option value="claimed">Claimed</option>
              <option value="actioned">Actioned</option>
              <option value="rejected">Rejected</option>
              <option value="escalated">Escalated</option>
            </select>
          </ListFiltersBar>
          {isLoading ? <p className="text-sm text-ink-60">Loading…</p> : null}
          {!isLoading && filtered.length === 0 ? (
            <p className="mb-3 text-sm font-semibold text-ink-60">No listings match your search and filters.</p>
          ) : null}
          <div className="admin-table-scroll">
            <table className="w-full min-w-[960px] text-left text-[14px]">
              <thead className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
                <tr>
                  <th className="px-4 py-3">Listing</th>
                  <th className="px-4 py-3">Kind</th>
                  <th className="px-4 py-3">Owner</th>
                  <th className="px-4 py-3">Flag</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} className="border-t border-ink-10 hover:bg-surface-tint">
                    <td className="px-4 py-3 font-semibold text-ink">{row.title}</td>
                    <td className="px-4 py-3 capitalize text-ink-60">{row.kind}</td>
                    <td className="px-4 py-3 text-ink-60">{row.ownerEmail}</td>
                    <td className="max-w-[200px] px-4 py-3 text-[13px] text-ink-60">{row.flagReason}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-ink-5 px-2 py-0.5 text-[11px] font-bold uppercase text-ink-60">
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex flex-wrap justify-end gap-1.5">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={row.status !== 'queued' || mutLoading}
                          loading={claimState.isLoading && claimState.originalArgs === row.id}
                          onClick={() => run('Claimed.', () => claim(row.id).unwrap())}
                        >
                          Claim
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={row.status !== 'claimed' || mutLoading}
                          loading={releaseState.isLoading && releaseState.originalArgs === row.id}
                          onClick={() => run('Released.', () => release(row.id).unwrap())}
                        >
                          Release
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={mutLoading || (row.status !== 'queued' && row.status !== 'claimed')}
                          loading={rejectState.isLoading && rejectState.originalArgs === row.id}
                          onClick={() => run('Rejected.', () => reject(row.id).unwrap())}
                        >
                          Reject
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={mutLoading || (row.status !== 'queued' && row.status !== 'claimed')}
                          loading={escalateState.isLoading && escalateState.originalArgs === row.id}
                          onClick={() => run('Escalated.', () => escalate(row.id).unwrap())}
                        >
                          Escalate
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="dark"
                          disabled={
                            (row.status !== 'queued' && row.status !== 'claimed') || mutLoading
                          }
                          loading={markState.isLoading && markState.originalArgs === row.id}
                          onClick={() => run('Approved / reviewed.', () => markReviewed(row.id).unwrap())}
                        >
                          Approve
                        </Button>
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
