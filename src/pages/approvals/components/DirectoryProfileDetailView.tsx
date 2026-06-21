import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateTime } from '@/lib/localeFormat';
import { formatGeoLocationLine } from '@/lib/localizedGeoName';
import { getCurrentLocale } from '@/i18n';
import { cn } from '@/lib/utils';
import type { AdminProfileDirectoryRow } from '@/schemas/adminProfileDirectory.schema';
import { Link } from 'react-router-dom';
import {
  Building2,
  Calendar,
  Globe,
  Instagram,
  MapPin,
  Store,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const HERO_VENDOR =
  'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80&auto=format&fit=crop';
const HERO_ORGANIZER =
  'https://images.unsplash.com/photo-1540575467063-27a8943169da?w=800&q=80&auto=format&fit=crop';

function statusTone(s: string) {
  const u = s.toLowerCase();
  if (u.includes('pending') || u.includes('review'))
    return 'bg-amber/15 text-amber';
  if (
    u.includes('available') ||
    u.includes('active') ||
    u.includes('approved') ||
    u.includes('verified')
  )
    return 'bg-mint/20 text-ink border border-mint/50';
  if (u.includes('reject') || u.includes('suspend'))
    return 'bg-coral/15 text-coral';
  return 'bg-ink-5 text-ink';
}

function websiteHref(url: string) {
  const t = url.trim();
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

type Kind = 'vendor' | 'organizer';

export function DirectoryProfileDetailView({
  kind,
  row,
}: {
  kind: Kind;
  row: AdminProfileDirectoryRow;
}) {
  const { t } = useTranslation(['approvals', 'common']);
  const locale = getCurrentLocale();
  const heroFallback = kind === 'vendor' ? HERO_VENDOR : HERO_ORGANIZER;
  const hero = row.profileImageUrl ?? heroFallback;
  const locationLine = formatGeoLocationLine(
    {
      city: row.city,
      cityDetail: row.cityDetail,
      country: row.country,
      regionDetail: row.regionDetail,
    },
    locale,
  );
  const backPath = kind === 'vendor' ? '/approvals/vendors' : '/approvals/organizers';

  const chips: { key: string; label: string }[] = [];
  if (row.slug) chips.push({ key: 'slug', label: t('directoryDetail.slugChip', { slug: row.slug }) });
  if (row.coverageArea)
    chips.push({ key: 'coverage', label: row.coverageArea });
  if (
    row.availabilityStatus &&
    row.availabilityStatus.toLowerCase() !== (row.status ?? '').toLowerCase()
  ) {
    chips.push({
      key: 'avail',
      label: t('directoryDetail.availabilityChip', { status: row.availabilityStatus }),
    });
  }

  const bioText = row.bio?.trim() || t('directoryDetail.noBiography');

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <Link
            to={backPath}
            className="text-[13px] font-bold text-coral hover:underline"
          >
            {kind === 'vendor' ? t('directoryDetail.backToVendors') : t('directoryDetail.backToOrganizers')}
          </Link>
          <div className="mt-4 overflow-hidden rounded-[32px] border border-ink-10 shadow-card-lg">
            <div className="grid gap-0 md:grid-cols-[220px_1fr]">
              <div className="relative h-64 bg-ink-5 md:h-auto">
                <img src={hero} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="space-y-4 p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-ink-40">
                      {kind === 'vendor' ? t('directoryDetail.vendorDossier') : t('directoryDetail.organizerDossier')}
                    </p>
                    <h1 className="mt-1 text-3xl font-extrabold text-ink">
                      {row.displayName}
                    </h1>
                    {row.slug ? (
                      <p className="mt-1 font-mono text-[14px] font-semibold text-ink-60">
                        {row.slug}
                      </p>
                    ) : null}
                  </div>
                  {row.status ? (
                    <span
                      className={cn(
                        'rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide',
                        statusTone(row.status),
                      )}
                    >
                      {row.status}
                    </span>
                  ) : null}
                </div>
                {chips.length ? (
                  <div className="flex flex-wrap gap-2">
                    {chips.map((c) => (
                      <span
                        key={c.key}
                        className="rounded-full bg-ink-5 px-3 py-1 text-[12px] font-bold text-ink"
                      >
                        {c.label}
                      </span>
                    ))}
                  </div>
                ) : null}
                <p className="text-[14px] leading-relaxed text-ink-60">
                  {bioText}
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-ink-10 bg-surface-tint p-4">
                    <p className="text-[10px] font-extrabold uppercase tracking-wide text-ink-40">
                      {t('directoryDetail.bookings')}
                    </p>
                    <p className="mt-1 font-mono text-2xl font-black text-ink">
                      {row.completedBookings !== undefined
                        ? row.completedBookings
                        : t('common:none')}
                    </p>
                    <p className="text-[12px] font-semibold text-ink-60">
                      {t('directoryDetail.completedOnPlatform')}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-ink-10 bg-surface-tint p-4">
                    <p className="text-[10px] font-extrabold uppercase tracking-wide text-ink-40">
                      {t('directoryDetail.rating')}
                    </p>
                    <p className="mt-1 font-mono text-2xl font-black text-coral">
                      {row.ratingAverage !== undefined
                        ? `${row.ratingAverage.toFixed(1)} ★`
                        : t('common:none')}
                    </p>
                    <p className="text-[12px] font-semibold text-ink-60">
                      {t('directoryDetail.aggregateReviews')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Card className="rounded-3xl border-ink-10 shadow-card-sm">
            <CardHeader>
              <CardTitle className="text-lg font-extrabold">
                {t('directoryDetail.contactPresence')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-[14px]">
              {row.email ? (
                <p className="font-bold text-ink">{row.email}</p>
              ) : null}
              {row.linkedUserId ? (
                <p className="text-[13px] font-semibold text-ink-60">
                  <span className="font-bold text-ink">{t('directoryDetail.linkedUserId')}</span>
                  <span className="ml-2 font-mono text-ink">
                    {row.linkedUserId}
                  </span>
                </p>
              ) : null}
              {!row.email && !row.linkedUserId ? (
                <p className="text-[13px] font-semibold text-ink-60">
                  {t('directoryDetail.noEmailOrUser')}
                </p>
              ) : null}
              {row.websiteUrl ? (
                <p className="inline-flex items-center gap-2 font-semibold text-ink-60">
                  <Globe size={16} className="text-coral" />
                  <a
                    href={websiteHref(row.websiteUrl)}
                    className="font-bold text-coral hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {row.websiteUrl}
                  </a>
                </p>
              ) : null}
              {row.instagramHandle ? (
                <p className="inline-flex items-center gap-2 font-semibold text-ink-60">
                  <Instagram size={16} className="text-coral" />
                  <span className="font-bold text-ink">
                    @
                    {row.instagramHandle.replace(/^@/, '')}
                  </span>
                </p>
              ) : null}
              {locationLine ? (
                <p className="inline-flex items-center gap-2 text-ink-60">
                  {kind === 'vendor' ? (
                    <Store size={16} className="text-coral" />
                  ) : (
                    <Building2 size={16} className="text-coral" />
                  )}
                  {locationLine}
                </p>
              ) : null}
              {row.coverageArea && kind === 'vendor' ? (
                <p className="inline-flex items-start gap-2 text-ink-60">
                  <MapPin
                    size={16}
                    className="mt-0.5 shrink-0 text-coral"
                  />
                  <span>
                    <span className="font-bold text-ink">{t('directoryDetail.coverage')}</span>{' '}
                    {row.coverageArea}
                  </span>
                </p>
              ) : null}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-ink-10 shadow-card-sm">
            <CardHeader>
              <CardTitle className="text-lg font-extrabold">
                {t('directoryDetail.directoryMetadata')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-[14px] text-ink-60">
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-ink-10 bg-surface-tint px-4 py-3">
                <span className="font-bold text-ink">{t('directoryDetail.profileId')}</span>
                <span className="font-mono text-[13px]">{row.id}</span>
              </div>
              {row.updatedAt ? (
                <p className="inline-flex items-center gap-2">
                  <Calendar size={16} className="text-coral" />
                  <span className="font-bold text-ink">{t('directoryDetail.updated')}</span>
                  {formatDateTime(row.updatedAt)}
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
