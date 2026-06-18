import { ListFiltersBar } from '@/components/admin/ListFiltersBar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentLocale } from '@/i18n';
import { filterSelectClassName } from '@/lib/adminFilters';
import { formatSarCompact } from '@/lib/formatSar';
import { formatDateTime } from '@/lib/localeFormat';
import { notifyError, notifySuccess } from '@/lib/notify';
import { rowMatchesSearch } from '@/lib/listQuery';
import type { AdminAuctionStatus } from '@/schemas/auction.schema';
import {
  useCancelAuctionMutation,
  useFinalizeAuctionMutation,
  useFreezeAuctionMutation,
  useGetAuctionsQuery,
} from '@/services/adminApi';
import { useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

const AUCTION_STATUSES: AdminAuctionStatus[] = [
  'draft',
  'scheduled',
  'live',
  'paused',
  'frozen',
  'ended',
  'cancelled',
  'finalized',
  'sold',
  'expired',
  'removed',
  'unknown',
];

export function AuctionsListPage() {
  const { t } = useTranslation(['operations', 'common']);
  const locale = getCurrentLocale();
  const navigate = useNavigate();
  const { data, isLoading } = useGetAuctionsQuery();
  const [freeze] = useFreezeAuctionMutation();
  const [cancel] = useCancelAuctionMutation();
  const [finalize] = useFinalizeAuctionMutation();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | AdminAuctionStatus>('all');
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return (data ?? []).filter((row) => {
      if (status !== 'all' && row.status !== status) return false;
      return rowMatchesSearch(search, [row.id, row.title, row.organizerName, row.status]);
    });
  }, [data, search, status]);

  const busy = busyId !== null;

  async function run(id: string, okMsg: string, exec: () => Promise<unknown>) {
    setBusyId(id);
    try {
      await exec();
      notifySuccess(okMsg);
    } catch {
      notifyError(t('operations:auctions.notifyActionFailed'));
    } finally {
      setBusyId(null);
    }
  }

  function canFreeze(s: AdminAuctionStatus): boolean {
    return s === 'draft' || s === 'scheduled' || s === 'live' || s === 'paused';
  }

  function canCancel(s: AdminAuctionStatus): boolean {
    return (
      s !== 'cancelled' &&
      s !== 'finalized' &&
      s !== 'ended' &&
      s !== 'sold' &&
      s !== 'expired' &&
      s !== 'removed'
    );
  }

  function canFinalize(s: AdminAuctionStatus): boolean {
    return s === 'live';
  }

  function statusLabel(s: AdminAuctionStatus): string {
    return t(`operations:auctionStatus.${s}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-40">
          {t('operations:commerce')}
        </p>
        <h1 className="text-3xl font-extrabold text-ink">{t('operations:auctions.title')}</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-ink-60">
          <Trans
            ns="operations"
            i18nKey="auctions.subtitle"
            components={{ mono: <span className="font-mono text-ink" /> }}
          />
        </p>
      </div>

      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">{t('operations:auctions.allAuctions')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ListFiltersBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder={t('operations:auctions.searchPlaceholder')}
            className="mb-4"
          >
            <select
              className={filterSelectClassName()}
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
            >
              <option value="all">{t('operations:allStatuses')}</option>
              {AUCTION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {statusLabel(s)}
                </option>
              ))}
            </select>
          </ListFiltersBar>
          {isLoading ? <p className="text-sm text-ink-60">{t('common:loading')}</p> : null}
          {!isLoading && filtered.length === 0 ? (
            <p className="mb-3 text-sm font-semibold text-ink-60">{t('operations:auctions.empty')}</p>
          ) : null}
          <div className="admin-table-scroll">
            <table className="w-full min-w-[900px] text-left text-[14px]">
              <thead className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
                <tr>
                  <th className="px-4 py-3">{t('operations:auctions.colAuction')}</th>
                  <th className="px-4 py-3">{t('operations:auctions.colOrganizer')}</th>
                  <th className="px-4 py-3">{t('operations:orders.colStatus')}</th>
                  <th className="px-4 py-3">{t('operations:auctions.colHighBid')}</th>
                  <th className="px-4 py-3">{t('operations:auctions.colEnds')}</th>
                  <th className="px-4 py-3">{t('common:actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr
                    key={row.id}
                    className="cursor-pointer border-t border-ink-10 hover:bg-surface-tint"
                    onClick={() => navigate(`/auctions/${encodeURIComponent(row.id)}`)}
                  >
                    <td className="px-4 py-3">
                      <p className="font-mono text-[12px] font-semibold text-ink-60">{row.id}</p>
                      <Link
                        to={`/auctions/${encodeURIComponent(row.id)}`}
                        className="font-medium text-coral hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {row.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-ink-60">{row.organizerName}</td>
                    <td className="px-4 py-3 text-ink-60">{statusLabel(row.status)}</td>
                    <td className="px-4 py-3 font-mono text-ink">
                      {formatSarCompact(row.highBidSar, locale)}
                    </td>
                    <td className="px-4 py-3 text-[13px] text-ink-60">
                      {formatDateTime(row.endsAt, locale)}
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex max-w-[280px] flex-wrap gap-1.5">
                        {canFreeze(row.status) ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={busy}
                            loading={busyId === row.id}
                            onClick={() =>
                              void run(row.id, t('operations:auctions.notifyFrozen'), () => freeze(row.id).unwrap())
                            }
                          >
                            {t('operations:auctions.freeze')}
                          </Button>
                        ) : null}
                        {canCancel(row.status) ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="danger"
                            disabled={busy}
                            loading={busyId === row.id}
                            onClick={() => {
                              if (!window.confirm(t('operations:auctions.confirmCancel'))) return;
                              void run(row.id, t('operations:auctions.notifyCancelled'), () =>
                                cancel(row.id).unwrap(),
                              );
                            }}
                          >
                            {t('operations:auctions.cancel')}
                          </Button>
                        ) : null}
                        {canFinalize(row.status) ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="dark"
                            disabled={busy}
                            loading={busyId === row.id}
                            onClick={() => {
                              if (!window.confirm(t('operations:auctions.confirmFinalize'))) return;
                              void run(row.id, t('operations:auctions.notifyFinalized'), () =>
                                finalize(row.id).unwrap(),
                              );
                            }}
                          >
                            {t('operations:auctions.finalize')}
                          </Button>
                        ) : null}
                        {!canFreeze(row.status) && !canCancel(row.status) && !canFinalize(row.status) ? (
                          <span className="text-[12px] text-ink-40">{t('common:none')}</span>
                        ) : null}
                      </div>
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
