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
import type { AdminEventRow } from '@/schemas/event.schema';
import { useGetEventsQuery, useGetFeaturedConfigQuery, useSetFeaturedConfigMutation } from '@/services/adminApi';
import { Sparkles, Wand2 } from 'lucide-react';
import { useMemo, useState } from 'react';

export function FeaturedEventsPage() {
  const cfg = useGetFeaturedConfigQuery();
  const events = useGetEventsQuery();
  const [setCfg, setState] = useSetFeaturedConfigMutation();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | AdminEventRow['status']>('all');
  const [category, setCategory] = useState<string>('all');

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

  async function saveFeatured(next: Parameters<typeof setCfg>[0]) {
    try {
      await setCfg(next).unwrap();
      notifySuccess('Featured configuration updated.');
    } catch {
      notifyError('Could not update featured configuration.');
    }
  }

  return (
    <div className="space-y-12">
      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-ink-40">Events</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">Featured events</h1>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-60">
          Curate the storefront hero rails with confidence: switch between algorithmic surfacing and manual overrides,
          then pin the exact events buyers should see first.
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
        description="Algorithm keeps things fresh; manual override freezes the rail for launches, takeovers, and partner commitments."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Card
            className={`rounded-[28px] p-2 shadow-card-sm transition-all ${
              cfg.data.mode === 'algorithm' ? 'border-coral ring-2 ring-coral/25' : 'border-ink-10'
            }`}
          >
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center gap-3 text-coral">
                <Wand2 size={22} strokeWidth={2} />
                <p className="text-lg font-extrabold text-ink">Algorithm (default)</p>
              </div>
              <p className="text-[14px] font-medium text-ink-60">
                Uses conversion velocity, geo demand, and inventory risk to rotate features hourly (illustrative).
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
          <Card
            className={`rounded-[28px] p-2 shadow-card-sm transition-all ${
              cfg.data.mode === 'manual_override' ? 'border-coral ring-2 ring-coral/25' : 'border-ink-10'
            }`}
          >
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center gap-3 text-coral">
                <Sparkles size={22} strokeWidth={2} />
                <p className="text-lg font-extrabold text-ink">Manual override</p>
              </div>
              <p className="text-[14px] font-medium text-ink-60">
                Pins the curated checklist below. Ideal for sponsor obligations and marquee launches.
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
      </AdminSection>

      <AdminSection
        divider
        eyebrow="Curation"
        title="Pinned events"
        description="Tick the events that belong in the hero rail. We automatically switch you to manual override when the selection changes."
      >
        <Card className="rounded-3xl border-ink-10 shadow-card-md">
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
                    <label className="absolute right-4 top-4 z-10 flex cursor-pointer items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-[12px] font-extrabold text-ink shadow-card-sm ring-1 ring-ink-10">
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
                    <AdminEventCard event={e} showDetailLink={false} className="h-full" />
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
