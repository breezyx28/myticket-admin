import { BadgeCategoriesPanel } from '@/pages/categories/BadgeCategoriesPanel';
import { EventCategoriesPanel } from '@/pages/categories/EventCategoriesPanel';
import type { CategoryTaxonomyTab } from '@/schemas/categoryTaxonomy.schema';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const TAB_IDS: CategoryTaxonomyTab[] = ['events', 'talent', 'vendor'];

const TAB_HINT_KEYS: Record<CategoryTaxonomyTab, string> = {
  events: 'categories.tabs.eventsHint',
  talent: 'categories.tabs.talentHint',
  vendor: 'categories.tabs.vendorHint',
};

function parseTab(raw: string | null): CategoryTaxonomyTab {
  if (raw === 'talent' || raw === 'vendor' || raw === 'events') return raw;
  return 'events';
}

export function CategoriesHubPage() {
  const { t } = useTranslation('operations');
  const [params, setParams] = useSearchParams();
  const tab = useMemo(() => parseTab(params.get('tab')), [params]);

  function setTab(next: CategoryTaxonomyTab) {
    setParams(next === 'events' ? {} : { tab: next }, { replace: true });
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-8">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-40">{t('categories.eyebrow')}</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-ink md:text-4xl">{t('categories.hubTitle')}</h1>
        <p className="mt-3 max-w-[65ch] text-[15px] leading-relaxed text-ink-60">{t('categories.hubDescription')}</p>
      </div>

      <div className="flex flex-col gap-3 border-b border-ink-10 pb-1 sm:flex-row sm:items-end sm:gap-6">
        {TAB_IDS.map((id) => {
          const active = tab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                'group text-left transition active:scale-[0.98]',
                active ? 'border-b-2 border-coral pb-3' : 'border-b-2 border-transparent pb-3 hover:border-ink-10',
              )}
            >
              <p className={cn('text-[15px] font-extrabold', active ? 'text-ink' : 'text-ink-60 group-hover:text-ink')}>
                {t(`categories.tabs.${id}`)}
              </p>
              <p className="mt-0.5 text-[12px] text-ink-40">{t(TAB_HINT_KEYS[id])}</p>
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
