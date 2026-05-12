import { ListFiltersBar } from '@/components/admin/ListFiltersBar';
import { RowActionsMenu } from '@/components/admin/RowActionsMenu';
import { filterSelectClassName } from '@/lib/adminFilters';
import { listingModerationStatusBadgeClass } from '@/lib/listingModerationStatusUi';
import { cn } from '@/lib/utils';
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
      return rowMatchesSearch(search, [
        row.title,
        row.ownerEmail,
        row.flagReason,
        row.description,
        row.id,
      ]);
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
                  <th className="w-14 px-2 py-3 text-right" aria-label="Actions column" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => {
                  const rowBusy =
                    (claimState.isLoading && claimState.originalArgs === row.id && 'claim') ||
                    (releaseState.isLoading && releaseState.originalArgs === row.id && 'release') ||
                    (rejectState.isLoading && rejectState.originalArgs === row.id && 'reject') ||
                    (escalateState.isLoading && escalateState.originalArgs === row.id && 'escalate') ||
                    (markState.isLoading && markState.originalArgs === row.id && 'approve') ||
                    null;
                  const canClaimRelease = row.status === 'queued' || row.status === 'claimed';
                  return (
                    <tr key={row.id} className="border-t border-ink-10 hover:bg-surface-tint">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-ink">{row.title}</p>
                        {row.description ? (
                          <p className="mt-1 line-clamp-2 max-w-md text-[12px] text-ink-50">{row.description}</p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 capitalize text-ink-60">{row.kind}</td>
                      <td className="px-4 py-3 text-ink-60">{row.ownerEmail}</td>
                      <td className="max-w-[200px] px-4 py-3 text-[13px] text-ink-60">{row.flagReason}</td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide',
                            listingModerationStatusBadgeClass(row.status),
                          )}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="px-2 py-3 text-right align-middle">
                        <RowActionsMenu
                          ariaLabel={`Actions for listing case ${row.id}`}
                          actions={[
                            {
                              key: 'claim',
                              label: 'Claim',
                              disabled: row.status !== 'queued' || mutLoading,
                              loading: rowBusy === 'claim',
                              onSelect: () => run('Claimed.', () => claim(row.id).unwrap()),
                            },
                            {
                              key: 'release',
                              label: 'Release',
                              disabled: row.status !== 'claimed' || mutLoading,
                              loading: rowBusy === 'release',
                              onSelect: () => run('Released.', () => release(row.id).unwrap()),
                            },
                            {
                              key: 'reject',
                              label: 'Reject',
                              disabled: mutLoading || !canClaimRelease,
                              loading: rowBusy === 'reject',
                              onSelect: () => run('Rejected.', () => reject(row.id).unwrap()),
                            },
                            {
                              key: 'escalate',
                              label: 'Escalate',
                              disabled: mutLoading || !canClaimRelease,
                              loading: rowBusy === 'escalate',
                              onSelect: () => run('Escalated.', () => escalate(row.id).unwrap()),
                            },
                            {
                              key: 'approve',
                              label: 'Approve',
                              disabled: !canClaimRelease || mutLoading,
                              loading: rowBusy === 'approve',
                              onSelect: () => run('Approved / reviewed.', () => markReviewed(row.id).unwrap()),
                            },
                          ]}
                        />
                      </td>
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
