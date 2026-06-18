import { ListFiltersBar } from '@/components/admin/ListFiltersBar';
import { RowActionsMenu, type RowMenuAction } from '@/components/admin/RowActionsMenu';
import { SuspendUserDialog } from '@/components/users/SuspendUserDialog';
import { Button } from '@/components/ui/Button';
import { getCurrentLocale } from '@/i18n';
import { filterSelectClassName } from '@/lib/adminFilters';
import { formatDate } from '@/lib/localeFormat';
import { notifyError, notifySuccess } from '@/lib/notify';
import { cn } from '@/lib/utils';
import type { AdminUserRow } from '@/schemas/user.schema';
import {
  useGetUsersQuery,
  useImpersonateUserMutation,
  useSuspendUserMutation,
  useUnsuspendUserMutation,
} from '@/services/adminApi';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

function roleBadge(role: AdminUserRow['role'], t: (key: string) => string) {
  const styles: Record<AdminUserRow['role'], string> = {
    guest: 'bg-ink-5 text-ink-60 border-ink-10',
    talent: 'bg-mint/20 text-ink border-mint/40',
    vendor: 'bg-lemon/30 text-ink border-lemon/50',
    organizer: 'bg-coral/10 text-coral border-coral/30',
    scanner: 'bg-surface-tint text-ink border-ink-10',
    admin: 'bg-ink text-white border-ink',
  };
  return (
    <span
      className={cn(
        'inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide',
        styles[role],
      )}
    >
      {t(`roles.${role}`)}
    </span>
  );
}

function accountStatusBadge(row: AdminUserRow, t: (key: string) => string) {
  if (row.suspended) {
    return (
      <span className="inline-flex rounded-full border border-coral/40 bg-coral/15 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-coral">
        {t('userStatus.suspended')}
      </span>
    );
  }
  if (row.isActive === false) {
    return (
      <span className="inline-flex rounded-full border border-amber/40 bg-amber/15 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-amber">
        {t('userStatus.inactive')}
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full border border-mint/40 bg-mint/20 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-ink">
      {t('userStatus.active')}
    </span>
  );
}

function canManageUser(row: AdminUserRow) {
  return row.role !== 'admin';
}

export function UsersPage() {
  const { t } = useTranslation(['operations', 'common']);
  const locale = getCurrentLocale();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [role, setRole] = useState<'all' | AdminUserRow['role']>('all');
  const [suspended, setSuspended] = useState<'all' | 'yes' | 'no'>('all');
  const [suspendTarget, setSuspendTarget] = useState<AdminUserRow | null>(null);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);

  const roleOptions: Array<{ value: 'all' | AdminUserRow['role']; label: string }> = useMemo(
    () => [
      { value: 'all', label: t('operations:roles.all') },
      { value: 'guest', label: t('operations:roles.guest') },
      { value: 'talent', label: t('operations:roles.talent') },
      { value: 'vendor', label: t('operations:roles.vendor') },
      { value: 'organizer', label: t('operations:roles.organizer') },
      { value: 'scanner', label: t('operations:roles.scanner') },
      { value: 'admin', label: t('operations:roles.admin') },
    ],
    [t],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, role, suspended]);

  const listParams = useMemo(
    () => ({
      page,
      perPage: 30,
      ...(role !== 'all' ? { role } : {}),
      ...(suspended !== 'all' ? { suspended } : {}),
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    }),
    [page, role, suspended, debouncedSearch],
  );

  const { data, isLoading, isFetching, isError } = useGetUsersQuery(listParams);
  const [suspend, suspendState] = useSuspendUserMutation();
  const [unsuspend, unsuspendState] = useUnsuspendUserMutation();
  const [impersonate, impersonateState] = useImpersonateUserMutation();

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.perPage)) : 1;
  const busy = busyUserId !== null;

  async function runRowAction(userId: string, action: () => Promise<unknown>) {
    setBusyUserId(userId);
    try {
      await action();
    } finally {
      setBusyUserId(null);
    }
  }

  function rowActions(row: AdminUserRow): RowMenuAction[] {
    const loading = busy && busyUserId === row.id;
    const manageable = canManageUser(row);
    const actions: RowMenuAction[] = [
      {
        key: 'view',
        label: t('operations:users.viewProfile'),
        onSelect: () => {
          void navigate(`/users/${encodeURIComponent(row.id)}`);
        },
      },
    ];

    if (manageable && !row.suspended) {
      actions.push({
        key: 'suspend',
        label: t('operations:users.suspend'),
        danger: true,
        loading,
        onSelect: () => setSuspendTarget(row),
      });
    }

    if (manageable && row.suspended) {
      actions.push({
        key: 'unsuspend',
        label: t('operations:users.unsuspend'),
        loading: loading || unsuspendState.isLoading,
        onSelect: async () => {
          await runRowAction(row.id, async () => {
            try {
              await unsuspend(row.id).unwrap();
              notifySuccess(t('operations:users.notifyUnsuspended'));
            } catch {
              notifyError(t('operations:users.notifyUnsuspendFailed'));
            }
          });
        },
      });
    }

    if (manageable) {
      actions.push({
        key: 'impersonate',
        label: t('operations:users.impersonate'),
        loading: loading || impersonateState.isLoading,
        onSelect: async () => {
          await runRowAction(row.id, async () => {
            try {
              const res = await impersonate(row.id).unwrap();
              const payload = res.data;
              if (
                payload &&
                typeof payload === 'object' &&
                'token' in payload &&
                typeof payload.token === 'string'
              ) {
                notifySuccess(t('operations:users.notifyImpersonationToken'));
              } else {
                notifySuccess(t('operations:users.notifyImpersonationDone'));
              }
            } catch {
              notifyError(t('operations:users.notifyImpersonationFailed'));
            }
          });
        },
      });
    }

    return actions;
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)] lg:items-end">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-40">
            {t('operations:directory')}
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
            {t('operations:users.title')}
          </h1>
          <p className="mt-3 max-w-[65ch] text-[15px] leading-relaxed text-ink-60">
            <Trans
              ns="operations"
              i18nKey="users.subtitle"
              components={{ mono: <span className="font-mono text-[13px] text-ink" /> }}
            />
          </p>
        </div>
        {data ? (
          <div className="rounded-3xl border border-ink-10 bg-white px-5 py-4 shadow-card-sm">
            <p className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
              {t('operations:users.directoryTotal')}
            </p>
            <p className="mt-1 font-mono text-3xl font-black tracking-tight text-ink">
              {data.total.toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US')}
            </p>
            <p className="mt-1 text-[13px] text-ink-60">
              {t('operations:users.pageMeta', {
                page: data.currentPage,
                total: totalPages,
                perPage: data.perPage,
              })}
            </p>
          </div>
        ) : null}
      </div>

      <section className="overflow-hidden rounded-3xl border border-ink-10 bg-white shadow-card-sm">
        <div className="border-b border-ink-10 px-5 py-4 md:px-6">
          <ListFiltersBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder={t('operations:users.searchPlaceholder')}
          >
            <select
              className={filterSelectClassName()}
              value={role}
              onChange={(e) => setRole(e.target.value as typeof role)}
            >
              {roleOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <select
              className={filterSelectClassName()}
              value={suspended}
              onChange={(e) => setSuspended(e.target.value as typeof suspended)}
            >
              <option value="all">{t('operations:userStatus.any')}</option>
              <option value="no">{t('operations:userStatus.activeOnly')}</option>
              <option value="yes">{t('operations:userStatus.suspendedOnly')}</option>
            </select>
          </ListFiltersBar>
        </div>

        <div className="px-5 py-4 md:px-6">
          {isLoading || isFetching ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-2xl bg-ink-5" />
              ))}
            </div>
          ) : null}

          {isError ? (
            <p className="rounded-2xl bg-coral/10 px-4 py-3 text-[14px] font-semibold text-coral">
              {t('operations:users.loadError')}
            </p>
          ) : null}

          {!isLoading && !isError && (data?.items.length ?? 0) === 0 ? (
            <div className="rounded-2xl border border-dashed border-ink-10 px-6 py-12 text-center">
              <p className="text-lg font-bold text-ink">{t('operations:users.emptyTitle')}</p>
              <p className="mt-2 text-[14px] text-ink-60">{t('operations:users.emptyHint')}</p>
            </div>
          ) : null}

          {!isLoading && !isError && data && data.items.length > 0 ? (
            <div className="admin-table-scroll">
              <table className="w-full min-w-[980px] text-left text-[14px]">
                <thead className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
                  <tr>
                    <th className="px-4 py-3">{t('operations:users.colUser')}</th>
                    <th className="px-4 py-3">{t('operations:users.colContact')}</th>
                    <th className="px-4 py-3">{t('operations:users.colRole')}</th>
                    <th className="px-4 py-3">{t('operations:users.colStatus')}</th>
                    <th className="px-4 py-3">{t('operations:users.colJoined')}</th>
                    <th className="px-4 py-3 text-right">{t('common:actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((row) => (
                    <tr key={row.id} className="border-t border-ink-10 transition hover:bg-surface-tint">
                      <td className="px-4 py-3">
                        <Link
                          to={`/users/${encodeURIComponent(row.id)}`}
                          className="group block min-w-0"
                        >
                          <p className="font-semibold text-ink group-hover:text-coral">{row.displayName}</p>
                          <p className="mt-0.5 font-mono text-[11px] text-ink-40">#{row.id}</p>
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-ink">{row.email}</p>
                        {row.phone ? (
                          <p className="mt-0.5 font-mono text-[12px] text-ink-60">{row.phone}</p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">{roleBadge(row.role, (key) => t(`operations:${key}`))}</td>
                      <td className="px-4 py-3">
                        {accountStatusBadge(row, (key) => t(`operations:${key}`))}
                      </td>
                      <td className="px-4 py-3 font-mono text-[13px] text-ink-60">
                        {row.joinedAt ? formatDate(row.joinedAt, locale) : t('common:none')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/users/${encodeURIComponent(row.id)}`}
                            className="hidden rounded-xl border border-ink-10 px-3 py-1.5 text-[12px] font-bold text-coral transition hover:border-coral/40 hover:bg-coral/5 sm:inline-flex"
                          >
                            {t('common:view')}
                          </Link>
                          <RowActionsMenu
                            ariaLabel={t('operations:actionsFor', { name: row.displayName })}
                            actions={rowActions(row)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {data && data.total > 0 ? (
            <div className="mt-6 flex flex-col gap-3 border-t border-ink-10 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-mono text-[13px] text-ink-60">
                {t('operations:users.pagination', {
                  shown: data.items.length,
                  total: data.total.toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US'),
                  page: data.currentPage,
                  totalPages,
                })}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || isFetching}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden />
                  {t('operations:previous')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages || isFetching}
                  onClick={() => setPage((p) => p + 1)}
                >
                  {t('common:next')}
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <SuspendUserDialog
        open={suspendTarget !== null}
        userLabel={suspendTarget?.displayName ?? t('operations:users.thisUser')}
        loading={suspendState.isLoading}
        onClose={() => setSuspendTarget(null)}
        onConfirm={async (values) => {
          if (!suspendTarget) return;
          try {
            await suspend({ id: suspendTarget.id, body: values }).unwrap();
            notifySuccess(t('operations:users.notifySuspended'));
            setSuspendTarget(null);
          } catch {
            notifyError(t('operations:users.notifySuspendFailed'));
          }
        }}
      />
    </div>
  );
}
