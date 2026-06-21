import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTourismAdsRealtime } from '@/hooks/useTourismAdsRealtime';
import { getCurrentLocale } from '@/i18n';
import { getApiErrorMessage } from '@/lib/apiError';
import { formatDateTime } from '@/lib/localeFormat';
import { notifyError, notifySuccess } from '@/lib/notify';
import { canArchiveTourismAd, canEditTourismAd } from '@/lib/tourismAdFormValues';
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
import { i18nZodResolver } from '@/lib/i18nZodResolver';
import { ArrowLeft, ExternalLink, MapPin, Pencil } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { OpeningHoursEditor } from './components/OpeningHoursEditor';
import { TourismAdStatusBadge } from './components/TourismAdStatusBadge';

type RejectForm = RejectTourismAdInput;

function mapsUrl(lat: string, lng: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`;
}

export function TourismAdDetailPage() {
  const { t } = useTranslation('operations');
  const locale = getCurrentLocale();
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
    resolver: i18nZodResolver(rejectTourismAdSchema),
    defaultValues: { reason: '' },
  });

  const busy = approving || rejecting || archiving || pinning || unpinning;

  async function onApprove() {
    try {
      await approve(id).unwrap();
      notifySuccess(t('tourismAds.notify.approved'));
    } catch {
      notifyError(t('tourismAds.notify.approveFailed'));
    }
  }

  async function onReject(values: RejectForm) {
    try {
      await reject({ id, reason: values.reason }).unwrap();
      notifySuccess(t('tourismAds.notify.rejected'));
      setShowReject(false);
      rejectForm.reset();
    } catch {
      notifyError(t('tourismAds.notify.rejectFailed'));
    }
  }

  async function onArchive(locationName: string) {
    if (!window.confirm(t('tourismAds.archiveConfirm', { name: locationName }))) {
      return;
    }
    try {
      await archive(id).unwrap();
      notifySuccess(t('tourismAds.notify.archived'));
    } catch (err) {
      notifyError(getApiErrorMessage(err, t('tourismAds.notify.archiveFailed')));
    }
  }

  async function onPin() {
    try {
      await pin({ id }).unwrap();
      notifySuccess(t('tourismAds.notify.pinned'));
    } catch {
      notifyError(t('tourismAds.notify.pinDetailFailed'));
    }
  }

  async function onUnpin() {
    try {
      await unpin(id).unwrap();
      notifySuccess(t('tourismAds.notify.unpinned'));
    } catch {
      notifyError(t('tourismAds.notify.unpinDetailFailed'));
    }
  }

  if (isLoading) return <p className="text-sm text-ink-60">{t('tourismAds.loading')}</p>;
  if (isError || !ad) {
    return (
      <div className="space-y-4">
        <Link to="/tourism-ads" className="inline-flex items-center gap-1 text-[13px] font-semibold text-ink-60">
          <ArrowLeft size={14} /> {t('tourismAds.backLink')}
        </Link>
        <p className="text-coral">{t('tourismAds.notFound')}</p>
      </div>
    );
  }

  const hero = ad.coverImageUrl ?? ad.galleryUrls[0];
  const readOnly = !canEditTourismAd(ad);
  const editable = canEditTourismAd(ad);
  const archivable = canArchiveTourismAd(ad);
  const hasReviewActions = ad.status === 'pending_review';
  const hasCarouselActions = ad.status === 'published';
  const hasAnyAction = editable || hasReviewActions || hasCarouselActions || archivable;

  return (
    <div className="space-y-6 pb-8">
      <Link
        to="/tourism-ads"
        className="inline-flex items-center gap-1 text-[13px] font-semibold text-ink-60 transition-colors hover:text-ink"
      >
        <ArrowLeft size={14} /> {t('tourismAds.backLink')}
      </Link>

      <div className="overflow-hidden rounded-3xl border border-ink-10 bg-white shadow-card-sm">
        <div className="flex flex-col gap-4 p-5 md:p-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <TourismAdStatusBadge status={ad.status} />
              <span className="rounded-full bg-ink-5 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-ink-60">
                {t(`tourismAds.sourceType.${ad.source}`)}
              </span>
              {ad.isPinned ? (
                <span className="rounded-full bg-coral/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-coral">
                  {t('tourismAds.carouselPosition', { position: ad.carouselPosition ?? 0 })}
                </span>
              ) : null}
            </div>
            <div>
              <h1 className="text-balance text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
                {ad.locationName}
              </h1>
              <p className="mt-2 font-mono text-[12px] tabular-nums text-ink-40">{ad.id}</p>
            </div>
          </div>

          {hero ? (
            <img
              src={hero}
              alt=""
              className="h-24 w-full rounded-2xl object-cover outline outline-1 outline-black/10 sm:h-28 sm:w-40 lg:shrink-0"
            />
          ) : null}
        </div>

        <div className="border-t border-ink-10 bg-surface-tint/50 px-5 py-4 md:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <p className="max-w-xl text-[13px] font-medium text-ink-60">{t('tourismAds.actionsHint')}</p>
            {hasAnyAction ? (
              <div
                className="flex flex-wrap items-center gap-2"
                role="group"
                aria-label={t('tourismAds.sections.actions')}
              >
                {editable ? (
                  <Link to={`/tourism-ads/${ad.id}/edit`}>
                    <Button variant="secondary" size="sm" disabled={busy}>
                      <Pencil size={14} className="me-1.5" />
                      {t('tourismAds.actions.edit')}
                    </Button>
                  </Link>
                ) : null}
                {hasReviewActions ? (
                  <>
                    <Button variant="dark" size="sm" loading={approving} disabled={busy} onClick={onApprove}>
                      {t('tourismAds.approve')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={busy}
                      onClick={() => setShowReject((open) => !open)}
                    >
                      {t('tourismAds.reject')}
                    </Button>
                  </>
                ) : null}
                {hasCarouselActions ? (
                  ad.isPinned ? (
                    <Button variant="outline" size="sm" loading={unpinning} disabled={busy} onClick={onUnpin}>
                      {t('tourismAds.unpin')}
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" loading={pinning} disabled={busy} onClick={onPin}>
                      {t('tourismAds.pinToCarousel')}
                    </Button>
                  )
                ) : null}
                {archivable ? (
                  <Button
                    variant="danger"
                    size="sm"
                    loading={archiving}
                    disabled={busy}
                    onClick={() => onArchive(ad.locationName)}
                  >
                    {t('tourismAds.actions.archive')}
                  </Button>
                ) : null}
              </div>
            ) : (
              <p className="text-[13px] font-semibold text-ink-40">{t('tourismAds.actionsReadOnly')}</p>
            )}
          </div>
        </div>

        {showReject ? (
          <div className="border-t border-ink-10 bg-white px-5 py-4 md:px-6">
            <form onSubmit={rejectForm.handleSubmit(onReject)} className="space-y-3">
              <label className="flex flex-col gap-2 text-[12px] font-semibold text-ink-60">
                {t('tourismAds.rejectionReason')}
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
              <div className="flex flex-wrap gap-2">
                <Button type="submit" variant="danger" size="sm" loading={rejecting} disabled={busy}>
                  {t('tourismAds.confirmReject')}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={busy}
                  onClick={() => {
                    setShowReject(false);
                    rejectForm.reset();
                  }}
                >
                  {t('tourismAds.cancelReject')}
                </Button>
              </div>
            </form>
          </div>
        ) : null}
      </div>

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
              <CardTitle className="text-lg">{t('tourismAds.sections.description')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-ink-60">{ad.description}</p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-ink-10 shadow-card-sm">
            <CardHeader>
              <CardTitle className="text-lg">{t('tourismAds.sections.services')}</CardTitle>
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
              <CardTitle className="text-lg">{t('tourismAds.sections.gallery')}</CardTitle>
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
              <CardTitle className="text-lg">{t('tourismAds.sections.details')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                {ad.contact.phone ? (
                  <p>
                    {t('tourismAds.contactLabels.phone')}: {ad.contact.phone}
                  </p>
                ) : null}
                {ad.contact.email ? (
                  <p>
                    {t('tourismAds.contactLabels.email')}: {ad.contact.email}
                  </p>
                ) : null}
                {ad.contact.website ? (
                  <p>
                    {t('tourismAds.contactLabels.website')}: {ad.contact.website}
                  </p>
                ) : null}
                {ad.contact.whatsapp ? (
                  <p>
                    {t('tourismAds.contactLabels.whatsapp')}: {ad.contact.whatsapp}
                  </p>
                ) : null}
              </div>

              {ad.mediaLinks.length > 0 ? (
                <div className="space-y-1 border-t border-ink-10 pt-4">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
                    {t('tourismAds.sections.mediaLinks')}
                  </p>
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
                  <p className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
                    {t('tourismAds.submitter')}
                  </p>
                  <p className="font-semibold text-ink">
                    {ad.user?.fullName ?? ad.createdBy?.fullName ?? t('tourismAds.unknown')}
                  </p>
                  <p>{ad.user?.email ?? ad.createdBy?.email}</p>
                  {ad.submittedAt ? (
                    <p className="mt-1 text-[12px]">
                      {t('tourismAds.submittedAt', {
                        date: formatDateTime(ad.submittedAt, locale),
                      })}
                    </p>
                  ) : null}
                </div>
              )}

              {ad.reviewedBy || ad.reviewedAt ? (
                <div className="border-t border-ink-10 pt-4 text-[13px] text-ink-60">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
                    {t('tourismAds.review')}
                  </p>
                  {ad.reviewedBy ? (
                    <p>
                      {t('tourismAds.reviewedBy', {
                        name: ad.reviewedBy.fullName ?? ad.reviewedBy.email ?? t('tourismAds.unknown'),
                      })}
                    </p>
                  ) : null}
                  {ad.reviewedAt ? <p>{formatDateTime(ad.reviewedAt, locale)}</p> : null}
                  {ad.rejectionReason ? (
                    <p className="mt-2 rounded-xl bg-coral/10 px-3 py-2 text-coral">{ad.rejectionReason}</p>
                  ) : null}
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-ink-10 shadow-card-sm">
            <CardHeader>
              <CardTitle className="text-lg">{t('tourismAds.sections.openingHours')}</CardTitle>
            </CardHeader>
            <CardContent>
              {readOnly ? (
                <div className="grid grid-cols-2 gap-2 text-[13px]">
                  {WEEKDAY_KEYS.map((day) => {
                    const row = ad.openingHours[day];
                    return (
                      <div key={day} className="rounded-xl bg-surface-tint/50 px-3 py-2">
                        <span className="font-bold text-ink">{t(`tourismAds.weekdaysShort.${day}`)}</span>
                        <span className="ml-2 text-ink-60">
                          {row.closed
                            ? t('tourismAds.closed')
                            : t('tourismAds.hoursRange', { opens: row.opens, closes: row.closes })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <OpeningHoursEditor value={ad.openingHours} onChange={() => {}} disabled />
              )}
              {editable ? (
                <p className="mt-3 text-[12px] text-ink-60">
                  <Link to={`/tourism-ads/${ad.id}/edit`} className="font-semibold text-coral hover:underline">
                    {t('tourismAds.editHoursLink')}
                  </Link>
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
