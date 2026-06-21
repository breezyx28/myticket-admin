import { filterCategoryNameSuggestions } from '@/lib/categoryNameSuggestions';
import { cn } from '@/lib/utils';
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

type CategoryNameSuggestInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSuggestionSelect?: (value: string) => void;
  onBlur?: () => void;
  suggestions: string[];
  dir?: 'ltr' | 'rtl' | 'auto';
  className?: string;
  error?: string;
};

type MenuPosition = {
  top: number;
  left: number;
  width: number;
};

export function CategoryNameSuggestInput({
  value,
  onChange,
  onSuggestionSelect,
  onBlur,
  suggestions,
  dir = 'auto',
  className,
  error,
}: CategoryNameSuggestInputProps) {
  const { t } = useTranslation('operations');
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);

  const matches = useMemo(
    () => filterCategoryNameSuggestions(value, suggestions),
    [value, suggestions],
  );

  const showMenu = open && matches.length > 0;

  useLayoutEffect(() => {
    if (!showMenu) {
      setMenuPosition(null);
      return;
    }

    function updatePosition() {
      const input = inputRef.current;
      if (!input) return;
      const rect = input.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [showMenu, value]);

  useEffect(() => {
    function onDocPointerDown(e: PointerEvent) {
      const target = e.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener('pointerdown', onDocPointerDown);
    return () => document.removeEventListener('pointerdown', onDocPointerDown);
  }, []);

  const menu =
    showMenu && menuPosition
      ? createPortal(
          <ul
            ref={menuRef}
            id={listId}
            role="listbox"
            style={{
              top: menuPosition.top,
              left: menuPosition.left,
              width: menuPosition.width,
            }}
            className="fixed z-[9999] max-h-52 overflow-y-auto rounded-2xl border border-ink-10 bg-white py-1 shadow-card-lg"
          >
            <li className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-ink-40">
              {t('categories.nameSuggest.label')}
            </li>
            {matches.map((name) => (
              <li key={name} role="option">
                <button
                  type="button"
                  className="flex w-full cursor-pointer items-center px-3 py-2 text-start text-[13px] font-medium text-ink transition hover:bg-coral/10"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onChange(name);
                    onSuggestionSelect?.(name);
                    setOpen(false);
                  }}
                >
                  {name}
                </button>
              </li>
            ))}
          </ul>,
          document.body,
        )
      : null;

  return (
    <div ref={rootRef} className="relative">
      <input
        ref={inputRef}
        dir={dir}
        role="combobox"
        aria-expanded={showMenu}
        aria-controls={listId}
        aria-autocomplete="list"
        className={cn(
          'w-full rounded-xl border border-ink-10 px-3 py-2 text-[13px] outline-none focus:border-coral focus:ring-2 focus:ring-coral/30',
          className,
        )}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          window.setTimeout(() => {
            setOpen(false);
            onBlur?.();
          }, 120);
        }}
      />

      {menu}

      {error ? <p className="mt-1 text-[12px] font-medium text-coral">{error}</p> : null}
    </div>
  );
}
