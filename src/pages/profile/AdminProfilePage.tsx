import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { notifyError, notifySuccess } from '@/lib/notify';
import { useUpdateAdminProfileMutation } from '@/services/adminApi';
import { useEffect, useMemo, useState } from 'react';

export function AdminProfilePage() {
  const { user, updateUser } = useAuth();
  const [updateProfile, updateState] = useUpdateAdminProfileMutation();
  const initialName = user?.name ?? '';
  const [displayName, setDisplayName] = useState(initialName);
  const [timezone, setTimezone] = useState('Asia/Riyadh');
  const [digestEmail, setDigestEmail] = useState(true);

  useEffect(() => {
    if (user?.name !== undefined) setDisplayName(user.name);
  }, [user?.name]);

  const email = useMemo(() => user?.email ?? '—', [user?.email]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-ink-40">Account</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-ink">My profile</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-ink-60">
          Update how you appear in the admin console. Changes are sent to{' '}
          <span className="font-mono text-ink">PATCH /api/v1/admin/me</span> when you are signed in with API
          credentials.
        </p>
      </div>

      <Card className="rounded-3xl border-ink-10 shadow-card-md">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Administrator</CardTitle>
          <CardDescription>Signed-in session. Email is read-only for audit trails.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wide text-ink-40">Work email</span>
              <input
                readOnly
                value={email}
                className="w-full cursor-not-allowed rounded-xl border border-ink-10 bg-ink-5 px-4 py-3 text-[14px] font-semibold text-ink-60"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wide text-ink-40">Display name</span>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px] font-semibold text-ink outline-none focus:border-coral focus:ring-2 focus:ring-coral/25"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wide text-ink-40">Timezone</span>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full rounded-xl border border-ink-10 bg-white px-4 py-3 text-[14px] font-semibold text-ink outline-none focus:border-coral focus:ring-2 focus:ring-coral/25"
              >
                <option value="Asia/Riyadh">Asia/Riyadh</option>
                <option value="Asia/Dubai">Asia/Dubai</option>
                <option value="Europe/London">Europe/London</option>
                <option value="UTC">UTC</option>
              </select>
            </label>
            <label className="flex items-center gap-3 rounded-2xl border border-ink-10 bg-surface-tint px-4 py-4">
              <input
                type="checkbox"
                checked={digestEmail}
                onChange={(e) => setDigestEmail(e.target.checked)}
                className="h-4 w-4 accent-coral"
              />
              <div>
                <p className="text-[14px] font-bold text-ink">Daily operations digest</p>
                <p className="text-[12px] text-ink-60">Morning summary of queues, payouts, and risk flags.</p>
              </div>
            </label>
          </div>
          <Button
            type="button"
            variant="dark"
            loading={updateState.isLoading}
            onClick={async () => {
              try {
                await updateProfile({
                  name: displayName.trim() || (user?.name ?? 'Admin'),
                  timezone,
                  digestEmail,
                }).unwrap();
                updateUser({ name: displayName.trim() || (user?.name ?? 'Admin') });
                notifySuccess('Profile saved.');
              } catch {
                notifyError('Could not save profile. Confirm PATCH /api/v1/admin/me exists on the API.');
              }
            }}
          >
            Save preferences
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
