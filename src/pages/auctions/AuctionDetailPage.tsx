import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { notifyError, notifySuccess } from '@/lib/notify';
import type { AdminAuctionStatus } from '@/schemas/auction.schema';
import { useFinalizeAuctionMutation, useGetAuctionQuery } from '@/services/adminApi';
import { Link, useParams } from 'react-router-dom';

function canFinalizeListing(status: AdminAuctionStatus): boolean {
  return status === 'live';
}

export function AuctionDetailPage() {
  const { id = '' } = useParams();
  const q = useGetAuctionQuery(id, { skip: !id });
  const [finalize, finalizeState] = useFinalizeAuctionMutation();

  if (q.isLoading) return <p className="text-ink-60">Loading…</p>;
  if (!q.data) {
    return (
      <div className="rounded-3xl border border-ink-10 bg-white p-8">
        <p className="font-semibold text-ink">Auction not found.</p>
        <Link to="/auctions" className="mt-4 inline-block text-coral hover:underline">
          Back to auctions
        </Link>
      </div>
    );
  }

  const a = q.data;

  return (
    <div className="space-y-6">
      <div>
        <Link to="/auctions" className="text-[13px] font-semibold text-coral hover:underline">
          ← Auctions
        </Link>
        <h1 className="mt-2 text-3xl font-extrabold text-ink">{a.title}</h1>
        <p className="mt-1 font-mono text-[13px] text-ink-60">{a.id}</p>
        <p className="mt-2 text-[14px] capitalize text-ink-60">Status: {a.status}</p>
        <p className="mt-2 max-w-2xl text-[13px] text-ink-60">
          Finalize calls <span className="font-mono text-ink">POST …/auctions/{'{id}'}/finalize</span> with an empty body.
          The API returns <span className="font-mono text-ink">422</span> unless the listing status is{' '}
          <span className="font-mono text-ink">active</span> (mapped here as <span className="font-mono text-ink">live</span>).
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-3xl border-ink-10 shadow-card-sm">
          <CardHeader>
            <CardTitle className="text-sm">Organizer</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[14px] font-semibold text-ink">{a.organizerName || '—'}</p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-ink-10 shadow-card-sm">
          <CardHeader>
            <CardTitle className="text-sm">High bid (SAR)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-2xl font-black text-ink">{a.highBidSar.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-ink-10 shadow-card-sm">
          <CardHeader>
            <CardTitle className="text-sm">Ends</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[14px] font-semibold text-ink">{new Date(a.endsAt).toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {canFinalizeListing(a.status) ? (
        <Card className="rounded-3xl border-ink-10 shadow-card-sm">
          <CardHeader>
            <CardTitle className="text-lg">Finalize</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              variant="dark"
              loading={finalizeState.isLoading}
              onClick={async () => {
                if (!window.confirm('Finalize this auction?')) return;
                try {
                  await finalize(a.id).unwrap();
                  notifySuccess('Auction finalized.');
                } catch {
                  notifyError('Finalize failed (check listing status is active / live).');
                }
              }}
            >
              Finalize listing
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
