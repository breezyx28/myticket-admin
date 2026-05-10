import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ListFiltersBar } from '@/components/admin/ListFiltersBar';
import { notifyError, notifySuccess } from '@/lib/notify';
import { rowMatchesSearch } from '@/lib/listQuery';
import {
  useExecuteAdminActionMutation,
  useGetAdminActionsQuery,
  useGetAuditLogQuery,
  useGetAuditLogsQuery,
} from '@/services/adminApi';
import { skipToken } from '@reduxjs/toolkit/query';
import { useMemo, useState } from 'react';

const inputClass =
  'mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 font-mono text-[13px] outline-none focus:border-coral focus:ring-2 focus:ring-coral/30';

const defaultActionBody = `{
  "action_key": "rebuild_search_index",
  "async": true
}`;

export function ActivityAuditPage() {
  const actionsQ = useGetAdminActionsQuery();
  const logsQ = useGetAuditLogsQuery();
  const [searchActions, setSearchActions] = useState('');
  const [searchLogs, setSearchLogs] = useState('');
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const detailQ = useGetAuditLogQuery(selectedLogId ?? skipToken);
  const [execAction, execState] = useExecuteAdminActionMutation();
  const [jsonBody, setJsonBody] = useState(defaultActionBody);

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
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-40">Insights</p>
        <h1 className="text-3xl font-extrabold text-ink">Activity & audit</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-ink-60">
          <span className="font-mono text-ink">GET /api/v1/admin/admin-actions</span> and{' '}
          <span className="font-mono text-ink">POST …/admin-actions</span> with a JSON body;{' '}
          <span className="font-mono text-ink">GET …/audit-logs</span> and{' '}
          <span className="font-mono text-ink">{`GET …/audit-logs/{id}`}</span> for detail (IP, user-agent, changes
          when the API provides them).
        </p>
      </div>

      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">Admin actions catalog</CardTitle>
        </CardHeader>
        <CardContent>
          <ListFiltersBar
            searchValue={searchActions}
            onSearchChange={setSearchActions}
            searchPlaceholder="Search key, label, category…"
            className="mb-4"
          />
          {actionsQ.isLoading ? <p className="text-sm text-ink-60">Loading…</p> : null}
          <div className="admin-table-scroll">
            <table className="w-full min-w-[640px] text-left text-[14px]">
              <thead className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
                <tr>
                  <th className="px-4 py-3">Key</th>
                  <th className="px-4 py-3">Label</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Description</th>
                </tr>
              </thead>
              <tbody>
                {filteredActions.map((row) => (
                  <tr key={row.id} className="border-t border-ink-10 hover:bg-surface-tint">
                    <td className="px-4 py-3 font-mono text-[13px] text-ink">{row.actionKey}</td>
                    <td className="px-4 py-3 font-medium text-ink">{row.label}</td>
                    <td className="px-4 py-3 text-ink-60">{row.category ?? '—'}</td>
                    <td className="max-w-md px-4 py-3 text-ink-60">{row.description ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 border-t border-ink-10 pt-6">
            <h3 className="text-[15px] font-bold text-ink">Execute action (POST)</h3>
            <p className="mt-1 text-[13px] text-ink-60">
              Paste a JSON object. Keys and semantics must match your backend contract — the collection does not define
              a request body.
            </p>
            <form
              className="mt-4 max-w-2xl space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                let parsed: Record<string, unknown>;
                try {
                  parsed = JSON.parse(jsonBody) as Record<string, unknown>;
                  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
                    notifyError('Root JSON value must be an object.');
                    return;
                  }
                } catch {
                  notifyError('Invalid JSON.');
                  return;
                }
                try {
                  await execAction(parsed).unwrap();
                  notifySuccess('Action request sent.');
                } catch {
                  notifyError('Action request failed.');
                }
              }}
            >
              <textarea rows={8} className={inputClass} value={jsonBody} onChange={(e) => setJsonBody(e.target.value)} />
              <Button type="submit" disabled={execState.isLoading} loading={execState.isLoading}>
                POST to /admin-actions
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">Audit log</CardTitle>
        </CardHeader>
        <CardContent>
          <ListFiltersBar
            searchValue={searchLogs}
            onSearchChange={setSearchLogs}
            searchPlaceholder="Search id, summary, actor, resource…"
            className="mb-4"
          />
          {logsQ.isLoading ? <p className="text-sm text-ink-60">Loading…</p> : null}
          <div className="admin-table-scroll">
            <table className="w-full min-w-[800px] text-left text-[14px]">
              <thead className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
                <tr>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Summary</th>
                  <th className="px-4 py-3">Actor</th>
                  <th className="px-4 py-3">Resource</th>
                  <th className="px-4 py-3">Detail</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((row) => (
                  <tr key={row.id} className="border-t border-ink-10 hover:bg-surface-tint">
                    <td className="px-4 py-3 font-mono text-[13px] text-ink-60">
                      {new Date(row.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-ink">{row.summary}</td>
                    <td className="px-4 py-3 text-ink-60">{row.actorLabel ?? '—'}</td>
                    <td className="px-4 py-3 font-mono text-[12px] text-ink-60">
                      {row.resourceType ?? '—'}
                      {row.resourceId ? ` · ${row.resourceId}` : ''}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        type="button"
                        size="sm"
                        variant={selectedLogId === row.id ? 'dark' : 'outline'}
                        onClick={() => setSelectedLogId(row.id === selectedLogId ? null : row.id)}
                      >
                        {selectedLogId === row.id ? 'Hide' : 'View'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedLogId && detailQ.isLoading ? (
            <p className="mt-4 text-sm text-ink-60">Loading detail…</p>
          ) : null}
          {selectedLogId && detailQ.isError ? (
            <p className="mt-4 text-sm font-semibold text-coral">Could not load audit detail.</p>
          ) : null}
          {selectedLogId && detailQ.data ? (
            <div className="mt-6 rounded-2xl border border-ink-10 bg-ink-5 p-4">
              <p className="font-mono text-[12px] font-semibold text-ink-60">{detailQ.data.id}</p>
              <p className="mt-1 text-[15px] font-semibold text-ink">{detailQ.data.summary}</p>
              <dl className="mt-3 grid gap-2 text-[13px] text-ink-60 sm:grid-cols-2">
                <div>
                  <dt className="font-bold uppercase tracking-wide text-ink-40">IP</dt>
                  <dd className="font-mono text-ink">{detailQ.data.ip ?? '—'}</dd>
                </div>
                <div>
                  <dt className="font-bold uppercase tracking-wide text-ink-40">User agent</dt>
                  <dd className="break-all text-ink">{detailQ.data.userAgent ?? '—'}</dd>
                </div>
              </dl>
              {detailQ.data.changes && Object.keys(detailQ.data.changes).length > 0 ? (
                <pre className="mt-4 max-h-64 overflow-auto rounded-xl bg-white p-3 font-mono text-[12px] text-ink">
                  {JSON.stringify(detailQ.data.changes, null, 2)}
                </pre>
              ) : (
                <p className="mt-4 text-[13px] text-ink-60">No structured changes on this entry.</p>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
