import { changeAppLanguage, getCurrentLocale } from '@/i18n';
import type { AppLocale } from '@/i18n/constants';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

type LanguageSwitcherProps = {
  className?: string;
  compact?: boolean;
};

export function LanguageSwitcher({ className, compact }: LanguageSwitcherProps) {
  const { t } = useTranslation('common');
  const current = getCurrentLocale();

  async function select(lng: AppLocale) {
    await changeAppLanguage(lng);
  }

  return (
    <div
      className={cn('inline-flex items-center rounded-full border border-ink-10 bg-white p-0.5', className)}
      role="group"
      aria-label={t('language')}
    >
      {(['en', 'ar'] as const).map((lng) => (
        <button
          key={lng}
          type="button"
          onClick={() => void select(lng)}
          className={cn(
            'rounded-full px-3 py-1.5 text-[12px] font-bold transition active:scale-[0.98]',
            current === lng ? 'bg-ink text-white' : 'text-ink-60 hover:text-ink',
            compact && 'px-2 py-1 text-[11px]',
          )}
        >
          {lng === 'en' ? t('languageEn') : t('languageAr')}
        </button>
      ))}
    </div>
  );
}
