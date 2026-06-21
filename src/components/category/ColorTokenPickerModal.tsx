import { ColorTokenSwatchButton } from '@/components/category/ColorTokenSwatchButton';
import { Button } from '@/components/ui/Button';
import { CATEGORY_COLOR_TOKENS } from '@/lib/categoryColorTokens';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

type ColorTokenPickerModalProps = {
  open: boolean;
  value: string;
  onClose: () => void;
  onSelect: (token: string) => void;
};

export function ColorTokenPickerModal({ open, value, onClose, onSelect }: ColorTokenPickerModalProps) {
  const { t } = useTranslation(['operations', 'common']);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) {
      setQuery('');
      if (!el.open) el.showModal();
    } else if (el.open) {
      el.close();
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CATEGORY_COLOR_TOKENS;
    return CATEGORY_COLOR_TOKENS.filter((entry) => entry.token.includes(q));
  }, [query]);

  const selected = value?.trim().toLowerCase() ?? '';

  return (
    <dialog
      ref={dialogRef}
      className="m-auto max-h-[min(90vh,720px)] w-[min(96vw,880px)] translate-x-0 translate-y-0 rounded-3xl border border-ink-10 bg-white p-0 text-ink shadow-card-lg backdrop:bg-ink/40"
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      <div className="flex max-h-[min(90vh,720px)] flex-col p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-ink-10 pb-4">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-ink-40">
              {t('operations:categories.colorPicker.eyebrow')}
            </p>
            <h2 className="text-xl font-extrabold text-ink">{t('operations:categories.colorPicker.title')}</h2>
            <p className="mt-1 max-w-xl text-[13px] text-ink-60">{t('operations:categories.colorPicker.hint')}</p>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            {t('common:close')}
          </Button>
        </div>

        <label className="mt-4 block">
          <span className="text-[12px] font-bold text-ink-60">{t('operations:categories.colorPicker.filterLabel')}</span>
          <input
            className="mt-1.5 w-full rounded-xl border border-ink-10 px-3 py-2 font-mono text-[14px] outline-none focus:border-coral focus:ring-2 focus:ring-coral/30"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('operations:categories.colorPicker.filterPlaceholder')}
            autoFocus
          />
        </label>

        <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
          <div
            className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
            role="listbox"
            aria-label={t('operations:categories.fields.colorToken')}
          >
            {filtered.map(({ token, hex }) => (
              <ColorTokenSwatchButton
                key={token}
                token={token}
                hex={hex}
                selected={selected === token}
                onSelect={() => {
                  onSelect(token);
                  onClose();
                }}
              />
            ))}
          </div>
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm font-semibold text-ink-60">
              {t('operations:categories.colorPicker.noMatch')}
            </p>
          ) : null}
        </div>
      </div>
    </dialog>
  );
}
