import { ListFiltersBar } from '@/components/admin/ListFiltersBar';
import { RowActionsMenu } from '@/components/admin/RowActionsMenu';
import { filterSelectClassName } from '@/lib/adminFilters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { rowMatchesSearch } from '@/lib/listQuery';
import { notifyError, notifySuccess } from '@/lib/notify';
import type { RatingRow } from '@/schemas/moderation.schema';
import {
  useDeleteRatingModerationMutation,
  useGetRatingsModerationQuery,
  useHideRatingModerationMutation,
  useRestoreRatingModerationMutation,
} from '@/services/adminApi';
import { Star } from 'lucide-react';
import { useMemo, useState } from 'react';

function StarRatingCell({ stars }: { stars: number }) {
  const n = Math.min(5, Math.max(1, stars));
  return (
    <div className="flex items-center gap-1.5">
      <span className="flex items-center gap-px" aria-hidden>
        {Array.from({ length: n }, (_, i) => (
          <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-500" strokeWidth={1.5} />
        ))}
      </span>
      <span className="font-mono text-[13px] font-semibold tabular-nums text-ink">{n}</span>
    </div>
  );
}

export function RatingsPage() {
  const { data, isLoading } = useGetRatingsModerationQuery();
  const [hide, hideState] = useHideRatingModerationMutation();
  const [restore, restoreState] = useRestoreRatingModerationMutation();
  const [del, delState] = useDeleteRatingModerationMutation();
  const [search, setSearch] = useState('');
  const [minStars, setMinStars] = useState<'all' | '1' | '2' | '3' | '4' | '5'>('all');
  const [mod, setMod] = useState<'all' | RatingRow['moderationState']>('all');

  const filtered = useMemo(() => {
    return (data ?? []).filter((row) => {
      if (mod !== 'all' && row.moderationState !== mod) return false;
      if (minStars !== 'all') {
        const n = Number(minStars);
        if (n === 5) {
          if (row.stars !== 5) return false;
        } else if (row.stars < n) {
          return false;
        }
      }
      return rowMatchesSearch(search, [
        row.targetLabel,
        row.authorEmail,
        row.comment,
        row.id,
        String(row.stars),
      ]);
    });
  }, [data, search, minStars, mod]);

  const mutBusy = hideState.isLoading || restoreState.isLoading || delState.isLoading;

  async function run(ok: string, fn: () => Promise<unknown>) {
    try {
      await fn();
      notifySuccess(ok);
    } catch {
      notifyError('Action failed.');
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-ink-40">Trust & safety</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">Ratings oversight</h1>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-60">
          Read from <span className="font-mono text-ink">GET /api/v1/admin/ratings</span>; hide, restore, and delete
          map to Postman POSTs on each rating id.
        </p>
      </div>
      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">Recent ratings</CardTitle>
        </CardHeader>
        <CardContent>
          <ListFiltersBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search target, author, comment…"
            className="mb-4"
          >
            <select
              className={filterSelectClassName()}
              value={minStars}
              onChange={(e) => setMinStars(e.target.value as typeof minStars)}
            >
              <option value="all">All star ratings</option>
              <option value="5">5 stars only</option>
              <option value="4">4+ stars</option>
              <option value="3">3+ stars</option>
              <option value="2">2+ stars</option>
              <option value="1">1+ stars</option>
            </select>
            <select
              className={filterSelectClassName()}
              value={mod}
              onChange={(e) => setMod(e.target.value as typeof mod)}
            >
              <option value="all">All moderation states</option>
              <option value="visible">Visible</option>
              <option value="hidden">Hidden</option>
              <option value="deleted">Deleted</option>
            </select>
          </ListFiltersBar>
          {isLoading ? <p className="text-sm text-ink-60">Loading…</p> : null}
          {!isLoading && filtered.length === 0 ? (
            <p className="mb-3 text-sm font-semibold text-ink-60">No ratings match your search and filters.</p>
          ) : null}
          <div className="admin-table-scroll">
            <table className="w-full min-w-[920px] text-left text-[14px]">
              <thead className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
                <tr>
                  <th className="px-4 py-3">Target</th>
                  <th className="px-4 py-3">Author</th>
                  <th className="px-4 py-3">Stars</th>
                  <th className="px-4 py-3">State</th>
                  <th className="px-4 py-3">Comment</th>
                  <th className="w-14 px-2 py-3 text-right" aria-label="Actions column" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => {
                  const rowBusy =
                    (hideState.isLoading && hideState.originalArgs === row.id && 'hide') ||
                    (restoreState.isLoading && restoreState.originalArgs === row.id && 'restore') ||
                    (delState.isLoading && delState.originalArgs === row.id && 'delete') ||
                    null;
                  return (
                    <tr key={row.id} className="border-t border-ink-10 hover:bg-surface-tint">
                      <td className="px-4 py-3 font-semibold text-ink">{row.targetLabel}</td>
                      <td className="px-4 py-3 text-ink-60">{row.authorEmail}</td>
                      <td className="px-4 py-3">
                        <StarRatingCell stars={row.stars} />
                      </td>
                      <td className="px-4 py-3 text-[12px] font-bold uppercase text-ink-60">{row.moderationState}</td>
                      <td className="max-w-[280px] px-4 py-3 text-ink-60">{row.comment}</td>
                      <td className="px-2 py-3 text-right align-middle">
                        <RowActionsMenu
                          ariaLabel={`Actions for rating ${row.id}`}
                          actions={[
                            {
                              key: 'hide',
                              label: 'Hide',
                              disabled: row.moderationState !== 'visible' || mutBusy,
                              loading: rowBusy === 'hide',
                              onSelect: () => run('Rating hidden.', () => hide(row.id).unwrap()),
                            },
                            {
                              key: 'restore',
                              label: 'Restore',
                              disabled: row.moderationState !== 'hidden' || mutBusy,
                              loading: rowBusy === 'restore',
                              onSelect: () => run('Rating restored.', () => restore(row.id).unwrap()),
                            },
                            {
                              key: 'delete',
                              label: 'Delete',
                              danger: true,
                              disabled: row.moderationState === 'deleted' || mutBusy,
                              loading: rowBusy === 'delete',
                              onSelect: () => run('Rating marked deleted.', () => del(row.id).unwrap()),
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
