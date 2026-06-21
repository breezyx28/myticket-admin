import { ListFiltersBar } from '@/components/admin/ListFiltersBar';
import { RowActionsMenu, type RowMenuAction } from '@/components/admin/RowActionsMenu';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTourismAdsRealtime } from '@/hooks/useTourismAdsRealtime';
import { filterSelectClassName } from '@/lib/adminFilters';
import { notifyError, notifySuccess } from '@/lib/notify';
import { rowMatchesSearch } from '@/lib/listQuery';
import { canArchiveTourismAd, canEditTourismAd } from '@/lib/tourismAdFormValues';
import { cn } from '@/lib/utils';
import type { TourismAd, TourismAdSource, TourismAdStatus } from '@/schemas/tourismAd.schema';
import {
  useArchiveTourismAdMutation,
  useGetTourismAdsQuery,
  usePinTourismAdMutation,
  useUnpinTourismAdMutation,
  useUpdateTourismCarouselOrderMutation,
} from '@/services/adminApi';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, MapPin, Plus } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { TourismAdStatusBadge } from './components/TourismAdStatusBadge';

type Tab = 'review' | 'all' | 'carousel';

const STATUS_FILTERS: TourismAdStatus[] = [
  'draft',
  'pending_review',
  'published',
  'rejected',
  'withdrawn',
  'archived',
];

const SOURCE_FILTERS: TourismAdSource[] = ['guest', 'admin'];

function submitterLabel(ad: TourismAd) {
  return ad.user?.fullName ?? ad.createdBy?.fullName ?? ad.user?.email ?? ad.createdBy?.email ?? '—';
}

export function TourismAdsPage() {
  const { t } = useTranslation(['operations', 'common']);
  const navigate = useNavigate();
  useTourismAdsRealtime();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = (searchParams.get('tab') as Tab) || 'review';
  const page = Number(searchParams.get('page') ?? '1') || 1;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TourismAdStatus>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | TourismAdSource>('all');
  const [carouselBusy, setCarouselBusy] = useState(false);
  const reorderTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tabs = useMemo(
    () =>
      [
        { id: 'review' as const, label: t('operations:tourismAds.tabs.review') },
        { id: 'all' as const, label: t('operations:tourismAds.tabs.all') },
        { id: 'carousel' as const, label: t('operations:tourismAds.tabs.carousel') },
      ] satisfies { id: Tab; label: string }[],
    [t],
  );

  const listParams = useMemo(() => {
    if (tab === 'review') {
      return { status: 'pending_review' as const, source: 'guest' as const, page, perPage: 20 };
    }
    if (tab === 'carousel') {
      return { status: 'published' as const, page: 1, perPage: 50 };
    }
    return {
      ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
      ...(sourceFilter !== 'all' ? { source: sourceFilter } : {}),
      page,
      perPage: 20,
    };
  }, [tab, page, statusFilter, sourceFilter]);

  const { data, isLoading, isFetching } = useGetTourismAdsQuery(listParams);
  const [pinAd] = usePinTourismAdMutation();
  const [unpinAd] = useUnpinTourismAdMutation();
  const [archiveAd, archiveState] = useArchiveTourismAdMutation();
  const [reorderCarousel] = useUpdateTourismCarouselOrderMutation();

  const filtered = useMemo(() => {
    const items = data?.items ?? [];
    if (!search.trim()) return items;
    return items.filter((row) =>
      rowMatchesSearch(search, [
        row.id,
        row.locationName,
        row.description,
        row.status,
        row.source,
        submitterLabel(row),
      ]),
    );
  }, [data?.items, search]);

  const pinnedCarousel = useMemo(() => {
    return [...(data?.items ?? [])]
      .filter((ad) => ad.status === 'published' && ad.isPinned)
      .sort((a, b) => (a.carouselPosition ?? 0) - (b.carouselPosition ?? 0));
  }, [data?.items]);

  const [carouselOrder, setCarouselOrder] = useState<TourismAd[]>([]);

  useEffect(() => {
    setCarouselOrder(pinnedCarousel);
  }, [pinnedCarousel]);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.perPage)) : 1;

  function setTab(next: Tab) {
    const p = new URLSearchParams(searchParams);
    p.set('tab', next);
    p.delete('page');
    setSearchParams(p);
  }

  function setPage(next: number) {
    const p = new URLSearchParams(searchParams);
    p.set('page', String(next));
    setSearchParams(p);
  }

  const flushReorder = useCallback(
    (ordered: TourismAd[]) => {
      if (reorderTimer.current) clearTimeout(reorderTimer.current);
      reorderTimer.current = setTimeout(async () => {
        setCarouselBusy(true);
        try {
          await reorderCarousel({
            items: ordered.map((ad, index) => ({ id: ad.id, position: index })),
          }).unwrap();
          notifySuccess(t('operations:tourismAds.notify.carouselOrderSaved'));
        } catch {
          notifyError(t('operations:tourismAds.notify.carouselOrderFailed'));
        } finally {
          setCarouselBusy(false);
        }
      }, 450);
    },
    [reorderCarousel, t],
  );

  useEffect(() => {
    return () => {
      if (reorderTimer.current) clearTimeout(reorderTimer.current);
    };
  }, []);

  function moveCarouselItem(index: number, direction: -1 | 1) {
    const next = [...carouselOrder];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    const tmp = next[index];
    next[index] = next[target];
    next[target] = tmp;
    setCarouselOrder(next);
    flushReorder(next);
  }

  async function togglePin(ad: TourismAd) {
    try {
      if (ad.isPinned) {
        await unpinAd(ad.id).unwrap();
        notifySuccess(t('operations:tourismAds.notify.unpinned'));
      } else {
        await pinAd({ id: ad.id }).unwrap();
        notifySuccess(t('operations:tourismAds.notify.pinned'));
      }
    } catch {
      notifyError(t('operations:tourismAds.notify.pinFailed'));
    }
  }

  async function onArchive(ad: TourismAd) {
    if (
      !window.confirm(
        t('operations:tourismAds.archiveConfirm', { name: ad.locationName }),
      )
    ) {
      return;
    }
    try {
      await archiveAd(ad.id).unwrap();
      notifySuccess(t('operations:tourismAds.notify.archived'));
    } catch {
      notifyError(t('operations:tourismAds.notify.archiveFailed'));
    }
  }

  function rowActions(ad: TourismAd): RowMenuAction[] {
    const actions: RowMenuAction[] = [
      {
        key: 'open',
        label: t('operations:tourismAds.open'),
        onSelect: () => navigate(`/tourism-ads/${ad.id}`),
      },
    ];

    if (canEditTourismAd(ad)) {
      actions.push({
        key: 'edit',
        label: t('operations:tourismAds.actions.edit'),
        onSelect: () => navigate(`/tourism-ads/${ad.id}/edit`),
      });
    }

    if (canArchiveTourismAd(ad)) {
      actions.push({
        key: 'archive',
        label: t('operations:tourismAds.actions.archive'),
        danger: true,
        loading: archiveState.isLoading && archiveState.originalArgs === ad.id,
        onSelect: () => onArchive(ad),
      });
    }

    return actions;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-40">
            {t('operations:operationsLabel')}
          </p>
          <h1 className="text-3xl font-extrabold text-ink">{t('operations:tourismAds.title')}</h1>
          <p className="mt-2 max-w-2xl text-[14px] text-ink-60">
            <Trans
              ns="operations"
              i18nKey="tourismAds.subtitle"
              components={{ mono: <span className="font-mono text-ink" /> }}
            />
          </p>
        </div>
        <Link to="/tourism-ads/new">
          <Button variant="secondary">
            <Plus size={16} className="mr-1.5" />
            {t('operations:tourismAds.publishNewAd')}
          </Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tabItem) => (
          <button
            key={tabItem.id}
            type="button"
            onClick={() => setTab(tabItem.id)}
            className={cn(
              'rounded-full px-4 py-2 text-[13px] font-bold transition active:scale-[0.98]',
              tab === tabItem.id ? 'bg-coral text-white' : 'bg-ink-5 text-ink-60 hover:bg-ink-10',
            )}
          >
            {tabItem.label}
          </button>
        ))}
      </div>

      {tab === 'carousel' ? (
        <Card className="rounded-3xl border-ink-10 shadow-card-sm">
          <CardHeader>
            <CardTitle className="text-lg">{t('operations:tourismAds.carousel.title')}</CardTitle>
            <p className="text-[13px] text-ink-60">
              <Trans
                ns="operations"
                i18nKey="tourismAds.carousel.hint"
                components={{ mono: <span className="font-mono text-ink" /> }}
              />
            </p>
          </CardHeader>
          <CardContent>
            {isLoading || isFetching ? (
              <p className="text-sm text-ink-60">{t('operations:tourismAds.carousel.loading')}</p>
            ) : null}
            {!isLoading && carouselOrder.length === 0 ? (
              <p className="text-sm font-semibold text-ink-60">{t('operations:tourismAds.carousel.empty')}</p>
            ) : null}
            <div className="space-y-3">
              {carouselOrder.map((ad, index) => (
                <div
                  key={ad.id}
                  className="flex flex-col gap-4 rounded-2xl border border-ink-10 bg-surface-tint/40 p-4 sm:flex-row sm:items-center"
                >
                  {ad.coverImageUrl ? (
                    <img
                      src={ad.coverImageUrl}
                      alt=""
                      className="h-20 w-28 shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-20 w-28 shrink-0 items-center justify-center rounded-xl bg-ink-5 text-ink-40">
                      <MapPin size={20} />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-ink">{ad.locationName}</p>
                    <p className="text-[12px] text-ink-60">
                      {t('operations:tourismAds.carousel.position', { index })}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={carouselBusy || index === 0}
                      onClick={() => moveCarouselItem(index, -1)}
                    >
                      <ArrowUp size={14} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={carouselBusy || index === carouselOrder.length - 1}
                      onClick={() => moveCarouselItem(index, 1)}
                    >
                      <ArrowDown size={14} />
                    </Button>
                    <Link to={`/tourism-ads/${ad.id}`}>
                      <Button variant="ghost" size="sm">
                        {t('operations:tourismAds.open')}
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" disabled={carouselBusy} onClick={() => togglePin(ad)}>
                      {t('operations:tourismAds.unpin')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 border-t border-ink-10 pt-6">
              <p className="mb-3 text-[13px] font-bold text-ink">
                {t('operations:tourismAds.carousel.publishedAdsTitle')}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {(data?.items ?? [])
                  .filter((ad) => ad.status === 'published' && !ad.isPinned)
                  .map((ad) => (
                    <div
                      key={ad.id}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-ink-10 p-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-ink">{ad.locationName}</p>
                        <p className="font-mono text-[11px] text-ink-40">{ad.id}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => togglePin(ad)}>
                        {t('operations:tourismAds.pin')}
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-3xl border-ink-10 shadow-card-sm">
          <CardHeader>
            <CardTitle className="text-lg">
              {tab === 'review'
                ? t('operations:tourismAds.awaitingReview')
                : t('operations:tourismAds.directory')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ListFiltersBar
              searchValue={search}
              onSearchChange={setSearch}
              searchPlaceholder={t('operations:tourismAds.searchPlaceholder')}
              className="mb-4"
            >
              {tab === 'all' ? (
                <>
                  <select
                    className={filterSelectClassName()}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                  >
                    <option value="all">{t('operations:tourismAds.allStatuses')}</option>
                    {STATUS_FILTERS.map((status) => (
                      <option key={status} value={status}>
                        {t(`operations:tourismAds.status.${status}`)}
                      </option>
                    ))}
                  </select>
                  <select
                    className={filterSelectClassName()}
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value as typeof sourceFilter)}
                  >
                    <option value="all">{t('operations:tourismAds.allSources')}</option>
                    {SOURCE_FILTERS.map((source) => (
                      <option key={source} value={source}>
                        {t(`operations:tourismAds.sourceType.${source}`)}
                      </option>
                    ))}
                  </select>
                </>
              ) : null}
            </ListFiltersBar>

            {isLoading ? <p className="text-sm text-ink-60">{t('common:loading')}</p> : null}
            {!isLoading && filtered.length === 0 ? (
              <p className="text-sm font-semibold text-ink-60">{t('operations:tourismAds.empty')}</p>
            ) : null}

            <div className="space-y-3">
              {filtered.map((ad) => (
                <div
                  key={ad.id}
                  className="flex flex-col gap-4 rounded-2xl border border-ink-10 bg-white p-4 transition hover:border-coral/30 hover:shadow-card-sm sm:flex-row sm:items-center"
                >
                  <Link to={`/tourism-ads/${ad.id}`} className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-center">
                    {ad.coverImageUrl ? (
                      <img
                        src={ad.coverImageUrl}
                        alt=""
                        className="h-24 w-full rounded-xl object-cover outline outline-1 outline-black/10 sm:h-20 sm:w-28"
                      />
                    ) : (
                      <div className="flex h-24 w-full items-center justify-center rounded-xl bg-ink-5 text-ink-40 sm:h-20 sm:w-28">
                        <MapPin size={24} />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-bold text-ink">{ad.locationName}</p>
                        <TourismAdStatusBadge status={ad.status} />
                        <span className="rounded-full bg-ink-5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-60">
                          {t(`operations:tourismAds.sourceType.${ad.source}`)}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-[13px] text-ink-60">{ad.description}</p>
                      <p className="mt-2 text-[12px] text-ink-40">
                        {submitterLabel(ad)} · <span className="font-mono tabular-nums">{ad.id}</span>
                      </p>
                    </div>
                  </Link>
                  <div className="flex shrink-0 items-center justify-end gap-2 self-start sm:self-center">
                    <Link to={`/tourism-ads/${ad.id}/edit`} className={canEditTourismAd(ad) ? undefined : 'hidden'}>
                      <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                        {t('operations:tourismAds.actions.edit')}
                      </Button>
                    </Link>
                    <RowActionsMenu
                      ariaLabel={t('operations:tourismAds.actions.menuLabel', { name: ad.locationName })}
                      actions={rowActions(ad)}
                    />
                  </div>
                </div>
              ))}
            </div>

            {data && data.total > data.perPage ? (
              <div className="mt-6 flex items-center justify-between border-t border-ink-10 pt-4">
                <p className="text-[13px] text-ink-60">
                  {t('operations:tourismAds.pagination', {
                    page: data.currentPage,
                    totalPages,
                    total: data.total,
                  })}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                  >
                    <ChevronLeft size={14} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    <ChevronRight size={14} />
                  </Button>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
