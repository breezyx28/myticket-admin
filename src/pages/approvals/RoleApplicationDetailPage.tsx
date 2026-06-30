import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentLocale } from '@/i18n';
import { formatDateTime } from '@/lib/localeFormat';
import { notifyError, notifySuccess } from '@/lib/notify';
import { cn } from '@/lib/utils';
import { rejectRoleApplicationSchema } from '@/schemas/roleApplication.schema';
import type { RejectRoleApplicationInput, RoleApplicationDetail } from '@/schemas/roleApplication.schema';
import {
  useApproveRoleApplicationMutation,
  useGetRoleApplicationQuery,
  useRejectRoleApplicationMutation,
} from '@/services/adminApi';
import { i18nZodResolver } from '@/lib/i18nZodResolver';
import {
  Building2,
  ExternalLink,
  FileText,
  Mail,
  Phone,
  User,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

type RejectForm = RejectRoleApplicationInput;

function statusBadgeClass(status: RoleApplicationDetail['status']) {
  const map: Record<RoleApplicationDetail['status'], string> = {
    pending: 'bg-amber/15 text-amber border-amber/35',
    approved: 'bg-mint/20 text-ink border-mint/45',
    rejected: 'bg-coral/12 text-coral border-coral/35',
  };
  return map[status];
}

function DetailField({
  label,
  value,
  mono = false,
}: {
  label: string;
  value?: string | null;
  mono?: boolean;
}) {
  const { t } = useTranslation('approvals');
  const text = value?.trim() ? value : t('notProvided');
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-bold uppercase tracking-wide text-ink-40">{label}</p>
      <p
        className={cn(
          'text-[14px] leading-relaxed text-pretty text-ink',
          mono && 'font-mono text-[13px] tabular-nums',
          !value?.trim() && 'text-ink-40',
        )}
      >
        {text}
      </p>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse space-y-8">
      <div className="h-8 w-40 rounded-lg bg-ink-10" />
      <div className="h-36 rounded-2xl bg-ink-5" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-64 rounded-2xl bg-ink-5" />
        <div className="h-64 rounded-2xl bg-ink-5" />
      </div>
    </div>
  );
}

export function RoleApplicationDetailPage() {
  const { t } = useTranslation(['approvals', 'common']);
  const locale = getCurrentLocale();
  const { id = '' } = useParams();
  const nav = useNavigate();
  const q = useGetRoleApplicationQuery(id, { skip: !id });
  const [approve, approveState] = useApproveRoleApplicationMutation();
  const [reject, rejectState] = useRejectRoleApplicationMutation();

  const form = useForm<RejectForm>({
    resolver: i18nZodResolver(rejectRoleApplicationSchema),
    defaultValues: { reason: '', internalNote: '' },
  });

  if (q.isLoading) return <DetailSkeleton />;

  if (q.isError || !q.data) {
    return (
      <div className="mx-auto max-w-7xl rounded-2xl border border-ink-10 bg-white p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.06)]">
        <p className="font-semibold text-ink">
          {q.isError ? t('approvals:roleApplicationDetail.loadError') : t('approvals:roleApplicationDetail.notFound')}
        </p>
        <Link
          to="/approvals/roles"
          className="mt-4 inline-block text-[13px] font-semibold text-coral transition-transform active:scale-[0.96]"
        >
          {t('approvals:roleApplicationDetail.backToQueue')}
        </Link>
      </div>
    );
  }

  const row = q.data;
  const organizer = row.organizer;
  const headline = organizer?.displayName?.trim() || row.applicantName;
  const canReview = row.status === 'pending';

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <Link
            to="/approvals/roles"
            className="text-[13px] font-semibold text-coral transition-transform active:scale-[0.96]"
          >
            {t('approvals:backToQueue')}
          </Link>
          <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-40">
            {t('approvals:roleApplicationDetail.eyebrow')}
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-balance text-ink">{headline}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'inline-flex rounded-lg border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide',
                statusBadgeClass(row.status),
              )}
            >
              {t(`approvals:status.${row.status}`)}
            </span>
            <span className="rounded-lg bg-ink-5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink-60">
              {t(`approvals:type.${row.type}`)}
            </span>
            <span className="font-mono text-[12px] tabular-nums text-ink-40">
              {t('approvals:roleApplicationDetail.applicationId', { id: row.id })}
            </span>
          </div>
          <p className="mt-2 text-[14px] text-pretty text-ink-60">
            {t('approvals:roleApplicationDetail.submittedAt', {
              time: formatDateTime(row.submittedAt, locale),
            })}
            {row.reviewedAt
              ? ` · ${t('approvals:roleApplicationDetail.reviewedAt', {
                  time: formatDateTime(row.reviewedAt, locale),
                })}`
              : null}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            type="button"
            variant="primary"
            disabled={!canReview || approveState.isLoading}
            loading={approveState.isLoading}
            className="active:scale-[0.96]"
            onClick={async () => {
              try {
                await approve(row.id).unwrap();
                notifySuccess(t('approvals:roleApplicationDetail.approveSuccess'));
                void nav('/approvals/roles');
              } catch {
                notifyError(t('approvals:roleApplicationDetail.approveFailed'));
              }
            }}
          >
            {t('approvals:roleApplicationDetail.approve')}
          </Button>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl bg-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.06)]">
        <div className="grid gap-0 lg:grid-cols-[minmax(0,240px)_1fr]">
          <div className="border-b border-ink-10 bg-surface-tint p-6 lg:border-b-0 lg:border-e">
            {row.profileImageUrl ? (
              <img
                src={row.profileImageUrl}
                alt={headline}
                className="aspect-square w-full max-w-[200px] rounded-2xl border border-black/10 object-cover outline outline-1 outline-black/10 dark:outline-white/10"
              />
            ) : (
              <div className="flex aspect-square w-full max-w-[200px] items-center justify-center rounded-2xl border border-dashed border-ink-10 bg-white">
                <User className="h-10 w-10 text-ink-30" aria-hidden />
              </div>
            )}
          </div>
          <div className="grid gap-6 p-6 sm:grid-cols-2">
            <div className="space-y-4">
              <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wide text-ink-40">
                <User className="h-4 w-4" aria-hidden />
                {t('approvals:roleApplicationDetail.applicantAccount')}
              </p>
              <DetailField label={t('approvals:roleApplications.applicant')} value={row.applicantName} />
              <DetailField label={t('approvals:email')} value={row.email} />
              <DetailField label={t('approvals:phone')} value={row.phone} mono />
              <DetailField label={t('approvals:roleApplicationDetail.bio')} value={row.applicantBio} />
            </div>
            <div className="space-y-4">
              <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wide text-ink-40">
                <Building2 className="h-4 w-4" aria-hidden />
                {row.type === 'organizer'
                  ? t('approvals:roleApplicationDetail.organizerProfile')
                  : t('approvals:roleApplicationDetail.applicationPayload')}
              </p>
              {organizer ? (
                <>
                  <DetailField
                    label={t('approvals:roleApplicationDetail.displayName')}
                    value={organizer.displayName}
                  />
                  <DetailField
                    label={t('approvals:roleApplicationDetail.contactEmail')}
                    value={organizer.contactEmail}
                  />
                  <DetailField
                    label={t('approvals:roleApplicationDetail.contactPhone')}
                    value={organizer.contactPhone}
                    mono
                  />
                  <DetailField
                    label={t('approvals:roleApplicationDetail.accountType')}
                    value={
                      organizer.isCompany
                        ? t('approvals:roleApplicationDetail.company')
                        : t('approvals:roleApplicationDetail.individual')
                    }
                  />
                  {organizer.isCompany ? (
                    <>
                      <DetailField
                        label={t('approvals:roleApplicationDetail.companyName')}
                        value={organizer.companyName}
                      />
                      <DetailField
                        label={t('approvals:roleApplicationDetail.companyInfo')}
                        value={organizer.companyInfo}
                      />
                    </>
                  ) : (
                    <>
                      <DetailField
                        label={t('approvals:roleApplicationDetail.ownerName')}
                        value={organizer.ownerName}
                      />
                      <DetailField
                        label={t('approvals:roleApplicationDetail.ownerInfo')}
                        value={organizer.ownerInfo}
                      />
                    </>
                  )}
                  <DetailField label={t('approvals:roleApplicationDetail.bio')} value={organizer.bio} />
                </>
              ) : (
                <DetailField
                  label={t('approvals:roleApplicationDetail.applicationPayload')}
                  value={row.documentsSummary}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,360px)]">
        <Card className="rounded-2xl border-ink-10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.06)]">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-ink-40" aria-hidden />
              {t('approvals:roleApplicationDetail.documents')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {organizer?.documentUrl ? (
              <a
                href={organizer.documentUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-ink-10 bg-surface-tint px-4 py-3 text-[13px] font-semibold text-coral transition-transform hover:bg-ink-5 active:scale-[0.96]"
              >
                {t('approvals:roleApplicationDetail.documentLink')}
                <ExternalLink className="h-4 w-4" aria-hidden />
              </a>
            ) : (
              <p className="text-[14px] text-pretty text-ink-60">
                {t('approvals:roleApplicationDetail.noDocument')}
              </p>
            )}
            {row.rejectReason ? (
              <p className="rounded-xl bg-coral/10 px-4 py-3 text-[14px] text-pretty text-ink">
                <span className="font-bold">{t('approvals:roleApplicationDetail.lastRejectionReason')}</span>{' '}
                {row.rejectReason}
              </p>
            ) : null}
            {row.internalNote ? (
              <p className="rounded-xl bg-ink-5 px-4 py-3 text-[14px] text-pretty text-ink-60">
                <span className="font-bold text-ink">{t('approvals:roleApplicationDetail.internalNote')}: </span>
                {row.internalNote}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-ink-10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.06)]">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{t('approvals:roleApplicationDetail.metadata')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailField
              label={t('approvals:roleApplicationDetail.roleApplicationId')}
              value={row.id}
              mono
            />
            <DetailField label={t('approvals:roleApplicationDetail.userId')} value={row.userId} mono />
            <div className="flex flex-wrap gap-3 border-t border-ink-10 pt-4 text-[13px] text-ink-60">
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" aria-hidden />
                {row.email}
              </span>
              {row.phone ? (
                <span className="inline-flex items-center gap-1.5 font-mono tabular-nums">
                  <Phone className="h-3.5 w-3.5" aria-hidden />
                  {row.phone}
                </span>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-ink-10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.06)]">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{t('approvals:roleApplicationDetail.rejectTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="mx-auto max-w-xl space-y-4"
            onSubmit={form.handleSubmit(async (values) => {
              try {
                await reject({ id: row.id, body: values }).unwrap();
                notifySuccess(t('approvals:roleApplicationDetail.rejectSuccess'));
                void nav('/approvals/roles');
              } catch {
                notifyError(t('approvals:roleApplicationDetail.rejectFailed'));
              }
            })}
          >
            <label className="block">
              <span className="text-[12px] font-semibold text-ink-60">
                {t('approvals:roleApplicationDetail.reasonLabel')}
              </span>
              <textarea
                className="mt-1.5 min-h-[100px] w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px] outline-none focus:border-coral focus:ring-2 focus:ring-coral/30"
                {...form.register('reason')}
              />
            </label>
            {form.formState.errors.reason ? (
              <p className="text-[12px] font-medium text-coral">{form.formState.errors.reason.message}</p>
            ) : null}
            <label className="block">
              <span className="text-[12px] font-semibold text-ink-60">
                {t('approvals:roleApplicationDetail.internalNoteLabel')}
              </span>
              <textarea
                className="mt-1.5 min-h-[72px] w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px] outline-none focus:border-coral focus:ring-2 focus:ring-coral/30"
                {...form.register('internalNote')}
              />
            </label>
            <Button
              type="submit"
              variant="danger"
              disabled={!canReview || rejectState.isLoading}
              loading={rejectState.isLoading}
              className="active:scale-[0.96]"
            >
              {t('approvals:roleApplicationDetail.rejectButton')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
