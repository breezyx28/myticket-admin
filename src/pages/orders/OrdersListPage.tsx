import { ListFiltersBar } from '@/components/admin/ListFiltersBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentLocale } from '@/i18n';
import { filterSelectClassName } from '@/lib/adminFilters';
import { formatSarCompact } from '@/lib/formatSar';
import { rowMatchesSearch } from '@/lib/listQuery';
import type { AdminOrderStatus } from '@/schemas/order.schema';
import { useGetOrdersQuery } from '@/services/adminApi';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const ORDER_STATUSES: AdminOrderStatus[] = [
  'paid',
  'pending',
  'processing',
  'completed',
  'refunded',
  'cancelled',
  'failed',
  'unknown',
];

export function OrdersListPage() {
  const { t } = useTranslation(['operations', 'common']);
  const locale = getCurrentLocale();
  const { data, isLoading } = useGetOrdersQuery();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | AdminOrderStatus>('all');

  const filtered = useMemo(() => {
    return (data ?? []).filter((row) => {
      if (status !== 'all' && row.status !== status) return false;
      return rowMatchesSearch(search, [
        row.reference ?? row.id,
        row.id,
        row.buyerLabel,
        row.eventTitle,
        row.status,
        String(row.numericId ?? ''),
      ]);
    });
  }, [data, search, status]);

  function statusLabel(s: AdminOrderStatus): string {
    return t(`operations:orderStatus.${s}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-40">
          {t('operations:commerce')}
        </p>
        <h1 className="text-3xl font-extrabold text-ink">{t('operations:orders.title')}</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-ink-60">{t('operations:orders.subtitle')}</p>
      </div>
      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">{t('operations:orders.allOrders')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ListFiltersBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder={t('operations:orders.searchPlaceholder')}
            className="mb-4"
          >
            <select
              className={filterSelectClassName()}
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
            >
              <option value="all">{t('operations:allStatuses')}</option>
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {statusLabel(s)}
                </option>
              ))}
            </select>
          </ListFiltersBar>
          {isLoading ? <p className="text-sm text-ink-60">{t('common:loading')}</p> : null}
          {!isLoading && filtered.length === 0 ? (
            <p className="mb-3 text-sm font-semibold text-ink-60">{t('operations:orders.empty')}</p>
          ) : null}
          <div className="admin-table-scroll">
            <table className="w-full min-w-[720px] text-left text-[14px]">
              <thead className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
                <tr>
                  <th className="px-4 py-3">{t('operations:orders.colReference')}</th>
                  <th className="px-4 py-3">{t('operations:orders.colBuyer')}</th>
                  <th className="px-4 py-3">{t('operations:orders.colEvent')}</th>
                  <th className="px-4 py-3">{t('operations:orders.colStatus')}</th>
                  <th className="px-4 py-3">{t('operations:orders.colTotal')}</th>
                  <th className="px-4 py-3">{t('operations:orders.colQty')}</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} className="border-t border-ink-10 hover:bg-surface-tint">
                    <td className="px-4 py-3 font-mono text-[13px] font-semibold text-ink">
                      <span>{row.reference ?? row.id}</span>
                      {row.numericId ? (
                        <span className="ml-1 text-ink-40">#{row.numericId}</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-ink-60">{row.buyerLabel}</td>
                    <td className="px-4 py-3 font-medium text-ink">{row.eventTitle}</td>
                    <td className="px-4 py-3 text-ink-60">{statusLabel(row.status)}</td>
                    <td className="px-4 py-3 font-mono text-ink">
                      {formatSarCompact(row.totalSar, locale)}
                    </td>
                    <td className="px-4 py-3 text-ink-60">{row.ticketCount}</td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/orders/${row.id}`} className="font-semibold text-coral hover:underline">
                        {t('common:view')}
                      </Link>
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
