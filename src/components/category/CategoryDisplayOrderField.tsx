import {
  ordersFromCategories,
  resolveCategoryDisplayOrder,
  suggestNextCategoryDisplayOrder,
} from '@/lib/categoryDisplayOrder';
import { useTranslation } from 'react-i18next';
import { Controller, type FieldValues, type Path, type UseFormReturn } from 'react-hook-form';

type CategoryDisplayOrderFieldProps<T extends FieldValues> = {
  form: UseFormReturn<T>;
  items: Array<{ id: string; displayOrder?: number }>;
  excludeId?: string;
};

export function CategoryDisplayOrderField<T extends FieldValues & { displayOrder?: number }>({
  form,
  items,
  excludeId,
}: CategoryDisplayOrderFieldProps<T>) {
  const { t } = useTranslation('operations');
  const takenOrders = ordersFromCategories(items, excludeId);
  const suggested = suggestNextCategoryDisplayOrder(takenOrders);

  return (
    <label className="block space-y-2">
      <span className="text-[12px] font-semibold text-ink-60">{t('categories.fields.displayOrder')}</span>
      <Controller
        control={form.control}
        name={'displayOrder' as Path<T>}
        render={({ field }) => (
          <input
            type="number"
            min={0}
            max={65535}
            placeholder={String(suggested)}
            className="w-full rounded-xl border border-ink-10 px-3 py-2 font-mono text-[13px]"
            value={field.value ?? ''}
            onChange={(e) => {
              const raw = e.target.value;
              if (raw === '') {
                field.onChange(undefined);
                return;
              }
              const parsed = Number(raw);
              field.onChange(Number.isFinite(parsed) ? parsed : undefined);
            }}
            onBlur={() => {
              const next = resolveCategoryDisplayOrder(field.value, takenOrders);
              field.onChange(next);
              field.onBlur();
            }}
          />
        )}
      />
      {form.formState.errors.displayOrder ? (
        <p className="text-[12px] font-medium text-coral">
          {String(form.formState.errors.displayOrder.message ?? '')}
        </p>
      ) : null}
    </label>
  );
}

export function defaultCategoryDisplayOrder(
  items: Array<{ id: string; displayOrder?: number }>,
): number {
  return suggestNextCategoryDisplayOrder(ordersFromCategories(items));
}
