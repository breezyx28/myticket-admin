import { ListFiltersBar } from '@/components/admin/ListFiltersBar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { filterAdminOperationalNotifications } from '@/lib/adminNotificationKinds';
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

const monoArea =
  'mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 font-mono text-[13px] outline-none focus:border-coral focus:ring-2 focus:ring-coral/30';

export function NotificationsPage() {
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
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-40">Platform</p>
        <h1 className="text-3xl font-extrabold text-ink">Notifications</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-ink-60">
          Active channel flags from{' '}
          <span className="font-mono text-ink">GET …/notification-settings</span> (root{' '}
          <span className="font-mono text-ink">active</span> / <span className="font-mono text-ink">history</span>), saved
          with <span className="font-mono text-ink">PATCH …/notification-settings</span> (snake_case body). Operational views:{' '}
          <span className="font-mono text-ink">GET …/notifications/recent</span>,{' '}
          <span className="font-mono text-ink">GET …/notifications/delivery-log</span>, and{' '}
          <span className="font-mono text-ink">POST …/notifications/test</span> (body is backend-defined).
        </p>
      </div>

      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">Channels</CardTitle>
        </CardHeader>
        <CardContent>
          {q.isLoading ? (
            <p className="text-sm text-ink-60">Loading settings…</p>
          ) : (
            <form
              className="max-w-xl space-y-4"
              onSubmit={form.handleSubmit(async (values) => {
                try {
                  await save(values).unwrap();
                  notifySuccess('Notification settings saved.');
                } catch {
                  notifyError('Could not save notification settings.');
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
                Email
              </label>
              <label className="flex items-center gap-2 text-[14px] font-medium text-ink">
                <input
                  type="checkbox"
                  checked={Boolean(channels?.inApp)}
                  onChange={(e) =>
                    form.setValue('channels.inApp', e.target.checked, { shouldValidate: true, shouldDirty: true })
                  }
                />
                In-app
              </label>
              <label className="flex items-center gap-2 text-[14px] font-medium text-ink">
                <input
                  type="checkbox"
                  checked={Boolean(channels?.push)}
                  onChange={(e) =>
                    form.setValue('channels.push', e.target.checked, { shouldValidate: true, shouldDirty: true })
                  }
                />
                Push
              </label>
              <label className="flex items-center gap-2 text-[14px] font-medium text-ink">
                <input
                  type="checkbox"
                  checked={Boolean(channels?.sms)}
                  onChange={(e) =>
                    form.setValue('channels.sms', e.target.checked, { shouldValidate: true, shouldDirty: true })
                  }
                />
                SMS
              </label>
              <div className="grid gap-2 sm:grid-cols-2">
                <label className="block">
                  <span className="text-[12px] font-semibold text-ink-60">Reminder 1 (hours)</span>
                  <input
                    type="number"
                    className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 font-mono text-[14px] outline-none focus:border-coral focus:ring-2 focus:ring-coral/30"
                    {...form.register('reminderOffsetsHours.0', { valueAsNumber: true })}
                  />
                </label>
                <label className="block">
                  <span className="text-[12px] font-semibold text-ink-60">Reminder 2 (hours)</span>
                  <input
                    type="number"
                    className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 font-mono text-[14px] outline-none focus:border-coral focus:ring-2 focus:ring-coral/30"
                    {...form.register('reminderOffsetsHours.1', { valueAsNumber: true })}
                  />
                </label>
              </div>
              <Button type="submit" variant="dark" loading={saveState.isLoading}>
                Save
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">Recent notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <ListFiltersBar
            searchValue={searchRecent}
            onSearchChange={setSearchRecent}
            searchPlaceholder="Search id, title, body, channel…"
            className="mb-4"
          />
          {recentQ.isLoading ? <p className="text-sm text-ink-60">Loading…</p> : null}
          {!recentQ.isLoading && filteredRecent.length === 0 ? (
            <p className="text-sm text-ink-60">No rows match your search.</p>
          ) : null}
          <div className="admin-table-scroll">
            <table className="w-full min-w-[720px] text-left text-[14px]">
              <thead className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
                <tr>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Channel</th>
                  <th className="px-4 py-3">Read</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecent.map((row) => (
                  <tr key={row.id} className="border-t border-ink-10 hover:bg-surface-tint">
                    <td className="px-4 py-3 font-mono text-[13px] text-ink-60">
                      {new Date(row.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">{row.title}</p>
                      {row.body ? <p className="mt-0.5 text-[13px] text-ink-60">{row.body}</p> : null}
                    </td>
                    <td className="px-4 py-3 text-ink-60">{row.channel ?? '—'}</td>
                    <td className="px-4 py-3 text-ink-60">{row.read === undefined ? '—' : row.read ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">Delivery log</CardTitle>
        </CardHeader>
        <CardContent>
          <ListFiltersBar
            searchValue={searchDelivery}
            onSearchChange={setSearchDelivery}
            searchPlaceholder="Search id, channel, status, recipient, template…"
            className="mb-4"
          />
          {deliveryQ.isLoading ? <p className="text-sm text-ink-60">Loading…</p> : null}
          {!deliveryQ.isLoading && filteredDelivery.length === 0 ? (
            <p className="text-sm text-ink-60">No rows match your search.</p>
          ) : null}
          <div className="admin-table-scroll">
            <table className="w-full min-w-[880px] text-left text-[14px]">
              <thead className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
                <tr>
                  <th className="px-4 py-3">Sent</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Channel</th>
                  <th className="px-4 py-3">Recipient</th>
                  <th className="px-4 py-3">Template</th>
                  <th className="px-4 py-3">Error</th>
                </tr>
              </thead>
              <tbody>
                {filteredDelivery.map((row) => (
                  <tr key={row.id} className="border-t border-ink-10 hover:bg-surface-tint">
                    <td className="px-4 py-3 font-mono text-[13px] text-ink-60">
                      {row.sentAt ? new Date(row.sentAt).toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-3 capitalize text-ink-60">{row.status}</td>
                    <td className="px-4 py-3 text-ink-60">{row.channel ?? '—'}</td>
                    <td className="px-4 py-3 font-mono text-[12px] text-ink-60">{row.recipient ?? '—'}</td>
                    <td className="px-4 py-3 text-ink-60">{row.templateKey ?? '—'}</td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-[13px] text-coral">{row.errorMessage ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">Send test notification</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 max-w-xl text-[13px] text-ink-60">
            POST an object your API expects (often empty <span className="font-mono text-ink">{'{}'}</span>). Invalid JSON is rejected before calling the network.
          </p>
          <form
            className="max-w-xl space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              let body: Record<string, unknown>;
              try {
                const parsed = JSON.parse(testJson) as unknown;
                if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
                  notifyError('Root JSON value must be an object.');
                  return;
                }
                body = parsed as Record<string, unknown>;
              } catch {
                notifyError('Invalid JSON.');
                return;
              }
              try {
                await sendTest(body).unwrap();
                notifySuccess('Test notification request sent.');
              } catch {
                notifyError('Test notification failed.');
              }
            }}
          >
            <textarea rows={5} className={monoArea} value={testJson} onChange={(e) => setTestJson(e.target.value)} />
            <Button type="submit" variant="outline" loading={sendTestState.isLoading}>
              POST /notifications/test
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
