import { ListFiltersBar } from '@/components/admin/ListFiltersBar';
import { RowActionsMenu } from '@/components/admin/RowActionsMenu';
import { filterSelectClassName } from '@/lib/adminFilters';
import { getApiErrorMessage } from '@/lib/apiError';
import { listingModerationStatusBadgeClass } from '@/lib/listingModerationStatusUi';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { rowMatchesSearch } from '@/lib/listQuery';
import { notifyError, notifySuccess } from '@/lib/notify';
import type { ListingModerationRow } from '@/schemas/moderation.schema';
import {
  useClaimListingModerationMutation,
  useEscalateListingModerationMutation,
  useGetListingModerationQuery,
  useMarkListingModerationReviewedMutation,
  useRejectListingModerationMutation,
  useReleaseListingModerationMutation,
} from '@/services/adminApi';
import { useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

export function ListingsPage() {
  const { t } = useTranslation(['trust', 'common', 'errors']);
  const { data, isLoading } = useGetListingModerationQuery();
  const [markReviewed, markState] = useMarkListingModerationReviewedMutation();
  const [claim, claimState] = useClaimListingModerationMutation();
  const [release, releaseState] = useReleaseListingModerationMutation();
  const [reject, rejectState] = useRejectListingModerationMutation();
  const [escalate, escalateState] = useEscalateListingModerationMutation();
  const [search, setSearch] = useState('');
  const [kind, setKind] = useState<'all' | ListingModerationRow['kind']>('all');
  const [status, setStatus] = useState<'all' | ListingModerationRow['status']>('all');

  const filtered = useMemo(() => {
    return (data ?? []).filter((row) => {
      if (kind !== 'all' && row.kind !== kind) return false;
      if (status !== 'all' && row.status !== status) return false;
      return rowMatchesSearch(search, [
        row.title,
        row.ownerEmail,
        row.flagReason,
        row.description,
        row.id,
      ]);
    });
  }, [data, search, kind, status]);

  const mutLoading =
    markState.isLoading ||
    claimState.isLoading ||
    releaseState.isLoading ||
    rejectState.isLoading ||
    escalateState.isLoading;

  async function run(okMsg: string, exec: () => Promise<unknown>) {
    try {
      await exec();
      notifySuccess(okMsg);
    } catch (err) {
      notifyError(getApiErrorMessage(err, t('errors:requestFailed')));
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-40">{t('trust:eyebrow')}</p>
        <h1 className="text-3xl font-extrabold text-ink">{t('trust:listings.title')}</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-ink-60">
          <Trans
            i18nKey="trust:listings.subtitle"
            components={[
              <span key="1" className="font-mono text-ink" />,
              <span key="2" className="font-mono text-ink" />,
              <span key="3" className="font-mono text-ink" />,
              <span key="4" className="font-mono text-ink" />,
              <span key="5" className="font-mono text-ink" />,
            ]}
          />
        </p>
      </div>
      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">{t('trust:listings.queueTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ListFiltersBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder={t('trust:listings.searchPlaceholder')}
            className="mb-4"
          >
            <select className={filterSelectClassName()} value={kind} onChange={(e) => setKind(e.target.value as typeof kind)}>
              <option value="all">{t('trust:listings.filters.allKinds')}</option>
              <option value="talent">{t('trust:listings.kind.talent')}</option>
              <option value="vendor">{t('trust:listings.kind.vendor')}</option>
            </select>
            <select
              className={filterSelectClassName()}
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
            >
              <option value="all">{t('trust:listings.filters.allStates')}</option>
              <option value="queued">{t('trust:listings.status.queued')}</option>
              <option value="claimed">{t('trust:listings.status.claimed')}</option>
              <option value="actioned">{t('trust:listings.status.actioned')}</option>
              <option value="rejected">{t('trust:listings.status.rejected')}</option>
              <option value="escalated">{t('trust:listings.status.escalated')}</option>
            </select>
          </ListFiltersBar>
          {isLoading ? <p className="text-sm text-ink-60">{t('common:loading')}</p> : null}
          {!isLoading && filtered.length === 0 ? (
            <p className="mb-3 text-sm font-semibold text-ink-60">{t('trust:listings.empty')}</p>
          ) : null}
          <div className="admin-table-scroll">
            <table className="w-full min-w-[960px] text-left text-[14px]">
              <thead className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
                <tr>
                  <th className="px-4 py-3">{t('trust:listings.columns.listing')}</th>
                  <th className="px-4 py-3">{t('trust:listings.columns.kind')}</th>
                  <th className="px-4 py-3">{t('trust:listings.columns.owner')}</th>
                  <th className="px-4 py-3">{t('trust:listings.columns.flag')}</th>
                  <th className="px-4 py-3">{t('trust:listings.columns.status')}</th>
                  <th className="w-14 px-2 py-3 text-right" aria-label={t('trust:listings.columns.actions')} />
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => {
                  const rowBusy =
                    (claimState.isLoading && claimState.originalArgs === row.id && 'claim') ||
                    (releaseState.isLoading && releaseState.originalArgs === row.id && 'release') ||
                    (rejectState.isLoading && rejectState.originalArgs === row.id && 'reject') ||
                    (escalateState.isLoading && escalateState.originalArgs === row.id && 'escalate') ||
                    (markState.isLoading && markState.originalArgs === row.id && 'approve') ||
                    null;
                  const canClaimRelease = row.status === 'queued' || row.status === 'claimed';
                  return (
                    <tr key={row.id} className="border-t border-ink-10 hover:bg-surface-tint">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-ink">{row.title}</p>
                        {row.description ? (
                          <p className="mt-1 line-clamp-2 max-w-md text-[12px] text-ink-50">{row.description}</p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-ink-60">{t(`trust:listings.kind.${row.kind}`)}</td>
                      <td className="px-4 py-3 text-ink-60">{row.ownerEmail}</td>
                      <td className="max-w-[200px] px-4 py-3 text-[13px] text-ink-60">{row.flagReason}</td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide',
                            listingModerationStatusBadgeClass(row.status),
                          )}
                        >
                          {t(`trust:listings.status.${row.status}`)}
                        </span>
                      </td>
                      <td className="px-2 py-3 text-right align-middle">
                        <RowActionsMenu
                          ariaLabel={t('trust:listings.actions.forListing', { id: row.id })}
                          actions={[
                            {
                              key: 'claim',
                              label: t('trust:listings.actions.claim'),
                              disabled: row.status !== 'queued' || mutLoading,
                              loading: rowBusy === 'claim',
                              onSelect: () => run(t('trust:listings.notify.claimed'), () => claim(row.id).unwrap()),
                            },
                            {
                              key: 'release',
                              label: t('trust:listings.actions.release'),
                              disabled: row.status !== 'claimed' || mutLoading,
                              loading: rowBusy === 'release',
                              onSelect: () => run(t('trust:listings.notify.released'), () => release(row.id).unwrap()),
                            },
                            {
                              key: 'reject',
                              label: t('trust:listings.actions.reject'),
                              disabled: mutLoading || !canClaimRelease,
                              loading: rowBusy === 'reject',
                              onSelect: () => run(t('trust:listings.notify.rejected'), () => reject(row.id).unwrap()),
                            },
                            {
                              key: 'escalate',
                              label: t('trust:listings.actions.escalate'),
                              disabled: mutLoading || !canClaimRelease,
                              loading: rowBusy === 'escalate',
                              onSelect: () => run(t('trust:listings.notify.escalated'), () => escalate(row.id).unwrap()),
                            },
                            {
                              key: 'approve',
                              label: t('trust:listings.actions.approve'),
                              disabled: !canClaimRelease || mutLoading,
                              loading: rowBusy === 'approve',
                              onSelect: () =>
                                run(t('trust:listings.notify.approved'), () => markReviewed(row.id).unwrap()),
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
