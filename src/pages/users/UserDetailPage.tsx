import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { notifyError, notifySuccess } from '@/lib/notify';
import { suspendUserSchema, type SuspendUserInput } from '@/schemas/user.schema';
import {
  useGetUserQuery,
  useImpersonateUserMutation,
  useSuspendUserMutation,
  useUnsuspendUserMutation,
} from '@/services/adminApi';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { Link, useParams } from 'react-router-dom';

export function UserDetailPage() {
  const { id = '' } = useParams();
  const q = useGetUserQuery(id, { skip: !id });
  const [suspend, suspendState] = useSuspendUserMutation();
  const [unsuspend, unsuspendState] = useUnsuspendUserMutation();
  const [impersonate, impersonateState] = useImpersonateUserMutation();
  const form = useForm<SuspendUserInput>({
    resolver: zodResolver(suspendUserSchema),
    defaultValues: { reason: '', permanent: false },
  });
  const permanent = useWatch({ control: form.control, name: 'permanent' });

  if (q.isLoading) return <p className="text-ink-60">Loading…</p>;
  if (!q.data) {
    return (
      <div className="rounded-3xl border border-ink-10 bg-white p-8">
        <p className="font-semibold text-ink">User not found.</p>
        <Link to="/users" className="mt-4 inline-block text-coral hover:underline">
          Back
        </Link>
      </div>
    );
  }

  const u = q.data;

  return (
    <div className="space-y-6">
      <div>
        <Link to="/users" className="text-[13px] font-semibold text-coral hover:underline">
          ← Users
        </Link>
        <h1 className="mt-2 text-3xl font-extrabold text-ink">{u.displayName}</h1>
        <p className="text-[14px] text-ink-60">{u.email}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-3xl border-ink-10 shadow-card-sm">
          <CardHeader><CardTitle className="text-sm">Account info</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-[14px]">
            {u.phone ? (
              <p><span className="font-semibold text-ink-60">Phone: </span><span className="text-ink">{u.phone}</span></p>
            ) : null}
            <p><span className="font-semibold text-ink-60">Role: </span><span className="capitalize text-ink">{u.role}</span></p>
            <p><span className="font-semibold text-ink-60">Status: </span>
              <span className={u.suspended ? 'text-coral font-semibold' : 'text-ink'}>
                {u.suspended ? 'Suspended' : u.isActive === false ? 'Inactive' : 'Active'}
              </span>
            </p>
            {u.suspensionReason ? (
              <p><span className="font-semibold text-ink-60">Suspension reason: </span><span className="text-ink">{u.suspensionReason}</span></p>
            ) : null}
            <p><span className="font-semibold text-ink-60">Email verified: </span>
              <span className="text-ink">{u.emailVerifiedAt ? new Date(u.emailVerifiedAt).toLocaleDateString() : 'No'}</span>
            </p>
            <p><span className="font-semibold text-ink-60">Phone verified: </span>
              <span className="text-ink">{u.phoneVerifiedAt ? new Date(u.phoneVerifiedAt).toLocaleDateString() : 'No'}</span>
            </p>
            {u.lastLoginAt ? (
              <p><span className="font-semibold text-ink-60">Last login: </span><span className="text-ink">{new Date(u.lastLoginAt).toLocaleString()}</span></p>
            ) : null}
            <p><span className="font-semibold text-ink-60">Joined: </span><span className="text-ink">{u.joinedAt ? new Date(u.joinedAt).toLocaleDateString() : '—'}</span></p>
          </CardContent>
        </Card>

        {(u.ticketsPurchased > 0 || u.bookingsCount > 0 || u.ratingGivenCount > 0) ? (
          <div className="grid gap-4">
            <Card className="rounded-3xl border-ink-10 shadow-card-sm">
              <CardHeader><CardTitle className="text-sm">Tickets purchased</CardTitle></CardHeader>
              <CardContent><p className="font-mono text-3xl font-black text-ink">{u.ticketsPurchased}</p></CardContent>
            </Card>
            <Card className="rounded-3xl border-ink-10 shadow-card-sm">
              <CardHeader><CardTitle className="text-sm">Bookings</CardTitle></CardHeader>
              <CardContent><p className="font-mono text-3xl font-black text-ink">{u.bookingsCount}</p></CardContent>
            </Card>
          </div>
        ) : null}
      </div>

      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">Admin actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              loading={impersonateState.isLoading}
              onClick={async () => {
                try {
                  const res = await impersonate(u.id).unwrap();
                  notifySuccess(
                    res.data && typeof res.data === 'object' && res.data !== null && 'url' in res.data
                      ? 'Impersonation payload received (check response for redirect URL).'
                      : 'Impersonation request completed.'
                  );
                } catch {
                  notifyError('Impersonation failed.');
                }
              }}
            >
              Impersonate
            </Button>
            {u.suspended ? (
              <Button
                type="button"
                variant="secondary"
                loading={unsuspendState.isLoading}
                onClick={async () => {
                  try {
                    await unsuspend(u.id).unwrap();
                    notifySuccess('User unsuspended.');
                  } catch {
                    notifyError('Unsuspend failed.');
                  }
                }}
              >
                Unsuspend
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">Suspend account</CardTitle>
        </CardHeader>
        <CardContent>
          {u.suspended ? (
            <p className="text-[14px] font-medium text-ink-60">This account is suspended. Use Unsuspend above.</p>
          ) : (
            <form
              className="space-y-4"
              onSubmit={form.handleSubmit(async (values) => {
                try {
                  await suspend({ id: u.id, body: values }).unwrap();
                  notifySuccess('User suspended.');
                  form.reset();
                } catch {
                  notifyError('Suspension failed.');
                }
              })}
            >
              <label className="flex items-center gap-2 text-[14px] font-medium text-ink">
                <input
                  type="checkbox"
                  checked={Boolean(permanent)}
                  onChange={(e) =>
                    form.setValue('permanent', e.target.checked, { shouldValidate: true, shouldDirty: true })
                  }
                />
                Permanent suspension
              </label>
              <label className="block">
                <span className="text-[12px] font-semibold text-ink-60">Reason</span>
                <textarea
                  className="mt-1.5 min-h-[88px] w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px] outline-none focus:border-coral focus:ring-2 focus:ring-coral/30"
                  {...form.register('reason')}
                />
              </label>
              {form.formState.errors.reason ? (
                <p className="text-[12px] font-medium text-coral">{form.formState.errors.reason.message}</p>
              ) : null}
              <Button type="submit" variant="danger" loading={suspendState.isLoading}>
                Suspend
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
