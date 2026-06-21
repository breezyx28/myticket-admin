import { Button } from '@/components/ui/Button';
import { notifyError, notifySuccess } from '@/lib/notify';
import {
  createTourismAdSchema,
  defaultOpeningHours,
  type CreateTourismAdInput,
} from '@/schemas/tourismAd.schema';
import { useCreateTourismAdMutation } from '@/services/adminApi';
import { i18nZodResolver } from '@/lib/i18nZodResolver';
import { ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { TourismAdFormBody } from './components/TourismAdFormBody';

export function TourismAdCreatePage() {
  const { t } = useTranslation(['operations', 'common']);
  const navigate = useNavigate();
  const [createAd, { isLoading }] = useCreateTourismAdMutation();

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

  async function onSubmit(values: CreateTourismAdInput) {
    try {
      const created = await createAd({
        ...values,
        galleryUrls: values.galleryUrls.filter((u) => u.trim().length > 0),
      }).unwrap();
      notifySuccess(t('operations:tourismAds.notify.created'));
      navigate(`/tourism-ads/${created.id}`);
    } catch {
      notifyError(t('operations:tourismAds.notify.createFailed'));
    }
  }

  return (
    <div className="space-y-6">
      <Link to="/tourism-ads" className="inline-flex items-center gap-1 text-[13px] font-semibold text-ink-60">
        <ArrowLeft size={14} /> {t('operations:tourismAds.backLink')}
      </Link>

      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-40">
          {t('operations:tourismAds.publishEyebrow')}
        </p>
        <h1 className="text-balance text-3xl font-extrabold text-ink">{t('operations:tourismAds.createTitle')}</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-ink-60">
          <Trans
            ns="operations"
            i18nKey="tourismAds.createDescription"
            components={{ mono: <span className="font-mono text-ink" /> }}
          />
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <TourismAdFormBody form={form} />
        <div className="flex justify-end gap-3">
          <Link to="/tourism-ads">
            <Button type="button" variant="ghost">
              {t('common:cancel')}
            </Button>
          </Link>
          <Button type="submit" variant="secondary" loading={isLoading}>
            {t('operations:tourismAds.publishButton')}
          </Button>
        </div>
      </form>
    </div>
  );
}
