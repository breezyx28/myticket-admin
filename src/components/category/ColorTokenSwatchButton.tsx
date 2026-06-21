import { isLightCategoryColorHex } from '@/lib/categoryColorTokens';
import { cn } from '@/lib/utils';

type ColorTokenSwatchButtonProps = {
  token: string;
  hex: string;
  selected?: boolean;
  onSelect: () => void;
};

export function ColorTokenSwatchButton({ token, hex, selected, onSelect }: ColorTokenSwatchButtonProps) {
  const lightSwatch = isLightCategoryColorHex(hex);

  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={onSelect}
      className={cn(
        'group relative flex h-16 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border transition active:scale-[0.98]',
        selected
          ? 'border-ink ring-2 ring-coral/40 ring-offset-2'
          : 'border-ink/10 hover:border-coral/35 hover:shadow-card-sm',
      )}
      style={{ backgroundColor: hex }}
    >
      <span
        className={cn(
          'rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide shadow-sm backdrop-blur-sm transition',
          lightSwatch ? 'bg-ink/75 text-white group-hover:bg-ink/90' : 'bg-white/90 text-ink group-hover:bg-white',
        )}
      >
        {token}
      </span>
    </button>
  );
}
