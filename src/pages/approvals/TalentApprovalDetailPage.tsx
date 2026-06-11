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
import {
  Building2,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  FileText,
  Globe,
  ImageIcon,
  Instagram,
  MapPin,
  Music2,
  Plane,
  ShieldCheck,
  User,
  Video,
  XCircle,
} from 'lucide-react';

type RejectForm = RejectTalentProfileInput;

const HEADSHOT_FALLBACK =
  'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&q=80&auto=format&fit=crop';

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

function boolLabel(value: boolean | undefined, yes = 'Yes', no = 'No') {
  if (value === undefined) return '—';
  return value ? yes : no;
}

function verificationBadge(verified: boolean | undefined, label: string) {
  if (verified === undefined) return null;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide',
        verified ? 'bg-mint/20 text-ink' : 'bg-amber/15 text-amber',
      )}
    >
      {verified ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
      {label} {verified ? 'verified' : 'unverified'}
    </span>
  );
}

function locationLine(row: TalentProfile) {
  const parts = [row.city, row.country].filter(Boolean);
  if (parts.length) return parts.join(', ');
  if (row.regionId !== undefined || row.cityId !== undefined) {
    return [
      row.regionId !== undefined ? `Region #${row.regionId}` : null,
      row.cityId !== undefined ? `City #${row.cityId}` : null,
    ]
      .filter(Boolean)
      .join(' · ');
  }
  return 'Not provided';
}

function websiteHref(url: string) {
  const t = url.trim();
  if (!t) return '';
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

function EmptyMedia({ label }: { label: string }) {
  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center rounded-2xl border border-dashed border-ink-10 bg-surface-tint px-4 text-center">
      <ImageIcon className="mb-2 text-ink-40" size={28} />
      <p className="text-[13px] font-bold text-ink-60">{label}</p>
      <p className="mt-1 text-[12px] font-semibold text-ink-40">Not uploaded yet</p>
    </div>
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
  const roleApplicationId = row.applicationId?.trim() ?? '';
  const canDecide = row.status === 'pending' && Boolean(roleApplicationId);
  const headshot = row.headshotUrl.trim() || HEADSHOT_FALLBACK;
  const hasIntroVideo = Boolean(row.introVideoUrl.trim());
  const hasPortfolio = Boolean(row.portfolioPdfUrl.trim());
  const hasWebsite = Boolean(row.websiteUrl.trim());
  const hasInstagram = Boolean(row.instagramHandle.trim());
  const showApplicationContact =
    (row.contactEmail && row.contactEmail !== row.email) ||
    (row.contactPhone && row.contactPhone !== row.phone);

  const profileChips: { key: string; label: string }[] = [];
  if (row.slug) profileChips.push({ key: 'slug', label: `Slug · ${row.slug}` });
  if (row.yearsExperience > 0) {
    profileChips.push({ key: 'exp', label: `${row.yearsExperience} yrs experience` });
  }
  if (row.availabilityStatus) {
    profileChips.push({ key: 'avail', label: `Availability · ${row.availabilityStatus}` });
  }
  if (row.travelReady !== undefined) {
    profileChips.push({
      key: 'travel',
      label: row.travelReady ? 'Travel ready' : 'Not travel ready',
    });
  }
  if (row.locationPublic !== undefined) {
    profileChips.push({
      key: 'loc',
      label: row.locationPublic ? 'Location public' : 'Location hidden',
    });
  }

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
                <img src={headshot} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="space-y-4 p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-ink-40">Talent dossier</p>
                    <h1 className="mt-1 text-3xl font-extrabold text-ink">{row.stageName}</h1>
                    <p className="mt-1 text-[14px] font-semibold text-ink-60">
                      {row.legalName.trim() || 'Legal name not provided'}
                    </p>
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
                {profileChips.length ? (
                  <div className="flex flex-wrap gap-2">
                    {profileChips.map((chip) => (
                      <span
                        key={chip.key}
                        className="rounded-full bg-ink-5 px-3 py-1 text-[12px] font-bold text-ink"
                      >
                        {chip.label}
                      </span>
                    ))}
                  </div>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  {row.genres.length ? (
                    row.genres.map((g) => (
                      <span
                        key={g}
                        className="inline-flex items-center gap-1 rounded-full bg-ink-5 px-3 py-1 text-[12px] font-bold text-ink"
                      >
                        <Music2 size={14} className="text-coral" />
                        {g}
                      </span>
                    ))
                  ) : (
                    <span className="rounded-full bg-ink-5 px-3 py-1 text-[12px] font-bold text-ink-60">
                      No categories listed
                    </span>
                  )}
                </div>
                <p className="text-[14px] leading-relaxed text-ink-60">
                  {row.bio.trim() || 'No biography provided.'}
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-ink-10 bg-surface-tint p-4">
                    <p className="text-[10px] font-extrabold uppercase tracking-wide text-ink-40">Bookings</p>
                    <p className="mt-1 font-mono text-2xl font-black text-ink">{row.completedBookings}</p>
                    <p className="text-[12px] font-semibold text-ink-60">Completed on platform</p>
                  </div>
                  <div className="rounded-2xl border border-ink-10 bg-surface-tint p-4">
                    <p className="text-[10px] font-extrabold uppercase tracking-wide text-ink-40">Fan rating</p>
                    <p className="mt-1 font-mono text-2xl font-black text-coral">
                      {row.averageRating.toFixed(1)} ★
                    </p>
                    <p className="text-[12px] font-semibold text-ink-60">
                      {row.ratingCount !== undefined
                        ? `${row.ratingCount} review${row.ratingCount === 1 ? '' : 's'}`
                        : 'Post-show surveys'}
                    </p>
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
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wide text-ink-40">Account email</p>
                <p className="mt-1 font-bold text-ink">{row.email}</p>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {verificationBadge(row.emailVerified, 'Email')}
                  {verificationBadge(row.phoneVerified, 'Phone')}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wide text-ink-40">Account phone</p>
                <p className="mt-1 font-semibold text-ink-60">{row.phone.trim() || 'Not provided'}</p>
              </div>
              {showApplicationContact ? (
                <div className="rounded-2xl border border-ink-10 bg-surface-tint p-3">
                  <p className="text-[10px] font-extrabold uppercase tracking-wide text-ink-40">
                    Application contact
                  </p>
                  {row.contactEmail && row.contactEmail !== row.email ? (
                    <p className="mt-1 font-bold text-ink">{row.contactEmail}</p>
                  ) : null}
                  {row.contactPhone && row.contactPhone !== row.phone ? (
                    <p className="mt-1 font-semibold text-ink-60">{row.contactPhone}</p>
                  ) : null}
                </div>
              ) : null}
              {hasWebsite ? (
                <p className="inline-flex items-center gap-2 font-semibold text-ink-60">
                  <Globe size={16} className="text-coral" />
                  <a
                    href={websiteHref(row.websiteUrl)}
                    className="font-bold text-coral hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {row.websiteUrl}
                  </a>
                </p>
              ) : (
                <p className="inline-flex items-center gap-2 text-ink-40">
                  <Globe size={16} />
                  No website provided
                </p>
              )}
              {hasInstagram ? (
                <p className="inline-flex items-center gap-2 font-semibold text-ink-60">
                  <Instagram size={16} className="text-coral" />
                  <span className="font-bold text-ink">
                    @{row.instagramHandle.replace(/^@/, '')}
                  </span>
                </p>
              ) : (
                <p className="inline-flex items-center gap-2 text-ink-40">
                  <Instagram size={16} />
                  No Instagram handle
                </p>
              )}
              <p className="inline-flex items-center gap-2 text-ink-60">
                <MapPin size={16} className="text-coral" />
                {locationLine(row)}
              </p>
              {row.travelReady !== undefined ? (
                <p className="inline-flex items-center gap-2 text-ink-60">
                  <Plane size={16} className="text-coral" />
                  Travel ready: <span className="font-bold text-ink">{boolLabel(row.travelReady)}</span>
                </p>
              ) : null}
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
                <span className="font-bold text-ink">Certificate:</span>{' '}
                {row.certificatesSummary.trim() || 'None provided'}
              </p>
              <p>
                <span className="font-bold text-ink">Quality disclaimer:</span>{' '}
                {row.acceptedQualityDisclaimer === undefined
                  ? '—'
                  : row.acceptedQualityDisclaimer
                    ? 'Accepted'
                    : 'Not accepted'}
              </p>
              <p>
                <span className="font-bold text-ink">Submitted:</span>{' '}
                {row.submittedAt
                  ? new Date(row.submittedAt).toLocaleString()
                  : '—'}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-ink-10 shadow-card-sm">
            <CardHeader>
              <CardTitle className="text-lg font-extrabold">Profile metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-[14px] text-ink-60">
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-ink-10 bg-surface-tint px-4 py-3">
                <span className="font-bold text-ink">Profile id</span>
                <span className="font-mono text-[13px]">{row.id}</span>
              </div>
              {row.userId ? (
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-ink-10 bg-surface-tint px-4 py-3">
                  <span className="inline-flex items-center gap-2 font-bold text-ink">
                    <User size={16} className="text-coral" />
                    User id
                  </span>
                  <span className="font-mono text-[13px]">{row.userId}</span>
                </div>
              ) : null}
              {row.applicationId ? (
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-ink-10 bg-surface-tint px-4 py-3">
                  <span className="inline-flex items-center gap-2 font-bold text-ink">
                    <Building2 size={16} className="text-coral" />
                    Role application id
                  </span>
                  <Link
                    to={`/approvals/roles/${row.applicationId}`}
                    className="font-mono text-[13px] font-bold text-coral hover:underline"
                  >
                    {row.applicationId}
                  </Link>
                </div>
              ) : (
                <p className="rounded-2xl border border-amber/30 bg-amber/10 px-4 py-3 text-[13px] font-semibold text-ink">
                  No linked role application id on this profile. Approval must use the id from{' '}
                  <Link to="/approvals/roles" className="font-bold text-coral hover:underline">
                    Role applications
                  </Link>
                  , not the talent profile id.
                </p>
              )}
              {row.isActive !== undefined ? (
                <p>
                  <span className="font-bold text-ink">Profile active:</span>{' '}
                  {boolLabel(row.isActive)}
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Button
            type="button"
            variant="dark"
            className="w-full"
            disabled={!canDecide || approveState.isLoading}
            loading={approveState.isLoading}
            onClick={async () => {
              if (!roleApplicationId) {
                notifyError('Missing role application id for this talent profile.');
                return;
              }
              try {
                await approve({
                  profileId: row.id,
                  applicationId: roleApplicationId,
                }).unwrap();
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

      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ImageIcon className="text-coral" size={20} />
            <CardTitle className="text-lg font-extrabold">Gallery uploads</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {row.gallery.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {row.gallery.map((item) => (
                <a
                  key={item.id}
                  href={item.imageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group block overflow-hidden rounded-2xl border border-ink-10 bg-ink-5"
                >
                  <div className="relative aspect-[4/3]">
                    <img
                      src={item.imageUrl}
                      alt={item.caption ?? `Gallery image ${item.position + 1}`}
                      className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
                    />
                    <span className="absolute right-2 top-2 rounded-full bg-ink/70 px-2 py-0.5 text-[10px] font-bold text-white">
                      #{item.position + 1}
                    </span>
                  </div>
                  {item.caption ? (
                    <p className="px-3 py-2 text-[12px] font-semibold text-ink-60">{item.caption}</p>
                  ) : null}
                </a>
              ))}
            </div>
          ) : (
            <EmptyMedia label="No gallery images uploaded" />
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-3xl border-ink-10 shadow-card-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Video className="text-coral" size={20} />
              <CardTitle className="text-lg font-extrabold">Intro reel</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {hasIntroVideo ? (
              <video
                className="aspect-video w-full rounded-2xl bg-ink ring-1 ring-ink-10"
                controls
                src={row.introVideoUrl}
              />
            ) : (
              <EmptyMedia label="No intro video uploaded" />
            )}
            <p className="mt-3 text-[13px] font-semibold text-ink-60">
              <span className="font-bold text-ink">Media QA:</span>{' '}
              {row.mediaQualityNote.trim() || 'No moderator notes on file.'}
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
            {hasPortfolio ? (
              <a
                href={row.portfolioPdfUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl border border-ink-10 bg-surface-tint px-4 py-3 text-[14px] font-bold text-coral hover:border-coral/40"
              >
                Open portfolio PDF
                <ExternalLink size={16} />
              </a>
            ) : (
              <EmptyMedia label="No portfolio PDF uploaded" />
            )}
            {row.certificatesSummary.trim() ? (
              <p className="text-[13px] text-ink-60">
                <span className="font-bold text-ink">Certificate on file:</span> {row.certificatesSummary}
              </p>
            ) : null}
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
              if (!roleApplicationId) {
                notifyError('Missing role application id for this talent profile.');
                return;
              }
              try {
                await reject({
                  profileId: row.id,
                  applicationId: roleApplicationId,
                  body: values,
                }).unwrap();
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
              disabled={!canDecide || rejectState.isLoading}
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
