import { ListFiltersBar } from '@/components/admin/ListFiltersBar';
import { filterSelectClassName } from '@/lib/adminFilters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { rowMatchesSearch } from '@/lib/listQuery';
import { useGetRatingsModerationQuery } from '@/services/adminApi';
import { useMemo, useState } from 'react';

export function RatingsPage() {
  const { data, isLoading } = useGetRatingsModerationQuery();
  const [search, setSearch] = useState('');
  const [minStars, setMinStars] = useState<'all' | '1' | '2' | '3' | '4' | '5'>('all');

  const filtered = useMemo(() => {
    return (data ?? []).filter((row) => {
      if (minStars !== 'all') {
        const n = Number(minStars);
        if (n === 5) {
          if (row.stars !== 5) return false;
        } else if (row.stars < n) {
          return false;
        }
      }
      return rowMatchesSearch(search, [row.targetLabel, row.authorEmail, row.comment, row.id]);
    });
  }, [data, search, minStars]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-40">Trust & safety</p>
        <h1 className="text-3xl font-extrabold text-ink">Ratings oversight</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-ink-60">
          Platform-wide ratings for abuse monitoring (read-only mock).
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
          </ListFiltersBar>
          {isLoading ? <p className="text-sm text-ink-60">Loading…</p> : null}
          {!isLoading && filtered.length === 0 ? (
            <p className="mb-3 text-sm font-semibold text-ink-60">No ratings match your search and filters.</p>
          ) : null}
          <div className="admin-table-scroll">
            <table className="w-full min-w-[640px] text-left text-[14px]">
              <thead className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
                <tr>
                  <th className="px-4 py-3">Target</th>
                  <th className="px-4 py-3">Author</th>
                  <th className="px-4 py-3">Stars</th>
                  <th className="px-4 py-3">Comment</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} className="border-t border-ink-10 hover:bg-surface-tint">
                    <td className="px-4 py-3 font-semibold text-ink">{row.targetLabel}</td>
                    <td className="px-4 py-3 text-ink-60">{row.authorEmail}</td>
                    <td className="px-4 py-3 font-mono text-ink">{row.stars}</td>
                    <td className="px-4 py-3 text-ink-60">{row.comment}</td>
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
