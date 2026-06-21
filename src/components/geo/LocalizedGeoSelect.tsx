import { filterSelectClassName } from '@/lib/adminFilters';
import { localizedGeoLabel } from '@/lib/localizedGeoName';
import { getCurrentLocale } from '@/i18n';
import type { LocalizedGeoName } from '@/schemas/localizedGeo.schema';
import { cn } from '@/lib/utils';

type LocalizedGeoSelectProps = {
  items: LocalizedGeoName[];
  value?: number | '';
  onChange: (next: number | '') => void;
  placeholder: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  'aria-label'?: string;
};

export function LocalizedGeoSelect({
  items,
  value,
  onChange,
  placeholder,
  disabled,
  className,
  id,
  'aria-label': ariaLabel,
}: LocalizedGeoSelectProps) {
  const locale = getCurrentLocale();

  return (
    <select
      id={id}
      aria-label={ariaLabel}
      disabled={disabled}
      className={cn(filterSelectClassName(), className)}
      value={value === undefined || value === null ? '' : String(value)}
      onChange={(event) => {
        const raw = event.target.value;
        onChange(raw === '' ? '' : Number(raw));
      }}
    >
      <option value="">{placeholder}</option>
      {items
        .filter((item): item is LocalizedGeoName & { id: number } => item.id !== undefined)
        .map((item) => (
          <option key={item.id} value={item.id}>
            {localizedGeoLabel(item, locale)}
          </option>
        ))}
    </select>
  );
}
