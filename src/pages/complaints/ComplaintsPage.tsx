import { ListFiltersBar } from '@/components/admin/ListFiltersBar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { filterSelectClassName } from '@/lib/adminFilters';
import { notifyError, notifySuccess } from '@/lib/notify';
import { rowMatchesSearch } from '@/lib/listQuery';
import type { AdminComplaintStatus } from '@/schemas/complaint.schema';
import {
  useEscalateComplaintMutation,
  useGetComplaintsQuery,
  useResolveComplaintMutation,
  useTriageComplaintMutation,
} from '@/services/adminApi';
import { useMemo, useState } from 'react';

export function ComplaintsPage() {
  const { data, isLoading } = useGetComplaintsQuery();
  const [triage] = useTriageComplaintMutation();
  const [resolve] = useResolveComplaintMutation();
  const [escalate] = useEscalateComplaintMutation();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | AdminComplaintStatus>('all');
  const [busy, setBusy] = useState<{ id: string; kind: 'triage' | 'resolve' | 'escalate' } | null>(null);

  const filtered = useMemo(() => {
    return (data ?? []).filter((row) => {
      if (status !== 'all' && row.status !== status) return false;
      return rowMatchesSearch(search, [
        row.id,
        row.title,
        row.category,
        row.reporterLabel,
        row.targetLabel,
        row.status,
      ]);
    });
  }, [data, search, status]);

  const isBusy = busy !== null;

  async function run(
    id: string,
    kind: 'triage' | 'resolve' | 'escalate',
    okMsg: string,
    exec: () => Promise<unknown>
  ) {
    setBusy({ id, kind });
    try {
      await exec();
      notifySuccess(okMsg);
    } catch {
      notifyError('Action failed.');
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-40">Support</p>
        <h1 className="text-3xl font-extrabold text-ink">Complaints</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-ink-60">
          <span className="font-mono text-ink">GET /api/v1/admin/complaints</span> with triage, resolve, and escalate
          actions aligned to the Postman collection.
        </p>
      </div>

      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <ListFiltersBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search id, title, category, reporter, target…"
            className="mb-4"
          >
            <select
              className={filterSelectClassName()}
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
            >
              <option value="all">All statuses</option>
              <option value="open">Open</option>
              <option value="triaged">Triaged</option>
              <option value="resolved">Resolved</option>
              <option value="escalated">Escalated</option>
              <option value="unknown">Other</option>
            </select>
          </ListFiltersBar>
          {isLoading ? <p className="text-sm text-ink-60">Loading…</p> : null}
          {!isLoading && filtered.length === 0 ? (
            <p className="mb-3 text-sm font-semibold text-ink-60">No complaints match your filters.</p>
          ) : null}
          <div className="admin-table-scroll">
            <table className="w-full min-w-[920px] text-left text-[14px]">
              <thead className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
                <tr>
                  <th className="px-4 py-3">Complaint</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Reporter</th>
                  <th className="px-4 py-3">Target</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Updated</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} className="border-t border-ink-10 hover:bg-surface-tint">
                    <td className="px-4 py-3">
                      <p className="font-mono text-[12px] font-semibold text-ink-60">{row.id}</p>
                      <p className="max-w-[280px] font-medium text-ink">{row.title}</p>
                    </td>
                    <td className="px-4 py-3 text-ink-60">{row.category ?? '—'}</td>
                    <td className="px-4 py-3 text-ink-60">{row.reporterLabel ?? '—'}</td>
                    <td className="px-4 py-3 text-ink-60">{row.targetLabel ?? '—'}</td>
                    <td className="px-4 py-3 capitalize text-ink-60">{row.status}</td>
                    <td className="px-4 py-3 font-mono text-[13px] text-ink-60">
                      {row.updatedAt ? new Date(row.updatedAt).toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {row.status === 'open' ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={isBusy}
                            loading={busy?.id === row.id && busy.kind === 'triage'}
                            onClick={() =>
                              void run(row.id, 'triage', 'Marked as triaged.', () => triage(row.id).unwrap())
                            }
                          >
                            Triage
                          </Button>
                        ) : null}
                        {row.status === 'open' || row.status === 'triaged' ? (
                          <>
                            <Button
                              type="button"
                              size="sm"
                              variant="dark"
                              disabled={isBusy}
                              loading={busy?.id === row.id && busy.kind === 'resolve'}
                              onClick={() => {
                                const note = window.prompt('Optional resolution note for the API body') ?? '';
                                void run(row.id, 'resolve', 'Complaint resolved.', () =>
                                  resolve({ id: row.id, resolutionNote: note.trim() || undefined }).unwrap()
                                );
                              }}
                            >
                              Resolve
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={isBusy}
                              loading={busy?.id === row.id && busy.kind === 'escalate'}
                              onClick={() =>
                                void run(row.id, 'escalate', 'Complaint escalated.', () =>
                                  escalate(row.id).unwrap()
                                )
                              }
                            >
                              Escalate
                            </Button>
                          </>
                        ) : null}
                      </div>
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
