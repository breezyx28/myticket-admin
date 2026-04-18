import { ListFiltersBar } from '@/components/admin/ListFiltersBar';
import { filterSelectClassName } from '@/lib/adminFilters';
import { AdminSection } from '@/components/layout/AdminSection';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { rowMatchesSearch } from '@/lib/listQuery';
import { notifyError, notifySuccess } from '@/lib/notify';
import { upsertCategorySchema, type UpsertCategoryInput } from '@/schemas/event.schema';
import {
  useGetCategoriesQuery,
  useToggleCategoryActiveMutation,
  useUpsertCategoryMutation,
} from '@/services/adminApi';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

export function EventCategoriesPage() {
  const { data, isLoading } = useGetCategoriesQuery();
  const [upsert, upsertState] = useUpsertCategoryMutation();
  const [toggleActive, toggleState] = useToggleCategoryActiveMutation();
  const [editingId, setEditingId] = useState<string | null>(null);

  const addForm = useForm<UpsertCategoryInput>({
    resolver: zodResolver(upsertCategorySchema),
    defaultValues: { name: '', iconKey: 'Music2', colorToken: 'coral' },
  });

  const editForm = useForm<UpsertCategoryInput>({
    resolver: zodResolver(upsertCategorySchema),
    defaultValues: { name: '', iconKey: 'Music2', colorToken: 'coral' },
  });

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const filteredCategories = useMemo(() => {
    const rows = data ?? [];
    return rows.filter((c) => {
      if (activeFilter === 'active' && !c.active) return false;
      if (activeFilter === 'inactive' && c.active) return false;
      return rowMatchesSearch(search, [c.name, c.iconKey, c.colorToken, c.id]);
    });
  }, [data, search, activeFilter]);

  return (
    <div className="space-y-12">
      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-ink-40">Events</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">Categories</h1>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-60">
          The catalog table and creation form are intentionally separated so operators can scan taxonomy health without
          bumping into draft inputs.
        </p>
      </div>

      <AdminSection
        eyebrow="Taxonomy"
        title="Category catalog"
        description="Edit icon keys and color tokens, then toggle activation without losing historical assignments."
      >
        <Card className="rounded-3xl border-ink-10 shadow-card-sm">
          <CardContent className="pt-6">
            <ListFiltersBar
              searchValue={search}
              onSearchChange={setSearch}
              searchPlaceholder="Search name, icon key, color…"
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
              <table className="w-full min-w-[800px] text-left text-[14px]">
                <thead className="text-[11px] font-extrabold uppercase tracking-wide text-ink-40">
                  <tr>
                    <th className="px-4 py-3">Name</th>
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
                        <td colSpan={5} className="px-4 py-3">
                          <form
                            className="flex flex-wrap items-end gap-2"
                            onSubmit={editForm.handleSubmit(async (values) => {
                              try {
                                await upsert({ id: c.id, body: values }).unwrap();
                                notifySuccess('Category updated.');
                                setEditingId(null);
                              } catch {
                                notifyError('Could not save category.');
                              }
                            })}
                          >
                            <input
                              className="min-w-[160px] flex-1 rounded-xl border border-ink-10 px-3 py-2 text-[13px]"
                              {...editForm.register('name')}
                            />
                            <input
                              className="w-28 rounded-xl border border-ink-10 px-3 py-2 text-[13px]"
                              {...editForm.register('iconKey')}
                            />
                            <input
                              className="w-28 rounded-xl border border-ink-10 px-3 py-2 text-[13px]"
                              {...editForm.register('colorToken')}
                            />
                            <Button type="submit" size="sm" variant="dark" loading={upsertState.isLoading}>
                              Save
                            </Button>
                            <Button type="button" size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                              Cancel
                            </Button>
                          </form>
                        </td>
                      </tr>
                    ) : (
                      <tr key={c.id} className="border-t border-ink-10 hover:bg-surface-tint">
                        <td className="px-4 py-3 font-bold text-ink">{c.name}</td>
                        <td className="px-4 py-3 font-mono text-[13px] text-ink-60">{c.iconKey}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-ink-5 px-2 py-1 text-[12px] font-bold text-ink-60">
                            {c.colorToken}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={
                              c.active
                                ? 'font-extrabold text-mint'
                                : 'font-bold text-amber'
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
                                name: c.name,
                                iconKey: c.iconKey,
                                colorToken: c.colorToken,
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
                              } catch {
                                notifyError('Could not toggle category.');
                              }
                            }}
                          >
                            {c.active ? 'Deactivate' : 'Activate'}
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
        description="Mock-only insert — validates naming rules before appending to the in-memory store."
      >
        <Card className="rounded-3xl border-ink-10 shadow-card-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Category builder</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-3 md:grid-cols-3"
              onSubmit={addForm.handleSubmit(async (values) => {
                try {
                  await upsert({ body: values }).unwrap();
                  notifySuccess('Category created (mock).');
                  addForm.reset({ name: '', iconKey: 'Music2', colorToken: 'coral' });
                } catch {
                  notifyError('Could not create category.');
                }
              })}
            >
              <label className="block md:col-span-1">
                <span className="text-[12px] font-bold text-ink-60">Name</span>
                <input
                  className="mt-1.5 w-full rounded-xl border border-ink-10 px-3 py-2 text-[14px] outline-none focus:border-coral focus:ring-2 focus:ring-coral/30"
                  {...addForm.register('name')}
                />
              </label>
              <label className="block md:col-span-1">
                <span className="text-[12px] font-bold text-ink-60">Icon key</span>
                <input
                  className="mt-1.5 w-full rounded-xl border border-ink-10 px-3 py-2 text-[14px] outline-none focus:border-coral focus:ring-2 focus:ring-coral/30"
                  {...addForm.register('iconKey')}
                />
              </label>
              <label className="block md:col-span-1">
                <span className="text-[12px] font-bold text-ink-60">Color token</span>
                <input
                  className="mt-1.5 w-full rounded-xl border border-ink-10 px-3 py-2 text-[14px] outline-none focus:border-coral focus:ring-2 focus:ring-coral/30"
                  {...addForm.register('colorToken')}
                />
              </label>
              {addForm.formState.errors.name ? (
                <p className="text-[12px] font-bold text-coral md:col-span-3">{addForm.formState.errors.name.message}</p>
              ) : null}
              <div className="md:col-span-3">
                <Button type="submit" variant="dark" loading={upsertState.isLoading}>
                  Save (mock)
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </AdminSection>
    </div>
  );
}
