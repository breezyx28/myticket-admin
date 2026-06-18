import { ListFiltersBar } from '@/components/admin/ListFiltersBar';
import { filterSelectClassName } from '@/lib/adminFilters';
import { AdminEventCard } from '@/components/events/AdminEventCard';
import { AdminSection } from '@/components/layout/AdminSection';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatBubble } from '@/components/ui/StatBubble';
import { formatSarCompact } from '@/lib/formatSar';
import { getCurrentLocale } from '@/i18n';
import { eventCategoryLabel } from '@/lib/pickLocalizedField';
import { rowMatchesSearch } from '@/lib/listQuery';
import { notifyError, notifySuccess } from '@/lib/notify';
import type { AdminEventRow, FeaturedEventsConfig } from '@/schemas/event.schema';
import { useGetEventsQuery, useGetFeaturedConfigQuery, useSetFeaturedConfigMutation } from '@/services/adminApi';
import { Sparkles, Wand2 } from 'lucide-react';
import { Trans, useTranslation } from 'react-i18next';
import { useEffect, useMemo, useState } from 'react';

const featuredNumericInputClass =
  'w-full max-w-[220px] rounded-xl border border-ink-10 bg-white px-3 py-2 font-mono text-[14px] font-semibold text-ink tabular-nums outline-none focus:border-coral focus:ring-2 focus:ring-coral/25';

function modeCardClass(active: boolean): string {
  return [
    'rounded-3xl border bg-white shadow-card-sm transition-colors',
    active ? 'border-coral ring-2 ring-coral/25' : 'border-ink-10 hover:border-ink-20',
  ].join(' ');
}

export function FeaturedEventsPage() {
  const { t } = useTranslation(['operations', 'common']);
  const locale = getCurrentLocale();
  const cfg = useGetFeaturedConfigQuery();
  const events = useGetEventsQuery();
  const [setCfg, setState] = useSetFeaturedConfigMutation();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | AdminEventRow['status']>('all');
  const [category, setCategory] = useState<string>('all');
  const [refreshDraft, setRefreshDraft] = useState<number | null>(null);

  useEffect(() => {
    if (!cfg.data) return;
    setRefreshDraft(null);
  }, [cfg.data?.refreshMinutes, cfg.data?.mode, cfg.data?.manualEventIds.join('|')]);

  const stats = useMemo(() => {
    if (!events.data?.length) return null;
    const revenue = events.data.reduce((acc, e) => acc + e.revenueSar, 0);
    const fillAvg = Math.round(
      events.data.reduce((acc, e) => acc + Math.min(100, (e.ticketsSold / e.capacity) * 100), 0) / events.data.length
    );
    const ratingAvg =
      Math.round((events.data.reduce((acc, e) => acc + e.avgRating, 0) / events.data.length) * 10) / 10;
    return { revenue, fillAvg, ratingAvg };
  }, [events.data]);

  const categories = useMemo(() => {
    const seen = new Map<string, string>();
    for (const e of events.data ?? []) {
      if (!e.category || seen.has(e.category)) continue;
      seen.set(e.category, eventCategoryLabel(e, locale));
    }
    return Array.from(seen.entries()).sort((a, b) => a[1].localeCompare(b[1], locale));
  }, [events.data, locale]);

  const filtered = useMemo(() => {
    const rows = events.data ?? [];
    return rows.filter((e) => {
      if (status !== 'all' && e.status !== status) return false;
      if (category !== 'all' && e.category !== category) return false;
      return rowMatchesSearch(search, [e.title, e.organizerName, e.city, e.category, e.venueName, e.id]);
    });
  }, [events.data, search, status, category]);

  if (cfg.isLoading || events.isLoading || !cfg.data) return <p className="text-ink-60">{t('common:loading')}</p>;

  const manual = cfg.data.manualEventIds;
  const refreshMinutes = refreshDraft ?? cfg.data.refreshMinutes;

  async function saveFeatured(next: Pick<FeaturedEventsConfig, 'mode' | 'manualEventIds'>) {
    const payload: FeaturedEventsConfig = {
      ...next,
      refreshMinutes,
    };
    try {
      await setCfg(payload).unwrap();
      notifySuccess(t('operations:events.notifyFeaturedUpdated'));
    } catch {
      notifyError(t('operations:events.notifyFeaturedFailed'));
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-ink-40">{t('operations:events.eyebrow')}</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">{t('operations:events.featuredTitle')}</h1>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-60">{t('operations:events.featuredDescription')}</p>
      </div>

      <AdminSection
        eyebrow={t('operations:events.impactEyebrow')}
        title={t('operations:events.impactTitle')}
        description={t('operations:events.impactDescription')}
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatBubble
            label={t('operations:events.stats.catalogRevenue')}
            value={stats ? formatSarCompact(stats.revenue) : t('common:none')}
            color="bg-coral text-white"
          />
          <StatBubble
            label={t('operations:events.stats.avgFillRate')}
            value={stats ? `${stats.fillAvg}%` : t('common:none')}
            color="bg-mint text-ink"
          />
          <StatBubble
            label={t('operations:events.stats.avgRating')}
            value={stats ? `${stats.ratingAvg} ★` : t('common:none')}
            color="bg-lemon text-ink"
          />
          <StatBubble
            label={t('operations:events.stats.manualSlots')}
            value={`${manual.length}`}
            color="bg-ink text-white"
          />
        </div>
      </AdminSection>

      <AdminSection
        divider
        eyebrow={t('operations:events.strategyEyebrow')}
        title={t('operations:events.strategyTitle')}
        description={t('operations:events.strategyDescription')}
      >
        <div className="space-y-4">
          <Card className="rounded-3xl border border-ink-10 shadow-card-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-extrabold">{t('operations:events.refreshTitle')}</CardTitle>
              <CardDescription>
                <Trans
                  ns="operations"
                  i18nKey="events.refreshDescription"
                  components={{ mono: <span className="font-mono text-ink" /> }}
                />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex max-w-md flex-col gap-2">
                <label className="text-[11px] font-bold uppercase tracking-wide text-ink-40" htmlFor="featured-refresh">
                  {t('operations:events.refreshLabel')}
                </label>
                <input
                  id="featured-refresh"
                  type="number"
                  min={1}
                  max={10080}
                  step={1}
                  inputMode="numeric"
                  className={featuredNumericInputClass}
                  value={refreshMinutes}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    if (!Number.isFinite(n)) return;
                    const clamped = Math.min(10080, Math.max(1, Math.round(n)));
                    setRefreshDraft(clamped);
                  }}
                />
                <p className="text-[12px] leading-relaxed text-ink-50">{t('operations:events.refreshHint')}</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className={modeCardClass(cfg.data.mode === 'algorithm')}>
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center gap-3 text-coral">
                  <Wand2 size={22} strokeWidth={2} aria-hidden />
                  <p className="text-lg font-extrabold text-ink">{t('operations:events.modeAlgorithm')}</p>
                </div>
                <p className="text-[14px] font-medium leading-relaxed text-ink-60">
                  {t('operations:events.modeAlgorithmDescription')}
                </p>
                <Button
                  type="button"
                  variant={cfg.data.mode === 'algorithm' ? 'dark' : 'outline'}
                  loading={setState.isLoading}
                  onClick={() => void saveFeatured({ mode: 'algorithm', manualEventIds: manual })}
                >
                  {t('operations:events.useAlgorithm')}
                </Button>
              </CardContent>
            </Card>

            <Card className={modeCardClass(cfg.data.mode === 'manual_override')}>
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center gap-3 text-coral">
                  <Sparkles size={22} strokeWidth={2} aria-hidden />
                  <p className="text-lg font-extrabold text-ink">{t('operations:events.modeManual')}</p>
                </div>
                <p className="text-[14px] font-medium leading-relaxed text-ink-60">
                  {t('operations:events.modeManualDescription')}
                </p>
                <Button
                  type="button"
                  variant={cfg.data.mode === 'manual_override' ? 'dark' : 'outline'}
                  loading={setState.isLoading}
                  onClick={() => void saveFeatured({ mode: 'manual_override', manualEventIds: manual })}
                >
                  {t('operations:events.lockManual')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminSection>

      <AdminSection
        divider
        eyebrow={t('operations:events.curationEyebrow')}
        title={t('operations:events.curationTitle')}
        description={t('operations:events.curationDescription')}
      >
        <Card className="rounded-3xl border border-ink-10 shadow-card-md">
          <CardHeader>
            <CardTitle className="text-xl font-extrabold">{t('operations:events.shortlistTitle')}</CardTitle>
            <CardDescription>{t('operations:events.shortlistDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ListFiltersBar
              searchValue={search}
              onSearchChange={setSearch}
              searchPlaceholder={t('operations:events.pinSearchPlaceholder')}
              className="mb-6"
            >
              <select className={filterSelectClassName()} value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
                <option value="all">{t('operations:events.allStatuses')}</option>
                <option value="active">{t('operations:events.status.active')}</option>
                <option value="ended">{t('operations:events.status.ended')}</option>
                <option value="cancelled">{t('operations:events.status.cancelled')}</option>
                <option value="archived">{t('operations:events.status.archived')}</option>
              </select>
              <select className={filterSelectClassName()} value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="all">{t('operations:events.allCategories')}</option>
                {categories.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </ListFiltersBar>
            {filtered.length === 0 ? (
              <p className="text-sm font-semibold text-ink-60">{t('operations:events.noMatches')}</p>
            ) : null}
            <div className="grid gap-6 lg:grid-cols-2">
              {filtered.map((e) => {
                const checked = manual.includes(e.id);
                return (
                  <div key={e.id} className="relative">
                    <div className="pointer-events-none">
                      <AdminEventCard event={e} showDetailLink={false} className="h-full" />
                    </div>
                    <label className="pointer-events-auto absolute right-4 top-4 z-20 flex cursor-pointer items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-[12px] font-extrabold text-ink shadow-card-sm ring-1 ring-ink-10">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          const next = checked ? manual.filter((x) => x !== e.id) : [...manual, e.id];
                          void saveFeatured({ mode: 'manual_override', manualEventIds: next });
                        }}
                        className="h-4 w-4 accent-coral"
                      />
                      {t('operations:events.pin')}
                    </label>
                  </div>
                );
              })}
            </div>
            {setState.isLoading ? <p className="mt-4 text-[12px] font-bold text-ink-40">{t('operations:events.saving')}</p> : null}
          </CardContent>
        </Card>
      </AdminSection>
    </div>
  );
}
