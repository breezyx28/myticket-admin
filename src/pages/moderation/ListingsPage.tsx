import { ListFiltersBar } from '@/components/admin/ListFiltersBar';
import { filterSelectClassName } from '@/lib/adminFilters';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { rowMatchesSearch } from '@/lib/listQuery';
import { notifyError, notifySuccess } from '@/lib/notify';
import type { ListingModerationRow } from '@/schemas/moderation.schema';
import { useGetListingModerationQuery, useMarkListingModerationReviewedMutation } from '@/services/adminApi';
import { useMemo, useState } from 'react';

export function ListingsPage() {
  const { data, isLoading } = useGetListingModerationQuery();
  const [markReviewed, markState] = useMarkListingModerationReviewedMutation();
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

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-40">Trust & safety</p>
        <h1 className="text-3xl font-extrabold text-ink">Listing moderation</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-ink-60">
          Sprint 5: review marketplace talent/vendor listings. Marking reviewed updates mock state only.
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
              <option value="actioned">Actioned</option>
            </select>
          </ListFiltersBar>
          {isLoading ? <p className="text-sm text-ink-60">Loading…</p> : null}
          {!isLoading && filtered.length === 0 ? (
            <p className="mb-3 text-sm font-semibold text-ink-60">No listings match your search and filters.</p>
          ) : null}
          <div className="admin-table-scroll">
            <table className="w-full min-w-[720px] text-left text-[14px]">
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
                      <span
                        className={
                          row.status === 'queued'
                            ? 'rounded-full bg-amber/30 px-2 py-0.5 text-[11px] font-bold uppercase text-ink'
                            : 'rounded-full bg-lime/40 px-2 py-0.5 text-[11px] font-bold uppercase text-ink'
                        }
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={row.status !== 'queued' || markState.isLoading}
                        loading={markState.isLoading && markState.originalArgs === row.id}
                        onClick={async () => {
                          try {
                            await markReviewed(row.id).unwrap();
                            notifySuccess('Listing marked reviewed (mock).');
                          } catch {
                            notifyError('Could not update listing.');
                          }
                        }}
                      >
                        Mark reviewed
                      </Button>
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
