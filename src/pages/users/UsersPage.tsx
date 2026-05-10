import { ListFiltersBar } from '@/components/admin/ListFiltersBar';
import { filterSelectClassName } from '@/lib/adminFilters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { rowMatchesSearch } from '@/lib/listQuery';
import type { AdminUserRow } from '@/schemas/user.schema';
import { useGetUsersQuery } from '@/services/adminApi';
import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';

export function UsersPage() {
  const { data, isLoading } = useGetUsersQuery();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<'all' | AdminUserRow['role']>('all');
  const [suspended, setSuspended] = useState<'all' | 'yes' | 'no'>('all');

  const filtered = useMemo(() => {
    return (data ?? []).filter((row) => {
      if (role !== 'all' && row.role !== role) return false;
      if (suspended === 'yes' && !row.suspended) return false;
      if (suspended === 'no' && row.suspended) return false;
      return rowMatchesSearch(search, [row.displayName, row.email, row.id, row.role]);
    });
  }, [data, search, role, suspended]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-40">Directory</p>
        <h1 className="text-3xl font-extrabold text-ink">Users</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-ink-60">
          View accounts, roles, and suspension state. Role history is final after approval in production.
        </p>
      </div>
      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">All users</CardTitle>
        </CardHeader>
        <CardContent>
          <ListFiltersBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search name, email, id…"
            className="mb-4"
          >
            <select className={filterSelectClassName()} value={role} onChange={(e) => setRole(e.target.value as typeof role)}>
              <option value="all">All roles</option>
              <option value="guest">Guest</option>
              <option value="talent">Talent</option>
              <option value="vendor">Vendor</option>
              <option value="organizer">Organizer</option>
            </select>
            <select
              className={filterSelectClassName()}
              value={suspended}
              onChange={(e) => setSuspended(e.target.value as typeof suspended)}
            >
              <option value="all">Suspended: any</option>
              <option value="no">Active accounts</option>
              <option value="yes">Suspended only</option>
            </select>
          </ListFiltersBar>
          {isLoading ? <p className="text-sm text-ink-60">Loading…</p> : null}
          {!isLoading && filtered.length === 0 ? (
            <p className="mb-3 text-sm font-semibold text-ink-60">No users match your search and filters.</p>
          ) : null}
          <div className="admin-table-scroll">
            <table className="w-full min-w-[640px] text-left text-[14px]">
              <thead className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Suspended</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} className="border-t border-ink-10 hover:bg-surface-tint">
                    <td className="px-4 py-3 font-semibold text-ink">{row.displayName}</td>
                    <td className="px-4 py-3 text-ink-60">{row.email}</td>
                    <td className="px-4 py-3 capitalize text-ink-60">{row.role}</td>
                    <td className="px-4 py-3">{row.suspended ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/users/${row.id}`} className="font-semibold text-coral hover:underline">
                        View
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
