import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { notifyError, notifySuccess } from '@/lib/notify';
import {
  createTourismAdSchema,
  defaultOpeningHours,
  type CreateTourismAdInput,
} from '@/schemas/tourismAd.schema';
import { useCreateTourismAdMutation } from '@/services/adminApi';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { OpeningHoursEditor } from './components/OpeningHoursEditor';
import { TourismAdContactFields } from './components/TourismAdContactFields';
import { TourismAdGalleryField } from './components/TourismAdGalleryField';
import { TourismAdLocationPicker } from './components/TourismAdLocationPicker';

export function TourismAdCreatePage() {
  const navigate = useNavigate();
  const [createAd, { isLoading }] = useCreateTourismAdMutation();
  const [serviceDraft, setServiceDraft] = useState('');
  const [linkDraft, setLinkDraft] = useState({ platform: '', url: '' });

  const form = useForm<CreateTourismAdInput>({
    resolver: zodResolver(createTourismAdSchema),
    defaultValues: {
      locationName: '',
      latitude: 24.7136,
      longitude: 46.6753,
      description: '',
      openingHours: defaultOpeningHours(),
      services: [],
      contact: {},
      mediaLinks: [],
      galleryUrls: [''],
      visibilityStartsAt: null,
      visibilityEndsAt: null,
    },
  });

  const services = form.watch('services');
  const mediaLinks = form.watch('mediaLinks');

  async function onSubmit(values: CreateTourismAdInput) {
    try {
      const created = await createAd({
        ...values,
        galleryUrls: values.galleryUrls.filter((u) => u.trim().length > 0),
      }).unwrap();
      notifySuccess('Tourism ad published.');
      navigate(`/tourism-ads/${created.id}`);
    } catch {
      notifyError('Could not create tourism ad.');
    }
  }

  function addService() {
    const t = serviceDraft.trim();
    if (!t || services.length >= 20) return;
    if (services.includes(t)) return;
    form.setValue('services', [...services, t], { shouldValidate: true });
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
    <div className="space-y-6">
      <Link to="/tourism-ads" className="inline-flex items-center gap-1 text-[13px] font-semibold text-ink-60">
        <ArrowLeft size={14} /> Back to tourism ads
      </Link>

      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-40">Publish</p>
        <h1 className="text-3xl font-extrabold text-ink">New tourism ad</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-ink-60">
          Admin create publishes immediately via{' '}
          <span className="font-mono text-ink">POST /api/v1/admin/tourism-ads</span>.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="rounded-3xl border-ink-10 shadow-card-sm">
          <CardHeader>
            <CardTitle className="text-lg">Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex flex-col gap-1 text-[12px] font-semibold text-ink-60">
              Location name
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
            <CardTitle className="text-lg">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              {...form.register('description')}
              rows={5}
              className="w-full rounded-xl border border-ink-10 bg-white px-3 py-2 text-[14px] text-ink"
              placeholder="At least 50 characters describing the experience…"
            />
            {form.formState.errors.description ? (
              <p className="mt-1 text-[12px] font-semibold text-coral">
                {form.formState.errors.description.message}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-ink-10 shadow-card-sm">
          <CardHeader>
            <CardTitle className="text-lg">Opening hours</CardTitle>
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
            <CardTitle className="text-lg">Contact</CardTitle>
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
            <CardTitle className="text-lg">Services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {services.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 rounded-full bg-mint/20 px-3 py-1 text-[12px] font-bold"
                >
                  {s}
                  <button
                    type="button"
                    onClick={() =>
                      form.setValue(
                        'services',
                        services.filter((x) => x !== s),
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
                placeholder="e.g. guided tours"
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
            <CardTitle className="text-lg">Media links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(mediaLinks ?? []).map((m, i) => (
              <p key={`${m.platform}-${i}`} className="text-[13px] text-ink-60">
                {m.platform}: {m.url}
              </p>
            ))}
            <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
              <input
                value={linkDraft.platform}
                onChange={(e) => setLinkDraft((d) => ({ ...d, platform: e.target.value }))}
                placeholder="Platform"
                className="h-11 rounded-xl border border-ink-10 bg-white px-3 text-[14px]"
              />
              <input
                value={linkDraft.url}
                onChange={(e) => setLinkDraft((d) => ({ ...d, url: e.target.value }))}
                placeholder="https://…"
                className="h-11 rounded-xl border border-ink-10 bg-white px-3 text-[14px]"
              />
              <Button type="button" variant="outline" onClick={addMediaLink}>
                Add
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-ink-10 shadow-card-sm">
          <CardHeader>
            <CardTitle className="text-lg">Gallery</CardTitle>
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
            <CardTitle className="text-lg">Visibility window (optional)</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-[12px] font-semibold text-ink-60">
              Starts at
              <input
                type="datetime-local"
                {...form.register('visibilityStartsAt')}
                className="h-11 rounded-xl border border-ink-10 bg-white px-3 text-[14px]"
              />
            </label>
            <label className="flex flex-col gap-1 text-[12px] font-semibold text-ink-60">
              Ends at
              <input
                type="datetime-local"
                {...form.register('visibilityEndsAt')}
                className="h-11 rounded-xl border border-ink-10 bg-white px-3 text-[14px]"
              />
            </label>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Link to="/tourism-ads">
            <Button type="button" variant="ghost">
              Cancel
            </Button>
          </Link>
          <Button type="submit" variant="secondary" loading={isLoading}>
            Publish tourism ad
          </Button>
        </div>
      </form>
    </div>
  );
}
