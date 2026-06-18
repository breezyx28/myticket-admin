import { ListFiltersBar } from '@/components/admin/ListFiltersBar';
import { filterSelectClassName } from '@/lib/adminFilters';
import { AdminEventCard } from '@/components/events/AdminEventCard';
import { EventStatusBadge } from '@/components/events/EventStatusBadge';
import { AdminSection } from '@/components/layout/AdminSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatSarCompact } from '@/lib/formatSar';
import { formatDateTime } from '@/lib/localeFormat';
import { getCurrentLocale } from '@/i18n';
import { eventCategoryLabel } from '@/lib/pickLocalizedField';
import { rowMatchesSearch } from '@/lib/listQuery';
import type { AdminEventRow } from '@/schemas/event.schema';
import { useGetEventsQuery } from '@/services/adminApi';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';

export function EventsListPage() {
  const { t } = useTranslation(['operations', 'common']);
  const locale = getCurrentLocale();
  const { data, isLoading } = useGetEventsQuery();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | AdminEventRow['status']>('all');
  const [category, setCategory] = useState<string>('all');

  const categories = useMemo(() => {
    const seen = new Map<string, string>();
    for (const e of data ?? []) {
      if (!e.category || seen.has(e.category)) continue;
      seen.set(e.category, eventCategoryLabel(e, locale));
    }
    return Array.from(seen.entries()).sort((a, b) => a[1].localeCompare(b[1], locale));
  }, [data, locale]);

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
        <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-ink-40">{t('operations:events.eyebrow')}</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">{t('operations:events.catalogTitle')}</h1>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-60">{t('operations:events.catalogDescription')}</p>
      </div>

      <AdminSection
        eyebrow={t('operations:events.visualCatalogEyebrow')}
        title={t('operations:events.visualCatalogTitle')}
        description={t('operations:events.visualCatalogDescription')}
      >
        <ListFiltersBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder={t('operations:events.searchPlaceholder')}
          className="mb-6"
        >
          <select className={filterSelectClassName()} value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
            <option value="all">{t('operations:events.allStatuses')}</option>
            <option value="active">{t('operations:events.status.active')}</option>
            <option value="ended">{t('operations:events.status.ended')}</option>
            <option value="cancelled">{t('operations:events.status.cancelled')}</option>
            <option value="archived">{t('operations:events.status.archived')}</option>
          </select>
          <select className={filterSelectClassName()} value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">{t('operations:events.allCategories')}</option>
            {categories.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </ListFiltersBar>
        {isLoading ? <p className="text-sm text-ink-60">{t('common:loading')}</p> : null}
        {!isLoading && filtered.length === 0 ? (
          <p className="text-sm font-semibold text-ink-60">{t('operations:events.noMatches')}</p>
        ) : null}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2">
          {filtered.map((row) => (
            <AdminEventCard key={row.id} event={row} />
          ))}
        </div>
      </AdminSection>

      <AdminSection
        divider
        eyebrow={t('operations:events.operationsEyebrow')}
        title={t('operations:events.tableEyebrow')}
        description={t('operations:events.tableDescription')}
      >
        <Card className="rounded-3xl border-ink-10 shadow-card-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold">{t('operations:events.tableTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="admin-table-scroll">
              <table className="w-full min-w-[880px] text-left text-[14px]">
                <thead className="text-[11px] font-extrabold uppercase tracking-wide text-ink-40">
                  <tr>
                    <th className="px-4 py-3">{t('operations:events.columns.title')}</th>
                    <th className="px-4 py-3">{t('operations:events.columns.organizer')}</th>
                    <th className="px-4 py-3">{t('operations:events.columns.status')}</th>
                    <th className="px-4 py-3">{t('operations:events.columns.starts')}</th>
                    <th className="px-4 py-3">{t('operations:events.columns.fill')}</th>
                    <th className="px-4 py-3">{t('operations:events.columns.revenue')}</th>
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
                          {formatDateTime(row.startsAt, locale)}
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
                            {t('operations:events.open')}
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
