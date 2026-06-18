import { DirectoryProfileDetailView } from '@/pages/approvals/components/DirectoryProfileDetailView';
import { useGetVendorProfilesQuery } from '@/services/adminApi';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function VendorProfileDetailPage() {
  const { t } = useTranslation('approvals');
  const { id = '' } = useParams();
  const { data, isLoading } = useGetVendorProfilesQuery();

  if (isLoading) return <p className="text-ink-60">{t('loading')}</p>;

  const row = data?.find((r) => String(r.id) === String(id));

  if (!row) {
    return (
      <div className="rounded-3xl border border-ink-10 bg-white p-8">
        <p className="font-semibold text-ink">{t('vendorDetail.notFound')}</p>
        <Link
          to="/approvals/vendors"
          className="mt-4 inline-block font-bold text-coral hover:underline"
        >
          {t('vendorDetail.backToVendors')}
        </Link>
      </div>
    );
  }

  return <DirectoryProfileDetailView kind="vendor" row={row} />;
}
