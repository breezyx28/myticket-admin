import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { Button } from '@/components/ui/Button';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export function AccessDeniedPage() {
  const { t } = useTranslation('auth');

  return (
    <div className="min-h-dvh bg-surface-tint px-6 py-20">
      <div className="absolute end-4 top-4 sm:end-6 sm:top-6">
        <LanguageSwitcher />
      </div>
      <div className="mx-auto max-w-lg rounded-3xl border border-ink-10 bg-white p-10 text-center shadow-card-lg">
        <h1 className="text-3xl font-extrabold text-ink">{t('accessDenied.title')}</h1>
        <p className="mt-3 text-[15px] text-ink-60">{t('accessDenied.subtitle')}</p>
        <Link to="/login" className="mt-8 inline-block">
          <Button type="button" variant="dark" size="lg">
            {t('accessDenied.returnToSignIn')}
          </Button>
        </Link>
      </div>
    </div>
  );
}
