import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { notifyError, notifySuccess } from '@/lib/notify';
import { cn } from '@/lib/utils';
import { rejectTalentProfileSchema } from '@/schemas/talentApproval.schema';
import type { TalentProfile } from '@/schemas/talentApproval.schema';
import {
  useApproveTalentProfileMutation,
  useGetTalentProfileQuery,
  useRejectTalentProfileMutation,
} from '@/services/adminApi';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { RejectTalentProfileInput } from '@/schemas/talentApproval.schema';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Building2, CreditCard, FileText, Globe, Instagram, Music2, ShieldCheck, Video } from 'lucide-react';

type RejectForm = RejectTalentProfileInput;

function govBadge(status: TalentProfile['governmentIdStatus']) {
  const styles: Record<TalentProfile['governmentIdStatus'], string> = {
    verified: 'bg-mint/20 text-ink border border-mint/50',
    pending: 'bg-amber/15 text-amber border border-amber/40',
    rejected: 'bg-coral/15 text-coral border border-coral/40',
  };
  return (
    <span className={cn('rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide', styles[status])}>
      ID {status}
    </span>
  );
}

export function TalentApprovalDetailPage() {
  const { id = '' } = useParams();
  const nav = useNavigate();
  const q = useGetTalentProfileQuery(id, { skip: !id });
  const [approve, approveState] = useApproveTalentProfileMutation();
  const [reject, rejectState] = useRejectTalentProfileMutation();
  const form = useForm<RejectForm>({
    resolver: zodResolver(rejectTalentProfileSchema),
    defaultValues: { reason: '' },
  });

  if (q.isLoading) return <p className="text-ink-60">Loading…</p>;
  if (!q.data) {
    return (
      <div className="rounded-3xl border border-ink-10 bg-white p-8">
        <p className="font-semibold text-ink">Profile not found.</p>
        <Link to="/approvals/talent" className="mt-4 inline-block font-bold text-coral hover:underline">
          Back
        </Link>
      </div>
    );
  }

  const row = q.data;

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <Link to="/approvals/talent" className="text-[13px] font-bold text-coral hover:underline">
            ← Back
          </Link>
          <div className="mt-4 overflow-hidden rounded-[32px] border border-ink-10 shadow-card-lg">
            <div className="grid gap-0 md:grid-cols-[220px_1fr]">
              <div className="relative h-64 bg-ink-5 md:h-auto">
                <img src={row.headshotUrl} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="space-y-4 p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-ink-40">Talent dossier</p>
                    <h1 className="mt-1 text-3xl font-extrabold text-ink">{row.stageName}</h1>
                    <p className="mt-1 text-[14px] font-semibold text-ink-60">{row.legalName}</p>
                  </div>
                  <span
                    className={cn(
                      'rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide',
                      row.status === 'pending' && 'bg-amber/15 text-amber',
                      row.status === 'approved' && 'bg-mint/20 text-ink',
                      row.status === 'rejected' && 'bg-coral/15 text-coral'
                    )}
                  >
                    {row.status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {row.genres.map((g) => (
                    <span
                      key={g}
                      className="inline-flex items-center gap-1 rounded-full bg-ink-5 px-3 py-1 text-[12px] font-bold text-ink"
                    >
                      <Music2 size={14} className="text-coral" />
                      {g}
                    </span>
                  ))}
                </div>
                <p className="text-[14px] leading-relaxed text-ink-60">{row.bio}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-ink-10 bg-surface-tint p-4">
                    <p className="text-[10px] font-extrabold uppercase tracking-wide text-ink-40">Bookings</p>
                    <p className="mt-1 font-mono text-2xl font-black text-ink">{row.completedBookings}</p>
                    <p className="text-[12px] font-semibold text-ink-60">Lifetime on platform (sample)</p>
                  </div>
                  <div className="rounded-2xl border border-ink-10 bg-surface-tint p-4">
                    <p className="text-[10px] font-extrabold uppercase tracking-wide text-ink-40">Fan rating</p>
                    <p className="mt-1 font-mono text-2xl font-black text-coral">{row.averageRating.toFixed(1)} ★</p>
                    <p className="text-[12px] font-semibold text-ink-60">Post-show surveys</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Card className="rounded-3xl border-ink-10 shadow-card-sm">
            <CardHeader>
              <CardTitle className="text-lg font-extrabold">Contact & presence</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-[14px]">
              <p className="font-bold text-ink">{row.email}</p>
              <p className="font-semibold text-ink-60">{row.phone}</p>
              <p className="inline-flex items-center gap-2 font-semibold text-ink-60">
                <Globe size={16} className="text-coral" />
                <a href={row.websiteUrl} className="font-bold text-coral hover:underline" target="_blank" rel="noreferrer">
                  {row.websiteUrl}
                </a>
              </p>
              <p className="inline-flex items-center gap-2 font-semibold text-ink-60">
                <Instagram size={16} className="text-coral" />
                <span className="font-bold text-ink">{row.instagramHandle}</span>
              </p>
              <p className="inline-flex items-center gap-2 text-ink-60">
                <Building2 size={16} className="text-coral" />
                {row.city}, {row.country}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-ink-10 shadow-card-sm">
            <CardHeader>
              <CardTitle className="text-lg font-extrabold">Compliance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-[14px] text-ink-60">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 font-bold text-ink">
                  <ShieldCheck size={18} className="text-coral" />
                  Government ID
                </span>
                {govBadge(row.governmentIdStatus)}
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 font-bold text-ink">
                  <CreditCard size={18} className="text-coral" />
                  Payout account
                </span>
                <span
                  className={cn(
                    'text-[12px] font-extrabold',
                    row.bankVerified ? 'text-mint' : 'text-amber'
                  )}
                >
                  {row.bankVerified ? 'Verified' : 'Pending verification'}
                </span>
              </div>
              <p>
                <span className="font-bold text-ink">Certificates:</span> {row.certificatesSummary}
              </p>
              <p>
                <span className="font-bold text-ink">Submitted:</span> {new Date(row.submittedAt).toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Button
            type="button"
            variant="dark"
            className="w-full"
            disabled={row.status !== 'pending' || approveState.isLoading}
            loading={approveState.isLoading}
            onClick={async () => {
              try {
                await approve(row.id).unwrap();
                notifySuccess('Talent profile approved.');
                void nav('/approvals/talent');
              } catch {
                notifyError('Approval failed.');
              }
            }}
          >
            Approve profile
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-3xl border-ink-10 shadow-card-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Video className="text-coral" size={20} />
              <CardTitle className="text-lg font-extrabold">Intro reel</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <video className="aspect-video w-full rounded-2xl bg-ink ring-1 ring-ink-10" controls src={row.introVideoUrl} />
            <p className="mt-3 text-[13px] font-semibold text-ink-60">
              <span className="font-bold text-ink">Media QA:</span> {row.mediaQualityNote}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-ink-10 shadow-card-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="text-coral" size={20} />
              <CardTitle className="text-lg font-extrabold">Portfolio PDF</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <a
              href={row.portfolioPdfUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-2xl border border-ink-10 bg-surface-tint px-4 py-3 text-[14px] font-bold text-coral hover:border-coral/40"
            >
              Open certificate packet →
            </a>
            <p className="text-[13px] text-ink-60">Opens in a new tab (sample PDF).</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg font-extrabold">Reject profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(async (values) => {
              try {
                await reject({ id: row.id, body: values }).unwrap();
                notifySuccess('Talent profile rejected with notes.');
                void nav('/approvals/talent');
              } catch {
                notifyError('Rejection failed.');
              }
            })}
          >
            <label className="block">
              <span className="text-[12px] font-bold text-ink-60">Reason</span>
              <textarea
                className="mt-1.5 min-h-[100px] w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px] outline-none focus:border-coral focus:ring-2 focus:ring-coral/30"
                {...form.register('reason')}
              />
            </label>
            {form.formState.errors.reason ? (
              <p className="text-[12px] font-bold text-coral">{form.formState.errors.reason.message}</p>
            ) : null}
            <Button
              type="submit"
              variant="danger"
              disabled={row.status !== 'pending' || rejectState.isLoading}
              loading={rejectState.isLoading}
            >
              Reject
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
