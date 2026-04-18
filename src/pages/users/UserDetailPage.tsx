import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { notifyError, notifySuccess } from '@/lib/notify';
import { suspendUserSchema, type SuspendUserInput } from '@/schemas/user.schema';
import { useGetUserQuery, useSuspendUserMutation } from '@/services/adminApi';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { Link, useParams } from 'react-router-dom';

export function UserDetailPage() {
  const { id = '' } = useParams();
  const q = useGetUserQuery(id, { skip: !id });
  const [suspend, suspendState] = useSuspendUserMutation();
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

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-3xl border-ink-10 shadow-card-sm">
          <CardHeader>
            <CardTitle className="text-sm">Tickets purchased</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-3xl font-black text-ink">{u.ticketsPurchased}</p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-ink-10 shadow-card-sm">
          <CardHeader>
            <CardTitle className="text-sm">Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-3xl font-black text-ink">{u.bookingsCount}</p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-ink-10 shadow-card-sm">
          <CardHeader>
            <CardTitle className="text-sm">Ratings given</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-3xl font-black text-ink">{u.ratingGivenCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">Suspend account</CardTitle>
        </CardHeader>
        <CardContent>
          {u.suspended ? (
            <p className="text-[14px] font-medium text-ink-60">This account is already suspended (mock).</p>
          ) : (
            <form
              className="space-y-4"
              onSubmit={form.handleSubmit(async (values) => {
                try {
                  await suspend({ id: u.id, body: values }).unwrap();
                  notifySuccess('User suspended (mock).');
                  form.reset();
                } catch {
                  notifyError('Suspension failed (mock).');
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
                Suspend (mock)
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
