import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { notifyError, notifySuccess } from '@/lib/notify';
import { rejectRoleApplicationSchema } from '@/schemas/roleApplication.schema';
import {
  useApproveRoleApplicationMutation,
  useGetRoleApplicationQuery,
  useRejectRoleApplicationMutation,
} from '@/services/adminApi';
import { i18nZodResolver } from '@/lib/i18nZodResolver';
import { useForm } from 'react-hook-form';
import type { RejectRoleApplicationInput } from '@/schemas/roleApplication.schema';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

type RejectForm = RejectRoleApplicationInput;

export function RoleApplicationDetailPage() {
  const { t } = useTranslation('approvals');
  const { id = '' } = useParams();
  const nav = useNavigate();
  const q = useGetRoleApplicationQuery(id, { skip: !id });
  const [approve, approveState] = useApproveRoleApplicationMutation();
  const [reject, rejectState] = useRejectRoleApplicationMutation();

  const form = useForm<RejectForm>({
    resolver: i18nZodResolver(rejectRoleApplicationSchema),
    defaultValues: { reason: '', internalNote: '' },
  });

  if (q.isLoading) return <p className="text-ink-60">{t('loading')}</p>;
  if (!q.data) {
    return (
      <div className="rounded-3xl border border-ink-10 bg-white p-8">
        <p className="font-semibold text-ink">{t('roleApplicationDetail.notFound')}</p>
        <Link to="/approvals/roles" className="mt-4 inline-block text-coral hover:underline">
          {t('roleApplicationDetail.backToQueue')}
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
            {t('backToQueue')}
          </Link>
          <h1 className="mt-2 text-3xl font-extrabold text-ink">{row.applicantName}</h1>
          <p className="mt-1 text-[14px] text-ink-60">
            {row.email} · {t(`type.${row.type}`)} · {t(`status.${row.status}`)}
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
                notifySuccess(t('roleApplicationDetail.approveSuccess'));
                void nav('/approvals/roles');
              } catch {
                notifyError(t('roleApplicationDetail.approveFailed'));
              }
            }}
          >
            {t('roleApplicationDetail.approve')}
          </Button>
        </div>
      </div>

      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">{t('roleApplicationDetail.documents')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-[14px] text-ink-60">{row.documentsSummary}</p>
          {row.rejectReason ? (
            <p className="mt-4 rounded-2xl bg-coral/10 px-4 py-3 text-[14px] text-ink">
              <span className="font-bold">{t('roleApplicationDetail.lastRejectionReason')}</span> {row.rejectReason}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">{t('roleApplicationDetail.rejectTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(async (values) => {
              try {
                await reject({ id: row.id, body: values }).unwrap();
                notifySuccess(t('roleApplicationDetail.rejectSuccess'));
                void nav('/approvals/roles');
              } catch {
                notifyError(t('roleApplicationDetail.rejectFailed'));
              }
            })}
          >
            <label className="block">
              <span className="text-[12px] font-semibold text-ink-60">{t('roleApplicationDetail.reasonLabel')}</span>
              <textarea
                className="mt-1.5 min-h-[100px] w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px] outline-none focus:border-coral focus:ring-2 focus:ring-coral/30"
                {...form.register('reason')}
              />
            </label>
            {form.formState.errors.reason ? (
              <p className="text-[12px] font-medium text-coral">{form.formState.errors.reason.message}</p>
            ) : null}
            <label className="block">
              <span className="text-[12px] font-semibold text-ink-60">{t('roleApplicationDetail.internalNoteLabel')}</span>
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
              {t('roleApplicationDetail.rejectButton')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
