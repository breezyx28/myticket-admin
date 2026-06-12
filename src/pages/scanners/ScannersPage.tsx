import { ListFiltersBar } from '@/components/admin/ListFiltersBar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { filterSelectClassName } from '@/lib/adminFilters';
import { notifyError, notifySuccess } from '@/lib/notify';
import { rowMatchesSearch } from '@/lib/listQuery';
import { cn } from '@/lib/utils';
import type {
  AdminScanLogOutcome,
  AdminScanLogRow,
  AdminScannerRow,
  AdminScannerStatus,
} from '@/schemas/scanner.schema';
import {
  useGetScanLogsQuery,
  useGetScannersQuery,
  useSuspendScannerMutation,
  useUnsuspendScannerMutation,
} from '@/services/adminApi';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

function statusBadge(status: AdminScannerStatus) {
  const styles: Record<AdminScannerStatus, string> = {
    active: 'bg-mint/20 text-ink border-mint/40',
    suspended: 'bg-coral/15 text-coral border-coral/40',
    offline: 'bg-ink-5 text-ink-60 border-ink-10',
    unknown: 'bg-amber/15 text-amber border-amber/40',
  };
  return (
    <span
      className={cn(
        'inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide',
        styles[status],
      )}
    >
      {status}
    </span>
  );
}

function organizerLabel(row: AdminScannerRow) {
  const parts = [row.organizerName, row.organizerCompanyName].filter(Boolean);
  if (parts.length) return parts.join(' · ');
  return null;
}

function outcomeBadge(outcome: AdminScanLogOutcome, rawResult?: string) {
  const styles: Record<AdminScanLogOutcome, string> = {
    valid: 'bg-mint/20 text-ink border-mint/40',
    invalid: 'bg-coral/15 text-coral border-coral/40',
    duplicate: 'bg-amber/15 text-amber border-amber/40',
    error: 'bg-red-100 text-red-700 border-red-200',
    unknown: 'bg-ink-5 text-ink-60 border-ink-10',
  };
  const label = rawResult && rawResult !== outcome ? rawResult : outcome;
  return (
    <span
      className={cn(
        'inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide',
        styles[outcome],
      )}
    >
      {label}
    </span>
  );
}

function ScanLogTableRow({ row }: { row: AdminScanLogRow }) {
  const ticketCode = row.ticketCode ?? row.ticketRef;
  const scannerTitle = row.scannerName ?? row.scannerLabel;

  return (
    <tr className="border-t border-ink-10 hover:bg-surface-tint">
      <td className="px-4 py-3 font-mono text-[13px] text-ink-60">
        {new Date(row.scannedAt).toLocaleString()}
      </td>
      <td className="px-4 py-3">{outcomeBadge(row.outcome, row.result)}</td>
      <td className="px-4 py-3">
        {scannerTitle ? (
          <div className="space-y-0.5">
            {row.scannerCode ? (
              <p className="font-mono text-[11px] text-ink-40">{row.scannerCode}</p>
            ) : null}
            <p className="font-medium text-ink">{scannerTitle}</p>
            {row.scannerEmail ? (
              <p className="text-[12px] text-ink-60">{row.scannerEmail}</p>
            ) : null}
            {row.organizerName ? (
              <p className="text-[12px] text-ink-60">
                {row.organizerProfileId ? (
                  <Link
                    to={`/approvals/organizers/${row.organizerProfileId}`}
                    className="font-semibold text-coral hover:underline"
                  >
                    {row.organizerName}
                  </Link>
                ) : (
                  row.organizerName
                )}
                {row.organizerCode ? (
                  <span className="ml-1 font-mono text-[11px] text-ink-40">
                    {row.organizerCode}
                  </span>
                ) : null}
              </p>
            ) : null}
          </div>
        ) : (
          <span className="text-ink-60">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        {row.eventTitle ? (
          <div className="space-y-0.5">
            {row.eventDetailPath ? (
              <Link
                to={row.eventDetailPath}
                className="font-semibold text-coral hover:underline"
              >
                {row.eventTitle}
              </Link>
            ) : (
              <p className="font-semibold text-ink">{row.eventTitle}</p>
            )}
            {row.eventCode ? (
              <p className="font-mono text-[11px] text-ink-40">{row.eventCode}</p>
            ) : null}
            {row.eventStatus ? (
              <p className="text-[12px] capitalize text-ink-60">{row.eventStatus}</p>
            ) : null}
          </div>
        ) : (
          <span className="text-ink-60">—</span>
        )}
      </td>
      <td className="px-4 py-3">
        {ticketCode ? (
          <div className="space-y-0.5">
            {row.ticketDetailPath ? (
              <Link
                to={row.ticketDetailPath}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[13px] font-semibold text-coral hover:underline"
              >
                {ticketCode}
              </Link>
            ) : (
              <p className="font-mono text-[13px] font-semibold text-ink">{ticketCode}</p>
            )}
            {row.ticketTypeName || row.ticketSeatLabel ? (
              <p className="text-[12px] text-ink-60">
                {[row.ticketTypeName, row.ticketSeatLabel ? `Seat ${row.ticketSeatLabel}` : null]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            ) : null}
            {row.ticketStatus ? (
              <p className="text-[12px] capitalize text-ink-60">{row.ticketStatus}</p>
            ) : null}
            {row.ticketOrderId ? (
              <p className="text-[11px] text-ink-40">
                Order{' '}
                <Link
                  to={`/orders/${row.ticketOrderId}`}
                  className="font-mono font-semibold text-coral hover:underline"
                >
                  #{row.ticketOrderId}
                </Link>
              </p>
            ) : null}
          </div>
        ) : (
          <span className="text-ink-60">—</span>
        )}
      </td>
    </tr>
  );
}

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
        row.code,
        row.displayName,
        row.email,
        row.organizerName,
        row.organizerCompanyName,
        row.organizerCode,
        row.organizerSlug,
        row.deviceLabel,
        row.status,
      ]);
    });
  }, [scannersQ.data, searchScn, statusScn]);

  const filteredLogs = useMemo(() => {
    return (logsQ.data ?? []).filter((row) =>
      rowMatchesSearch(searchLog, [
        row.id,
        row.result,
        row.outcome,
        row.ticketRef,
        row.ticketCode,
        row.ticketSeatLabel,
        row.ticketTypeName,
        row.ticketStatus,
        row.scannerLabel,
        row.scannerName,
        row.scannerCode,
        row.scannerEmail,
        row.organizerName,
        row.organizerCode,
        row.eventTitle,
        row.eventCode,
        row.eventStatus,
      ]),
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
            searchPlaceholder="Search code, name, email, organizer…"
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
            <table className="w-full min-w-[960px] text-left text-[14px]">
              <thead className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
                <tr>
                  <th className="px-4 py-3">Scanner</th>
                  <th className="px-4 py-3">Organizer</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Last login</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredScanners.map((row) => {
                  const orgLabel = organizerLabel(row);
                  const canSuspend = row.status === 'active' || row.status === 'offline' || row.status === 'unknown';
                  const canUnsuspend = row.status === 'suspended';

                  return (
                    <tr key={row.id} className="border-t border-ink-10 hover:bg-surface-tint">
                      <td className="px-4 py-3">
                        <p className="font-mono text-[12px] font-semibold text-ink-60">
                          {row.code ?? row.id}
                        </p>
                        <p className="font-medium text-ink">{row.displayName}</p>
                        {row.email ? (
                          <p className="mt-0.5 text-[12px] text-ink-60">{row.email}</p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        {orgLabel ? (
                          <div className="space-y-0.5">
                            {row.organizerProfileId ? (
                              <Link
                                to={`/approvals/organizers/${row.organizerProfileId}`}
                                className="font-semibold text-coral hover:underline"
                              >
                                {row.organizerName ?? 'Organizer'}
                              </Link>
                            ) : (
                              <p className="font-semibold text-ink">{row.organizerName}</p>
                            )}
                            {row.organizerCompanyName &&
                            row.organizerCompanyName !== row.organizerName ? (
                              <p className="text-[12px] text-ink-60">{row.organizerCompanyName}</p>
                            ) : null}
                            {row.organizerCode ? (
                              <p className="font-mono text-[11px] text-ink-40">{row.organizerCode}</p>
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-ink-60">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">{statusBadge(row.status)}</td>
                      <td className="px-4 py-3 text-[13px] text-ink-60">
                        {row.lastSeenAt ? new Date(row.lastSeenAt).toLocaleString() : 'Never'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1.5">
                          {canSuspend ? (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={busy}
                              loading={busyId === row.id}
                              onClick={() =>
                                void runScannerAction(row.id, 'Scanner suspended.', () =>
                                  suspend(row.id).unwrap(),
                                )
                              }
                            >
                              Suspend
                            </Button>
                          ) : null}
                          {canUnsuspend ? (
                            <Button
                              type="button"
                              size="sm"
                              variant="dark"
                              disabled={busy}
                              loading={busyId === row.id}
                              onClick={() =>
                                void runScannerAction(row.id, 'Scanner re-enabled.', () =>
                                  unsuspend(row.id).unwrap(),
                                )
                              }
                            >
                              Unsuspend
                            </Button>
                          ) : null}
                          {!canSuspend && !canUnsuspend ? (
                            <span className="text-[12px] text-ink-40">No actions</span>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
            searchPlaceholder="Search result, ticket, scanner, event, organizer…"
            className="mb-4"
          />
          {logsQ.isLoading ? <p className="text-sm text-ink-60">Loading…</p> : null}
          {!logsQ.isLoading && filteredLogs.length === 0 ? (
            <p className="mb-3 text-sm font-semibold text-ink-60">No log rows match your search.</p>
          ) : null}
          <div className="admin-table-scroll">
            <table className="w-full min-w-[1080px] text-left text-[14px]">
              <thead className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
                <tr>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Result</th>
                  <th className="px-4 py-3">Scanner</th>
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3">Ticket</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((row) => (
                  <ScanLogTableRow key={row.id} row={row} />
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
