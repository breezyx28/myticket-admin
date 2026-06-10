import { ListFiltersBar } from '@/components/admin/ListFiltersBar';
import { filterSelectClassName } from '@/lib/adminFilters';
import { Card, CardContent } from '@/components/ui/card';
import { rowMatchesSearch } from '@/lib/listQuery';
import { cn } from '@/lib/utils';
import type { TalentProfile } from '@/schemas/talentApproval.schema';
import { useGetTalentProfilesQuery } from '@/services/adminApi';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Mic2, Shield } from 'lucide-react';
import { useMemo, useState } from 'react';

function statusTone(status: TalentProfile['status']) {
  if (status === 'approved') return 'text-mint font-extrabold';
  if (status === 'rejected') return 'text-coral font-extrabold';
  return 'text-amber font-extrabold';
}

const HEADSHOT_FALLBACK =
  'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&q=80&auto=format&fit=crop';

function locationLabel(row: TalentProfile) {
  const parts = [row.city, row.country].filter(Boolean);
  if (parts.length) return parts.join(', ');
  return 'Location not set';
}

function govTone(status: TalentProfile['governmentIdStatus']) {
  if (status === 'verified') return 'border-mint/50 bg-mint/15 text-ink';
  if (status === 'rejected') return 'border-coral/50 bg-coral/10 text-coral';
  return 'border-amber/40 bg-amber/10 text-amber';
}

export function TalentApprovalsPage() {
  const { data, isLoading } = useGetTalentProfilesQuery();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | TalentProfile['status']>('all');
  const [gov, setGov] = useState<'all' | TalentProfile['governmentIdStatus']>('all');

  const filtered = useMemo(() => {
    return (data ?? []).filter((row) => {
      if (status !== 'all' && row.status !== status) return false;
      if (gov !== 'all' && row.governmentIdStatus !== gov) return false;
      return rowMatchesSearch(search, [
        row.stageName,
        row.legalName,
        row.email,
        row.city,
        row.country,
        row.bio,
        row.genres.join(' '),
        row.id,
        row.slug,
      ]);
    });
  }, [data, search, status, gov]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-ink-40">Approvals</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">Talent profile verification</h1>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-60">
          Realistic fields mirror what production sends: identity, portfolio assets, banking readiness, and media QA
          notes. Open a card for the full dossier.
        </p>
      </div>

      <ListFiltersBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search stage name, legal name, email, city…"
      >
        <select className={filterSelectClassName()} value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
          <option value="all">All review statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select className={filterSelectClassName()} value={gov} onChange={(e) => setGov(e.target.value as typeof gov)}>
          <option value="all">ID: any</option>
          <option value="pending">ID: pending</option>
          <option value="verified">ID: verified</option>
          <option value="rejected">ID: rejected</option>
        </select>
      </ListFiltersBar>

      {isLoading ? <p className="text-sm text-ink-60">Loading…</p> : null}
      {!isLoading && filtered.length === 0 ? (
        <p className="text-sm font-semibold text-ink-60">No talent profiles match your search and filters.</p>
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
                    <p className="text-[11px] font-extrabold uppercase tracking-wide text-white/80">Stage name</p>
                    <p className="text-xl font-extrabold text-white">{row.stageName}</p>
                    <p className="text-[13px] font-semibold text-white/85">{row.legalName}</p>
                  </div>
                  <span
                    className={cn(
                      'rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide shadow-card-sm',
                      statusTone(row.status)
                    )}
                  >
                    {row.status}
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
                    {row.yearsExperience} yrs
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar size={14} className="text-coral" />
                    {new Date(row.submittedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-ink-10 bg-surface-tint px-3 py-2">
                  <span className="inline-flex items-center gap-2 text-[12px] font-bold text-ink-60">
                    <Shield size={14} className="text-coral" />
                    Government ID
                  </span>
                  <span className={cn('rounded-full px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide', govTone(row.governmentIdStatus))}>
                    {row.governmentIdStatus}
                  </span>
                </div>
                <p className="text-[12px] font-semibold text-ink-40">Media QA · {row.mediaQualityNote}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
