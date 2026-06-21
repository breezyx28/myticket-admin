import { Button } from '@/components/ui/Button';
import { getApiErrorMessage } from '@/lib/apiError';
import { tourismAdToFormValues } from '@/lib/tourismAdFormValues';
import { notifyError, notifySuccess } from '@/lib/notify';
import { createTourismAdSchema, defaultOpeningHours, type CreateTourismAdInput } from '@/schemas/tourismAd.schema';
import { useGetTourismAdQuery, useUpdateTourismAdMutation } from '@/services/adminApi';
import { i18nZodResolver } from '@/lib/i18nZodResolver';
import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { TourismAdFormBody } from './components/TourismAdFormBody';

export function TourismAdEditPage() {
  const { t } = useTranslation(['operations', 'common']);
  const navigate = useNavigate();
  const { id = '' } = useParams();
  const { data: ad, isLoading, isError } = useGetTourismAdQuery(id, { skip: !id });
  const [updateAd, { isLoading: saving }] = useUpdateTourismAdMutation();

  const form = useForm<CreateTourismAdInput>({
    resolver: i18nZodResolver(createTourismAdSchema),
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

  useEffect(() => {
    if (!ad) return;
    form.reset(tourismAdToFormValues(ad));
  }, [ad, form]);

  async function onSubmit(values: CreateTourismAdInput) {
    try {
      await updateAd({
        id,
        body: {
          ...values,
          galleryUrls: values.galleryUrls.filter((url) => url.trim().length > 0),
        },
      }).unwrap();
      notifySuccess(t('operations:tourismAds.notify.updated'));
      navigate(`/tourism-ads/${id}`);
    } catch (err) {
      notifyError(getApiErrorMessage(err, t('operations:tourismAds.notify.updateFailed')));
    }
  }

  if (isLoading) return <p className="text-sm text-ink-60">{t('operations:tourismAds.loading')}</p>;
  if (isError || !ad) {
    return (
      <div className="space-y-4">
        <Link to="/tourism-ads" className="inline-flex items-center gap-1 text-[13px] font-semibold text-ink-60">
          <ArrowLeft size={14} /> {t('operations:tourismAds.backLink')}
        </Link>
        <p className="text-coral">{t('operations:tourismAds.notFound')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to={`/tourism-ads/${id}`}
        className="inline-flex items-center gap-1 text-[13px] font-semibold text-ink-60 transition-colors hover:text-ink"
      >
        <ArrowLeft size={14} /> {t('operations:tourismAds.backToDetail')}
      </Link>

      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-40">
          {t('operations:tourismAds.editEyebrow')}
        </p>
        <h1 className="text-balance text-3xl font-extrabold text-ink">{t('operations:tourismAds.editTitle')}</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-ink-60">
          <Trans
            ns="operations"
            i18nKey="tourismAds.editDescription"
            values={{ name: ad.locationName }}
            components={{ strong: <span className="font-semibold text-ink" /> }}
          />
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <TourismAdFormBody form={form} />
        <div className="flex justify-end gap-3">
          <Link to={`/tourism-ads/${id}`}>
            <Button type="button" variant="ghost">
              {t('common:cancel')}
            </Button>
          </Link>
          <Button type="submit" variant="secondary" loading={saving}>
            {t('operations:tourismAds.saveButton')}
          </Button>
        </div>
      </form>
    </div>
  );
}
