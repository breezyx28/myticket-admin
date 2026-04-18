import { ListFiltersBar } from '@/components/admin/ListFiltersBar';
import { filterSelectClassName } from '@/lib/adminFilters';
import { AdminEventCard } from '@/components/events/AdminEventCard';
import { EventStatusBadge } from '@/components/events/EventStatusBadge';
import { AdminSection } from '@/components/layout/AdminSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatSarCompact } from '@/lib/formatSar';
import { rowMatchesSearch } from '@/lib/listQuery';
import type { AdminEventRow } from '@/schemas/event.schema';
import { useGetEventsQuery } from '@/services/adminApi';
import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';

export function EventsListPage() {
  const { data, isLoading } = useGetEventsQuery();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | AdminEventRow['status']>('all');
  const [category, setCategory] = useState<string>('all');

  const categories = useMemo(() => {
    const s = new Set((data ?? []).map((e) => e.category));
    return Array.from(s).sort();
  }, [data]);

  const filtered = useMemo(() => {
    const rows = data ?? [];
    return rows.filter((e) => {
      if (status !== 'all' && e.status !== status) return false;
      if (category !== 'all' && e.category !== category) return false;
      return rowMatchesSearch(search, [e.title, e.organizerName, e.city, e.category, e.venueName, e.id]);
    });
  }, [data, search, status, category]);

  return (
    <div className="space-y-12">
      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-ink-40">Events</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">Event catalog</h1>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-60">
          Visual-first catalog with the same professional cards used on the overview dashboard. Scroll the table for
          dense audits and CSV prep workflows.
        </p>
      </div>

      <AdminSection
        eyebrow="Visual catalog"
        title="Featured layout"
        description="Each tile highlights lifecycle state, venue, revenue, and health metrics so operators do not have to open a record for basic triage."
      >
        <ListFiltersBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search title, organizer, venue, city…"
          className="mb-6"
        >
          <select className={filterSelectClassName()} value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="ended">Ended</option>
            <option value="cancelled">Cancelled</option>
            <option value="archived">Archived</option>
          </select>
          <select className={filterSelectClassName()} value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </ListFiltersBar>
        {isLoading ? <p className="text-sm text-ink-60">Loading…</p> : null}
        {!isLoading && filtered.length === 0 ? (
          <p className="text-sm font-semibold text-ink-60">No events match your search and filters.</p>
        ) : null}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2">
          {filtered.map((row) => (
            <AdminEventCard key={row.id} event={row} />
          ))}
        </div>
      </AdminSection>

      <AdminSection
        divider
        eyebrow="Operations"
        title="Tabular export view"
        description="Compact rows for copy/paste into spreadsheets. Status chips mirror the card treatment for consistency."
      >
        <Card className="rounded-3xl border-ink-10 shadow-card-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold">All events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="admin-table-scroll">
              <table className="w-full min-w-[880px] text-left text-[14px]">
                <thead className="text-[11px] font-extrabold uppercase tracking-wide text-ink-40">
                  <tr>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Organizer</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Starts</th>
                    <th className="px-4 py-3">Fill</th>
                    <th className="px-4 py-3">Revenue</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => {
                    const fill = Math.min(100, Math.round((row.ticketsSold / row.capacity) * 100));
                    return (
                      <tr key={row.id} className="border-t border-ink-10 hover:bg-surface-tint">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={row.coverImageUrl}
                              alt=""
                              className="h-10 w-14 shrink-0 rounded-lg object-cover ring-1 ring-ink-10"
                            />
                            <span className="font-bold text-ink">{row.title}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-ink-60">{row.organizerName}</td>
                        <td className="px-4 py-3">
                          <EventStatusBadge status={row.status} />
                        </td>
                        <td className="px-4 py-3 text-[13px] font-semibold text-ink-60">
                          {new Date(row.startsAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={
                              fill >= 88 ? 'font-mono font-black text-mint' : fill >= 50 ? 'font-mono font-bold text-ink' : 'font-mono font-bold text-amber'
                            }
                          >
                            {fill}%
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-[13px] font-bold text-coral">{formatSarCompact(row.revenueSar)}</td>
                        <td className="px-4 py-3 text-right">
                          <Link to={`/events/${row.id}`} className="font-bold text-coral hover:underline">
                            Open
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </AdminSection>
    </div>
  );
}
