import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { notifyError, notifySuccess } from '@/lib/notify';
import { ProfileAvatarUpload } from '@/pages/profile/ProfileAvatarUpload';
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
    <div className="mx-auto max-w-[1400px] space-y-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-end">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-ink-40">Account</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-ink md:text-4xl">My profile</h1>
          <p className="mt-3 max-w-[65ch] text-[15px] leading-relaxed text-ink-60">
            Update how you appear in the admin console. Photo uploads and preference changes use your current Sanctum
            session — no user ID in the request body.
          </p>
        </div>
        <div className="rounded-3xl border border-ink-10 bg-white px-5 py-4 shadow-card-sm">
          <p className="text-[11px] font-bold uppercase tracking-wide text-ink-40">Endpoints</p>
          <p className="mt-1 font-mono text-[12px] text-ink">PATCH /api/v1/admin/me</p>
          <p className="font-mono text-[12px] text-ink">POST /api/v1/admin/me/profile-image</p>
        </div>
      </div>

      <Card className="rounded-[2rem] border-ink-10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
        <CardHeader className="border-b border-ink-10/80 pb-6">
          <CardTitle className="text-xl font-bold">Identity</CardTitle>
          <CardDescription>Profile photo, display name, and session metadata.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 pt-8">
          <ProfileAvatarUpload
            avatarUrl={user?.avatarUrl}
            displayName={displayName || user?.name || 'Admin'}
            onUploaded={(avatarUrl) => updateUser({ avatarUrl })}
          />

          <div className="grid gap-6 md:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wide text-ink-40">Work email</span>
              <input
                readOnly
                value={email}
                className="w-full cursor-not-allowed rounded-xl border border-ink-10 bg-ink-5 px-4 py-3 text-[14px] font-semibold text-ink-60"
              />
              <span className="text-[12px] text-ink-40">Read-only for audit trails.</span>
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wide text-ink-40">Display name</span>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px] font-semibold text-ink outline-none transition active:scale-[0.99] focus:border-coral focus:ring-2 focus:ring-coral/25"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wide text-ink-40">Timezone</span>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full rounded-xl border border-ink-10 bg-white px-4 py-3 text-[14px] font-semibold text-ink outline-none transition active:scale-[0.99] focus:border-coral focus:ring-2 focus:ring-coral/25"
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
