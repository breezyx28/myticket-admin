import { SuspendUserDialog } from '@/components/users/SuspendUserDialog';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentLocale } from '@/i18n';
import { formatDate, formatDateTime } from '@/lib/localeFormat';
import { notifyError, notifySuccess } from '@/lib/notify';
import { cn } from '@/lib/utils';
import type { AdminUserDetail } from '@/schemas/user.schema';
import {
  useGetUserQuery,
  useImpersonateUserMutation,
  useSuspendUserMutation,
  useUnsuspendUserMutation,
} from '@/services/adminApi';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';

function roleBadge(role: AdminUserDetail['role'], t: (key: string) => string) {
  const styles: Record<AdminUserDetail['role'], string> = {
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

function canManageUser(user: AdminUserDetail) {
  return user.role !== 'admin';
}

export function UserDetailPage() {
  const { t } = useTranslation(['operations', 'common']);
  const locale = getCurrentLocale();
  const { id = '' } = useParams();
  const q = useGetUserQuery(id, { skip: !id });
  const [suspend, suspendState] = useSuspendUserMutation();
  const [unsuspend, unsuspendState] = useUnsuspendUserMutation();
  const [impersonate, impersonateState] = useImpersonateUserMutation();
  const [suspendOpen, setSuspendOpen] = useState(false);

  if (q.isLoading) {
    return (
      <div className="mx-auto max-w-[1400px] space-y-4">
        <div className="h-8 w-40 animate-pulse rounded-xl bg-ink-5" />
        <div className="h-32 animate-pulse rounded-3xl bg-ink-5" />
      </div>
    );
  }

  if (!q.data) {
    return (
      <div className="mx-auto max-w-[1400px] rounded-3xl border border-ink-10 bg-white p-8">
        <p className="font-semibold text-ink">{t('operations:users.notFound')}</p>
        <Link to="/users" className="mt-4 inline-block text-coral hover:underline">
          {t('operations:users.backToUsers')}
        </Link>
      </div>
    );
  }

  const u = q.data;
  const manageable = canManageUser(u);
  const ot = (key: string) => t(`operations:${key}`);

  return (
    <div className="mx-auto max-w-[1400px] space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link to="/users" className="text-[13px] font-semibold text-coral hover:underline">
            {t('operations:users.backLink')}
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-ink md:text-4xl">{u.displayName}</h1>
            {roleBadge(u.role, ot)}
            {u.suspended ? (
              <span className="rounded-full border border-coral/40 bg-coral/15 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-coral">
                {t('operations:userStatus.suspended')}
              </span>
            ) : u.isActive === false ? (
              <span className="rounded-full border border-amber/40 bg-amber/15 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-amber">
                {t('operations:userStatus.inactive')}
              </span>
            ) : (
              <span className="rounded-full border border-mint/40 bg-mint/20 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-ink">
                {t('operations:userStatus.active')}
              </span>
            )}
          </div>
          <p className="mt-2 text-[14px] text-ink-60">{u.email}</p>
          <p className="mt-1 font-mono text-[12px] text-ink-40">
            {t('operations:users.userId', { id: u.id })}
          </p>
        </div>

        {manageable ? (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              loading={impersonateState.isLoading}
              onClick={async () => {
                try {
                  const res = await impersonate(u.id).unwrap();
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
              }}
            >
              {t('operations:users.impersonate')}
            </Button>
            {u.suspended ? (
              <Button
                type="button"
                variant="secondary"
                loading={unsuspendState.isLoading}
                onClick={async () => {
                  try {
                    await unsuspend(u.id).unwrap();
                    notifySuccess(t('operations:users.notifyUnsuspended'));
                  } catch {
                    notifyError(t('operations:users.notifyUnsuspendFailed'));
                  }
                }}
              >
                {t('operations:users.unsuspend')}
              </Button>
            ) : (
              <Button type="button" variant="danger" onClick={() => setSuspendOpen(true)}>
                {t('operations:users.suspend')}
              </Button>
            )}
          </div>
        ) : (
          <p className="rounded-2xl border border-ink-10 bg-surface-tint px-4 py-3 text-[13px] text-ink-60">
            {t('operations:users.adminNoManage')}
          </p>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <Card className="rounded-3xl border-ink-10 shadow-card-sm">
          <CardHeader>
            <CardTitle className="text-lg">{t('operations:users.account')}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-[14px] sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
                {t('operations:users.phone')}
              </p>
              <p className="mt-1 font-mono text-ink">{u.phone ?? t('common:none')}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
                {t('operations:users.joined')}
              </p>
              <p className="mt-1 text-ink">
                {u.joinedAt ? formatDate(u.joinedAt, locale) : t('common:none')}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
                {t('operations:users.emailVerified')}
              </p>
              <p className="mt-1 text-ink">
                {u.emailVerifiedAt ? formatDateTime(u.emailVerifiedAt, locale) : t('common:no')}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
                {t('operations:users.phoneVerified')}
              </p>
              <p className="mt-1 text-ink">
                {u.phoneVerifiedAt ? formatDateTime(u.phoneVerifiedAt, locale) : t('common:no')}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
                {t('operations:users.lastLogin')}
              </p>
              <p className="mt-1 text-ink">
                {u.lastLoginAt ? formatDateTime(u.lastLoginAt, locale) : t('operations:never')}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
                {t('operations:users.lastLoginIp')}
              </p>
              <p className="mt-1 font-mono text-[13px] text-ink">{u.lastLoginIp ?? t('common:none')}</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          <Card className="rounded-3xl border-ink-10 shadow-card-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{t('operations:users.ticketsPurchased')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-mono text-3xl font-black tracking-tight text-ink">{u.ticketsPurchased}</p>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-ink-10 shadow-card-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{t('operations:users.bookings')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-mono text-3xl font-black tracking-tight text-ink">{u.bookingsCount}</p>
            </CardContent>
          </Card>
          <Card className="rounded-3xl border-ink-10 shadow-card-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{t('operations:users.ratingsGiven')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-mono text-3xl font-black tracking-tight text-ink">{u.ratingGivenCount}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {u.suspended ? (
        <Card className="rounded-3xl border-coral/30 bg-coral/5 shadow-card-sm">
          <CardHeader>
            <CardTitle className="text-lg text-coral">{t('operations:users.suspensionDetails')}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-[14px] sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
                {t('operations:users.reason')}
              </p>
              <p className="mt-1 text-ink">{u.suspensionReason ?? t('common:none')}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
                {t('operations:users.permanent')}
              </p>
              <p className="mt-1 text-ink">
                {u.suspensionIsPermanent ? t('common:yes') : t('common:no')}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
                {t('operations:users.suspendedAt')}
              </p>
              <p className="mt-1 text-ink">
                {u.suspendedAt ? formatDateTime(u.suspendedAt, locale) : t('common:none')}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
                {t('operations:users.suspendedBy')}
              </p>
              <p className="mt-1 font-mono text-[13px] text-ink">{u.suspendedBy ?? t('common:none')}</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <SuspendUserDialog
        open={suspendOpen}
        userLabel={u.displayName}
        loading={suspendState.isLoading}
        onClose={() => setSuspendOpen(false)}
        onConfirm={async (values) => {
          try {
            await suspend({ id: u.id, body: values }).unwrap();
            notifySuccess(t('operations:users.notifySuspended'));
            setSuspendOpen(false);
          } catch {
            notifyError(t('operations:users.notifySuspendFailed'));
          }
        }}
      />
    </div>
  );
}
