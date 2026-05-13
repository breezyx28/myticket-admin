import { CATEGORY_PHOSPHOR_ICON_MAP } from '@/components/category/phosphorCategoryPicklist';

export function PhosphorIconKeyPreview({ iconKey }: { iconKey: string }) {
  const k = iconKey.trim();
  if (!k) return <span className="text-ink-40">—</span>;
  const Icon = CATEGORY_PHOSPHOR_ICON_MAP.get(k);
  if (!Icon) {
    return <span className="font-mono text-[12px] text-ink-40" title="Not in bundled picklist">
      {k}
    </span>;
  }
  return (
    <span className="inline-flex shrink-0" title={k}>
      <Icon size={22} weight="duotone" className="text-coral" aria-hidden />
    </span>
  );
}
