import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

type ListFiltersBarProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  className?: string;
  children?: ReactNode;
};

export function ListFiltersBar({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  className,
  children,
}: ListFiltersBarProps) {
  const { t } = useTranslation('common');

  return (
    <div className={cn('flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between', className)}>
      <label className="relative block w-full lg:max-w-md">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-40"
          strokeWidth={2}
          aria-hidden
        />
        <input
          type="search"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder ?? t('searchPlaceholder')}
          className="w-full rounded-xl border border-ink-10 bg-white py-2.5 pl-10 pr-3 text-[14px] text-ink outline-none placeholder:text-ink-40 focus:border-coral focus:ring-2 focus:ring-coral/25"
        />
      </label>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}
