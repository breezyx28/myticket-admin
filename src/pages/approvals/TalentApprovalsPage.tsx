import { ListFiltersBar } from '@/components/admin/ListFiltersBar';
import { filterSelectClassName } from '@/lib/adminFilters';
import { Card, CardContent } from '@/components/ui/card';
import { getCurrentLocale } from '@/i18n';
import { formatDateTime } from '@/lib/localeFormat';
import { formatGeoLocationLine, geoSearchTokens } from '@/lib/localizedGeoName';
import { rowMatchesSearch } from '@/lib/listQuery';
import { cn } from '@/lib/utils';
import type { TalentProfile } from '@/schemas/talentApproval.schema';
import { useGetTalentProfilesQuery } from '@/services/adminApi';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Mic2, Shield } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

function statusTone(status: TalentProfile['status']) {
  if (status === 'approved') return 'text-mint font-extrabold';
  if (status === 'rejected') return 'text-coral font-extrabold';
  return 'text-amber font-extrabold';
}

const HEADSHOT_FALLBACK =
  'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&q=80&auto=format&fit=crop';

function govTone(status: TalentProfile['governmentIdStatus']) {
  if (status === 'verified') return 'border-mint/50 bg-mint/15 text-ink';
  if (status === 'rejected') return 'border-coral/50 bg-coral/10 text-coral';
  return 'border-amber/40 bg-amber/10 text-amber';
}

export function TalentApprovalsPage() {
  const { t } = useTranslation(['approvals', 'common']);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | TalentProfile['status']>('all');
  const [gov, setGov] = useState<'all' | TalentProfile['governmentIdStatus']>('all');
  const [active, setActive] = useState<'all' | 'active' | 'inactive'>('all');

  const listParams = useMemo(
    () => ({
      ...(status !== 'all' ? { status } : {}),
      ...(gov !== 'all' ? { governmentIdStatus: gov } : {}),
      ...(active === 'active' ? { isActive: true } : active === 'inactive' ? { isActive: false } : {}),
    }),
    [status, gov, active]
  );

  const { data, isLoading } = useGetTalentProfilesQuery(listParams);

  const filtered = useMemo(() => {
    return (data ?? []).filter((row) => {
      if (status !== 'all' && row.status !== status) return false;
      if (gov !== 'all' && row.governmentIdStatus !== gov) return false;
      if (active === 'active' && row.isActive === false) return false;
      if (active === 'inactive' && row.isActive !== false) return false;
      return rowMatchesSearch(search, [
        row.stageName,
        row.legalName,
        row.email,
        ...geoSearchTokens(row.cityDetail, row.city),
        ...geoSearchTokens(row.regionDetail, row.country),
        row.bio,
        row.genres.join(' '),
        row.id,
        row.slug,
        row.applicationId,
      ]);
    });
  }, [data, search, status, gov, active]);

  function locationLabel(row: TalentProfile) {
    const formatted = formatGeoLocationLine(
      {
        city: row.city,
        cityDetail: row.cityDetail,
        country: row.country,
        regionDetail: row.regionDetail,
      },
      getCurrentLocale(),
    );
    if (formatted) return formatted;
    return t('talentApprovals.locationNotSet');
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-ink-40">{t('kicker')}</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">{t('talentApprovals.title')}</h1>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-60">{t('talentApprovals.description')}</p>
      </div>

      <ListFiltersBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('talentApprovals.searchPlaceholder')}
      >
        <select className={filterSelectClassName()} value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
          <option value="all">{t('filter.allReviewStatuses')}</option>
          <option value="pending">{t('status.pending')}</option>
          <option value="approved">{t('status.approved')}</option>
          <option value="rejected">{t('status.rejected')}</option>
        </select>
        <select className={filterSelectClassName()} value={gov} onChange={(e) => setGov(e.target.value as typeof gov)}>
          <option value="all">{t('filter.idAny')}</option>
          <option value="pending">{t('filter.idPending')}</option>
          <option value="verified">{t('filter.idVerified')}</option>
          <option value="rejected">{t('filter.idRejected')}</option>
        </select>
        <select
          className={filterSelectClassName()}
          value={active}
          onChange={(e) => setActive(e.target.value as typeof active)}
        >
          <option value="all">{t('filter.profileAny')}</option>
          <option value="active">{t('filter.profileActive')}</option>
          <option value="inactive">{t('filter.profileInactive')}</option>
        </select>
      </ListFiltersBar>

      {isLoading ? <p className="text-sm text-ink-60">{t('loading')}</p> : null}
      {!isLoading && filtered.length === 0 ? (
        <p className="text-sm font-semibold text-ink-60">{t('talentApprovals.empty')}</p>
      ) : null}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((row) => (
          <Link key={row.id} to={`/approvals/talent/${row.id}`} className="group block">
            <Card className="h-full overflow-hidden rounded-3xl border-ink-10 shadow-card-sm transition-all hover:-translate-y-0.5 hover:border-coral/35 hover:shadow-card-md">
              <div className="relative h-40 bg-ink-5">
                <img
                  src={row.headshotUrl.trim() || HEADSHOT_FALLBACK}
                  alt=""
                  className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-wide text-white/80">{t('talentApprovals.stageName')}</p>
                    <p className="text-xl font-extrabold text-white">{row.stageName}</p>
                    <p className="text-[13px] font-semibold text-white/85">{row.legalName}</p>
                  </div>
                  <span
                    className={cn(
                      'rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide shadow-card-sm',
                      statusTone(row.status)
                    )}
                  >
                    {t(`status.${row.status}`)}
                  </span>
                </div>
              </div>
              <CardContent className="space-y-3 p-4">
                <div className="flex flex-wrap gap-2">
                  {row.genres.slice(0, 3).map((g) => (
                    <span key={g} className="rounded-full bg-ink-5 px-2.5 py-1 text-[11px] font-bold text-ink-60">
                      {g}
                    </span>
                  ))}
                </div>
                <p className="line-clamp-2 text-[13px] text-ink-60">{row.bio}</p>
                <div className="flex flex-wrap gap-3 text-[12px] font-semibold text-ink-60">
                  <span className="inline-flex items-center gap-1">
                    <MapPin size={14} className="text-coral" />
                    {locationLabel(row)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Mic2 size={14} className="text-coral" />
                    {t('talentApprovals.yearsShort', { count: row.yearsExperience })}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar size={14} className="text-coral" />
                    {formatDateTime(row.submittedAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-ink-10 bg-surface-tint px-3 py-2">
                  <span className="inline-flex items-center gap-2 text-[12px] font-bold text-ink-60">
                    <Shield size={14} className="text-coral" />
                    {t('talentApprovals.governmentId')}
                  </span>
                  <span className={cn('rounded-full px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide', govTone(row.governmentIdStatus))}>
                    {t(`status.${row.governmentIdStatus}`)}
                  </span>
                </div>
                {row.applicationId ? (
                  <p className="text-[11px] font-semibold text-ink-40">
                    {t('talentApprovals.roleApplication')} · <span className="font-mono">{row.applicationId}</span>
                  </p>
                ) : null}
                <p className="text-[12px] font-semibold text-ink-40">
                  {t('talentApprovals.mediaQa')} · {row.mediaQualityNote || t('common:none')}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
