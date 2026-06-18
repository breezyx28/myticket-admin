import { Button } from '@/components/ui/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatNumber } from '@/lib/localeFormat';
import { getCurrentLocale } from '@/i18n';
import { useTranslation } from 'react-i18next';

type CategoryPaginationBarProps = {
  page: number;
  totalPages: number;
  total: number;
  itemCount: number;
  loading?: boolean;
  onPrev: () => void;
  onNext: () => void;
};

export function CategoryPaginationBar({
  page,
  totalPages,
  total,
  itemCount,
  loading = false,
  onPrev,
  onNext,
}: CategoryPaginationBarProps) {
  const { t } = useTranslation(['operations', 'common']);
  const locale = getCurrentLocale();

  if (total <= 0) return null;

  return (
    <div className="mt-6 flex flex-col gap-3 border-t border-ink-10 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="font-mono text-[13px] text-ink-60">
        {t('operations:categories.pagination.showing', {
          count: itemCount,
          total: formatNumber(total, locale),
          page,
          totalPages,
        })}
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1 || loading} onClick={onPrev}>
          <ChevronLeft className="h-4 w-4" aria-hidden />
          {t('operations:categories.pagination.previous')}
        </Button>
        <Button variant="outline" size="sm" disabled={page >= totalPages || loading} onClick={onNext}>
          {t('operations:categories.pagination.next')}
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}
