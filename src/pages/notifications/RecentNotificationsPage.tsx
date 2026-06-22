import { ListFiltersBar } from '@/components/admin/ListFiltersBar';
import { Button } from '@/components/ui/Button';
import { getCurrentLocale } from '@/i18n';
import { filterSelectClassName } from '@/lib/adminFilters';
import {
  formatNotificationKind,
  formatRelatedEntityLabel,
} from '@/lib/adminNotificationDisplay';
import { formatDateTime, formatNumber } from '@/lib/localeFormat';
import { rowMatchesSearch } from '@/lib/listQuery';
import { cn } from '@/lib/utils';
import type { AdminRecentNotificationRow } from '@/schemas/adminNotifications.schema';
import { useGetNotificationsRecentQuery } from '@/services/adminApi';
import { ArrowUpRight, ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const PER_PAGE = 30;

type ReadFilter = 'all' | 'unread' | 'read';

function NotificationTableRow({ row }: { row: AdminRecentNotificationRow }) {
  const { t } = useTranslation(['notifications', 'common']);
  const locale = getCurrentLocale();
  const navigate = useNavigate();
  const unread = row.read === false;
  const kindLabel = formatNotificationKind(row.kind);
  const relatedLabel = formatRelatedEntityLabel(
    row.relatedEntityType,
    row.relatedEntityId,
    row.eventCode,
  );
  const openRow = () => {
    if (row.href) navigate(row.href);
  };

  return (
    <tr
      className={cn(
        'border-t border-ink-10',
        row.href && 'cursor-pointer transition-colors hover:bg-surface-tint',
      )}
      onClick={row.href ? openRow : undefined}
      onKeyDown={
        row.href
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openRow();
              }
            }
          : undefined
      }
      tabIndex={row.href ? 0 : undefined}
    >
      <td className="px-4 py-4 align-top">
        <span
          className={
            unread
              ? 'inline-flex h-2.5 w-2.5 rounded-full bg-coral'
              : 'inline-flex h-2.5 w-2.5 rounded-full bg-ink-10'
          }
          aria-hidden
        />
        <span className="sr-only">
          {unread ? t('notifications:status.unread') : t('notifications:status.read')}
        </span>
      </td>
      <td className="px-4 py-4 align-top">
        <p className={`text-[14px] leading-snug text-ink ${unread ? 'font-semibold' : 'font-medium'}`}>
          {row.title}
        </p>
        {row.body ? (
          <p className="mt-1 max-w-prose text-[13px] leading-relaxed text-pretty text-ink-60">
            {row.body}
          </p>
        ) : null}
      </td>
      <td className="px-4 py-4 align-top">
        {kindLabel ? (
          <span className="inline-flex rounded-lg bg-ink-5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink-60">
            {kindLabel}
          </span>
        ) : (
          <span className="text-ink-40">{t('common:none')}</span>
        )}
      </td>
      <td className="px-4 py-4 align-top font-mono text-[12px] text-ink-60">
        {relatedLabel || t('common:none')}
      </td>
      <td className="px-4 py-4 align-top font-mono text-[13px] tabular-nums text-ink-60">
        {formatDateTime(row.createdAt, locale)}
      </td>
      <td className="px-4 py-4 align-top">
        {row.href ? (
          <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-coral">
            {t('notifications:open')}
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </span>
        ) : (
          <span className="text-[13px] text-ink-40">{t('common:none')}</span>
        )}
      </td>
    </tr>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-0 divide-y divide-ink-10">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="flex gap-4 px-4 py-4">
          <div className="h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-ink-10" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/5 animate-pulse rounded-lg bg-ink-10" />
            <div className="h-3 w-3/5 animate-pulse rounded-lg bg-ink-5" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function RecentNotificationsPage() {
  const { t } = useTranslation(['notifications', 'common', 'settings']);
  const locale = getCurrentLocale();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [readFilter, setReadFilter] = useState<ReadFilter>('all');

  const { data, isLoading, isError, isFetching, refetch } = useGetNotificationsRecentQuery({
    page,
    perPage: PER_PAGE,
  });

  const filtered = useMemo(() => {
    return (data?.items ?? []).filter((row) => {
      if (readFilter === 'unread' && row.read !== false) return false;
      if (readFilter === 'read' && row.read !== true) return false;
      return rowMatchesSearch(search, [
        row.id,
        row.title,
        row.body,
        row.kind,
        row.eventCode,
        row.relatedEntityType,
        row.relatedEntityId,
      ]);
    });
  }, [data?.items, readFilter, search]);

  const unreadOnPage = useMemo(
    () => (data?.items ?? []).filter((row) => row.read === false).length,
    [data?.items],
  );

  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / (data?.perPage ?? PER_PAGE)));

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-40">
            {t('notifications:eyebrow')}
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-balance text-ink">
            {t('notifications:title')}
          </h1>
          <p className="mt-2 text-[14px] leading-relaxed text-pretty text-ink-60">
            {t('notifications:subtitle')}
          </p>
        </div>
        <Link
          to="/settings/notifications"
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-ink-10 bg-white px-4 text-[13px] font-semibold text-ink shadow-[0_8px_24px_-12px_rgba(0,0,0,0.12)] transition-transform hover:bg-ink-5 active:scale-[0.96] md:self-auto"
        >
          <Settings className="h-4 w-4 text-ink-60" aria-hidden />
          {t('notifications:settingsLink')}
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-xl bg-coral/10 px-3 py-1.5 text-[13px] font-semibold tabular-nums text-coral">
          {t('notifications:stats.unread', { count: formatNumber(unreadOnPage, locale) })}
        </span>
        <span className="rounded-xl bg-ink-5 px-3 py-1.5 text-[13px] font-medium tabular-nums text-ink-60">
          {t('notifications:stats.total', {
            count: formatNumber(data?.total ?? 0, locale),
          })}
        </span>
      </div>

      <section className="overflow-hidden rounded-2xl bg-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.06)]">
        <div className="border-b border-ink-10 p-4 sm:p-5">
          <ListFiltersBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder={t('notifications:searchPlaceholder')}
          >
            <select
              className={filterSelectClassName()}
              value={readFilter}
              onChange={(e) => setReadFilter(e.target.value as ReadFilter)}
              aria-label={t('notifications:columns.status')}
            >
              <option value="all">{t('notifications:filters.readAll')}</option>
              <option value="unread">{t('notifications:filters.readUnread')}</option>
              <option value="read">{t('notifications:filters.readRead')}</option>
            </select>
          </ListFiltersBar>
        </div>

        {isError ? (
          <div className="px-5 py-12 text-center">
            <p className="text-[14px] text-ink-60">{t('notifications:loadError')}</p>
            <button
              type="button"
              onClick={() => void refetch()}
              className="mt-3 text-[13px] font-semibold text-coral transition-transform active:scale-[0.96]"
            >
              {t('common:tryAgain')}
            </button>
          </div>
        ) : null}

        {isLoading ? <TableSkeleton /> : null}

        {!isLoading && !isError && filtered.length === 0 ? (
          <p className="px-5 py-12 text-center text-[14px] text-ink-60">
            {search || readFilter !== 'all'
              ? t('notifications:emptyFiltered')
              : t('notifications:empty')}
          </p>
        ) : null}

        {!isLoading && !isError && filtered.length > 0 ? (
          <div className="admin-table-scroll">
            <table className="w-full min-w-[960px] text-left text-[14px]">
              <thead className="bg-ink-5/50 text-[11px] font-bold uppercase tracking-wide text-ink-40">
                <tr>
                  <th className="w-10 px-4 py-3" aria-hidden />
                  <th className="px-4 py-3">{t('notifications:columns.notification')}</th>
                  <th className="px-4 py-3">{t('notifications:columns.kind')}</th>
                  <th className="px-4 py-3">{t('notifications:columns.related')}</th>
                  <th className="px-4 py-3">{t('notifications:columns.time')}</th>
                  <th className="px-4 py-3">{t('notifications:columns.status')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <NotificationTableRow key={row.id} row={row} />
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {!isLoading && !isError && (data?.total ?? 0) > 0 ? (
          <div className="flex flex-col gap-3 border-t border-ink-10 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p className="font-mono text-[13px] tabular-nums text-ink-60">
              {t('notifications:pagination.showing', {
                count: filtered.length,
                total: formatNumber(data?.total ?? 0, locale),
                page: data?.currentPage ?? page,
                totalPages,
              })}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={(data?.currentPage ?? 1) <= 1 || isFetching}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" aria-hidden />
                {t('notifications:pagination.previous')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={(data?.currentPage ?? 1) >= totalPages || isFetching}
                onClick={() => setPage((p) => p + 1)}
              >
                {t('notifications:pagination.next')}
                <ChevronRight className="h-4 w-4" aria-hidden />
              </Button>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
