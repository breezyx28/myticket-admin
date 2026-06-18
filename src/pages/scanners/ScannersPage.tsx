import { ListFiltersBar } from '@/components/admin/ListFiltersBar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentLocale } from '@/i18n';
import { filterSelectClassName } from '@/lib/adminFilters';
import { formatDateTime } from '@/lib/localeFormat';
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
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

function statusBadge(status: AdminScannerStatus, t: (key: string) => string) {
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
      {t(`scannerStatus.${status}`)}
    </span>
  );
}

function organizerLabel(row: AdminScannerRow) {
  const parts = [row.organizerName, row.organizerCompanyName].filter(Boolean);
  if (parts.length) return parts.join(' · ');
  return null;
}

function outcomeBadge(
  outcome: AdminScanLogOutcome,
  t: (key: string) => string,
  rawResult?: string,
) {
  const styles: Record<AdminScanLogOutcome, string> = {
    valid: 'bg-mint/20 text-ink border-mint/40',
    invalid: 'bg-coral/15 text-coral border-coral/40',
    duplicate: 'bg-amber/15 text-amber border-amber/40',
    error: 'bg-red-100 text-red-700 border-red-200',
    unknown: 'bg-ink-5 text-ink-60 border-ink-10',
  };
  const label =
    rawResult && rawResult !== outcome ? rawResult : t(`scanOutcome.${outcome}`);
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
  const { t } = useTranslation(['operations', 'common']);
  const locale = getCurrentLocale();
  const ot = (key: string) => t(`operations:${key}`);
  const ticketCode = row.ticketCode ?? row.ticketRef;
  const scannerTitle = row.scannerName ?? row.scannerLabel;

  return (
    <tr className="border-t border-ink-10 hover:bg-surface-tint">
      <td className="px-4 py-3 font-mono text-[13px] text-ink-60">
        {formatDateTime(row.scannedAt, locale)}
      </td>
      <td className="px-4 py-3">{outcomeBadge(row.outcome, ot, row.result)}</td>
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
                  <span className="ml-1 font-mono text-[11px] text-ink-40">{row.organizerCode}</span>
                ) : null}
              </p>
            ) : null}
          </div>
        ) : (
          <span className="text-ink-60">{t('common:none')}</span>
        )}
      </td>
      <td className="px-4 py-3">
        {row.eventTitle ? (
          <div className="space-y-0.5">
            {row.eventDetailPath ? (
              <Link to={row.eventDetailPath} className="font-semibold text-coral hover:underline">
                {row.eventTitle}
              </Link>
            ) : (
              <p className="font-semibold text-ink">{row.eventTitle}</p>
            )}
            {row.eventCode ? (
              <p className="font-mono text-[11px] text-ink-40">{row.eventCode}</p>
            ) : null}
            {row.eventStatus ? (
              <p className="text-[12px] text-ink-60">{row.eventStatus}</p>
            ) : null}
          </div>
        ) : (
          <span className="text-ink-60">{t('common:none')}</span>
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
                {[row.ticketTypeName, row.ticketSeatLabel ? t('operations:seat', { label: row.ticketSeatLabel }) : null]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            ) : null}
            {row.ticketStatus ? (
              <p className="text-[12px] text-ink-60">{row.ticketStatus}</p>
            ) : null}
            {row.ticketOrderId ? (
              <p className="text-[11px] text-ink-40">
                <Link
                  to={`/orders/${row.ticketOrderId}`}
                  className="font-mono font-semibold text-coral hover:underline"
                >
                  {t('operations:orderLink', { id: row.ticketOrderId })}
                </Link>
              </p>
            ) : null}
          </div>
        ) : (
          <span className="text-ink-60">{t('common:none')}</span>
        )}
      </td>
    </tr>
  );
}

const SCANNER_STATUSES: AdminScannerStatus[] = ['active', 'suspended', 'offline', 'unknown'];

export function ScannersPage() {
  const { t } = useTranslation(['operations', 'common']);
  const locale = getCurrentLocale();
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
  const ot = (key: string) => t(`operations:${key}`);

  async function runScannerAction(id: string, okMsg: string, exec: () => Promise<unknown>) {
    setBusyId(id);
    try {
      await exec();
      notifySuccess(okMsg);
    } catch {
      notifyError(t('operations:scanners.notifyActionFailed'));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-40">
          {t('operations:operationsLabel')}
        </p>
        <h1 className="text-3xl font-extrabold text-ink">{t('operations:scanners.title')}</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-ink-60">
          <Trans
            ns="operations"
            i18nKey="scanners.subtitle"
            components={{ mono: <span className="font-mono text-ink" /> }}
          />
        </p>
      </div>

      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">{t('operations:scanners.scanners')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ListFiltersBar
            searchValue={searchScn}
            onSearchChange={setSearchScn}
            searchPlaceholder={t('operations:scanners.searchScanners')}
            className="mb-4"
          >
            <select
              className={filterSelectClassName()}
              value={statusScn}
              onChange={(e) => setStatusScn(e.target.value as typeof statusScn)}
            >
              <option value="all">{t('operations:allStatuses')}</option>
              {SCANNER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {t(`operations:scannerStatus.${s}`)}
                </option>
              ))}
            </select>
          </ListFiltersBar>
          {scannersQ.isLoading ? <p className="text-sm text-ink-60">{t('common:loading')}</p> : null}
          {!scannersQ.isLoading && filteredScanners.length === 0 ? (
            <p className="mb-3 text-sm font-semibold text-ink-60">{t('operations:scanners.emptyScanners')}</p>
          ) : null}
          <div className="admin-table-scroll">
            <table className="w-full min-w-[960px] text-left text-[14px]">
              <thead className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
                <tr>
                  <th className="px-4 py-3">{t('operations:scanners.colScanner')}</th>
                  <th className="px-4 py-3">{t('operations:scanners.colOrganizer')}</th>
                  <th className="px-4 py-3">{t('operations:orders.colStatus')}</th>
                  <th className="px-4 py-3">{t('operations:scanners.colLastLogin')}</th>
                  <th className="px-4 py-3">{t('common:actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredScanners.map((row) => {
                  const orgLabel = organizerLabel(row);
                  const canSuspend =
                    row.status === 'active' || row.status === 'offline' || row.status === 'unknown';
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
                                {row.organizerName ?? t('operations:scanners.organizer')}
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
                          <span className="text-ink-60">{t('common:none')}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">{statusBadge(row.status, ot)}</td>
                      <td className="px-4 py-3 text-[13px] text-ink-60">
                        {row.lastSeenAt
                          ? formatDateTime(row.lastSeenAt, locale)
                          : t('operations:never')}
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
                                void runScannerAction(row.id, t('operations:scanners.notifySuspended'), () =>
                                  suspend(row.id).unwrap(),
                                )
                              }
                            >
                              {t('operations:scanners.suspend')}
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
                                void runScannerAction(row.id, t('operations:scanners.notifyReenabled'), () =>
                                  unsuspend(row.id).unwrap(),
                                )
                              }
                            >
                              {t('operations:scanners.unsuspend')}
                            </Button>
                          ) : null}
                          {!canSuspend && !canUnsuspend ? (
                            <span className="text-[12px] text-ink-40">{t('operations:noActions')}</span>
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
          <CardTitle className="text-lg">{t('operations:scanners.scanLogs')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ListFiltersBar
            searchValue={searchLog}
            onSearchChange={setSearchLog}
            searchPlaceholder={t('operations:scanners.searchLogs')}
            className="mb-4"
          />
          {logsQ.isLoading ? <p className="text-sm text-ink-60">{t('common:loading')}</p> : null}
          {!logsQ.isLoading && filteredLogs.length === 0 ? (
            <p className="mb-3 text-sm font-semibold text-ink-60">{t('operations:scanners.emptyLogs')}</p>
          ) : null}
          <div className="admin-table-scroll">
            <table className="w-full min-w-[1080px] text-left text-[14px]">
              <thead className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
                <tr>
                  <th className="px-4 py-3">{t('operations:scanners.colTime')}</th>
                  <th className="px-4 py-3">{t('operations:scanners.colResult')}</th>
                  <th className="px-4 py-3">{t('operations:scanners.colScanner')}</th>
                  <th className="px-4 py-3">{t('operations:refunds.event')}</th>
                  <th className="px-4 py-3">{t('operations:scanners.colTicket')}</th>
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
