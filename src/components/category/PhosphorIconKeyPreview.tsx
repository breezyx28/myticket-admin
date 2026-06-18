import { CATEGORY_PHOSPHOR_ICON_MAP } from '@/components/category/phosphorCategoryPicklist';
import { useTranslation } from 'react-i18next';

export function PhosphorIconKeyPreview({ iconKey }: { iconKey: string }) {
  const { t } = useTranslation('common');
  const k = iconKey.trim();
  if (!k) return <span className="text-ink-40">{t('none')}</span>;
  const Icon = CATEGORY_PHOSPHOR_ICON_MAP.get(k);
  if (!Icon) {
    return (
      <span className="font-mono text-[12px] text-ink-40" title={t('iconNotInPicklist')}>
        {k}
      </span>
    );
  }
  return (
    <span className="inline-flex shrink-0" title={k}>
      <Icon size={22} weight="duotone" className="text-coral" aria-hidden />
    </span>
  );
}
