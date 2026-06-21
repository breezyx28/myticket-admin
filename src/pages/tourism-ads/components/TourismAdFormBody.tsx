import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CreateTourismAdInput } from '@/schemas/tourismAd.schema';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import { Controller, type UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { OpeningHoursEditor } from './OpeningHoursEditor';
import { TourismAdContactFields } from './TourismAdContactFields';
import { TourismAdGalleryField } from './TourismAdGalleryField';
import { TourismAdLocationPicker } from './TourismAdLocationPicker';

type TourismAdFormBodyProps = {
  form: UseFormReturn<CreateTourismAdInput>;
};

export function TourismAdFormBody({ form }: TourismAdFormBodyProps) {
  const { t } = useTranslation(['operations', 'common']);
  const [serviceDraft, setServiceDraft] = useState('');
  const [linkDraft, setLinkDraft] = useState({ platform: '', url: '' });

  const services = form.watch('services');
  const mediaLinks = form.watch('mediaLinks');

  function addService() {
    const trimmed = serviceDraft.trim();
    if (!trimmed || services.length >= 20) return;
    if (services.includes(trimmed)) return;
    form.setValue('services', [...services, trimmed], { shouldValidate: true });
    setServiceDraft('');
  }

  function addMediaLink() {
    const platform = linkDraft.platform.trim();
    const url = linkDraft.url.trim();
    if (!platform || !url) return;
    form.setValue('mediaLinks', [...(mediaLinks ?? []), { platform, url }], { shouldValidate: true });
    setLinkDraft({ platform: '', url: '' });
  }

  return (
    <>
      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">{t('operations:tourismAds.sections.location')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex flex-col gap-2 text-[12px] font-semibold text-ink-60">
            {t('operations:tourismAds.locationName')}
            <input
              {...form.register('locationName')}
              className="h-11 rounded-xl border border-ink-10 bg-white px-3 text-[14px] text-ink"
            />
            {form.formState.errors.locationName ? (
              <span className="text-coral">{form.formState.errors.locationName.message}</span>
            ) : null}
          </label>
          <Controller
            control={form.control}
            name="latitude"
            render={({ field: latField }) => (
              <Controller
                control={form.control}
                name="longitude"
                render={({ field: lngField }) => (
                  <TourismAdLocationPicker
                    latitude={latField.value}
                    longitude={lngField.value}
                    onCoordinatesChange={(lat, lng) => {
                      latField.onChange(lat);
                      lngField.onChange(lng);
                    }}
                    onLocationNameSuggest={(name) => {
                      if (!form.getValues('locationName')?.trim()) {
                        form.setValue('locationName', name, { shouldValidate: true });
                      }
                    }}
                  />
                )}
              />
            )}
          />
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">{t('operations:tourismAds.sections.description')}</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            {...form.register('description')}
            rows={5}
            className="w-full rounded-xl border border-ink-10 bg-white px-3 py-2 text-[14px] text-ink"
            placeholder={t('operations:tourismAds.descriptionPlaceholder')}
          />
          {form.formState.errors.description ? (
            <p className="mt-2 text-[12px] font-semibold text-coral">
              {form.formState.errors.description.message}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">{t('operations:tourismAds.sections.openingHours')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Controller
            control={form.control}
            name="openingHours"
            render={({ field }) => <OpeningHoursEditor value={field.value} onChange={field.onChange} />}
          />
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">{t('operations:tourismAds.sections.contact')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Controller
            control={form.control}
            name="contact"
            render={({ field }) => (
              <TourismAdContactFields
                value={field.value}
                onChange={field.onChange}
                errors={{
                  phone: form.formState.errors.contact?.phone?.message,
                  email: form.formState.errors.contact?.email?.message,
                  root: form.formState.errors.contact?.message,
                }}
              />
            )}
          />
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">{t('operations:tourismAds.sections.services')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {services.map((service) => (
              <span
                key={service}
                className="inline-flex items-center gap-1 rounded-full bg-mint/20 px-3 py-1 text-[12px] font-bold"
              >
                {service}
                <button
                  type="button"
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full transition-transform active:scale-[0.96]"
                  onClick={() =>
                    form.setValue(
                      'services',
                      services.filter((item) => item !== service),
                      { shouldValidate: true },
                    )
                  }
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={serviceDraft}
              onChange={(e) => setServiceDraft(e.target.value)}
              placeholder={t('operations:tourismAds.servicePlaceholder')}
              className="h-11 flex-1 rounded-xl border border-ink-10 bg-white px-3 text-[14px]"
            />
            <Button type="button" variant="outline" onClick={addService}>
              <Plus size={14} />
            </Button>
          </div>
          {form.formState.errors.services ? (
            <p className="text-[12px] font-semibold text-coral">{form.formState.errors.services.message}</p>
          ) : null}
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">{t('operations:tourismAds.sections.mediaLinks')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(mediaLinks ?? []).map((link, index) => (
            <div
              key={`${link.platform}-${index}`}
              className="flex items-center justify-between gap-3 rounded-xl border border-ink-10 bg-surface-tint/40 px-3 py-2"
            >
              <p className="min-w-0 truncate text-[13px] text-ink-60">
                <span className="font-semibold text-ink">{link.platform}</span>: {link.url}
              </p>
              <button
                type="button"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-60 transition-transform hover:bg-ink-5 active:scale-[0.96]"
                onClick={() =>
                  form.setValue(
                    'mediaLinks',
                    (mediaLinks ?? []).filter((_, itemIndex) => itemIndex !== index),
                    { shouldValidate: true },
                  )
                }
              >
                <X size={14} />
              </button>
            </div>
          ))}
          <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <input
              value={linkDraft.platform}
              onChange={(e) => setLinkDraft((draft) => ({ ...draft, platform: e.target.value }))}
              placeholder={t('operations:tourismAds.platform')}
              className="h-11 rounded-xl border border-ink-10 bg-white px-3 text-[14px]"
            />
            <input
              value={linkDraft.url}
              onChange={(e) => setLinkDraft((draft) => ({ ...draft, url: e.target.value }))}
              placeholder={t('operations:tourismAds.urlPlaceholder')}
              className="h-11 rounded-xl border border-ink-10 bg-white px-3 text-[14px]"
            />
            <Button type="button" variant="outline" onClick={addMediaLink}>
              {t('common:add')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">{t('operations:tourismAds.sections.gallery')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Controller
            control={form.control}
            name="galleryUrls"
            render={({ field }) => (
              <TourismAdGalleryField
                urls={field.value}
                onChange={field.onChange}
                error={form.formState.errors.galleryUrls?.message}
              />
            )}
          />
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">{t('operations:tourismAds.sections.visibilityWindow')}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-[12px] font-semibold text-ink-60">
            {t('operations:tourismAds.startsAt')}
            <input
              type="datetime-local"
              {...form.register('visibilityStartsAt')}
              className="h-11 rounded-xl border border-ink-10 bg-white px-3 text-[14px] font-mono tabular-nums"
            />
          </label>
          <label className="flex flex-col gap-2 text-[12px] font-semibold text-ink-60">
            {t('operations:tourismAds.endsAt')}
            <input
              type="datetime-local"
              {...form.register('visibilityEndsAt')}
              className="h-11 rounded-xl border border-ink-10 bg-white px-3 text-[14px] font-mono tabular-nums"
            />
          </label>
        </CardContent>
      </Card>
    </>
  );
}
