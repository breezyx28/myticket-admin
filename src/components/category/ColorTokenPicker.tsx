import { ColorTokenBadge } from '@/components/category/ColorTokenBadge';
import { ColorTokenPickerModal } from '@/components/category/ColorTokenPickerModal';
import { Button } from '@/components/ui/Button';
import { isKnownCategoryColorToken } from '@/lib/categoryColorTokens';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type ColorTokenPickerProps = {
  value: string;
  onChange: (token: string) => void;
  id?: string;
};

export function ColorTokenPicker({ value, onChange, id }: ColorTokenPickerProps) {
  const { t } = useTranslation('operations');
  const [open, setOpen] = useState(false);
  const selected = value?.trim() ?? '';
  const unknownSelected = selected.length > 0 && !isKnownCategoryColorToken(selected);

  return (
    <div className="space-y-2" id={id}>
      <div className="flex flex-wrap items-center gap-2">
        <ColorTokenBadge token={selected || null} />
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
          {t('categories.colorPicker.choose')}
        </Button>
        {selected ? (
          <button
            type="button"
            className="cursor-pointer text-[12px] font-semibold text-ink-60 underline-offset-2 hover:text-ink hover:underline"
            onClick={() => onChange('')}
          >
            {t('categories.colorPicker.clear')}
          </button>
        ) : null}
      </div>

      {unknownSelected ? (
        <p className="text-[12px] font-medium text-amber">
          {t('categories.colorPicker.unknownToken', { token: selected })}
        </p>
      ) : null}

      <ColorTokenPickerModal
        open={open}
        value={selected}
        onClose={() => setOpen(false)}
        onSelect={onChange}
      />
    </div>
  );
}
