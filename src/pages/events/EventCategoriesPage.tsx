import { ListFiltersBar } from '@/components/admin/ListFiltersBar';
import { filterSelectClassName } from '@/lib/adminFilters';
import { AdminSection } from '@/components/layout/AdminSection';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PhosphorIconKeyPreview } from '@/components/category/PhosphorIconKeyPreview';
import { PhosphorIconPickerModal } from '@/components/category/PhosphorIconPickerModal';
import { getApiErrorMessage } from '@/lib/apiError';
import { rowMatchesSearch } from '@/lib/listQuery';
import { notifyError, notifySuccess } from '@/lib/notify';
import { suggestUniqueCategorySlug } from '@/schemas/api/adminMappers';
import { eventCategoryUpsertFormSchema, type EventCategoryUpsertForm } from '@/schemas/event.schema';
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

export function EventCategoriesPage() {
  const { data, isLoading } = useGetCategoriesQuery();
  const [upsert, upsertState] = useUpsertCategoryMutation();
  const [toggleActive, toggleState] = useToggleCategoryActiveMutation();
  const [deleteCategory, deleteState] = useDeleteEventCategoryMutation();
  const [editingId, setEditingId] = useState<string | null>(null);

  const addForm = useForm<EventCategoryUpsertForm>({
    resolver: zodResolver(eventCategoryUpsertFormSchema),
    defaultValues: defaultAddValues,
  });

  const editForm = useForm<EventCategoryUpsertForm>({
    resolver: zodResolver(eventCategoryUpsertFormSchema),
    defaultValues: defaultAddValues,
  });

  const addSlug = addForm.watch('slug');
  const editSlug = editForm.watch('slug');

  const slugTakenForAdd = useMemo(() => {
    const s = addSlug?.trim().toLowerCase();
    if (!s) return false;
    return (data ?? []).some((c) => c.slug.toLowerCase() === s);
  }, [data, addSlug]);

  const slugTakenForEdit = useMemo(() => {
    const s = editSlug?.trim().toLowerCase();
    if (!s || !editingId) return false;
    return (data ?? []).some((c) => c.id !== editingId && c.slug.toLowerCase() === s);
  }, [data, editSlug, editingId]);

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [iconPickerFor, setIconPickerFor] = useState<'add' | 'edit'>('add');

  const addIconKey = addForm.watch('iconKey');
  const editIconKey = editForm.watch('iconKey');

  const filteredCategories = useMemo(() => {
    const rows = data ?? [];
    return rows.filter((c) => {
      if (activeFilter === 'active' && !c.active) return false;
      if (activeFilter === 'inactive' && c.active) return false;
      return rowMatchesSearch(search, [
        c.slug,
        c.nameEn,
        c.nameAr,
        c.iconKey,
        c.colorToken,
        c.id,
      ]);
    });
  }, [data, search, activeFilter]);

  const existingSlugs = useMemo(() => (data ?? []).map((c) => c.slug), [data]);

  return (
    <div className="space-y-12">
      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-ink-40">Events</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">Categories</h1>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-60">
          Admin CRUD for <span className="font-mono text-ink">/api/v1/admin/event-categories</span>. Slug and English
          name must stay unique server-side. Store <span className="font-mono">icon_key</span> as a Phosphor export name
          (same strings as <span className="font-mono">@phosphor-icons/react</span> on the main site).
        </p>
      </div>

      <AdminSection
        eyebrow="Taxonomy"
        title="Category catalog"
        description="List is paginated on the API; this console requests up to 500 rows per load. Delete returns 422 if events still reference the category."
      >
        <Card className="rounded-3xl border-ink-10 shadow-card-sm">
          <CardContent className="pt-6">
            <ListFiltersBar
              searchValue={search}
              onSearchChange={setSearch}
              searchPlaceholder="Search slug, names, icon, color, id…"
              className="mb-4"
            >
              <select
                className={filterSelectClassName()}
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value as typeof activeFilter)}
              >
                <option value="all">All</option>
                <option value="active">Active only</option>
                <option value="inactive">Inactive only</option>
              </select>
            </ListFiltersBar>
            {isLoading ? <p className="text-sm text-ink-60">Loading…</p> : null}
            {!isLoading && filteredCategories.length === 0 ? (
              <p className="mb-3 text-sm font-semibold text-ink-60">No categories match your search and filters.</p>
            ) : null}
            <div className="admin-table-scroll">
              <table className="w-full min-w-[960px] text-left text-[14px]">
                <thead className="text-[11px] font-extrabold uppercase tracking-wide text-ink-40">
                  <tr>
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3">Slug</th>
                    <th className="px-4 py-3">Name (EN)</th>
                    <th className="px-4 py-3">Name (AR)</th>
                    <th className="px-4 py-3">Icon</th>
                    <th className="px-4 py-3">Color</th>
                    <th className="px-4 py-3">Active</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.map((c) =>
                    editingId === c.id ? (
                      <tr key={c.id} className="border-t border-ink-10 bg-surface-tint">
                        <td colSpan={8} className="px-4 py-4">
                          <form
                            className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"
                            onSubmit={editForm.handleSubmit(async (values) => {
                              try {
                                await upsert({ id: c.id, body: values }).unwrap();
                                notifySuccess('Category updated.');
                                setEditingId(null);
                              } catch (err) {
                                notifyError(getApiErrorMessage(err, 'Could not save category.'));
                              }
                            })}
                          >
                            <label className="block">
                              <span className="text-[12px] font-bold text-ink-60">Display order</span>
                              <input
                                type="number"
                                min={0}
                                max={65535}
                                className="mt-1.5 w-full rounded-xl border border-ink-10 px-3 py-2 text-[13px]"
                                {...editForm.register('displayOrder', {
                                  setValueAs: (v) => {
                                    if (v === '' || v === null || v === undefined) return undefined;
                                    const n = Number(v);
                                    return Number.isFinite(n) ? n : undefined;
                                  },
                                })}
                              />
                            </label>
                            <label className="block md:col-span-1">
                              <span className="text-[12px] font-bold text-ink-60">Slug</span>
                              <input
                                className="mt-1.5 w-full rounded-xl border border-ink-10 px-3 py-2 font-mono text-[13px]"
                                {...editForm.register('slug')}
                              />
                              {slugTakenForEdit ? (
                                <p className="mt-1 text-[12px] font-bold text-coral">Slug already used by another row.</p>
                              ) : null}
                            </label>
                            <label className="block">
                              <span className="text-[12px] font-bold text-ink-60">Name (EN)</span>
                              <input
                                className="mt-1.5 w-full rounded-xl border border-ink-10 px-3 py-2 text-[13px]"
                                {...editForm.register('nameEn')}
                              />
                            </label>
                            <label className="block">
                              <span className="text-[12px] font-bold text-ink-60">Name (AR)</span>
                              <input
                                className="mt-1.5 w-full rounded-xl border border-ink-10 px-3 py-2 text-[13px]"
                                {...editForm.register('nameAr')}
                              />
                            </label>
                            <label className="block xl:col-span-2">
                              <span className="text-[12px] font-bold text-ink-60">Icon key (Phosphor)</span>
                              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                <PhosphorIconKeyPreview iconKey={editIconKey ?? ''} />
                                <input
                                  className="min-w-[180px] flex-1 rounded-xl border border-ink-10 px-3 py-2 font-mono text-[13px]"
                                  placeholder="e.g. MusicNotesIcon"
                                  {...editForm.register('iconKey')}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setIconPickerFor('edit');
                                    setIconPickerOpen(true);
                                  }}
                                >
                                  Browse icons
                                </Button>
                              </div>
                            </label>
                            <label className="block">
                              <span className="text-[12px] font-bold text-ink-60">Color token</span>
                              <input
                                className="mt-1.5 w-full rounded-xl border border-ink-10 px-3 py-2 text-[13px]"
                                placeholder="e.g. coral"
                                {...editForm.register('colorToken')}
                              />
                            </label>
                            <div className="flex flex-wrap items-end gap-2 xl:col-span-2">
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
                      <tr key={c.id} className="border-t border-ink-10 hover:bg-surface-tint">
                        <td className="px-4 py-3 font-mono text-[13px] text-ink-60">{c.displayOrder ?? '—'}</td>
                        <td className="px-4 py-3 font-mono text-[13px] font-semibold text-ink">{c.slug}</td>
                        <td className="px-4 py-3 font-bold text-ink">{c.nameEn}</td>
                        <td className="px-4 py-3 text-ink-80" dir="rtl">
                          {c.nameAr}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <PhosphorIconKeyPreview iconKey={c.iconKey ?? ''} />
                            <span className="font-mono text-[12px] text-ink-60">{c.iconKey || '—'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-ink-5 px-2 py-1 text-[12px] font-bold text-ink-60">
                            {c.colorToken || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={
                              c.active ? 'font-extrabold text-mint' : 'font-bold text-amber'
                            }
                          >
                            {c.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="space-x-2 px-4 py-3 text-right">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingId(c.id);
                              editForm.reset({
                                slug: c.slug,
                                nameEn: c.nameEn,
                                nameAr: c.nameAr,
                                iconKey: c.iconKey ?? '',
                                colorToken: c.colorToken ?? '',
                                displayOrder: c.displayOrder,
                              });
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={c.active ? 'secondary' : 'primary'}
                            disabled={toggleState.isLoading}
                            loading={toggleState.isLoading && toggleState.originalArgs?.id === c.id}
                            onClick={async () => {
                              try {
                                await toggleActive({ id: c.id, active: !c.active }).unwrap();
                                notifySuccess(c.active ? 'Category deactivated.' : 'Category activated.');
                              } catch (err) {
                                notifyError(getApiErrorMessage(err, 'Could not toggle category.'));
                              }
                            }}
                          >
                            {c.active ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="danger"
                            disabled={deleteState.isLoading}
                            loading={deleteState.isLoading && deleteState.originalArgs === c.id}
                            onClick={async () => {
                              if (
                                !window.confirm(
                                  `Delete category “${c.nameEn}” (${c.slug})? This calls DELETE /api/v1/admin/event-categories/${c.id}.`
                                )
                              ) {
                                return;
                              }
                              try {
                                await deleteCategory(c.id).unwrap();
                                notifySuccess('Category deleted.');
                              } catch (err) {
                                notifyError(
                                  getApiErrorMessage(
                                    err,
                                    'Could not delete category. Reassign events if the API reports the category is in use.'
                                  )
                                );
                              }
                            }}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </AdminSection>

      <AdminSection
        divider
        eyebrow="Creation"
        title="Add a new category"
        description="POST mirrors validation rules: unique slug and unique English name on the server. Pick a Phosphor icon name from the browser so it matches the main website bundle."
      >
        <Card className="rounded-3xl border-ink-10 shadow-card-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Category builder</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-3 md:grid-cols-2 xl:grid-cols-3"
              onSubmit={addForm.handleSubmit(async (values) => {
                try {
                  await upsert({ body: values }).unwrap();
                  notifySuccess('Category created.');
                  addForm.reset(defaultAddValues);
                } catch (err) {
                  notifyError(getApiErrorMessage(err, 'Could not create category.'));
                }
              })}
            >
              <label className="block md:col-span-1">
                <span className="text-[12px] font-bold text-ink-60">Slug</span>
                <input
                  className="mt-1.5 w-full rounded-xl border border-ink-10 px-3 py-2 font-mono text-[14px] outline-none focus:border-coral focus:ring-2 focus:ring-coral/30"
                  placeholder="e.g. live-music"
                  {...addForm.register('slug')}
                />
                {slugTakenForAdd ? (
                  <p className="mt-1 text-[12px] font-bold text-coral">This slug is already in the loaded catalog.</p>
                ) : null}
                <Button
                  type="button"
                  variant="ghost"
                  className="mt-2 h-8 px-2 text-[12px]"
                  onClick={() => {
                    const nameEn = addForm.getValues('nameEn');
                    addForm.setValue(
                      'slug',
                      suggestUniqueCategorySlug(nameEn || 'category', existingSlugs),
                      { shouldValidate: true }
                    );
                  }}
                >
                  Suggest slug from English name
                </Button>
              </label>
              <label className="block md:col-span-1">
                <span className="text-[12px] font-bold text-ink-60">Name (EN)</span>
                <input
                  className="mt-1.5 w-full rounded-xl border border-ink-10 px-3 py-2 text-[14px] outline-none focus:border-coral focus:ring-2 focus:ring-coral/30"
                  {...addForm.register('nameEn')}
                />
              </label>
              <label className="block md:col-span-1">
                <span className="text-[12px] font-bold text-ink-60">Name (AR)</span>
                <input
                  className="mt-1.5 w-full rounded-xl border border-ink-10 px-3 py-2 text-[14px] outline-none focus:border-coral focus:ring-2 focus:ring-coral/30"
                  {...addForm.register('nameAr')}
                />
              </label>
              <label className="block md:col-span-2 xl:col-span-3">
                <span className="text-[12px] font-bold text-ink-60">Icon key (optional, Phosphor)</span>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <PhosphorIconKeyPreview iconKey={addIconKey ?? ''} />
                  <input
                    className="min-w-[200px] flex-1 rounded-xl border border-ink-10 px-3 py-2 font-mono text-[14px] outline-none focus:border-coral focus:ring-2 focus:ring-coral/30"
                    placeholder="e.g. MusicNotesIcon"
                    {...addForm.register('iconKey')}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIconPickerFor('add');
                      setIconPickerOpen(true);
                    }}
                  >
                    Browse icons
                  </Button>
                </div>
              </label>
              <label className="block md:col-span-1">
                <span className="text-[12px] font-bold text-ink-60">Color token (optional)</span>
                <input
                  className="mt-1.5 w-full rounded-xl border border-ink-10 px-3 py-2 text-[14px] outline-none focus:border-coral focus:ring-2 focus:ring-coral/30"
                  {...addForm.register('colorToken')}
                />
              </label>
              <label className="block md:col-span-1">
                <span className="text-[12px] font-bold text-ink-60">Display order (optional)</span>
                <input
                  type="number"
                  min={0}
                  max={65535}
                  className="mt-1.5 w-full rounded-xl border border-ink-10 px-3 py-2 text-[14px] outline-none focus:border-coral focus:ring-2 focus:ring-coral/30"
                  {...addForm.register('displayOrder', {
                    setValueAs: (v) => {
                      if (v === '' || v === null || v === undefined) return undefined;
                      const n = Number(v);
                      return Number.isFinite(n) ? n : undefined;
                    },
                  })}
                />
              </label>
              {addForm.formState.errors.slug ? (
                <p className="text-[12px] font-bold text-coral md:col-span-3">{addForm.formState.errors.slug.message}</p>
              ) : null}
              {addForm.formState.errors.nameEn ? (
                <p className="text-[12px] font-bold text-coral md:col-span-3">
                  {addForm.formState.errors.nameEn.message}
                </p>
              ) : null}
              {addForm.formState.errors.nameAr ? (
                <p className="text-[12px] font-bold text-coral md:col-span-3">
                  {addForm.formState.errors.nameAr.message}
                </p>
              ) : null}
              <div className="md:col-span-3">
                <Button type="submit" variant="dark" loading={upsertState.isLoading}>
                  Create category
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </AdminSection>
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
