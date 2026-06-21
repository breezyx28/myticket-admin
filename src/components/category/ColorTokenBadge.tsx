import { isLightCategoryColorHex, resolveCategoryColorTokenHex } from '@/lib/categoryColorTokens';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

type ColorTokenBadgeProps = {
  token?: string | null;
  className?: string;
  compact?: boolean;
};

export function ColorTokenBadge({ token, className, compact }: ColorTokenBadgeProps) {
  const { t } = useTranslation('common');
  const value = token?.trim();

  if (!value) {
    return <span className="text-[12px] font-semibold text-ink-40">{t('none')}</span>;
  }

  const hex = resolveCategoryColorTokenHex(value);
  const lightSwatch = isLightCategoryColorHex(hex);

  return (
    <div
      className={cn(
        'relative flex items-center justify-center overflow-hidden rounded-xl border border-ink/10 shadow-card-sm',
        compact ? 'h-9 min-w-[6.5rem]' : 'h-11 min-w-[7.5rem]',
        className,
      )}
      style={{ backgroundColor: hex }}
      title={value}
    >
      <span
        className={cn(
          'rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide shadow-sm backdrop-blur-sm',
          lightSwatch ? 'bg-ink/80 text-white' : 'bg-white/90 text-ink',
        )}
      >
        {value}
      </span>
    </div>
  );
}
