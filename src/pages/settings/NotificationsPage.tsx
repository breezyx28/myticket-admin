import { ListFiltersBar } from '@/components/admin/ListFiltersBar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentLocale } from '@/i18n';
import { filterAdminOperationalNotifications } from '@/lib/adminNotificationKinds';
import { formatDateTime } from '@/lib/localeFormat';
import { rowMatchesSearch } from '@/lib/listQuery';
import { notifyError, notifySuccess } from '@/lib/notify';
import { notificationSettingsSchema, type NotificationSettings } from '@/schemas/settings.schema';
import {
  useGetNotificationSettingsQuery,
  useGetNotificationsDeliveryLogQuery,
  useGetNotificationsRecentQuery,
  useSendTestNotificationMutation,
  useUpdateNotificationSettingsMutation,
} from '@/services/adminApi';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';

const monoArea =
  'mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 font-mono text-[13px] outline-none focus:border-coral focus:ring-2 focus:ring-coral/30';

export function NotificationsPage() {
  const { t } = useTranslation(['settings', 'common', 'nav']);
  const locale = getCurrentLocale();
  const q = useGetNotificationSettingsQuery();
  const recentQ = useGetNotificationsRecentQuery();
  const deliveryQ = useGetNotificationsDeliveryLogQuery();
  const [save, saveState] = useUpdateNotificationSettingsMutation();
  const [sendTest, sendTestState] = useSendTestNotificationMutation();
  const form = useForm<NotificationSettings>({
    resolver: zodResolver(notificationSettingsSchema),
  });
  const [searchRecent, setSearchRecent] = useState('');
  const [searchDelivery, setSearchDelivery] = useState('');
  const [testJson, setTestJson] = useState('{}');

  useEffect(() => {
    if (q.data) form.reset(q.data);
  }, [q.data, form]);

  const channels = useWatch({ control: form.control, name: 'channels' });

  const filteredRecent = useMemo(() => {
    return filterAdminOperationalNotifications(recentQ.data ?? []).filter((row) =>
      rowMatchesSearch(searchRecent, [
        row.id,
        row.title,
        row.body,
        row.kind,
        row.channel,
        String(row.read ?? ''),
      ]),
    );
  }, [recentQ.data, searchRecent]);

  const filteredDelivery = useMemo(() => {
    return (deliveryQ.data ?? []).filter((row) =>
      rowMatchesSearch(searchDelivery, [
        row.id,
        row.channel,
        row.status,
        row.recipient,
        row.templateKey,
        row.errorMessage,
      ])
    );
  }, [deliveryQ.data, searchDelivery]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-40">
          {t('nav:groups.platform')}
        </p>
        <h1 className="text-3xl font-extrabold text-ink">{t('settings:notifications.title')}</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-ink-60">
          <Trans
            ns="settings"
            i18nKey="notifications.subtitle"
            components={{ mono: <span className="font-mono text-ink" /> }}
          />
        </p>
      </div>

      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">{t('settings:notifications.channelsTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          {q.isLoading ? (
            <p className="text-sm text-ink-60">{t('settings:notifications.loadingSettings')}</p>
          ) : (
            <form
              className="max-w-xl space-y-4"
              onSubmit={form.handleSubmit(async (values) => {
                try {
                  await save(values).unwrap();
                  notifySuccess(t('settings:notifications.notifySaved'));
                } catch {
                  notifyError(t('settings:notifications.notifySaveFailed'));
                }
              })}
            >
              <label className="flex items-center gap-2 text-[14px] font-medium text-ink">
                <input
                  type="checkbox"
                  checked={Boolean(channels?.email)}
                  onChange={(e) =>
                    form.setValue('channels.email', e.target.checked, { shouldValidate: true, shouldDirty: true })
                  }
                />
                {t('settings:notifications.channelEmail')}
              </label>
              <label className="flex items-center gap-2 text-[14px] font-medium text-ink">
                <input
                  type="checkbox"
                  checked={Boolean(channels?.inApp)}
                  onChange={(e) =>
                    form.setValue('channels.inApp', e.target.checked, { shouldValidate: true, shouldDirty: true })
                  }
                />
                {t('settings:notifications.channelInApp')}
              </label>
              <label className="flex items-center gap-2 text-[14px] font-medium text-ink">
                <input
                  type="checkbox"
                  checked={Boolean(channels?.push)}
                  onChange={(e) =>
                    form.setValue('channels.push', e.target.checked, { shouldValidate: true, shouldDirty: true })
                  }
                />
                {t('settings:notifications.channelPush')}
              </label>
              <label className="flex items-center gap-2 text-[14px] font-medium text-ink">
                <input
                  type="checkbox"
                  checked={Boolean(channels?.sms)}
                  onChange={(e) =>
                    form.setValue('channels.sms', e.target.checked, { shouldValidate: true, shouldDirty: true })
                  }
                />
                {t('settings:notifications.channelSms')}
              </label>
              <div className="grid gap-2 sm:grid-cols-2">
                <label className="block">
                  <span className="text-[12px] font-semibold text-ink-60">
                    {t('settings:notifications.reminder1Label')}
                  </span>
                  <input
                    type="number"
                    className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 font-mono text-[14px] outline-none focus:border-coral focus:ring-2 focus:ring-coral/30"
                    {...form.register('reminderOffsetsHours.0', { valueAsNumber: true })}
                  />
                </label>
                <label className="block">
                  <span className="text-[12px] font-semibold text-ink-60">
                    {t('settings:notifications.reminder2Label')}
                  </span>
                  <input
                    type="number"
                    className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 font-mono text-[14px] outline-none focus:border-coral focus:ring-2 focus:ring-coral/30"
                    {...form.register('reminderOffsetsHours.1', { valueAsNumber: true })}
                  />
                </label>
              </div>
              <Button type="submit" variant="dark" loading={saveState.isLoading}>
                {t('common:save')}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">{t('settings:notifications.recentTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ListFiltersBar
            searchValue={searchRecent}
            onSearchChange={setSearchRecent}
            searchPlaceholder={t('settings:notifications.recentSearchPlaceholder')}
            className="mb-4"
          />
          {recentQ.isLoading ? <p className="text-sm text-ink-60">{t('common:loading')}</p> : null}
          {!recentQ.isLoading && filteredRecent.length === 0 ? (
            <p className="text-sm text-ink-60">{t('settings:notifications.noSearchMatches')}</p>
          ) : null}
          <div className="admin-table-scroll">
            <table className="w-full min-w-[720px] text-left text-[14px]">
              <thead className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
                <tr>
                  <th className="px-4 py-3">{t('settings:notifications.recentColumns.time')}</th>
                  <th className="px-4 py-3">{t('settings:notifications.recentColumns.title')}</th>
                  <th className="px-4 py-3">{t('settings:notifications.recentColumns.channel')}</th>
                  <th className="px-4 py-3">{t('settings:notifications.recentColumns.read')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecent.map((row) => (
                  <tr key={row.id} className="border-t border-ink-10 hover:bg-surface-tint">
                    <td className="px-4 py-3 font-mono text-[13px] text-ink-60">
                      {formatDateTime(row.createdAt, locale)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">{row.title}</p>
                      {row.body ? <p className="mt-0.5 text-[13px] text-ink-60">{row.body}</p> : null}
                    </td>
                    <td className="px-4 py-3 text-ink-60">{row.channel ?? t('common:none')}</td>
                    <td className="px-4 py-3 text-ink-60">
                      {row.read === undefined ? t('common:none') : row.read ? t('common:yes') : t('common:no')}
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
          <CardTitle className="text-lg">{t('settings:notifications.deliveryTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ListFiltersBar
            searchValue={searchDelivery}
            onSearchChange={setSearchDelivery}
            searchPlaceholder={t('settings:notifications.deliverySearchPlaceholder')}
            className="mb-4"
          />
          {deliveryQ.isLoading ? <p className="text-sm text-ink-60">{t('common:loading')}</p> : null}
          {!deliveryQ.isLoading && filteredDelivery.length === 0 ? (
            <p className="text-sm text-ink-60">{t('settings:notifications.noSearchMatches')}</p>
          ) : null}
          <div className="admin-table-scroll">
            <table className="w-full min-w-[880px] text-left text-[14px]">
              <thead className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
                <tr>
                  <th className="px-4 py-3">{t('settings:notifications.deliveryColumns.sent')}</th>
                  <th className="px-4 py-3">{t('settings:notifications.deliveryColumns.status')}</th>
                  <th className="px-4 py-3">{t('settings:notifications.deliveryColumns.channel')}</th>
                  <th className="px-4 py-3">{t('settings:notifications.deliveryColumns.recipient')}</th>
                  <th className="px-4 py-3">{t('settings:notifications.deliveryColumns.template')}</th>
                  <th className="px-4 py-3">{t('settings:notifications.deliveryColumns.error')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredDelivery.map((row) => (
                  <tr key={row.id} className="border-t border-ink-10 hover:bg-surface-tint">
                    <td className="px-4 py-3 font-mono text-[13px] text-ink-60">
                      {row.sentAt ? formatDateTime(row.sentAt, locale) : t('common:none')}
                    </td>
                    <td className="px-4 py-3 capitalize text-ink-60">{row.status}</td>
                    <td className="px-4 py-3 text-ink-60">{row.channel ?? t('common:none')}</td>
                    <td className="px-4 py-3 font-mono text-[12px] text-ink-60">{row.recipient ?? t('common:none')}</td>
                    <td className="px-4 py-3 text-ink-60">{row.templateKey ?? t('common:none')}</td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-[13px] text-coral">
                      {row.errorMessage ?? t('common:none')}
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
          <CardTitle className="text-lg">{t('settings:notifications.testTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 max-w-xl text-[13px] text-ink-60">
            <Trans
              ns="settings"
              i18nKey="notifications.testHint"
              components={{ mono: <span className="font-mono text-ink" /> }}
            />
          </p>
          <form
            className="max-w-xl space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              let body: Record<string, unknown>;
              try {
                const parsed = JSON.parse(testJson) as unknown;
                if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
                  notifyError(t('settings:notifications.notifyJsonRoot'));
                  return;
                }
                body = parsed as Record<string, unknown>;
              } catch {
                notifyError(t('settings:notifications.notifyInvalidJson'));
                return;
              }
              try {
                await sendTest(body).unwrap();
                notifySuccess(t('settings:notifications.notifyTestSent'));
              } catch {
                notifyError(t('settings:notifications.notifyTestFailed'));
              }
            }}
          >
            <textarea rows={5} className={monoArea} value={testJson} onChange={(e) => setTestJson(e.target.value)} />
            <Button type="submit" variant="outline" loading={sendTestState.isLoading}>
              {t('settings:notifications.testSubmit')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
