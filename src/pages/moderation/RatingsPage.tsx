import { ListFiltersBar } from '@/components/admin/ListFiltersBar';
import { RowActionsMenu } from '@/components/admin/RowActionsMenu';
import { filterSelectClassName } from '@/lib/adminFilters';
import { getApiErrorMessage } from '@/lib/apiError';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { rowMatchesSearch } from '@/lib/listQuery';
import { notifyError, notifySuccess } from '@/lib/notify';
import type { RatingRow } from '@/schemas/moderation.schema';
import {
  useDeleteRatingModerationMutation,
  useGetRatingsModerationQuery,
  useHideRatingModerationMutation,
  useRestoreRatingModerationMutation,
} from '@/services/adminApi';
import { Star } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

function StarRatingCell({ stars }: { stars: number }) {
  const n = Math.min(5, Math.max(1, stars));
  return (
    <div className="flex items-center gap-1.5">
      <span className="flex items-center gap-px" aria-hidden>
        {Array.from({ length: n }, (_, i) => (
          <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-500" strokeWidth={1.5} />
        ))}
      </span>
      <span className="font-mono text-[13px] font-semibold tabular-nums text-ink">{n}</span>
    </div>
  );
}

export function RatingsPage() {
  const { t } = useTranslation(['trust', 'common', 'errors']);
  const { data, isLoading } = useGetRatingsModerationQuery();
  const [hide, hideState] = useHideRatingModerationMutation();
  const [restore, restoreState] = useRestoreRatingModerationMutation();
  const [del, delState] = useDeleteRatingModerationMutation();
  const [search, setSearch] = useState('');
  const [minStars, setMinStars] = useState<'all' | '1' | '2' | '3' | '4' | '5'>('all');
  const [mod, setMod] = useState<'all' | RatingRow['moderationState']>('all');

  const filtered = useMemo(() => {
    return (data ?? []).filter((row) => {
      if (mod !== 'all' && row.moderationState !== mod) return false;
      if (minStars !== 'all') {
        const n = Number(minStars);
        if (n === 5) {
          if (row.stars !== 5) return false;
        } else if (row.stars < n) {
          return false;
        }
      }
      return rowMatchesSearch(search, [
        row.targetLabel,
        row.authorEmail,
        row.comment,
        row.id,
        String(row.stars),
      ]);
    });
  }, [data, search, minStars, mod]);

  const mutBusy = hideState.isLoading || restoreState.isLoading || delState.isLoading;

  async function run(ok: string, fn: () => Promise<unknown>) {
    try {
      await fn();
      notifySuccess(ok);
    } catch (err) {
      notifyError(getApiErrorMessage(err, t('errors:requestFailed')));
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-ink-40">{t('trust:eyebrow')}</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">{t('trust:ratings.title')}</h1>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-60">
          <Trans
            i18nKey="trust:ratings.subtitle"
            components={[<span key="1" className="font-mono text-ink" />]}
          />
        </p>
      </div>
      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">{t('trust:ratings.recentTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ListFiltersBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder={t('trust:ratings.searchPlaceholder')}
            className="mb-4"
          >
            <select
              className={filterSelectClassName()}
              value={minStars}
              onChange={(e) => setMinStars(e.target.value as typeof minStars)}
            >
              <option value="all">{t('trust:ratings.filters.allStars')}</option>
              <option value="5">{t('trust:ratings.filters.stars5')}</option>
              <option value="4">{t('trust:ratings.filters.stars4Plus')}</option>
              <option value="3">{t('trust:ratings.filters.stars3Plus')}</option>
              <option value="2">{t('trust:ratings.filters.stars2Plus')}</option>
              <option value="1">{t('trust:ratings.filters.stars1Plus')}</option>
            </select>
            <select
              className={filterSelectClassName()}
              value={mod}
              onChange={(e) => setMod(e.target.value as typeof mod)}
            >
              <option value="all">{t('trust:ratings.filters.allModeration')}</option>
              <option value="visible">{t('trust:ratings.moderationState.visible')}</option>
              <option value="hidden">{t('trust:ratings.moderationState.hidden')}</option>
              <option value="deleted">{t('trust:ratings.moderationState.deleted')}</option>
            </select>
          </ListFiltersBar>
          {isLoading ? <p className="text-sm text-ink-60">{t('common:loading')}</p> : null}
          {!isLoading && filtered.length === 0 ? (
            <p className="mb-3 text-sm font-semibold text-ink-60">{t('trust:ratings.empty')}</p>
          ) : null}
          <div className="admin-table-scroll">
            <table className="w-full min-w-[920px] text-left text-[14px]">
              <thead className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
                <tr>
                  <th className="px-4 py-3">{t('trust:ratings.columns.target')}</th>
                  <th className="px-4 py-3">{t('trust:ratings.columns.author')}</th>
                  <th className="px-4 py-3">{t('trust:ratings.columns.stars')}</th>
                  <th className="px-4 py-3">{t('trust:ratings.columns.state')}</th>
                  <th className="px-4 py-3">{t('trust:ratings.columns.comment')}</th>
                  <th className="w-14 px-2 py-3 text-right" aria-label={t('trust:ratings.columns.actions')} />
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => {
                  const rowBusy =
                    (hideState.isLoading && hideState.originalArgs === row.id && 'hide') ||
                    (restoreState.isLoading && restoreState.originalArgs === row.id && 'restore') ||
                    (delState.isLoading && delState.originalArgs === row.id && 'delete') ||
                    null;
                  return (
                    <tr key={row.id} className="border-t border-ink-10 hover:bg-surface-tint">
                      <td className="px-4 py-3 font-semibold text-ink">{row.targetLabel}</td>
                      <td className="px-4 py-3 text-ink-60">{row.authorEmail}</td>
                      <td className="px-4 py-3">
                        <StarRatingCell stars={row.stars} />
                      </td>
                      <td className="px-4 py-3 text-[12px] font-bold uppercase text-ink-60">
                        {t(`trust:ratings.moderationState.${row.moderationState}`)}
                      </td>
                      <td className="max-w-[280px] px-4 py-3 text-ink-60">{row.comment}</td>
                      <td className="px-2 py-3 text-right align-middle">
                        <RowActionsMenu
                          ariaLabel={t('trust:ratings.actions.forRating', { id: row.id })}
                          actions={[
                            {
                              key: 'hide',
                              label: t('trust:ratings.actions.hide'),
                              disabled: row.moderationState !== 'visible' || mutBusy,
                              loading: rowBusy === 'hide',
                              onSelect: () => run(t('trust:ratings.notify.hidden'), () => hide(row.id).unwrap()),
                            },
                            {
                              key: 'restore',
                              label: t('trust:ratings.actions.restore'),
                              disabled: row.moderationState !== 'hidden' || mutBusy,
                              loading: rowBusy === 'restore',
                              onSelect: () => run(t('trust:ratings.notify.restored'), () => restore(row.id).unwrap()),
                            },
                            {
                              key: 'delete',
                              label: t('trust:ratings.actions.delete'),
                              danger: true,
                              disabled: row.moderationState === 'deleted' || mutBusy,
                              loading: rowBusy === 'delete',
                              onSelect: () => run(t('trust:ratings.notify.deleted'), () => del(row.id).unwrap()),
                            },
                          ]}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
