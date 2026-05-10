import { ListFiltersBar } from '@/components/admin/ListFiltersBar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { filterSelectClassName } from '@/lib/adminFilters';
import { notifyError, notifySuccess } from '@/lib/notify';
import { rowMatchesSearch } from '@/lib/listQuery';
import type { AdminScannerStatus } from '@/schemas/scanner.schema';
import {
  useGetScanLogsQuery,
  useGetScannersQuery,
  useSuspendScannerMutation,
  useUnsuspendScannerMutation,
} from '@/services/adminApi';
import { useMemo, useState } from 'react';

export function ScannersPage() {
  const scannersQ = useGetScannersQuery();
  const logsQ = useGetScanLogsQuery();
  const [suspend] = useSuspendScannerMutation();
  const [unsuspend] = useUnsuspendScannerMutation();
  const [searchScn, setSearchScn] = useState('');
  const [statusScn, setStatusScn] = useState<'all' | AdminScannerStatus>('all');
  const [searchLog, setSearchLog] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const filteredScanners = useMemo(() => {
    return (scannersQ.data ?? []).filter((row) => {
      if (statusScn !== 'all' && row.status !== statusScn) return false;
      return rowMatchesSearch(searchScn, [
        row.id,
        row.displayName,
        row.organizerName,
        row.deviceLabel,
        row.status,
      ]);
    });
  }, [scannersQ.data, searchScn, statusScn]);

  const filteredLogs = useMemo(() => {
    return (logsQ.data ?? []).filter((row) =>
      rowMatchesSearch(searchLog, [
        row.id,
        row.ticketRef,
        row.scannerLabel,
        row.eventTitle,
        row.outcome,
      ])
    );
  }, [logsQ.data, searchLog]);

  const busy = busyId !== null;

  async function runScannerAction(id: string, okMsg: string, exec: () => Promise<unknown>) {
    setBusyId(id);
    try {
      await exec();
      notifySuccess(okMsg);
    } catch {
      notifyError('Action failed.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-40">Operations</p>
        <h1 className="text-3xl font-extrabold text-ink">Scanners & scan logs</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-ink-60">
          <span className="font-mono text-ink">GET /api/v1/admin/scanners</span> with{' '}
          <span className="font-mono text-ink">suspend</span> / <span className="font-mono text-ink">unsuspend</span>, and{' '}
          <span className="font-mono text-ink">GET /api/v1/admin/scan-logs</span> for recent validation activity.
        </p>
      </div>

      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">Scanners</CardTitle>
        </CardHeader>
        <CardContent>
          <ListFiltersBar
            searchValue={searchScn}
            onSearchChange={setSearchScn}
            searchPlaceholder="Search id, name, organizer, device…"
            className="mb-4"
          >
            <select
              className={filterSelectClassName()}
              value={statusScn}
              onChange={(e) => setStatusScn(e.target.value as typeof statusScn)}
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="offline">Offline</option>
              <option value="unknown">Other</option>
            </select>
          </ListFiltersBar>
          {scannersQ.isLoading ? <p className="text-sm text-ink-60">Loading…</p> : null}
          {!scannersQ.isLoading && filteredScanners.length === 0 ? (
            <p className="mb-3 text-sm font-semibold text-ink-60">No scanners match your filters.</p>
          ) : null}
          <div className="admin-table-scroll">
            <table className="w-full min-w-[720px] text-left text-[14px]">
              <thead className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
                <tr>
                  <th className="px-4 py-3">Scanner</th>
                  <th className="px-4 py-3">Organizer</th>
                  <th className="px-4 py-3">Device</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Last seen</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredScanners.map((row) => (
                  <tr key={row.id} className="border-t border-ink-10 hover:bg-surface-tint">
                    <td className="px-4 py-3">
                      <p className="font-mono text-[12px] font-semibold text-ink-60">{row.id}</p>
                      <p className="font-medium text-ink">{row.displayName}</p>
                    </td>
                    <td className="px-4 py-3 text-ink-60">{row.organizerName ?? '—'}</td>
                    <td className="px-4 py-3 text-ink-60">{row.deviceLabel ?? '—'}</td>
                    <td className="px-4 py-3 capitalize text-ink-60">{row.status}</td>
                    <td className="px-4 py-3 text-[13px] text-ink-60">
                      {row.lastSeenAt ? new Date(row.lastSeenAt).toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {row.status === 'active' || row.status === 'offline' ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={busy}
                            loading={busyId === row.id}
                            onClick={() =>
                              void runScannerAction(row.id, 'Scanner suspended.', () => suspend(row.id).unwrap())
                            }
                          >
                            Suspend
                          </Button>
                        ) : null}
                        {row.status === 'suspended' ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="dark"
                            disabled={busy}
                            loading={busyId === row.id}
                            onClick={() =>
                              void runScannerAction(row.id, 'Scanner re-enabled.', () => unsuspend(row.id).unwrap())
                            }
                          >
                            Unsuspend
                          </Button>
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

      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">Scan logs</CardTitle>
        </CardHeader>
        <CardContent>
          <ListFiltersBar
            searchValue={searchLog}
            onSearchChange={setSearchLog}
            searchPlaceholder="Search id, ticket, scanner, event, outcome…"
            className="mb-4"
          />
          {logsQ.isLoading ? <p className="text-sm text-ink-60">Loading…</p> : null}
          {!logsQ.isLoading && filteredLogs.length === 0 ? (
            <p className="mb-3 text-sm font-semibold text-ink-60">No log rows match your search.</p>
          ) : null}
          <div className="admin-table-scroll">
            <table className="w-full min-w-[800px] text-left text-[14px]">
              <thead className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
                <tr>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Outcome</th>
                  <th className="px-4 py-3">Ticket</th>
                  <th className="px-4 py-3">Scanner</th>
                  <th className="px-4 py-3">Event</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((row) => (
                  <tr key={row.id} className="border-t border-ink-10 hover:bg-surface-tint">
                    <td className="px-4 py-3 font-mono text-[13px] text-ink-60">
                      {new Date(row.scannedAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 capitalize text-ink-60">{row.outcome}</td>
                    <td className="px-4 py-3 font-mono text-[13px] text-ink">{row.ticketRef ?? '—'}</td>
                    <td className="px-4 py-3 text-ink-60">{row.scannerLabel ?? '—'}</td>
                    <td className="px-4 py-3 text-ink-60">{row.eventTitle ?? '—'}</td>
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
