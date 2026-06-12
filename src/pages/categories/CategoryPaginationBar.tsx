import { Button } from '@/components/ui/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
  if (total <= 0) return null;

  return (
    <div className="mt-6 flex flex-col gap-3 border-t border-ink-10 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="font-mono text-[13px] text-ink-60">
        Showing {itemCount} of {total.toLocaleString()} · page {page} / {totalPages}
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1 || loading} onClick={onPrev}>
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Previous
        </Button>
        <Button variant="outline" size="sm" disabled={page >= totalPages || loading} onClick={onNext}>
          Next
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}
