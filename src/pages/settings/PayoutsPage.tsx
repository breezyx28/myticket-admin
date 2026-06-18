import { ListFiltersBar } from '@/components/admin/ListFiltersBar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentLocale } from '@/i18n';
import { filterSelectClassName } from '@/lib/adminFilters';
import { formatSarCompact } from '@/lib/formatSar';
import { formatDate } from '@/lib/localeFormat';
import { notifyError, notifySuccess } from '@/lib/notify';
import { rowMatchesSearch } from '@/lib/listQuery';
import type { PayoutStatus } from '@/schemas/payout.schema';
import {
  useApprovePayoutMutation,
  useGetPayoutsQuery,
  useMarkPayoutFailedMutation,
  useMarkPayoutPaidMutation,
  useMarkPayoutProcessingMutation,
  useRejectPayoutMutation,
} from '@/services/adminApi';
import { useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

const PAYOUT_STATUSES: PayoutStatus[] = [
  'pending',
  'approved',
  'processing',
  'paid',
  'failed',
  'rejected',
  'unknown',
];

export function PayoutsPage() {
  const { t } = useTranslation(['settings', 'common', 'nav']);
  const locale = getCurrentLocale();
  const { data, isLoading } = useGetPayoutsQuery();
  const [approve] = useApprovePayoutMutation();
  const [reject] = useRejectPayoutMutation();
  const [markProcessing] = useMarkPayoutProcessingMutation();
  const [markPaid] = useMarkPayoutPaidMutation();
  const [markFailed] = useMarkPayoutFailedMutation();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | PayoutStatus>('all');
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return (data ?? []).filter((row) => {
      if (status !== 'all' && row.status !== status) return false;
      return rowMatchesSearch(search, [
        row.id,
        row.organizerName,
        row.eventTitle,
        row.reference,
        row.status,
      ]);
    });
  }, [data, search, status]);

  const busy = busyId !== null;

  function statusLabel(s: PayoutStatus): string {
    return t(`settings:payoutStatus.${s}`);
  }

  async function runAction(id: string, okMsg: string, exec: () => Promise<unknown>) {
    setBusyId(id);
    try {
      await exec();
      notifySuccess(okMsg);
    } catch {
      notifyError(t('settings:notifyActionFailed'));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-40">
          {t('nav:groups.platform')}
        </p>
        <h1 className="text-3xl font-extrabold text-ink">{t('settings:payouts.title')}</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-ink-60">
          <Trans
            ns="settings"
            i18nKey="payouts.subtitle"
            components={{ mono: <span className="font-mono text-ink" /> }}
          />
        </p>
      </div>

      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">{t('settings:payouts.cardTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ListFiltersBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder={t('settings:payouts.searchPlaceholder')}
            className="mb-4"
          >
            <select
              className={filterSelectClassName()}
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
            >
              <option value="all">{t('settings:payouts.allStatuses')}</option>
              {PAYOUT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {statusLabel(s)}
                </option>
              ))}
            </select>
          </ListFiltersBar>
          {isLoading ? <p className="text-sm text-ink-60">{t('common:loading')}</p> : null}
          {!isLoading && filtered.length === 0 ? (
            <p className="mb-3 text-sm font-semibold text-ink-60">{t('settings:payouts.noMatches')}</p>
          ) : null}
          <div className="admin-table-scroll">
            <table className="w-full min-w-[960px] text-left text-[14px]">
              <thead className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
                <tr>
                  <th className="px-4 py-3">{t('settings:payouts.columns.payout')}</th>
                  <th className="px-4 py-3">{t('settings:payouts.columns.organizer')}</th>
                  <th className="px-4 py-3">{t('settings:payouts.columns.event')}</th>
                  <th className="px-4 py-3">{t('settings:payouts.columns.status')}</th>
                  <th className="px-4 py-3">{t('settings:payouts.columns.amount')}</th>
                  <th className="px-4 py-3">{t('settings:payouts.columns.created')}</th>
                  <th className="px-4 py-3">{t('common:actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} className="border-t border-ink-10 hover:bg-surface-tint">
                    <td className="px-4 py-3 font-mono text-[13px] font-semibold text-ink">{row.id}</td>
                    <td className="px-4 py-3 font-medium text-ink">{row.organizerName}</td>
                    <td className="px-4 py-3 text-ink-60">{row.eventTitle ?? t('common:none')}</td>
                    <td className="px-4 py-3 text-ink-60">{statusLabel(row.status)}</td>
                    <td className="px-4 py-3 font-mono text-ink">{formatSarCompact(row.amountSar, locale)}</td>
                    <td className="px-4 py-3 text-[13px] text-ink-60">{formatDate(row.createdAt, locale)}</td>
                    <td className="px-4 py-3">
                      <div className="flex max-w-[320px] flex-wrap gap-1.5">
                        {row.status === 'pending' ? (
                          <>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={busy}
                              loading={busyId === row.id}
                              onClick={() =>
                                void runAction(row.id, t('settings:payouts.notifyApproved'), () =>
                                  approve(row.id).unwrap()
                                )
                              }
                            >
                              {t('settings:payouts.approve')}
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="danger"
                              disabled={busy}
                              loading={busyId === row.id}
                              onClick={() => {
                                if (!window.confirm(t('settings:payouts.confirmReject'))) return;
                                const reason = window.prompt(t('settings:payouts.rejectReasonPrompt'), '')?.trim();
                                void runAction(row.id, t('settings:payouts.notifyRejected'), () =>
                                  reject({ id: row.id, reason: reason || undefined }).unwrap()
                                );
                              }}
                            >
                              {t('settings:payouts.reject')}
                            </Button>
                          </>
                        ) : null}
                        {row.status === 'approved' ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={busy}
                            loading={busyId === row.id}
                            onClick={() =>
                              void runAction(row.id, t('settings:payouts.notifyProcessing'), () =>
                                markProcessing(row.id).unwrap()
                              )
                            }
                          >
                            {t('settings:payouts.markProcessing')}
                          </Button>
                        ) : null}
                        {row.status === 'processing' ? (
                          <>
                            <Button
                              type="button"
                              size="sm"
                              variant="dark"
                              disabled={busy}
                              loading={busyId === row.id}
                              onClick={() =>
                                void runAction(row.id, t('settings:payouts.notifyPaid'), () =>
                                  markPaid(row.id).unwrap()
                                )
                              }
                            >
                              {t('settings:payouts.markPaid')}
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="danger"
                              disabled={busy}
                              loading={busyId === row.id}
                              onClick={() => {
                                if (!window.confirm(t('settings:payouts.confirmMarkFailed'))) return;
                                void runAction(row.id, t('settings:payouts.notifyFailed'), () =>
                                  markFailed(row.id).unwrap()
                                );
                              }}
                            >
                              {t('settings:payouts.markFailed')}
                            </Button>
                          </>
                        ) : null}
                        {row.status === 'paid' || row.status === 'failed' || row.status === 'rejected' ? (
                          <span className="text-[12px] text-ink-40">{t('common:none')}</span>
                        ) : null}
                        {row.status === 'unknown' ? (
                          <span className="text-[12px] text-ink-40">{t('settings:payouts.reviewInApi')}</span>
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
