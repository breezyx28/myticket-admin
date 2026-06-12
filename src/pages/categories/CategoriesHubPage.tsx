import { BadgeCategoriesPanel } from '@/pages/categories/BadgeCategoriesPanel';
import { EventCategoriesPanel } from '@/pages/categories/EventCategoriesPanel';
import type { CategoryTaxonomyTab } from '@/schemas/categoryTaxonomy.schema';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';

const TABS: { id: CategoryTaxonomyTab; label: string; hint: string }[] = [
  {
    id: 'events',
    label: 'Event categories',
    hint: 'Discover filters, icons, colors',
  },
  {
    id: 'talent',
    label: 'Talent badges',
    hint: 'Performer & talent profiles',
  },
  {
    id: 'vendor',
    label: 'Vendor services',
    hint: 'Marketplace vendor badges',
  },
];

function parseTab(raw: string | null): CategoryTaxonomyTab {
  if (raw === 'talent' || raw === 'vendor' || raw === 'events') return raw;
  return 'events';
}

export function CategoriesHubPage() {
  const [params, setParams] = useSearchParams();
  const tab = useMemo(() => parseTab(params.get('tab')), [params]);

  function setTab(next: CategoryTaxonomyTab) {
    setParams(next === 'events' ? {} : { tab: next }, { replace: true });
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-8">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)] lg:items-end">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-40">Taxonomy</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-ink md:text-4xl">Category catalogs</h1>
          <p className="mt-3 max-w-[65ch] text-[15px] leading-relaxed text-ink-60">
            Manage curated lists for events, talent badges, and vendor services. Organizer profile tags reuse event
            categories via pivot tables — there is no separate organizer taxonomy CRUD.
          </p>
        </div>
        <div className="rounded-3xl border border-ink-10 bg-white px-5 py-4 shadow-card-sm">
          <p className="text-[11px] font-bold uppercase tracking-wide text-ink-40">API base</p>
          <p className="mt-1 font-mono text-[13px] text-ink">/api/v1/admin/*-categories</p>
          <p className="mt-2 text-[13px] text-ink-60">Paginated lists · PATCH for active toggle · 422 on delete in use</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-b border-ink-10 pb-1 sm:flex-row sm:items-end sm:gap-6">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                'group text-left transition active:scale-[0.98]',
                active ? 'border-b-2 border-coral pb-3' : 'border-b-2 border-transparent pb-3 hover:border-ink-10',
              )}
            >
              <p className={cn('text-[15px] font-extrabold', active ? 'text-ink' : 'text-ink-60 group-hover:text-ink')}>
                {t.label}
              </p>
              <p className="mt-0.5 text-[12px] text-ink-40">{t.hint}</p>
            </button>
          );
        })}
      </div>

      {tab === 'events' ? <EventCategoriesPanel /> : null}
      {tab === 'talent' ? <BadgeCategoriesPanel kind="talent" /> : null}
      {tab === 'vendor' ? <BadgeCategoriesPanel kind="vendor" /> : null}
    </div>
  );
}

export function EventCategoriesPage() {
  return <CategoriesHubPage />;
}

export function CategoriesLegacyRedirect() {
  return <Navigate to="/categories?tab=events" replace />;
}
