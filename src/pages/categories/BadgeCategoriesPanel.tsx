import { ListFiltersBar } from '@/components/admin/ListFiltersBar';
import { RowActionsMenu, type RowMenuAction } from '@/components/admin/RowActionsMenu';
import { Button } from '@/components/ui/Button';
import { filterSelectClassName } from '@/lib/adminFilters';
import { getApiErrorMessage } from '@/lib/apiError';
import { rowMatchesSearch } from '@/lib/listQuery';
import { notifyError, notifySuccess } from '@/lib/notify';
import { CategoryPaginationBar } from '@/pages/categories/CategoryPaginationBar';
import { suggestUniqueCategorySlug } from '@/schemas/api/adminMappers';
import {
  badgeCategoryUpsertFormSchema,
  type BadgeCategory,
  type BadgeCategoryUpsertForm,
} from '@/schemas/categoryTaxonomy.schema';
import {
  useDeleteTalentCategoryMutation,
  useDeleteVendorServiceCategoryMutation,
  useGetTalentCategoriesQuery,
  useGetVendorServiceCategoriesQuery,
  useToggleTalentCategoryActiveMutation,
  useToggleVendorServiceCategoryActiveMutation,
  useUpsertTalentCategoryMutation,
  useUpsertVendorServiceCategoryMutation,
} from '@/services/adminApi';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

const defaultValues = {
  slug: '',
  nameEn: '',
  nameAr: '',
} satisfies BadgeCategoryUpsertForm;

type BadgeCategoriesPanelProps = {
  kind: 'talent' | 'vendor';
};

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

export function BadgeCategoriesPanel({ kind }: BadgeCategoriesPanelProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const listParams = useMemo(() => ({ page, perPage: 50 }), [page]);

  const talentQ = useGetTalentCategoriesQuery(listParams, { skip: kind !== 'talent' });
  const vendorQ = useGetVendorServiceCategoriesQuery(listParams, { skip: kind !== 'vendor' });
  const query = kind === 'talent' ? talentQ : vendorQ;

  const [upsertTalent, upsertTalentState] = useUpsertTalentCategoryMutation();
  const [upsertVendor, upsertVendorState] = useUpsertVendorServiceCategoryMutation();
  const [toggleTalent, toggleTalentState] = useToggleTalentCategoryActiveMutation();
  const [toggleVendor, toggleVendorState] = useToggleVendorServiceCategoryActiveMutation();
  const [deleteTalent, deleteTalentState] = useDeleteTalentCategoryMutation();
  const [deleteVendor, deleteVendorState] = useDeleteVendorServiceCategoryMutation();

  const upsert = kind === 'talent' ? upsertTalent : upsertVendor;
  const upsertState = kind === 'talent' ? upsertTalentState : upsertVendorState;
  const toggleActive = kind === 'talent' ? toggleTalent : toggleVendor;
  const toggleState = kind === 'talent' ? toggleTalentState : toggleVendorState;
  const deleteCategory = kind === 'talent' ? deleteTalent : deleteVendor;
  const deleteState = kind === 'talent' ? deleteTalentState : deleteVendorState;

  const addForm = useForm<BadgeCategoryUpsertForm>({
    resolver: zodResolver(badgeCategoryUpsertFormSchema),
    defaultValues,
  });
  const editForm = useForm<BadgeCategoryUpsertForm>({
    resolver: zodResolver(badgeCategoryUpsertFormSchema),
    defaultValues,
  });

  const data = query.data;
  const items = data?.items ?? [];
  const existingSlugs = useMemo(() => items.map((c) => c.slug), [items]);

  const filtered = useMemo(() => {
    return items.filter((c) => {
      if (activeFilter === 'active' && !c.active) return false;
      if (activeFilter === 'inactive' && c.active) return false;
      return rowMatchesSearch(search, [c.slug, c.nameEn, c.nameAr, c.id, c.createdByUserId ?? '']);
    });
  }, [items, search, activeFilter]);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.perPage)) : 1;

  const apiBase =
    kind === 'talent' ? '/api/v1/admin/talent-categories' : '/api/v1/admin/vendor-service-categories';
  const directoryPath = kind === 'talent' ? '/approvals/talent' : '/approvals/vendors';
  const filterHint =
    kind === 'talent'
      ? 'GET /profiles/talents?category_slug=…'
      : 'GET /profiles/vendors?category_slug=…';

  function rowActions(row: BadgeCategory): RowMenuAction[] {
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
            notifyError(getApiErrorMessage(err, 'Could not update category status.'));
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
              `Delete "${row.nameEn}" (${row.slug})? Profiles or applications still using it will block deletion.`,
            )
          ) {
            return;
          }
          try {
            await deleteCategory(row.id).unwrap();
            notifySuccess('Category deleted.');
          } catch (err) {
            notifyError(
              getApiErrorMessage(
                err,
                'Could not delete category. Reassign profiles or applications first.',
              ),
            );
          }
        },
      },
    ];
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <p className="max-w-[65ch] text-[14px] leading-relaxed text-ink-60">
          Curated badge taxonomy via <span className="font-mono text-ink">{apiBase}</span>. Rows marked{' '}
          <span className="font-semibold text-ink">Custom</span> were created by users on the main app.
        </p>
        <Link
          to={directoryPath}
          className="shrink-0 rounded-2xl border border-ink-10 bg-white px-4 py-3 text-[13px] font-bold text-coral shadow-card-sm transition hover:border-coral/30"
        >
          Open {kind === 'talent' ? 'talent' : 'vendor'} directory
        </Link>
      </div>

      <div className="rounded-3xl border border-ink-10 bg-white shadow-card-sm">
        <div className="border-b border-ink-10 px-5 py-4 md:px-6">
          <ListFiltersBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search slug, names, id…"
          >
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
            <p className="mb-4 text-[11px] font-bold uppercase tracking-wide text-ink-40">Create category</p>
            <form
              className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"
              onSubmit={addForm.handleSubmit(async (values) => {
                try {
                  await upsert({ body: values }).unwrap();
                  notifySuccess('Category created.');
                  addForm.reset(defaultValues);
                  setShowCreate(false);
                } catch (err) {
                  notifyError(getApiErrorMessage(err, 'Could not create category.'));
                }
              })}
            >
              <label className="block space-y-2">
                <span className="text-[12px] font-semibold text-ink-60">Slug</span>
                <input
                  className="w-full rounded-xl border border-ink-10 px-3 py-2 font-mono text-[13px]"
                  {...addForm.register('slug')}
                />
                <Button
                  type="button"
                  variant="ghost"
                  className="h-8 px-2 text-[12px]"
                  onClick={() =>
                    addForm.setValue(
                      'slug',
                      suggestUniqueCategorySlug(addForm.getValues('nameEn') || 'category', existingSlugs),
                      { shouldValidate: true },
                    )
                  }
                >
                  Suggest from English name
                </Button>
              </label>
              <label className="block space-y-2">
                <span className="text-[12px] font-semibold text-ink-60">Name (EN)</span>
                <input className="w-full rounded-xl border border-ink-10 px-3 py-2 text-[13px]" {...addForm.register('nameEn')} />
              </label>
              <label className="block space-y-2">
                <span className="text-[12px] font-semibold text-ink-60">Name (AR)</span>
                <input className="w-full rounded-xl border border-ink-10 px-3 py-2 text-[13px]" {...addForm.register('nameAr')} />
              </label>
              <label className="block space-y-2">
                <span className="text-[12px] font-semibold text-ink-60">Display order</span>
                <input
                  type="number"
                  min={0}
                  max={65535}
                  className="w-full rounded-xl border border-ink-10 px-3 py-2 font-mono text-[13px]"
                  {...addForm.register('displayOrder', {
                    setValueAs: (v) => {
                      if (v === '' || v === null || v === undefined) return undefined;
                      const n = Number(v);
                      return Number.isFinite(n) ? n : undefined;
                    },
                  })}
                />
              </label>
              <div className="flex items-end md:col-span-2 xl:col-span-4">
                <Button type="submit" variant="dark" loading={upsertState.isLoading}>
                  Create
                </Button>
              </div>
            </form>
          </div>
        ) : null}

        <div className="px-5 py-4 md:px-6">
          {query.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-2xl bg-ink-5" />
              ))}
            </div>
          ) : null}

          {!query.isLoading && filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-ink-10 px-6 py-10 text-center">
              <p className="font-bold text-ink">No categories on this page</p>
              <p className="mt-2 text-[13px] text-ink-60">Adjust filters or create a new badge.</p>
            </div>
          ) : null}

          {!query.isLoading && filtered.length > 0 ? (
            <div className="admin-table-scroll">
              <table className="w-full min-w-[920px] text-left text-[14px]">
                <thead className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
                  <tr>
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3">Slug</th>
                    <th className="px-4 py-3">Labels</th>
                    <th className="px-4 py-3">Origin</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) =>
                    editingId === row.id ? (
                      <tr key={row.id} className="border-t border-ink-10 bg-surface-tint">
                        <td colSpan={6} className="px-4 py-4">
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
                            <label className="block space-y-2">
                              <span className="text-[12px] font-semibold text-ink-60">Slug</span>
                              <input className="w-full rounded-xl border border-ink-10 px-3 py-2 font-mono text-[13px]" {...editForm.register('slug')} />
                            </label>
                            <label className="block space-y-2">
                              <span className="text-[12px] font-semibold text-ink-60">Name (EN)</span>
                              <input className="w-full rounded-xl border border-ink-10 px-3 py-2 text-[13px]" {...editForm.register('nameEn')} />
                            </label>
                            <label className="block space-y-2">
                              <span className="text-[12px] font-semibold text-ink-60">Name (AR)</span>
                              <input className="w-full rounded-xl border border-ink-10 px-3 py-2 text-[13px]" {...editForm.register('nameAr')} />
                            </label>
                            <label className="block space-y-2">
                              <span className="text-[12px] font-semibold text-ink-60">Display order</span>
                              <input
                                type="number"
                                min={0}
                                max={65535}
                                className="w-full rounded-xl border border-ink-10 px-3 py-2 font-mono text-[13px]"
                                {...editForm.register('displayOrder', {
                                  setValueAs: (v) => {
                                    if (v === '' || v === null || v === undefined) return undefined;
                                    const n = Number(v);
                                    return Number.isFinite(n) ? n : undefined;
                                  },
                                })}
                              />
                            </label>
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
                          {row.isCustom ? (
                            <span className="inline-flex rounded-full border border-coral/30 bg-coral/10 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-coral">
                              Custom
                            </span>
                          ) : (
                            <span className="text-[12px] font-semibold text-ink-60">Curated</span>
                          )}
                          {row.createdByUserId ? (
                            <p className="mt-1 font-mono text-[11px] text-ink-40">user #{row.createdByUserId}</p>
                          ) : null}
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
            loading={query.isFetching}
            onPrev={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => p + 1)}
          />

          <p className="mt-4 text-[12px] text-ink-40">
            Filter directory: <span className="font-mono text-ink-60">{filterHint}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
