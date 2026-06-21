import { ListFiltersBar } from '@/components/admin/ListFiltersBar';
import { RowActionsMenu, type RowMenuAction } from '@/components/admin/RowActionsMenu';
import {
  CategoryDisplayOrderField,
  defaultCategoryDisplayOrder,
} from '@/components/category/CategoryDisplayOrderField';
import { CategoryNameSuggestInput } from '@/components/category/CategoryNameSuggestInput';
import { ColorTokenBadge } from '@/components/category/ColorTokenBadge';
import { ColorTokenPicker } from '@/components/category/ColorTokenPicker';
import { PhosphorIconKeyPreview } from '@/components/category/PhosphorIconKeyPreview';
import { PhosphorIconPickerModal } from '@/components/category/PhosphorIconPickerModal';
import { Button } from '@/components/ui/Button';
import { filterSelectClassName } from '@/lib/adminFilters';
import { getApiErrorMessage } from '@/lib/apiError';
import { getCurrentLocale } from '@/i18n';
import { rowMatchesSearch } from '@/lib/listQuery';
import { notifyError, notifySuccess } from '@/lib/notify';
import { pickLocalizedField } from '@/lib/pickLocalizedField';
import { CategoryPaginationBar } from '@/pages/categories/CategoryPaginationBar';
import { ordersFromCategories, resolveCategoryDisplayOrder } from '@/lib/categoryDisplayOrder';
import { autoCategorySlugFromEnglishName } from '@/lib/categoryFormSlug';
import { eventCategoryUpsertFormSchema, type EventCategoryUpsertForm } from '@/schemas/event.schema';
import type { EventCategory } from '@/schemas/event.schema';
import {
  useDeleteEventCategoryMutation,
  useGetCategoriesQuery,
  useToggleCategoryActiveMutation,
  useUpsertCategoryMutation,
} from '@/services/adminApi';
import { i18nZodResolver } from '@/lib/i18nZodResolver';
import {
  buildCategoryNameSuggestions,
  EVENT_CATEGORY_NAME_AR_SUGGESTIONS,
  EVENT_CATEGORY_NAME_EN_SUGGESTIONS,
  lookupCategoryNameCounterpart,
} from '@/lib/categoryNameSuggestions';
import { Trans, useTranslation } from 'react-i18next';
import { useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';

const defaultAddValues = {
  slug: '',
  nameEn: '',
  nameAr: '',
  iconKey: '',
  colorToken: '',
} satisfies EventCategoryUpsertForm;

export function EventCategoriesPanel() {
  const { t } = useTranslation(['operations', 'common']);
  const locale = getCurrentLocale();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [iconPickerFor, setIconPickerFor] = useState<'add' | 'edit'>('add');

  const { data, isLoading, isFetching } = useGetCategoriesQuery({ page, perPage: 50 });
  const [upsert, upsertState] = useUpsertCategoryMutation();
  const [toggleActive, toggleState] = useToggleCategoryActiveMutation();
  const [deleteCategory, deleteState] = useDeleteEventCategoryMutation();

  const addForm = useForm<EventCategoryUpsertForm>({
    resolver: i18nZodResolver(eventCategoryUpsertFormSchema),
    defaultValues: defaultAddValues,
  });
  const editForm = useForm<EventCategoryUpsertForm>({
    resolver: i18nZodResolver(eventCategoryUpsertFormSchema),
    defaultValues: defaultAddValues,
  });

  const items = data?.items ?? [];
  const existingSlugs = useMemo(() => items.map((c) => c.slug), [items]);
  const addIconKey = addForm.watch('iconKey');
  const editIconKey = editForm.watch('iconKey');

  const filtered = useMemo(() => {
    return items.filter((c) => {
      if (activeFilter === 'active' && !c.active) return false;
      if (activeFilter === 'inactive' && c.active) return false;
      return rowMatchesSearch(search, [c.slug, c.nameEn, c.nameAr, c.iconKey, c.colorToken, c.id]);
    });
  }, [items, search, activeFilter]);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.perPage)) : 1;

  const nameEnSuggestions = useMemo(
    () => buildCategoryNameSuggestions(items.map((c) => c.nameEn), EVENT_CATEGORY_NAME_EN_SUGGESTIONS),
    [items],
  );
  const nameArSuggestions = useMemo(
    () => buildCategoryNameSuggestions(items.map((c) => c.nameAr), EVENT_CATEGORY_NAME_AR_SUGGESTIONS),
    [items],
  );
  const localizedCategoryItems = useMemo(
    () => items.map((c) => ({ nameEn: c.nameEn, nameAr: c.nameAr })),
    [items],
  );

  function syncSlugFromEnglishName(
    form: typeof addForm,
    nameEn: string,
    mode: 'add' | 'edit',
    excludeSlug?: string,
  ) {
    if (mode !== 'add') return;
    form.setValue('slug', autoCategorySlugFromEnglishName(nameEn, existingSlugs, excludeSlug), {
      shouldValidate: true,
      shouldDirty: true,
    });
  }

  function fillCounterpartName(
    form: typeof addForm,
    selectedName: string,
    from: 'en' | 'ar',
  ) {
    const counterpart = lookupCategoryNameCounterpart(selectedName, from, localizedCategoryItems);
    if (!counterpart) return;
    const targetField = from === 'en' ? 'nameAr' : 'nameEn';
    form.setValue(targetField, counterpart, { shouldValidate: true, shouldDirty: true });
  }

  function statusBadge(active: boolean) {
    return active ? (
      <span className="inline-flex rounded-full border border-mint/40 bg-mint/20 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-ink">
        {t('operations:categories.status.active')}
      </span>
    ) : (
      <span className="inline-flex rounded-full border border-amber/40 bg-amber/15 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-amber">
        {t('operations:categories.status.inactive')}
      </span>
    );
  }

  function rowActions(row: EventCategory): RowMenuAction[] {
    const localizedName = pickLocalizedField({ en: row.nameEn, ar: row.nameAr }, locale, row.slug);
    return [
      {
        key: 'edit',
        label: t('operations:categories.actions.edit'),
        onSelect: () => {
          setEditingId(row.id);
          editForm.reset({
            slug: row.slug,
            nameEn: row.nameEn,
            nameAr: row.nameAr,
            iconKey: row.iconKey ?? '',
            colorToken: row.colorToken ?? '',
            displayOrder: row.displayOrder,
          });
        },
      },
      {
        key: 'toggle',
        label: row.active ? t('operations:categories.actions.deactivate') : t('operations:categories.actions.activate'),
        loading: toggleState.isLoading && toggleState.originalArgs?.id === row.id,
        onSelect: async () => {
          try {
            await toggleActive({ id: row.id, active: !row.active }).unwrap();
            notifySuccess(
              row.active
                ? t('operations:categories.eventPanel.notifyDeactivated')
                : t('operations:categories.eventPanel.notifyActivated'),
            );
          } catch (err) {
            notifyError(getApiErrorMessage(err, t('operations:categories.eventPanel.notifyToggleFailed')));
          }
        },
      },
      {
        key: 'delete',
        label: t('operations:categories.actions.delete'),
        danger: true,
        loading: deleteState.isLoading && deleteState.originalArgs === row.id,
        onSelect: async () => {
          if (
            !window.confirm(
              t('operations:categories.eventPanel.deleteConfirm', { name: localizedName, slug: row.slug }),
            )
          ) {
            return;
          }
          try {
            await deleteCategory(row.id).unwrap();
            notifySuccess(t('operations:categories.eventPanel.notifyDeleted'));
          } catch (err) {
            notifyError(getApiErrorMessage(err, t('operations:categories.eventPanel.notifyDeleteFailed')));
          }
        },
      },
    ];
  }

  const formFields = (
    form: typeof addForm,
    iconKey: string | undefined,
    mode: 'add' | 'edit',
    excludeSlug?: string,
    excludeId?: string,
  ) => (
    <>
      <label className="block space-y-2">
        <span className="text-[12px] font-semibold text-ink-60">{t('operations:categories.fields.nameEn')}</span>
        <Controller
          control={form.control}
          name="nameEn"
          render={({ field }) => (
            <CategoryNameSuggestInput
              value={field.value ?? ''}
              onChange={(value) => {
                field.onChange(value);
                syncSlugFromEnglishName(form, value, mode, excludeSlug);
              }}
              onSuggestionSelect={(name) => {
                fillCounterpartName(form, name, 'en');
                syncSlugFromEnglishName(form, name, mode, excludeSlug);
              }}
              onBlur={field.onBlur}
              suggestions={nameEnSuggestions}
              dir="ltr"
              error={form.formState.errors.nameEn?.message}
            />
          )}
        />
      </label>
      <label className="block space-y-2">
        <span className="text-[12px] font-semibold text-ink-60">{t('operations:categories.fields.nameAr')}</span>
        <Controller
          control={form.control}
          name="nameAr"
          render={({ field }) => (
            <CategoryNameSuggestInput
              value={field.value ?? ''}
              onChange={field.onChange}
              onSuggestionSelect={(name) => fillCounterpartName(form, name, 'ar')}
              onBlur={field.onBlur}
              suggestions={nameArSuggestions}
              dir="rtl"
              error={form.formState.errors.nameAr?.message}
            />
          )}
        />
      </label>
      <label className="block space-y-2 md:col-span-2">
        <span className="text-[12px] font-semibold text-ink-60">{t('operations:categories.fields.iconKey')}</span>
        <div className="flex flex-wrap items-center gap-2">
          <PhosphorIconKeyPreview iconKey={iconKey ?? ''} />
          <input
            className="min-w-[180px] flex-1 rounded-xl border border-ink-10 px-3 py-2 font-mono text-[13px]"
            placeholder={t('operations:categories.fields.iconPlaceholder')}
            {...form.register('iconKey')}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setIconPickerFor(mode);
              setIconPickerOpen(true);
            }}
          >
            {t('operations:categories.actions.browseIcons')}
          </Button>
        </div>
      </label>
      <div className="block space-y-2">
        <span className="text-[12px] font-semibold text-ink-60">{t('operations:categories.fields.colorToken')}</span>
        <Controller
          control={form.control}
          name="colorToken"
          render={({ field }) => (
            <ColorTokenPicker value={field.value ?? ''} onChange={field.onChange} />
          )}
        />
      </div>
      <label className="block space-y-2">
        <span className="text-[12px] font-semibold text-ink-60">{t('operations:categories.fields.slug')}</span>
        <input className="w-full rounded-xl border border-ink-10 px-3 py-2 font-mono text-[13px]" {...form.register('slug')} />
        {form.formState.errors.slug ? (
          <p className="text-[12px] font-medium text-coral">{form.formState.errors.slug.message}</p>
        ) : null}
      </label>
      <CategoryDisplayOrderField form={form} items={items} excludeId={excludeId} />
    </>
  );

  return (
    <div className="space-y-6">
      <p className="max-w-[65ch] text-[14px] leading-relaxed text-ink-60">
        <Trans
          ns="operations"
          i18nKey="categories.eventPanel.description"
          components={{
            mono: <span className="font-mono" />,
          }}
        />
      </p>

      <div className="rounded-3xl border border-ink-10 bg-white shadow-card-sm">
        <div className="border-b border-ink-10 px-5 py-4 md:px-6">
          <ListFiltersBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder={t('operations:categories.filters.searchEvent')}
          >
            <select
              className={filterSelectClassName()}
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value as typeof activeFilter)}
            >
              <option value="all">{t('operations:categories.filters.allStatuses')}</option>
              <option value="active">{t('operations:categories.filters.activeOnly')}</option>
              <option value="inactive">{t('operations:categories.filters.inactiveOnly')}</option>
            </select>
            <Button
              type="button"
              variant="dark"
              size="sm"
              onClick={() => {
                setShowCreate((open) => {
                  const next = !open;
                  if (next) {
                    addForm.reset({
                      ...defaultAddValues,
                      displayOrder: defaultCategoryDisplayOrder(items),
                    });
                  }
                  return next;
                });
              }}
            >
              {showCreate ? t('operations:categories.actions.closeForm') : t('operations:categories.actions.newCategory')}
            </Button>
          </ListFiltersBar>
        </div>

        {showCreate ? (
          <div className="border-b border-ink-10 bg-surface-tint/50 px-5 py-5 md:px-6">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-wide text-ink-40">
              {t('operations:categories.eventPanel.createTitle')}
            </p>
            <form
              className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"
              onSubmit={addForm.handleSubmit(async (values) => {
                try {
                  const takenOrders = ordersFromCategories(items);
                  await upsert({
                    body: {
                      ...values,
                      displayOrder: resolveCategoryDisplayOrder(values.displayOrder, takenOrders),
                    },
                  }).unwrap();
                  notifySuccess(t('operations:categories.eventPanel.notifyCreated'));
                  addForm.reset(defaultAddValues);
                  setShowCreate(false);
                } catch (err) {
                  notifyError(getApiErrorMessage(err, t('operations:categories.eventPanel.notifyCreateFailed')));
                }
              })}
            >
              {formFields(addForm, addIconKey, 'add')}
              <div className="flex items-end xl:col-span-4">
                <Button type="submit" variant="dark" loading={upsertState.isLoading}>
                  {t('operations:categories.actions.create')}
                </Button>
              </div>
            </form>
          </div>
        ) : null}

        <div className="px-5 py-4 md:px-6">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-2xl bg-ink-5" />
              ))}
            </div>
          ) : null}

          {!isLoading && filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-ink-10 px-6 py-10 text-center">
              <p className="font-bold text-ink">{t('operations:categories.eventPanel.empty')}</p>
            </div>
          ) : null}

          {!isLoading && filtered.length > 0 ? (
            <div className="admin-table-scroll">
              <table className="w-full min-w-[980px] text-left text-[14px]">
                <thead className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
                  <tr>
                    <th className="px-4 py-3">{t('operations:categories.columns.order')}</th>
                    <th className="px-4 py-3">{t('operations:categories.columns.slug')}</th>
                    <th className="px-4 py-3">{t('operations:categories.columns.labels')}</th>
                    <th className="px-4 py-3">{t('operations:categories.columns.icon')}</th>
                    <th className="px-4 py-3">{t('operations:categories.columns.color')}</th>
                    <th className="px-4 py-3">{t('operations:categories.columns.status')}</th>
                    <th className="px-4 py-3 text-right">{t('operations:categories.columns.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) =>
                    editingId === row.id ? (
                      <tr key={row.id} className="border-t border-ink-10 bg-surface-tint">
                        <td colSpan={7} className="px-4 py-4">
                          <form
                            className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"
                            onSubmit={editForm.handleSubmit(async (values) => {
                              try {
                                const takenOrders = ordersFromCategories(items, row.id);
                                await upsert({
                                  id: row.id,
                                  body: {
                                    ...values,
                                    displayOrder: resolveCategoryDisplayOrder(values.displayOrder, takenOrders),
                                  },
                                }).unwrap();
                                notifySuccess(t('operations:categories.eventPanel.notifyUpdated'));
                                setEditingId(null);
                              } catch (err) {
                                notifyError(getApiErrorMessage(err, t('operations:categories.eventPanel.notifySaveFailed')));
                              }
                            })}
                          >
                            {formFields(editForm, editIconKey, 'edit', row.slug, row.id)}
                            <div className="flex gap-2 xl:col-span-4">
                              <Button type="submit" size="sm" variant="dark" loading={upsertState.isLoading}>
                                {t('operations:categories.actions.save')}
                              </Button>
                              <Button type="button" size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                                {t('operations:categories.actions.cancel')}
                              </Button>
                            </div>
                          </form>
                        </td>
                      </tr>
                    ) : (
                      <tr key={row.id} className="border-t border-ink-10 transition hover:bg-surface-tint">
                        <td className="px-4 py-3 font-mono text-[13px] text-ink-60">{row.displayOrder ?? t('common:none')}</td>
                        <td className="px-4 py-3 font-mono text-[13px] font-semibold text-ink">{row.slug}</td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-ink">
                            {pickLocalizedField({ en: row.nameEn, ar: row.nameAr }, locale)}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <PhosphorIconKeyPreview iconKey={row.iconKey ?? ''} />
                            <span className="font-mono text-[11px] text-ink-40">{row.iconKey || t('common:none')}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <ColorTokenBadge token={row.colorToken} compact />
                        </td>
                        <td className="px-4 py-3">{statusBadge(row.active)}</td>
                        <td className="px-4 py-3 text-right">
                          <RowActionsMenu
                            ariaLabel={t('operations:categories.eventPanel.actionsFor', {
                              name: pickLocalizedField({ en: row.nameEn, ar: row.nameAr }, locale),
                            })}
                            actions={rowActions(row)}
                          />
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          ) : null}

          <CategoryPaginationBar
            page={page}
            totalPages={totalPages}
            total={data?.total ?? 0}
            itemCount={filtered.length}
            loading={isFetching}
            onPrev={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => p + 1)}
          />
        </div>
      </div>

      <PhosphorIconPickerModal
        open={iconPickerOpen}
        onClose={() => setIconPickerOpen(false)}
        onSelect={(key) => {
          if (iconPickerFor === 'add') {
            addForm.setValue('iconKey', key, { shouldValidate: true, shouldDirty: true });
          } else {
            editForm.setValue('iconKey', key, { shouldValidate: true, shouldDirty: true });
          }
        }}
      />
    </div>
  );
}
