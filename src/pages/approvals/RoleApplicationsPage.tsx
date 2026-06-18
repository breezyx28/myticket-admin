import { ListFiltersBar } from '@/components/admin/ListFiltersBar';
import { filterSelectClassName } from '@/lib/adminFilters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateTime } from '@/lib/localeFormat';
import { rowMatchesSearch } from '@/lib/listQuery';
import type { RoleApplication } from '@/schemas/roleApplication.schema';
import { useGetRoleApplicationsQuery } from '@/services/adminApi';
import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function RoleApplicationsPage() {
  const { t } = useTranslation('approvals');
  const { data, isLoading } = useGetRoleApplicationsQuery();
  const [search, setSearch] = useState('');
  const [type, setType] = useState<'all' | RoleApplication['type']>('all');
  const [status, setStatus] = useState<'all' | RoleApplication['status']>('all');

  const filtered = useMemo(() => {
    return (data ?? []).filter((row) => {
      if (type !== 'all' && row.type !== type) return false;
      if (status !== 'all' && row.status !== status) return false;
      return rowMatchesSearch(search, [row.applicantName, row.email, row.documentsSummary, row.id, row.type]);
    });
  }, [data, search, type, status]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-40">{t('kicker')}</p>
        <h1 className="text-3xl font-extrabold text-ink">{t('roleApplications.title')}</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-ink-60">{t('roleApplications.description')}</p>
      </div>
      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">{t('roleApplications.queue')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ListFiltersBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder={t('roleApplications.searchPlaceholder')}
            className="mb-4"
          >
            <select className={filterSelectClassName()} value={type} onChange={(e) => setType(e.target.value as typeof type)}>
              <option value="all">{t('type.all')}</option>
              <option value="talent">{t('type.talent')}</option>
              <option value="vendor">{t('type.vendor')}</option>
              <option value="organizer">{t('type.organizer')}</option>
            </select>
            <select
              className={filterSelectClassName()}
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
            >
              <option value="all">{t('filter.allStatuses')}</option>
              <option value="pending">{t('status.pending')}</option>
              <option value="approved">{t('status.approved')}</option>
              <option value="rejected">{t('status.rejected')}</option>
            </select>
          </ListFiltersBar>
          {isLoading ? <p className="text-sm text-ink-60">{t('loading')}</p> : null}
          {!isLoading && filtered.length === 0 ? (
            <p className="mb-3 text-sm font-semibold text-ink-60">{t('roleApplications.empty')}</p>
          ) : null}
          <div className="admin-table-scroll">
            <table className="w-full min-w-[640px] text-left text-[14px]">
              <thead className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
                <tr>
                  <th className="px-4 py-3">{t('roleApplications.applicant')}</th>
                  <th className="px-4 py-3">{t('roleApplications.type')}</th>
                  <th className="px-4 py-3">{t('roleApplications.status')}</th>
                  <th className="px-4 py-3">{t('roleApplications.submitted')}</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} className="border-t border-ink-10 hover:bg-surface-tint">
                    <td className="px-4 py-3 font-semibold text-ink">{row.applicantName}</td>
                    <td className="px-4 py-3 capitalize text-ink-60">{t(`type.${row.type}`)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          row.status === 'pending'
                            ? 'rounded-full bg-amber/30 px-2 py-0.5 text-[11px] font-bold uppercase text-ink'
                            : row.status === 'approved'
                              ? 'rounded-full bg-lime/40 px-2 py-0.5 text-[11px] font-bold uppercase text-ink'
                              : 'rounded-full bg-coral/20 px-2 py-0.5 text-[11px] font-bold uppercase text-ink'
                        }
                      >
                        {t(`status.${row.status}`)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-60">{formatDateTime(row.submittedAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/approvals/roles/${row.id}`} className="font-semibold text-coral hover:underline">
                        {t('roleApplications.review')}
                      </Link>
                    </td>
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
