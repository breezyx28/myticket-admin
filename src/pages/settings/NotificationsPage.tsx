import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { notifyError, notifySuccess } from '@/lib/notify';
import { notificationSettingsSchema, type NotificationSettings } from '@/schemas/settings.schema';
import { useGetNotificationSettingsQuery, useUpdateNotificationSettingsMutation } from '@/services/adminApi';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';

export function NotificationsPage() {
  const q = useGetNotificationSettingsQuery();
  const [save, saveState] = useUpdateNotificationSettingsMutation();
  const form = useForm<NotificationSettings>({
    resolver: zodResolver(notificationSettingsSchema),
  });

  useEffect(() => {
    if (q.data) form.reset(q.data);
  }, [q.data, form]);

  const channels = useWatch({ control: form.control, name: 'channels' });

  if (q.isLoading) return <p className="text-ink-60">Loading…</p>;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-40">Platform</p>
        <h1 className="text-3xl font-extrabold text-ink">Notification configuration</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-ink-60">
          Choose channels for reminders and configure offsets (hours before the event).
        </p>
      </div>

      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">Channels</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="max-w-xl space-y-4"
            onSubmit={form.handleSubmit(async (values) => {
              try {
                await save(values).unwrap();
                notifySuccess('Notification settings saved (mock).');
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
              Save (mock)
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
