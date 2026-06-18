import { ListFiltersBar } from '@/components/admin/ListFiltersBar';
import { AdminActionsGuideDialog, getDefaultAdminActionPostBody } from '@/components/activity/AdminActionsGuideDialog';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateTime } from '@/lib/localeFormat';
import { notifyError, notifySuccess } from '@/lib/notify';
import { rowMatchesSearch } from '@/lib/listQuery';
import {
  useExecuteAdminActionMutation,
  useGetAdminActionsQuery,
  useGetAuditLogQuery,
  useGetAuditLogsQuery,
} from '@/services/adminApi';
import { CircleHelp } from 'lucide-react';
import { skipToken } from '@reduxjs/toolkit/query';
import { useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

const inputClass =
  'mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 font-mono text-[13px] outline-none focus:border-coral focus:ring-2 focus:ring-coral/30';

export function ActivityAuditPage() {
  const { t } = useTranslation(['insights', 'common']);
  const actionsQ = useGetAdminActionsQuery();
  const logsQ = useGetAuditLogsQuery();
  const [searchActions, setSearchActions] = useState('');
  const [searchLogs, setSearchLogs] = useState('');
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const detailQ = useGetAuditLogQuery(selectedLogId ?? skipToken);
  const [execAction, execState] = useExecuteAdminActionMutation();
  const [jsonBody, setJsonBody] = useState(() => getDefaultAdminActionPostBody());
  const empty = t('common:none');

  const filteredActions = useMemo(() => {
    return (actionsQ.data ?? []).filter((row) =>
      rowMatchesSearch(searchActions, [row.id, row.actionKey, row.label, row.description, row.category])
    );
  }, [actionsQ.data, searchActions]);

  const filteredLogs = useMemo(() => {
    return (logsQ.data ?? []).filter((row) =>
      rowMatchesSearch(searchLogs, [
        row.id,
        row.summary,
        row.actorLabel,
        row.resourceType,
        row.resourceId,
      ])
    );
  }, [logsQ.data, searchLogs]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-40">{t('insights:activity.eyebrow')}</p>
        <h1 className="text-3xl font-extrabold text-ink">{t('insights:activity.title')}</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-ink-60">
          <Trans
            i18nKey="insights:activity.subtitle"
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
          <CardTitle className="text-lg">{t('insights:activity.catalogTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ListFiltersBar
            searchValue={searchActions}
            onSearchChange={setSearchActions}
            searchPlaceholder={t('insights:activity.searchActions')}
            className="mb-4"
          />
          {actionsQ.isLoading ? <p className="text-sm text-ink-60">{t('common:loading')}</p> : null}
          <div className="admin-table-scroll">
            <table className="w-full min-w-[640px] text-left text-[14px]">
              <thead className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
                <tr>
                  <th className="px-4 py-3">{t('insights:activity.columns.key')}</th>
                  <th className="px-4 py-3">{t('insights:activity.columns.label')}</th>
                  <th className="px-4 py-3">{t('insights:activity.columns.category')}</th>
                  <th className="px-4 py-3">{t('insights:activity.columns.description')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredActions.map((row) => (
                  <tr key={row.id} className="border-t border-ink-10 hover:bg-surface-tint">
                    <td className="px-4 py-3 font-mono text-[13px] text-ink">{row.actionKey}</td>
                    <td className="px-4 py-3 font-medium text-ink">{row.label}</td>
                    <td className="px-4 py-3 text-ink-60">{row.category ?? empty}</td>
                    <td className="max-w-md px-4 py-3 text-ink-60">{row.description ?? empty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 border-t border-ink-10 pt-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h3 className="text-[15px] font-bold text-ink">{t('insights:activity.recordAction.title')}</h3>
                <p className="mt-1 text-[13px] text-ink-60">
                  <Trans
                    i18nKey="insights:activity.recordAction.description"
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
              <Button
                type="button"
                variant="outline"
                className="shrink-0 gap-2"
                onClick={() => setGuideOpen(true)}
              >
                <CircleHelp className="h-4 w-4 shrink-0" aria-hidden />
                {t('insights:activity.recordAction.howThisWorks')}
              </Button>
            </div>
            <form
              className="mt-4 max-w-2xl space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                let parsed: Record<string, unknown>;
                try {
                  parsed = JSON.parse(jsonBody) as Record<string, unknown>;
                  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
                    notifyError(t('insights:activity.notify.jsonRootMustBeObject'));
                    return;
                  }
                } catch {
                  notifyError(t('insights:activity.notify.invalidJson'));
                  return;
                }
                try {
                  await execAction(parsed).unwrap();
                  notifySuccess(t('insights:activity.notify.actionSent'));
                } catch {
                  notifyError(t('insights:activity.notify.actionFailed'));
                }
              }}
            >
              <textarea rows={8} className={inputClass} value={jsonBody} onChange={(e) => setJsonBody(e.target.value)} />
              <Button type="submit" disabled={execState.isLoading} loading={execState.isLoading}>
                {t('insights:activity.recordAction.submit')}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      <AdminActionsGuideDialog open={guideOpen} onClose={() => setGuideOpen(false)} />

      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">{t('insights:activity.auditLog.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ListFiltersBar
            searchValue={searchLogs}
            onSearchChange={setSearchLogs}
            searchPlaceholder={t('insights:activity.auditLog.search')}
            className="mb-4"
          />
          {logsQ.isLoading ? <p className="text-sm text-ink-60">{t('common:loading')}</p> : null}
          <div className="admin-table-scroll">
            <table className="w-full min-w-[800px] text-left text-[14px]">
              <thead className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
                <tr>
                  <th className="px-4 py-3">{t('insights:activity.auditLog.columns.time')}</th>
                  <th className="px-4 py-3">{t('insights:activity.auditLog.columns.summary')}</th>
                  <th className="px-4 py-3">{t('insights:activity.auditLog.columns.actor')}</th>
                  <th className="px-4 py-3">{t('insights:activity.auditLog.columns.resource')}</th>
                  <th className="px-4 py-3">{t('insights:activity.auditLog.columns.detail')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((row) => (
                  <tr key={row.id} className="border-t border-ink-10 hover:bg-surface-tint">
                    <td className="px-4 py-3 font-mono text-[13px] text-ink-60">
                      {formatDateTime(row.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-ink">{row.summary}</td>
                    <td className="px-4 py-3 text-ink-60">{row.actorLabel ?? empty}</td>
                    <td className="px-4 py-3 font-mono text-[12px] text-ink-60">
                      {row.resourceType ?? empty}
                      {row.resourceId ? ` · ${row.resourceId}` : ''}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        type="button"
                        size="sm"
                        variant={selectedLogId === row.id ? 'dark' : 'outline'}
                        onClick={() => setSelectedLogId(row.id === selectedLogId ? null : row.id)}
                      >
                        {selectedLogId === row.id
                          ? t('insights:activity.auditLog.hide')
                          : t('insights:activity.auditLog.view')}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedLogId && detailQ.isLoading ? (
            <p className="mt-4 text-sm text-ink-60">{t('insights:activity.auditLog.loadingDetail')}</p>
          ) : null}
          {selectedLogId && detailQ.isError ? (
            <p className="mt-4 text-sm font-semibold text-coral">{t('insights:activity.auditLog.detailError')}</p>
          ) : null}
          {selectedLogId && detailQ.data ? (
            <div className="mt-6 rounded-2xl border border-ink-10 bg-ink-5 p-4">
              <p className="font-mono text-[12px] font-semibold text-ink-60">{detailQ.data.id}</p>
              <p className="mt-1 text-[15px] font-semibold text-ink">{detailQ.data.summary}</p>
              <dl className="mt-3 grid gap-2 text-[13px] text-ink-60 sm:grid-cols-2">
                <div>
                  <dt className="font-bold uppercase tracking-wide text-ink-40">
                    {t('insights:activity.auditLog.ip')}
                  </dt>
                  <dd className="font-mono text-ink">{detailQ.data.ip ?? empty}</dd>
                </div>
                <div>
                  <dt className="font-bold uppercase tracking-wide text-ink-40">
                    {t('insights:activity.auditLog.userAgent')}
                  </dt>
                  <dd className="break-all text-ink">{detailQ.data.userAgent ?? empty}</dd>
                </div>
              </dl>
              {detailQ.data.changes && Object.keys(detailQ.data.changes).length > 0 ? (
                <pre className="mt-4 max-h-64 overflow-auto rounded-xl bg-white p-3 font-mono text-[12px] text-ink">
                  {JSON.stringify(detailQ.data.changes, null, 2)}
                </pre>
              ) : (
                <p className="mt-4 text-[13px] text-ink-60">{t('insights:activity.auditLog.noChanges')}</p>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
