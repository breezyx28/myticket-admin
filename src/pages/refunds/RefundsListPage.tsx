import { ListFiltersBar } from '@/components/admin/ListFiltersBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentLocale } from '@/i18n';
import { filterSelectClassName } from '@/lib/adminFilters';
import { formatSarCompact } from '@/lib/formatSar';
import { rowMatchesSearch } from '@/lib/listQuery';
import type { AdminRefundStatus } from '@/schemas/refund.schema';
import { useGetRefundsQuery } from '@/services/adminApi';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

const REFUND_STATUSES: AdminRefundStatus[] = [
  'pending',
  'approved',
  'processing',
  'completed',
  'rejected',
  'failed',
  'unknown',
];

export function RefundsListPage() {
  const { t } = useTranslation(['operations', 'common']);
  const locale = getCurrentLocale();
  const navigate = useNavigate();
  const { data, isLoading } = useGetRefundsQuery();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | AdminRefundStatus>('all');

  const filtered = useMemo(() => {
    return (data ?? []).filter((row) => {
      if (status !== 'all' && row.status !== status) return false;
      return rowMatchesSearch(search, [
        row.id,
        row.orderId,
        row.requestedByLabel,
        row.eventTitle,
        row.reason,
        row.status,
      ]);
    });
  }, [data, search, status]);

  function statusLabel(s: AdminRefundStatus): string {
    return t(`operations:refundStatus.${s}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-40">
          {t('operations:commerce')}
        </p>
        <h1 className="text-3xl font-extrabold text-ink">{t('operations:refunds.title')}</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-ink-60">{t('operations:refunds.subtitle')}</p>
      </div>
      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">{t('operations:refunds.allRefunds')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ListFiltersBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder={t('operations:refunds.searchPlaceholder')}
            className="mb-4"
          >
            <select
              className={filterSelectClassName()}
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
            >
              <option value="all">{t('operations:allStatuses')}</option>
              {REFUND_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {statusLabel(s)}
                </option>
              ))}
            </select>
          </ListFiltersBar>
          {isLoading ? <p className="text-sm text-ink-60">{t('common:loading')}</p> : null}
          {!isLoading && filtered.length === 0 ? (
            <p className="mb-3 text-sm font-semibold text-ink-60">{t('operations:refunds.empty')}</p>
          ) : null}
          <div className="admin-table-scroll">
            <table className="w-full min-w-[800px] text-left text-[14px]">
              <thead className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
                <tr>
                  <th className="px-4 py-3">{t('operations:refunds.colRefund')}</th>
                  <th className="px-4 py-3">{t('operations:orders.colStatus')}</th>
                  <th className="px-4 py-3">{t('operations:refunds.colAmount')}</th>
                  <th className="px-4 py-3">{t('operations:refunds.colRequester')}</th>
                  <th className="px-4 py-3">{t('operations:orders.colEvent')}</th>
                  <th className="px-4 py-3">{t('operations:refunds.colReason')}</th>
                  <th className="px-4 py-3">{t('operations:refunds.colOrder')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr
                    key={row.id}
                    className="cursor-pointer border-t border-ink-10 hover:bg-surface-tint"
                    onClick={() => navigate(`/refunds/${encodeURIComponent(row.id)}`)}
                  >
                    <td className="px-4 py-3 font-mono text-[13px] font-semibold text-ink">{row.id}</td>
                    <td className="px-4 py-3 text-ink-60">{statusLabel(row.status)}</td>
                    <td className="px-4 py-3 font-mono text-ink">
                      {formatSarCompact(row.amountSar, locale)}
                    </td>
                    <td className="px-4 py-3 text-ink-60">{row.requestedByLabel}</td>
                    <td className="px-4 py-3 text-ink-60">{row.eventTitle ?? t('common:none')}</td>
                    <td className="max-w-[220px] px-4 py-3 text-[13px] text-ink-60">{row.reason}</td>
                    <td className="px-4 py-3">
                      {row.orderId ? (
                        <Link
                          to={`/orders/${row.orderId}`}
                          className="font-mono font-semibold text-coral hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {row.orderId}
                        </Link>
                      ) : (
                        <span className="text-ink-40">{t('common:none')}</span>
                      )}
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
