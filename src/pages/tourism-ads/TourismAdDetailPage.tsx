import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTourismAdsRealtime } from '@/hooks/useTourismAdsRealtime';
import { notifyError, notifySuccess } from '@/lib/notify';
import { cn } from '@/lib/utils';
import {
  rejectTourismAdSchema,
  WEEKDAY_KEYS,
  type RejectTourismAdInput,
} from '@/schemas/tourismAd.schema';
import {
  useApproveTourismAdMutation,
  useArchiveTourismAdMutation,
  useGetTourismAdQuery,
  usePinTourismAdMutation,
  useRejectTourismAdMutation,
  useUnpinTourismAdMutation,
} from '@/services/adminApi';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ExternalLink, MapPin } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useParams } from 'react-router-dom';
import { OpeningHoursEditor } from './components/OpeningHoursEditor';
import { TourismAdStatusBadge } from './components/TourismAdStatusBadge';

type RejectForm = RejectTourismAdInput;

const DAY_LABELS: Record<(typeof WEEKDAY_KEYS)[number], string> = {
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
  sun: 'Sun',
};

function mapsUrl(lat: string, lng: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`;
}

export function TourismAdDetailPage() {
  useTourismAdsRealtime();
  const { id = '' } = useParams();
  const { data: ad, isLoading, isError } = useGetTourismAdQuery(id, { skip: !id });
  const [approve, { isLoading: approving }] = useApproveTourismAdMutation();
  const [reject, { isLoading: rejecting }] = useRejectTourismAdMutation();
  const [archive, { isLoading: archiving }] = useArchiveTourismAdMutation();
  const [pin, { isLoading: pinning }] = usePinTourismAdMutation();
  const [unpin, { isLoading: unpinning }] = useUnpinTourismAdMutation();
  const [showReject, setShowReject] = useState(false);

  const rejectForm = useForm<RejectForm>({
    resolver: zodResolver(rejectTourismAdSchema),
    defaultValues: { reason: '' },
  });

  const busy = approving || rejecting || archiving || pinning || unpinning;

  async function onApprove() {
    try {
      await approve(id).unwrap();
      notifySuccess('Tourism ad approved and published.');
    } catch {
      notifyError('Approve failed.');
    }
  }

  async function onReject(values: RejectForm) {
    try {
      await reject({ id, reason: values.reason }).unwrap();
      notifySuccess('Tourism ad rejected.');
      setShowReject(false);
      rejectForm.reset();
    } catch {
      notifyError('Reject failed.');
    }
  }

  async function onArchive() {
    try {
      await archive(id).unwrap();
      notifySuccess('Tourism ad archived.');
    } catch {
      notifyError('Archive failed.');
    }
  }

  async function onPin() {
    try {
      await pin({ id }).unwrap();
      notifySuccess('Pinned to carousel.');
    } catch {
      notifyError('Pin failed.');
    }
  }

  async function onUnpin() {
    try {
      await unpin(id).unwrap();
      notifySuccess('Unpinned from carousel.');
    } catch {
      notifyError('Unpin failed.');
    }
  }

  if (isLoading) return <p className="text-sm text-ink-60">Loading tourism ad…</p>;
  if (isError || !ad) {
    return (
      <div className="space-y-4">
        <Link to="/tourism-ads" className="inline-flex items-center gap-1 text-[13px] font-semibold text-ink-60">
          <ArrowLeft size={14} /> Back to tourism ads
        </Link>
        <p className="text-coral">Tourism ad not found.</p>
      </div>
    );
  }

  const hero = ad.coverImageUrl ?? ad.galleryUrls[0];
  const readOnly = ad.status === 'rejected' || ad.status === 'withdrawn';

  return (
    <div className="space-y-6">
      <Link to="/tourism-ads" className="inline-flex items-center gap-1 text-[13px] font-semibold text-ink-60">
        <ArrowLeft size={14} /> Back to tourism ads
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-3xl border border-ink-10 bg-ink-5 shadow-card-sm">
            {hero ? (
              <img src={hero} alt="" className="aspect-[16/10] w-full object-cover" />
            ) : (
              <div className="flex aspect-[16/10] items-center justify-center text-ink-40">
                <MapPin size={48} />
              </div>
            )}
          </div>

          <Card className="rounded-3xl border-ink-10 shadow-card-sm">
            <CardHeader>
              <CardTitle className="text-lg">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-ink-60">{ad.description}</p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-ink-10 shadow-card-sm">
            <CardHeader>
              <CardTitle className="text-lg">Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {ad.services.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-mint/20 px-3 py-1 text-[12px] font-bold text-ink"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-ink-10 shadow-card-sm">
            <CardHeader>
              <CardTitle className="text-lg">Gallery</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {ad.galleryUrls.map((url) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="group overflow-hidden rounded-2xl border border-ink-10"
                  >
                    <img src={url} alt="" className="aspect-[4/3] w-full object-cover transition group-hover:scale-[1.02]" />
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-3xl border-ink-10 shadow-card-sm">
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-2xl font-extrabold">{ad.locationName}</CardTitle>
                <TourismAdStatusBadge status={ad.status} />
              </div>
              <p className="font-mono text-[12px] text-ink-40">{ad.id}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2 text-[12px] font-bold uppercase tracking-wide text-ink-60">
                <span className="rounded-full bg-ink-5 px-3 py-1">Source: {ad.source}</span>
                {ad.isPinned ? (
                  <span className="rounded-full bg-coral/15 px-3 py-1 text-coral">
                    Carousel #{ad.carouselPosition ?? 0}
                  </span>
                ) : null}
              </div>
              <a
                href={mapsUrl(ad.latitude, ad.longitude)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[13px] font-semibold text-coral"
              >
                {ad.latitude}, {ad.longitude}
                <ExternalLink size={14} />
              </a>

              <div className="space-y-2 border-t border-ink-10 pt-4 text-[13px] text-ink-60">
                {ad.contact.phone ? <p>Phone: {ad.contact.phone}</p> : null}
                {ad.contact.email ? <p>Email: {ad.contact.email}</p> : null}
                {ad.contact.website ? <p>Website: {ad.contact.website}</p> : null}
                {ad.contact.whatsapp ? <p>WhatsApp: {ad.contact.whatsapp}</p> : null}
              </div>

              {ad.mediaLinks.length > 0 ? (
                <div className="space-y-1 border-t border-ink-10 pt-4">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-ink-40">Media links</p>
                  {ad.mediaLinks.map((m) => (
                    <a
                      key={`${m.platform}-${m.url}`}
                      href={m.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-[13px] font-semibold text-coral"
                    >
                      {m.platform}
                    </a>
                  ))}
                </div>
              ) : null}

              {(ad.user || ad.createdBy) && (
                <div className="border-t border-ink-10 pt-4 text-[13px] text-ink-60">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-ink-40">Submitter</p>
                  <p className="font-semibold text-ink">
                    {ad.user?.fullName ?? ad.createdBy?.fullName ?? 'Unknown'}
                  </p>
                  <p>{ad.user?.email ?? ad.createdBy?.email}</p>
                  {ad.submittedAt ? (
                    <p className="mt-1 text-[12px]">Submitted {new Date(ad.submittedAt).toLocaleString()}</p>
                  ) : null}
                </div>
              )}

              {ad.reviewedBy || ad.reviewedAt ? (
                <div className="border-t border-ink-10 pt-4 text-[13px] text-ink-60">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-ink-40">Review</p>
                  {ad.reviewedBy ? <p>By {ad.reviewedBy.fullName ?? ad.reviewedBy.email}</p> : null}
                  {ad.reviewedAt ? <p>{new Date(ad.reviewedAt).toLocaleString()}</p> : null}
                  {ad.rejectionReason ? (
                    <p className="mt-2 rounded-xl bg-coral/10 px-3 py-2 text-coral">{ad.rejectionReason}</p>
                  ) : null}
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-ink-10 shadow-card-sm">
            <CardHeader>
              <CardTitle className="text-lg">Opening hours</CardTitle>
            </CardHeader>
            <CardContent>
              {readOnly ? (
                <div className="grid grid-cols-2 gap-2 text-[13px]">
                  {WEEKDAY_KEYS.map((day) => {
                    const row = ad.openingHours[day];
                    return (
                      <div key={day} className="rounded-xl bg-surface-tint/50 px-3 py-2">
                        <span className="font-bold text-ink">{DAY_LABELS[day]}</span>
                        <span className="ml-2 text-ink-60">
                          {row.closed ? 'Closed' : `${row.opens} – ${row.closes}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <OpeningHoursEditor value={ad.openingHours} onChange={() => {}} disabled />
              )}
              {!readOnly ? (
                <p className="mt-3 text-[12px] text-ink-60">Edit hours on the create form or via PATCH when wired.</p>
              ) : null}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-ink-10 shadow-card-sm">
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {ad.status === 'pending_review' ? (
                <>
                  <Button variant="secondary" loading={approving} disabled={busy} onClick={onApprove}>
                    Approve
                  </Button>
                  <Button variant="outline" disabled={busy} onClick={() => setShowReject((v) => !v)}>
                    Reject
                  </Button>
                </>
              ) : null}
              {ad.status === 'published' ? (
                <>
                  <Button variant="outline" loading={archiving} disabled={busy} onClick={onArchive}>
                    Archive
                  </Button>
                  {ad.isPinned ? (
                    <Button variant="ghost" loading={unpinning} disabled={busy} onClick={onUnpin}>
                      Unpin
                    </Button>
                  ) : (
                    <Button variant="ghost" loading={pinning} disabled={busy} onClick={onPin}>
                      Pin to carousel
                    </Button>
                  )}
                </>
              ) : null}
            </CardContent>
            {showReject ? (
              <CardContent className="border-t border-ink-10 pt-4">
                <form onSubmit={rejectForm.handleSubmit(onReject)} className="space-y-3">
                  <label className="flex flex-col gap-1 text-[12px] font-semibold text-ink-60">
                    Rejection reason
                    <textarea
                      {...rejectForm.register('reason')}
                      rows={3}
                      className={cn(
                        'rounded-xl border border-ink-10 bg-white px-3 py-2 text-[14px] text-ink',
                        rejectForm.formState.errors.reason && 'border-coral',
                      )}
                    />
                  </label>
                  {rejectForm.formState.errors.reason ? (
                    <p className="text-[12px] font-semibold text-coral">
                      {rejectForm.formState.errors.reason.message}
                    </p>
                  ) : null}
                  <Button type="submit" variant="danger" loading={rejecting} disabled={busy}>
                    Confirm reject
                  </Button>
                </form>
              </CardContent>
            ) : null}
          </Card>
        </div>
      </div>
    </div>
  );
}
