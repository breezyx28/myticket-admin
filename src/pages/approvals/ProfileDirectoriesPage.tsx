import { ListFiltersBar } from '@/components/admin/ListFiltersBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { filterSelectClassName } from '@/lib/adminFilters';
import { rowMatchesSearch } from '@/lib/listQuery';
import {
  useGetOrganizerProfilesQuery,
  useGetVendorProfilesQuery,
} from '@/services/adminApi';
import { useMemo, useState } from 'react';

type Kind = 'vendor' | 'organizer';

const COPY: Record<
  Kind,
  { title: string; kicker: string; blurb: string; path: string; empty: string }
> = {
  vendor: {
    kicker: 'Approvals',
    title: 'Vendor profiles',
    blurb:
      'Directory rows from the admin vendors profile list. Payload shapes vary by backend; mappers accept common envelopes and field aliases.',
    path: 'GET /api/v1/admin/profiles/vendors',
    empty: 'No vendor profiles match your filters.',
  },
  organizer: {
    kicker: 'Approvals',
    title: 'Organizer profiles',
    blurb:
      'Directory rows from the admin organizers profile list. Use alongside finance KYC when you need document-level review.',
    path: 'GET /api/v1/admin/profiles/organizers',
    empty: 'No organizer profiles match your filters.',
  },
};

function ProfileDirectoryBody({ kind }: { kind: Kind }) {
  const vendorQ = useGetVendorProfilesQuery(undefined, { skip: kind !== 'vendor' });
  const organizerQ = useGetOrganizerProfilesQuery(undefined, { skip: kind !== 'organizer' });
  const { data, isLoading } = kind === 'vendor' ? vendorQ : organizerQ;
  const c = COPY[kind];

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | string>('all');

  const statusOptions = useMemo(() => {
    const set = new Set<string>();
    for (const row of data ?? []) {
      if (row.status) set.add(row.status);
    }
    return Array.from(set).sort();
  }, [data]);

  const filtered = useMemo(() => {
    return (data ?? []).filter((row) => {
      if (status !== 'all' && (row.status ?? '') !== status) return false;
      return rowMatchesSearch(search, [
        row.id,
        row.displayName,
        row.email ?? '',
        row.slug ?? '',
        row.city ?? '',
        row.country ?? '',
        row.status ?? '',
      ]);
    });
  }, [data, search, status]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-40">{c.kicker}</p>
        <h1 className="text-3xl font-extrabold text-ink">{c.title}</h1>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-60">{c.blurb}</p>
        <p className="mt-2 font-mono text-[12px] text-ink-50">{c.path}</p>
      </div>

      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <ListFiltersBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search name, email, slug, city, id…"
            className="mb-4"
          >
            <select
              className={filterSelectClassName()}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="all">All statuses</option>
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </ListFiltersBar>
          {isLoading ? <p className="text-sm text-ink-60">Loading…</p> : null}
          {!isLoading && filtered.length === 0 ? (
            <p className="mb-3 text-sm font-semibold text-ink-60">{c.empty}</p>
          ) : null}
          <div className="admin-table-scroll">
            <table className="w-full min-w-[880px] text-left text-[14px]">
              <thead className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
                <tr>
                  <th className="pb-3 pr-4">Name</th>
                  <th className="pb-3 pr-4">Email</th>
                  <th className="pb-3 pr-4">Slug</th>
                  <th className="pb-3 pr-4">Location</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-10">
                {filtered.map((row) => (
                  <tr key={row.id} className="align-top">
                    <td className="py-3 pr-4 font-semibold text-ink">{row.displayName}</td>
                    <td className="py-3 pr-4 text-ink-60">{row.email ?? '—'}</td>
                    <td className="py-3 pr-4 font-mono text-[13px] text-ink-60">{row.slug ?? '—'}</td>
                    <td className="py-3 pr-4 text-ink-60">
                      {[row.city, row.country].filter(Boolean).join(', ') || '—'}
                    </td>
                    <td className="py-3 pr-4 text-ink-60">{row.status ?? '—'}</td>
                    <td className="py-3 font-mono text-[12px] text-ink-50">{row.updatedAt ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function VendorProfilesPage() {
  return <ProfileDirectoryBody kind="vendor" />;
}

export function OrganizerProfilesPage() {
  return <ProfileDirectoryBody kind="organizer" />;
}
