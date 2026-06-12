import { ListFiltersBar } from '@/components/admin/ListFiltersBar';
import { RowActionsMenu, type RowMenuAction } from '@/components/admin/RowActionsMenu';
import { PhosphorIconKeyPreview } from '@/components/category/PhosphorIconKeyPreview';
import { PhosphorIconPickerModal } from '@/components/category/PhosphorIconPickerModal';
import { Button } from '@/components/ui/Button';
import { filterSelectClassName } from '@/lib/adminFilters';
import { getApiErrorMessage } from '@/lib/apiError';
import { rowMatchesSearch } from '@/lib/listQuery';
import { notifyError, notifySuccess } from '@/lib/notify';
import { CategoryPaginationBar } from '@/pages/categories/CategoryPaginationBar';
import { suggestUniqueCategorySlug } from '@/schemas/api/adminMappers';
import { eventCategoryUpsertFormSchema, type EventCategoryUpsertForm } from '@/schemas/event.schema';
import type { EventCategory } from '@/schemas/event.schema';
import {
  useDeleteEventCategoryMutation,
  useGetCategoriesQuery,
  useToggleCategoryActiveMutation,
  useUpsertCategoryMutation,
} from '@/services/adminApi';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

const defaultAddValues = {
  slug: '',
  nameEn: '',
  nameAr: '',
  iconKey: '',
  colorToken: '',
} satisfies EventCategoryUpsertForm;

function statusBadge(active: boolean) {
  return active ? (
    <span className="inline-flex rounded-full border border-mint/40 bg-mint/20 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-ink">
      Active
    </span>
  ) : (
    <span className="inline-flex rounded-full border border-amber/40 bg-amber/15 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-amber">
      Inactive
    </span>
  );
}

export function EventCategoriesPanel() {
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
    resolver: zodResolver(eventCategoryUpsertFormSchema),
    defaultValues: defaultAddValues,
  });
  const editForm = useForm<EventCategoryUpsertForm>({
    resolver: zodResolver(eventCategoryUpsertFormSchema),
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

  function rowActions(row: EventCategory): RowMenuAction[] {
    return [
      {
        key: 'edit',
        label: 'Edit',
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
        label: row.active ? 'Deactivate' : 'Activate',
        loading: toggleState.isLoading && toggleState.originalArgs?.id === row.id,
        onSelect: async () => {
          try {
            await toggleActive({ id: row.id, active: !row.active }).unwrap();
            notifySuccess(row.active ? 'Category deactivated.' : 'Category activated.');
          } catch (err) {
            notifyError(getApiErrorMessage(err, 'Could not toggle category.'));
          }
        },
      },
      {
        key: 'delete',
        label: 'Delete',
        danger: true,
        loading: deleteState.isLoading && deleteState.originalArgs === row.id,
        onSelect: async () => {
          if (
            !window.confirm(
              `Delete "${row.nameEn}" (${row.slug})? Events still assigned to this category will block deletion.`,
            )
          ) {
            return;
          }
          try {
            await deleteCategory(row.id).unwrap();
            notifySuccess('Category deleted.');
          } catch (err) {
            notifyError(
              getApiErrorMessage(err, 'Could not delete category. Reassign events if the API reports it is in use.'),
            );
          }
        },
      },
    ];
  }

  const formFields = (form: typeof addForm, iconKey: string | undefined, mode: 'add' | 'edit') => (
    <>
      <label className="block space-y-2">
        <span className="text-[12px] font-semibold text-ink-60">Slug</span>
        <input className="w-full rounded-xl border border-ink-10 px-3 py-2 font-mono text-[13px]" {...form.register('slug')} />
        {mode === 'add' ? (
          <Button
            type="button"
            variant="ghost"
            className="h-8 px-2 text-[12px]"
            onClick={() =>
              form.setValue(
                'slug',
                suggestUniqueCategorySlug(form.getValues('nameEn') || 'category', existingSlugs),
                { shouldValidate: true },
              )
            }
          >
            Suggest from English name
          </Button>
        ) : null}
      </label>
      <label className="block space-y-2">
        <span className="text-[12px] font-semibold text-ink-60">Name (EN)</span>
        <input className="w-full rounded-xl border border-ink-10 px-3 py-2 text-[13px]" {...form.register('nameEn')} />
      </label>
      <label className="block space-y-2">
        <span className="text-[12px] font-semibold text-ink-60">Name (AR)</span>
        <input className="w-full rounded-xl border border-ink-10 px-3 py-2 text-[13px]" {...form.register('nameAr')} />
      </label>
      <label className="block space-y-2 md:col-span-2">
        <span className="text-[12px] font-semibold text-ink-60">Phosphor icon key</span>
        <div className="flex flex-wrap items-center gap-2">
          <PhosphorIconKeyPreview iconKey={iconKey ?? ''} />
          <input
            className="min-w-[180px] flex-1 rounded-xl border border-ink-10 px-3 py-2 font-mono text-[13px]"
            placeholder="e.g. MusicNotesIcon"
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
            Browse icons
          </Button>
        </div>
      </label>
      <label className="block space-y-2">
        <span className="text-[12px] font-semibold text-ink-60">Color token</span>
        <input className="w-full rounded-xl border border-ink-10 px-3 py-2 text-[13px]" placeholder="coral" {...form.register('colorToken')} />
      </label>
      <label className="block space-y-2">
        <span className="text-[12px] font-semibold text-ink-60">Display order</span>
        <input
          type="number"
          min={0}
          max={65535}
          className="w-full rounded-xl border border-ink-10 px-3 py-2 font-mono text-[13px]"
          {...form.register('displayOrder', {
            setValueAs: (v) => {
              if (v === '' || v === null || v === undefined) return undefined;
              const n = Number(v);
              return Number.isFinite(n) ? n : undefined;
            },
          })}
        />
      </label>
    </>
  );

  return (
    <div className="space-y-6">
      <p className="max-w-[65ch] text-[14px] leading-relaxed text-ink-60">
        Event discovery taxonomy via{' '}
        <span className="font-mono text-ink">/api/v1/admin/event-categories</span>. Includes Phosphor{' '}
        <span className="font-mono">icon_key</span> and theme <span className="font-mono">color_token</span> for the
        public site. Delete returns 422 when events still reference a category.
      </p>

      <div className="rounded-3xl border border-ink-10 bg-white shadow-card-sm">
        <div className="border-b border-ink-10 px-5 py-4 md:px-6">
          <ListFiltersBar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search slug, names, icon…">
            <select
              className={filterSelectClassName()}
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value as typeof activeFilter)}
            >
              <option value="all">All statuses</option>
              <option value="active">Active only</option>
              <option value="inactive">Inactive only</option>
            </select>
            <Button type="button" variant="dark" size="sm" onClick={() => setShowCreate((v) => !v)}>
              {showCreate ? 'Close form' : 'New category'}
            </Button>
          </ListFiltersBar>
        </div>

        {showCreate ? (
          <div className="border-b border-ink-10 bg-surface-tint/50 px-5 py-5 md:px-6">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-wide text-ink-40">Create event category</p>
            <form
              className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"
              onSubmit={addForm.handleSubmit(async (values) => {
                try {
                  await upsert({ body: values }).unwrap();
                  notifySuccess('Category created.');
                  addForm.reset(defaultAddValues);
                  setShowCreate(false);
                } catch (err) {
                  notifyError(getApiErrorMessage(err, 'Could not create category.'));
                }
              })}
            >
              {formFields(addForm, addIconKey, 'add')}
              <div className="flex items-end xl:col-span-4">
                <Button type="submit" variant="dark" loading={upsertState.isLoading}>
                  Create
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
              <p className="font-bold text-ink">No categories on this page</p>
            </div>
          ) : null}

          {!isLoading && filtered.length > 0 ? (
            <div className="admin-table-scroll">
              <table className="w-full min-w-[980px] text-left text-[14px]">
                <thead className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
                  <tr>
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3">Slug</th>
                    <th className="px-4 py-3">Labels</th>
                    <th className="px-4 py-3">Icon</th>
                    <th className="px-4 py-3">Color</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
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
                                await upsert({ id: row.id, body: values }).unwrap();
                                notifySuccess('Category updated.');
                                setEditingId(null);
                              } catch (err) {
                                notifyError(getApiErrorMessage(err, 'Could not save category.'));
                              }
                            })}
                          >
                            {formFields(editForm, editIconKey, 'edit')}
                            <div className="flex gap-2 xl:col-span-4">
                              <Button type="submit" size="sm" variant="dark" loading={upsertState.isLoading}>
                                Save
                              </Button>
                              <Button type="button" size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                                Cancel
                              </Button>
                            </div>
                          </form>
                        </td>
                      </tr>
                    ) : (
                      <tr key={row.id} className="border-t border-ink-10 transition hover:bg-surface-tint">
                        <td className="px-4 py-3 font-mono text-[13px] text-ink-60">{row.displayOrder ?? '—'}</td>
                        <td className="px-4 py-3 font-mono text-[13px] font-semibold text-ink">{row.slug}</td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-ink">{row.nameEn}</p>
                          <p className="text-[13px] text-ink-60" dir="rtl">
                            {row.nameAr}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <PhosphorIconKeyPreview iconKey={row.iconKey ?? ''} />
                            <span className="font-mono text-[11px] text-ink-40">{row.iconKey || '—'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-ink-5 px-2 py-1 text-[12px] font-bold text-ink-60">
                            {row.colorToken || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3">{statusBadge(row.active)}</td>
                        <td className="px-4 py-3 text-right">
                          <RowActionsMenu ariaLabel={`Actions for ${row.nameEn}`} actions={rowActions(row)} />
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
