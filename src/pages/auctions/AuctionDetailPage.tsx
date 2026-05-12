import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { notifyError, notifySuccess } from '@/lib/notify';
import type { AdminAuctionPartySummary, AdminAuctionStatus } from '@/schemas/auction.schema';
import { useFinalizeAuctionMutation, useGetAuctionQuery } from '@/services/adminApi';
import type { ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';

function canFinalizeListing(status: AdminAuctionStatus): boolean {
  return status === 'live';
}

function fmtMoney(n: number | undefined, currency: string | undefined): string {
  if (n === undefined) return '—';
  return `${n.toLocaleString()} ${currency ?? 'SAR'}`;
}

function fmtDt(iso: string | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString();
}

function DetailLine({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-ink-5 py-2.5 last:border-0 sm:flex-row sm:items-baseline sm:gap-6">
      <dt className="w-44 shrink-0 text-[11px] font-bold uppercase tracking-wide text-ink-40">{label}</dt>
      <dd className="min-w-0 flex-1 text-[14px] text-ink">{children}</dd>
    </div>
  );
}

function PartyCard({ title, party }: { title: string; party: AdminAuctionPartySummary }) {
  return (
    <Card className="rounded-3xl border-ink-10 shadow-card-sm">
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5">
        <p className="text-[15px] font-semibold text-ink">{party.fullName}</p>
        {party.email ? (
          <p className="text-[14px] text-ink-60">
            <span className="text-ink-40">Email</span> · {party.email}
          </p>
        ) : null}
        {party.phone ? (
          <p className="font-mono text-[13px] text-ink-60">
            <span className="text-ink-40">Phone</span> · {party.phone}
          </p>
        ) : null}
        <p className="font-mono text-[12px] text-ink-40">User #{party.id}</p>
      </CardContent>
    </Card>
  );
}

export function AuctionDetailPage() {
  const { id = '' } = useParams();
  const q = useGetAuctionQuery(id, { skip: !id });
  const [finalize, finalizeState] = useFinalizeAuctionMutation();

  if (q.isLoading) return <p className="text-ink-60">Loading…</p>;
  if (!q.data || q.isError) {
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
  const cur = a.currency ?? 'SAR';
  const hasDetail =
    a.eventSummary ||
    a.ticketSummary ||
    a.seller ||
    a.buyer ||
    (a.ledgerTransactions && a.ledgerTransactions.length > 0);

  return (
    <div className="space-y-6">
      <div>
        <Link to="/auctions" className="text-[13px] font-semibold text-coral hover:underline">
          ← Auctions
        </Link>
        <h1 className="mt-2 text-3xl font-extrabold text-ink">{a.title}</h1>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[13px] text-ink-60">
          {a.listingCode ? (
            <span>
              Code <span className="font-mono font-semibold text-ink">{a.listingCode}</span>
            </span>
          ) : null}
          <span>
            Id <span className="font-mono font-semibold text-ink">{a.id}</span>
          </span>
          <span className="capitalize">Status · {a.status}</span>
        </div>
        {canFinalizeListing(a.status) ? (
          <p className="mt-2 max-w-2xl text-[13px] text-ink-50">
            Finalize sends an empty <span className="font-mono">POST</span> to the listing finalize endpoint (expects
            active / live state on the API).
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-3xl border-ink-10 shadow-card-sm">
          <CardHeader>
            <CardTitle className="text-sm">Seller (listing)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[14px] font-semibold text-ink">{a.organizerName || '—'}</p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-ink-10 shadow-card-sm">
          <CardHeader>
            <CardTitle className="text-sm">Sale price ({cur})</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-2xl font-black text-ink">{a.highBidSar.toLocaleString()}</p>
            {a.salePriceSar !== undefined && a.salePriceSar !== a.highBidSar ? (
              <p className="mt-1 text-[12px] text-ink-50">Recorded sale · {a.salePriceSar.toLocaleString()}</p>
            ) : null}
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-ink-10 shadow-card-sm">
          <CardHeader>
            <CardTitle className="text-sm">Listing ends</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[14px] font-semibold text-ink">{fmtDt(a.endsAt)}</p>
            {a.startsAt ? <p className="mt-1 text-[12px] text-ink-50">Started {fmtDt(a.startsAt)}</p> : null}
          </CardContent>
        </Card>
      </div>

      {(a.originalPriceSar !== undefined ||
        a.commissionPct !== undefined ||
        a.commissionAmountSar !== undefined ||
        a.sellerProceedsSar !== undefined) && (
        <Card className="rounded-3xl border-ink-10 shadow-card-sm">
          <CardHeader>
            <CardTitle className="text-lg">Pricing & fees</CardTitle>
          </CardHeader>
          <CardContent>
            <dl>
              <DetailLine label="Original list">{fmtMoney(a.originalPriceSar, cur)}</DetailLine>
              <DetailLine label="Sale amount">{fmtMoney(a.salePriceSar ?? a.highBidSar, cur)}</DetailLine>
              <DetailLine label="Commission %">
                {a.commissionPct !== undefined ? `${a.commissionPct}%` : '—'}
              </DetailLine>
              <DetailLine label="Commission">{fmtMoney(a.commissionAmountSar, cur)}</DetailLine>
              <DetailLine label="Seller proceeds">{fmtMoney(a.sellerProceedsSar, cur)}</DetailLine>
            </dl>
          </CardContent>
        </Card>
      )}

      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <dl>
            <DetailLine label="Listing start">{fmtDt(a.startsAt)}</DetailLine>
            <DetailLine label="Listing end">{fmtDt(a.endsAt)}</DetailLine>
            <DetailLine label="Sold at">{fmtDt(a.soldAt)}</DetailLine>
            <DetailLine label="Cancelled">{fmtDt(a.cancelledAt)}</DetailLine>
            {a.cancellationReason ? (
              <DetailLine label="Cancellation reason">
                <span className="text-ink-60">{a.cancellationReason}</span>
              </DetailLine>
            ) : null}
          </dl>
        </CardContent>
      </Card>

      {(a.seatLabelCache || a.ticketTypeCache) && (
        <Card className="rounded-3xl border-ink-10 shadow-card-sm">
          <CardHeader>
            <CardTitle className="text-sm">Seat / ticket</CardTitle>
          </CardHeader>
          <CardContent>
            <dl>
              {a.seatLabelCache ? <DetailLine label="Seat">{a.seatLabelCache}</DetailLine> : null}
              {a.ticketTypeCache ? <DetailLine label="Ticket type">{a.ticketTypeCache}</DetailLine> : null}
            </dl>
          </CardContent>
        </Card>
      )}

      {hasDetail ? (
        <div className="space-y-4">
          <h2 className="text-lg font-extrabold text-ink">Linked records</h2>

          {a.eventSummary ? (
            <Card className="rounded-3xl border-ink-10 shadow-card-sm">
              <CardHeader>
                <CardTitle className="text-lg">Event</CardTitle>
              </CardHeader>
              <CardContent>
                <dl>
                  {a.eventSummary.title ? <DetailLine label="Title">{a.eventSummary.title}</DetailLine> : null}
                  {a.eventSummary.code ? (
                    <DetailLine label="Event code">
                      <span className="font-mono">{a.eventSummary.code}</span>
                    </DetailLine>
                  ) : null}
                  {a.eventSummary.status ? (
                    <DetailLine label="Event status">
                      <span className="capitalize">{a.eventSummary.status}</span>
                    </DetailLine>
                  ) : null}
                  {a.eventSummary.venueName ? <DetailLine label="Venue">{a.eventSummary.venueName}</DetailLine> : null}
                  {a.eventSummary.venueAddress ? (
                    <DetailLine label="Address">{a.eventSummary.venueAddress}</DetailLine>
                  ) : null}
                  {a.eventSummary.capacity !== undefined ? (
                    <DetailLine label="Capacity">{a.eventSummary.capacity.toLocaleString()}</DetailLine>
                  ) : null}
                  {a.eventSummary.startsAt ? (
                    <DetailLine label="Event starts">{fmtDt(a.eventSummary.startsAt)}</DetailLine>
                  ) : null}
                  {a.eventSummary.endsAt ? (
                    <DetailLine label="Event ends">{fmtDt(a.eventSummary.endsAt)}</DetailLine>
                  ) : null}
                  {a.eventSummary.timezone ? (
                    <DetailLine label="Timezone">
                      <span className="font-mono text-[13px]">{a.eventSummary.timezone}</span>
                    </DetailLine>
                  ) : null}
                </dl>
              </CardContent>
            </Card>
          ) : null}

          {a.ticketSummary ? (
            <Card className="rounded-3xl border-ink-10 shadow-card-sm">
              <CardHeader>
                <CardTitle className="text-lg">Ticket</CardTitle>
              </CardHeader>
              <CardContent>
                <dl>
                  <DetailLine label="Ticket code">
                    <span className="font-mono font-semibold">{a.ticketSummary.code}</span>
                  </DetailLine>
                  {a.ticketSummary.status ? (
                    <DetailLine label="Status">
                      <span className="capitalize">{a.ticketSummary.status}</span>
                    </DetailLine>
                  ) : null}
                  {a.ticketSummary.pricePaidSar !== undefined ? (
                    <DetailLine label="Price paid">{fmtMoney(a.ticketSummary.pricePaidSar, cur)}</DetailLine>
                  ) : null}
                  {a.ticketSummary.orderReference ? (
                    <DetailLine label="Order reference">
                      <span className="font-mono">{a.ticketSummary.orderReference}</span>
                    </DetailLine>
                  ) : null}
                  {a.ticketSummary.orderId ? (
                    <DetailLine label="Order">
                      <Link
                        to={`/orders/${encodeURIComponent(a.ticketSummary.orderId)}`}
                        className="font-mono font-semibold text-coral hover:underline"
                      >
                        Open order #{a.ticketSummary.orderId}
                      </Link>
                    </DetailLine>
                  ) : null}
                </dl>
              </CardContent>
            </Card>
          ) : null}

          {(a.seller || a.buyer) && (
            <div className="grid gap-4 md:grid-cols-2">
              {a.seller ? <PartyCard title="Seller account" party={a.seller} /> : null}
              {a.buyer ? <PartyCard title="Buyer account" party={a.buyer} /> : null}
            </div>
          )}

          {a.ledgerTransactions && a.ledgerTransactions.length > 0 ? (
            <Card className="rounded-3xl border-ink-10 shadow-card-sm">
              <CardHeader>
                <CardTitle className="text-lg">Ledger (commission & payout)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="admin-table-scroll">
                  <table className="w-full min-w-[560px] text-left text-[14px]">
                    <thead className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
                      <tr>
                        <th className="px-3 py-2">Type</th>
                        <th className="px-3 py-2">Amount</th>
                        <th className="px-3 py-2">When</th>
                      </tr>
                    </thead>
                    <tbody>
                      {a.ledgerTransactions.map((row) => (
                        <tr key={row.id} className="border-t border-ink-10">
                          <td className="px-3 py-2.5 font-mono text-[13px] text-ink">{row.transactionType}</td>
                          <td className="px-3 py-2.5 font-mono text-ink">
                            {row.amount.toLocaleString()} {row.currency}
                          </td>
                          <td className="px-3 py-2.5 text-[13px] text-ink-60">{fmtDt(row.occurredAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      ) : null}

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
