import { ListFiltersBar } from '@/components/admin/ListFiltersBar';
import { filterSelectClassName } from '@/lib/adminFilters';
import { AdminEventCard } from '@/components/events/AdminEventCard';
import { AdminSection } from '@/components/layout/AdminSection';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatBubble } from '@/components/ui/StatBubble';
import { formatSarCompact } from '@/lib/formatSar';
import { rowMatchesSearch } from '@/lib/listQuery';
import { notifyError, notifySuccess } from '@/lib/notify';
import type { AdminEventRow, FeaturedEventsConfig } from '@/schemas/event.schema';
import { useGetEventsQuery, useGetFeaturedConfigQuery, useSetFeaturedConfigMutation } from '@/services/adminApi';
import { Sparkles, Wand2 } from 'lucide-react';
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
    const s = new Set((events.data ?? []).map((e) => e.category));
    return Array.from(s).sort();
  }, [events.data]);

  const filtered = useMemo(() => {
    const rows = events.data ?? [];
    return rows.filter((e) => {
      if (status !== 'all' && e.status !== status) return false;
      if (category !== 'all' && e.category !== category) return false;
      return rowMatchesSearch(search, [e.title, e.organizerName, e.city, e.category, e.venueName, e.id]);
    });
  }, [events.data, search, status, category]);

  if (cfg.isLoading || events.isLoading || !cfg.data) return <p className="text-ink-60">Loading…</p>;

  const manual = cfg.data.manualEventIds;
  const refreshMinutes = refreshDraft ?? cfg.data.refreshMinutes;

  async function saveFeatured(next: Pick<FeaturedEventsConfig, 'mode' | 'manualEventIds'>) {
    const payload: FeaturedEventsConfig = {
      ...next,
      refreshMinutes,
    };
    try {
      await setCfg(payload).unwrap();
      notifySuccess('Featured configuration updated.');
    } catch {
      notifyError('Could not update featured configuration.');
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-ink-40">Events</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">Featured events</h1>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-60">
          Curate the storefront hero rails: choose algorithmic rotation or a manual override, set how often the rail
          refreshes (required by the API), then pin the events buyers should see first.
        </p>
      </div>

      <AdminSection
        eyebrow="Impact"
        title="Merchandising health"
        description="Synthetic aggregates from the current catalog sample — replace with live merchandising KPIs when analytics GETs are available."
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatBubble
            label="Catalog revenue (sum)"
            value={stats ? formatSarCompact(stats.revenue) : '—'}
            color="bg-coral text-white"
          />
          <StatBubble
            label="Avg fill rate"
            value={stats ? `${stats.fillAvg}%` : '—'}
            color="bg-mint text-ink"
          />
          <StatBubble
            label="Avg rating"
            value={stats ? `${stats.ratingAvg} ★` : '—'}
            color="bg-lemon text-ink"
          />
          <StatBubble
            label="Manual slots in use"
            value={`${manual.length}`}
            color="bg-ink text-white"
          />
        </div>
      </AdminSection>

      <AdminSection
        divider
        eyebrow="Strategy"
        title="Featuring mode"
        description="Algorithm keeps the rail rotating on a schedule you control. Manual override pins your shortlist; the server still needs a refresh interval on every save."
      >
        <div className="space-y-4">
          <Card className="rounded-3xl border border-ink-10 shadow-card-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-extrabold">Hero refresh interval</CardTitle>
              <CardDescription>
                Sent as <span className="font-mono text-ink">refresh_minutes</span> with every config update (Laravel
                validation).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex max-w-md flex-col gap-2">
                <label className="text-[11px] font-bold uppercase tracking-wide text-ink-40" htmlFor="featured-refresh">
                  Minutes between refreshes
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
                <p className="text-[12px] leading-relaxed text-ink-50">Range 1–10080. Typical values: 15–120 minutes.</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className={modeCardClass(cfg.data.mode === 'algorithm')}>
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center gap-3 text-coral">
                  <Wand2 size={22} strokeWidth={2} aria-hidden />
                  <p className="text-lg font-extrabold text-ink">Algorithm (default)</p>
                </div>
                <p className="text-[14px] font-medium leading-relaxed text-ink-60">
                  Uses conversion velocity, geo demand, and inventory risk to rotate features (illustrative). Honors the
                  refresh interval above.
                </p>
                <Button
                  type="button"
                  variant={cfg.data.mode === 'algorithm' ? 'dark' : 'outline'}
                  loading={setState.isLoading}
                  onClick={() => void saveFeatured({ mode: 'algorithm', manualEventIds: manual })}
                >
                  Use algorithmic rotation
                </Button>
              </CardContent>
            </Card>

            <Card className={modeCardClass(cfg.data.mode === 'manual_override')}>
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center gap-3 text-coral">
                  <Sparkles size={22} strokeWidth={2} aria-hidden />
                  <p className="text-lg font-extrabold text-ink">Manual override</p>
                </div>
                <p className="text-[14px] font-medium leading-relaxed text-ink-60">
                  Pins the curated checklist below. Use for launches, takeovers, and partner commitments.
                </p>
                <Button
                  type="button"
                  variant={cfg.data.mode === 'manual_override' ? 'dark' : 'outline'}
                  loading={setState.isLoading}
                  onClick={() => void saveFeatured({ mode: 'manual_override', manualEventIds: manual })}
                >
                  Lock manual list
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminSection>

      <AdminSection
        divider
        eyebrow="Curation"
        title="Pinned events"
        description="Tick the events that belong in the hero rail. Changing pins saves in manual mode and includes the refresh interval."
      >
        <Card className="rounded-3xl border border-ink-10 shadow-card-md">
          <CardHeader>
            <CardTitle className="text-xl font-extrabold">Manual shortlist</CardTitle>
            <CardDescription>Cards mirror the operator experience elsewhere — rich visuals reduce mis-picks.</CardDescription>
          </CardHeader>
          <CardContent>
            <ListFiltersBar
              searchValue={search}
              onSearchChange={setSearch}
              searchPlaceholder="Search events to pin…"
              className="mb-6"
            >
              <select className={filterSelectClassName()} value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="ended">Ended</option>
                <option value="cancelled">Cancelled</option>
                <option value="archived">Archived</option>
              </select>
              <select className={filterSelectClassName()} value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="all">All categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </ListFiltersBar>
            {filtered.length === 0 ? (
              <p className="text-sm font-semibold text-ink-60">No events match your search and filters.</p>
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
                      Pin
                    </label>
                  </div>
                );
              })}
            </div>
            {setState.isLoading ? <p className="mt-4 text-[12px] font-bold text-ink-40">Saving…</p> : null}
          </CardContent>
        </Card>
      </AdminSection>
    </div>
  );
}
