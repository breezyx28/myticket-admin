import { ListFiltersBar } from '@/components/admin/ListFiltersBar';
import { filterSelectClassName } from '@/lib/adminFilters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { rowMatchesSearch } from '@/lib/listQuery';
import type { SupportThread } from '@/schemas/support.schema';
import { useGetSupportThreadsQuery } from '@/services/adminApi';
import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';

export function SupportInboxPage() {
  const { data, isLoading } = useGetSupportThreadsQuery();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | SupportThread['status']>('all');

  const filtered = useMemo(() => {
    return (data ?? []).filter((t) => {
      if (status !== 'all' && t.status !== status) return false;
      return rowMatchesSearch(search, [t.subject, t.userEmail, t.preview, t.id]);
    });
  }, [data, search, status]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-40">Support</p>
        <h1 className="text-3xl font-extrabold text-ink">Inbox</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-ink-60">
          Centralized threads from the main website — chat and async messages (mock).
        </p>
      </div>
      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">Open threads</CardTitle>
        </CardHeader>
        <CardContent>
          <ListFiltersBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search subject, email, preview…"
            className="mb-4"
          >
            <select
              className={filterSelectClassName()}
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
            >
              <option value="all">All statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </ListFiltersBar>
          {isLoading ? <p className="text-sm text-ink-60">Loading…</p> : null}
          {!isLoading && filtered.length === 0 ? (
            <p className="mb-3 text-sm font-semibold text-ink-60">No threads match your search and filters.</p>
          ) : null}
          <div className="space-y-2">
            {filtered.map((t) => (
              <Link
                key={t.id}
                to={`/support/${t.id}`}
                className="block rounded-2xl border border-ink-10 px-4 py-3 transition-colors hover:border-coral/40 hover:bg-surface-tint"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-ink">{t.subject}</p>
                  <span className="rounded-full bg-ink-5 px-2 py-0.5 text-[11px] font-bold uppercase text-ink-60">
                    {t.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="mt-1 text-[13px] text-ink-60">{t.userEmail}</p>
                <p className="mt-1 line-clamp-2 text-[13px] text-ink-40">{t.preview}</p>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
