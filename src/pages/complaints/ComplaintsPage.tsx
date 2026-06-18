import { ListFiltersBar } from '@/components/admin/ListFiltersBar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentLocale } from '@/i18n';
import { filterSelectClassName } from '@/lib/adminFilters';
import { getApiErrorMessage } from '@/lib/apiError';
import { formatDateTime } from '@/lib/localeFormat';
import { notifyError, notifySuccess } from '@/lib/notify';
import { rowMatchesSearch } from '@/lib/listQuery';
import type { AdminComplaintStatus } from '@/schemas/complaint.schema';
import {
  useEscalateComplaintMutation,
  useGetComplaintsQuery,
  useResolveComplaintMutation,
  useTriageComplaintMutation,
} from '@/services/adminApi';
import { useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

export function ComplaintsPage() {
  const { t } = useTranslation(['support', 'common', 'errors']);
  const locale = getCurrentLocale();
  const { data, isLoading } = useGetComplaintsQuery();
  const [triage] = useTriageComplaintMutation();
  const [resolve] = useResolveComplaintMutation();
  const [escalate] = useEscalateComplaintMutation();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | AdminComplaintStatus>('all');
  const [busy, setBusy] = useState<{ id: string; kind: 'triage' | 'resolve' | 'escalate' } | null>(null);

  const filtered = useMemo(() => {
    return (data ?? []).filter((row) => {
      if (status !== 'all' && row.status !== status) return false;
      return rowMatchesSearch(search, [
        row.id,
        row.title,
        row.category,
        row.reporterLabel,
        row.targetLabel,
        row.status,
      ]);
    });
  }, [data, search, status]);

  const isBusy = busy !== null;

  async function run(
    id: string,
    kind: 'triage' | 'resolve' | 'escalate',
    okMsg: string,
    exec: () => Promise<unknown>
  ) {
    setBusy({ id, kind });
    try {
      await exec();
      notifySuccess(okMsg);
    } catch (err) {
      notifyError(getApiErrorMessage(err, t('errors:requestFailed')));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-40">{t('support:eyebrow')}</p>
        <h1 className="text-3xl font-extrabold text-ink">{t('support:complaints.title')}</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-ink-60">
          <Trans
            i18nKey="support:complaints.subtitle"
            components={[<span key="1" className="font-mono text-ink" />]}
          />
        </p>
      </div>

      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">{t('support:complaints.queueTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ListFiltersBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder={t('support:complaints.searchPlaceholder')}
            className="mb-4"
          >
            <select
              className={filterSelectClassName()}
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
            >
              <option value="all">{t('support:complaints.allStatuses')}</option>
              <option value="open">{t('support:complaints.status.open')}</option>
              <option value="triaged">{t('support:complaints.status.triaged')}</option>
              <option value="resolved">{t('support:complaints.status.resolved')}</option>
              <option value="escalated">{t('support:complaints.status.escalated')}</option>
              <option value="unknown">{t('support:complaints.status.unknown')}</option>
            </select>
          </ListFiltersBar>
          {isLoading ? <p className="text-sm text-ink-60">{t('common:loading')}</p> : null}
          {!isLoading && filtered.length === 0 ? (
            <p className="mb-3 text-sm font-semibold text-ink-60">{t('support:complaints.empty')}</p>
          ) : null}
          <div className="admin-table-scroll">
            <table className="w-full min-w-[920px] text-left text-[14px]">
              <thead className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
                <tr>
                  <th className="px-4 py-3">{t('support:complaints.columns.complaint')}</th>
                  <th className="px-4 py-3">{t('support:complaints.columns.category')}</th>
                  <th className="px-4 py-3">{t('support:complaints.columns.reporter')}</th>
                  <th className="px-4 py-3">{t('support:complaints.columns.target')}</th>
                  <th className="px-4 py-3">{t('support:complaints.columns.status')}</th>
                  <th className="px-4 py-3">{t('support:complaints.columns.updated')}</th>
                  <th className="px-4 py-3">{t('support:complaints.columns.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} className="border-t border-ink-10 hover:bg-surface-tint">
                    <td className="px-4 py-3">
                      <p className="font-mono text-[12px] font-semibold text-ink-60">{row.id}</p>
                      <p className="max-w-[280px] font-medium text-ink">{row.title}</p>
                    </td>
                    <td className="px-4 py-3 text-ink-60">{row.category ?? t('common:none')}</td>
                    <td className="px-4 py-3 text-ink-60">{row.reporterLabel ?? t('common:none')}</td>
                    <td className="px-4 py-3 text-ink-60">{row.targetLabel ?? t('common:none')}</td>
                    <td className="px-4 py-3 text-ink-60">{t(`support:complaints.status.${row.status}`)}</td>
                    <td className="px-4 py-3 font-mono text-[13px] text-ink-60">
                      {row.updatedAt ? formatDateTime(row.updatedAt, locale) : t('common:none')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {row.status === 'open' ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={isBusy}
                            loading={busy?.id === row.id && busy.kind === 'triage'}
                            onClick={() =>
                              void run(row.id, 'triage', t('support:complaints.notify.triaged'), () =>
                                triage(row.id).unwrap()
                              )
                            }
                          >
                            {t('support:complaints.actions.triage')}
                          </Button>
                        ) : null}
                        {row.status === 'open' || row.status === 'triaged' ? (
                          <>
                            <Button
                              type="button"
                              size="sm"
                              variant="dark"
                              disabled={isBusy}
                              loading={busy?.id === row.id && busy.kind === 'resolve'}
                              onClick={() => {
                                const note = window.prompt(t('support:complaints.resolvePrompt')) ?? '';
                                void run(row.id, 'resolve', t('support:complaints.notify.resolved'), () =>
                                  resolve({
                                    id: row.id,
                                    resolutionNote: note.trim() || t('support:complaints.defaultResolutionNote'),
                                  }).unwrap()
                                );
                              }}
                            >
                              {t('support:complaints.actions.resolve')}
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={isBusy}
                              loading={busy?.id === row.id && busy.kind === 'escalate'}
                              onClick={() =>
                                void run(row.id, 'escalate', t('support:complaints.notify.escalated'), () =>
                                  escalate(row.id).unwrap()
                                )
                              }
                            >
                              {t('support:complaints.actions.escalate')}
                            </Button>
                          </>
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
