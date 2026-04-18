import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { notifyError, notifySuccess } from '@/lib/notify';
import { rejectRoleApplicationSchema } from '@/schemas/roleApplication.schema';
import {
  useApproveRoleApplicationMutation,
  useGetRoleApplicationQuery,
  useRejectRoleApplicationMutation,
} from '@/services/adminApi';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { RejectRoleApplicationInput } from '@/schemas/roleApplication.schema';
import { Link, useNavigate, useParams } from 'react-router-dom';

type RejectForm = RejectRoleApplicationInput;

export function RoleApplicationDetailPage() {
  const { id = '' } = useParams();
  const nav = useNavigate();
  const q = useGetRoleApplicationQuery(id, { skip: !id });
  const [approve, approveState] = useApproveRoleApplicationMutation();
  const [reject, rejectState] = useRejectRoleApplicationMutation();

  const form = useForm<RejectForm>({
    resolver: zodResolver(rejectRoleApplicationSchema),
    defaultValues: { reason: '', internalNote: '' },
  });

  if (q.isLoading) return <p className="text-ink-60">Loading…</p>;
  if (!q.data) {
    return (
      <div className="rounded-3xl border border-ink-10 bg-white p-8">
        <p className="font-semibold text-ink">Application not found.</p>
        <Link to="/approvals/roles" className="mt-4 inline-block text-coral hover:underline">
          Back to queue
        </Link>
      </div>
    );
  }

  const row = q.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link to="/approvals/roles" className="text-[13px] font-semibold text-coral hover:underline">
            ← Back to queue
          </Link>
          <h1 className="mt-2 text-3xl font-extrabold text-ink">{row.applicantName}</h1>
          <p className="mt-1 text-[14px] text-ink-60">
            {row.email} · {row.type} · {row.status}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="primary"
            disabled={row.status !== 'pending' || approveState.isLoading}
            loading={approveState.isLoading}
            onClick={async () => {
              try {
                await approve(row.id).unwrap();
                notifySuccess('Role application approved (mock).');
                void nav('/approvals/roles');
              } catch {
                notifyError('Approval failed (mock).');
              }
            }}
          >
            Approve
          </Button>
        </div>
      </div>

      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-[14px] text-ink-60">{row.documentsSummary}</p>
          {row.rejectReason ? (
            <p className="mt-4 rounded-2xl bg-coral/10 px-4 py-3 text-[14px] text-ink">
              <span className="font-bold">Last rejection reason:</span> {row.rejectReason}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">Reject application</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(async (values) => {
              try {
                await reject({ id: row.id, body: values }).unwrap();
                notifySuccess('Role application rejected with reason (mock).');
                void nav('/approvals/roles');
              } catch {
                notifyError('Rejection failed (mock).');
              }
            })}
          >
            <label className="block">
              <span className="text-[12px] font-semibold text-ink-60">Reason (sent to applicant)</span>
              <textarea
                className="mt-1.5 min-h-[100px] w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px] outline-none focus:border-coral focus:ring-2 focus:ring-coral/30"
                {...form.register('reason')}
              />
            </label>
            {form.formState.errors.reason ? (
              <p className="text-[12px] font-medium text-coral">{form.formState.errors.reason.message}</p>
            ) : null}
            <label className="block">
              <span className="text-[12px] font-semibold text-ink-60">Internal note (optional)</span>
              <textarea
                className="mt-1.5 min-h-[72px] w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px] outline-none focus:border-coral focus:ring-2 focus:ring-coral/30"
                {...form.register('internalNote')}
              />
            </label>
            <Button
              type="submit"
              variant="danger"
              disabled={row.status !== 'pending' || rejectState.isLoading}
              loading={rejectState.isLoading}
            >
              Reject with reason
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
