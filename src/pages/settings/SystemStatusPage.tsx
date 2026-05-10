import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useGetAdminHealthQuery, useGetAdminVersionQuery } from '@/services/adminApi';

export function SystemStatusPage() {
  const healthQ = useGetAdminHealthQuery();
  const versionQ = useGetAdminVersionQuery();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-40">Platform</p>
        <h1 className="text-3xl font-extrabold text-ink">System status</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-ink-60">
          <span className="font-mono text-ink">GET /api/v1/admin/health</span> and{' '}
          <span className="font-mono text-ink">GET /api/v1/admin/version</span> — read-only operational snapshots when
          API read mode and a bearer token are available.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => void healthQ.refetch()}>
          Refresh health
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => void versionQ.refetch()}>
          Refresh version
        </Button>
      </div>

      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">Health</CardTitle>
        </CardHeader>
        <CardContent>
          {healthQ.isLoading ? <p className="text-sm text-ink-60">Loading…</p> : null}
          {healthQ.isError ? (
            <p className="text-sm font-semibold text-coral">Could not load health.</p>
          ) : null}
          {healthQ.data ? (
            <div className="space-y-3">
              <p className="text-[15px] text-ink">
                Status:{' '}
                <span className="font-mono font-semibold capitalize text-ink">{healthQ.data.status}</span>
              </p>
              {healthQ.data.message ? <p className="text-[14px] text-ink-60">{healthQ.data.message}</p> : null}
              {healthQ.data.checkedAt ? (
                <p className="font-mono text-[13px] text-ink-60">
                  Checked: {new Date(healthQ.data.checkedAt).toLocaleString()}
                </p>
              ) : null}
              <pre className="max-h-80 overflow-auto rounded-xl bg-ink-5 p-4 font-mono text-[12px] text-ink">
                {JSON.stringify(healthQ.data, null, 2)}
              </pre>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">Version</CardTitle>
        </CardHeader>
        <CardContent>
          {versionQ.isLoading ? <p className="text-sm text-ink-60">Loading…</p> : null}
          {versionQ.isError ? (
            <p className="text-sm font-semibold text-coral">Could not load version.</p>
          ) : null}
          {versionQ.data ? (
            <div className="space-y-3">
              <dl className="grid gap-3 text-[14px] sm:grid-cols-2">
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-wide text-ink-40">Version</dt>
                  <dd className="font-mono font-semibold text-ink">{versionQ.data.version}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-wide text-ink-40">Commit</dt>
                  <dd className="font-mono text-ink-60">{versionQ.data.commit ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-wide text-ink-40">Build</dt>
                  <dd className="font-mono text-ink-60">
                    {versionQ.data.buildDate ? new Date(versionQ.data.buildDate).toLocaleString() : '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-wide text-ink-40">Environment</dt>
                  <dd className="text-ink-60">{versionQ.data.environment ?? '—'}</dd>
                </div>
              </dl>
              <pre className="max-h-64 overflow-auto rounded-xl bg-ink-5 p-4 font-mono text-[12px] text-ink">
                {JSON.stringify(versionQ.data, null, 2)}
              </pre>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
