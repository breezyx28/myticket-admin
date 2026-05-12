import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { AdminRefundRow, AdminRefundStatus } from '@/schemas/refund.schema';
import { useGetRefundQuery } from '@/services/adminApi';
import { Link, useParams } from 'react-router-dom';

function statusLabel(s: AdminRefundStatus): string {
  return s === 'unknown' ? 'Other' : s;
}

function humanizeReasonCode(s: string): string {
  const t = s.trim();
  if (!t) return '—';
  return t.replace(/_/g, ' ');
}

function PaymentTransactionCard({ tx }: { tx: NonNullable<AdminRefundRow['paymentTransaction']> }) {
  return (
    <Card className="rounded-3xl border-ink-10 shadow-card-sm md:col-span-2">
      <CardHeader>
        <CardTitle className="text-sm">Payment transaction</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 text-[14px] sm:grid-cols-2">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-ink-40">Gateway</p>
          <p className="mt-0.5 font-semibold text-ink">{tx.gateway ?? '—'}</p>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-ink-40">Gateway ref</p>
          <p className="mt-0.5 font-mono text-[13px] text-ink">{tx.gatewayTransaction ?? '—'}</p>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-ink-40">Amount</p>
          <p className="mt-0.5 font-mono font-semibold text-ink">
            {tx.amount.toLocaleString()} {tx.currency ?? 'SAR'}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-ink-40">Status</p>
          <p className="mt-0.5 capitalize text-ink">{tx.status ?? '—'}</p>
        </div>
        {tx.occurredAt ? (
          <div className="sm:col-span-2">
            <p className="text-[11px] font-bold uppercase tracking-wide text-ink-40">Occurred</p>
            <p className="mt-0.5 font-semibold text-ink">{new Date(tx.occurredAt).toLocaleString()}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function RefundDetailPage() {
  const { id = '' } = useParams();
  const q = useGetRefundQuery(id, { skip: !id });

  if (q.isLoading) return <p className="text-ink-60">Loading…</p>;
  if (!q.data || q.isError) {
    return (
      <div className="rounded-3xl border border-ink-10 bg-white p-8">
        <p className="font-semibold text-ink">Refund not found.</p>
        <Link to="/refunds" className="mt-4 inline-block text-coral hover:underline">
          Back to refunds
        </Link>
      </div>
    );
  }

  const r = q.data;
  const currency = r.currency ?? 'SAR';

  return (
    <div className="space-y-6">
      <div>
        <Link to="/refunds" className="text-[13px] font-semibold text-coral hover:underline">
          ← Refunds
        </Link>
        <h1 className="mt-2 text-3xl font-extrabold text-ink">Refund</h1>
        <p className="mt-1 font-mono text-[13px] text-ink-60">{r.id}</p>
        {r.orderReference ? (
          <p className="mt-1 text-[14px] text-ink-60">
            Order <span className="font-mono font-semibold text-ink">{r.orderReference}</span>
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-3xl border-ink-10 shadow-card-sm">
          <CardHeader>
            <CardTitle className="text-sm">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[14px] capitalize font-semibold text-ink">{statusLabel(r.status)}</p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-ink-10 shadow-card-sm">
          <CardHeader>
            <CardTitle className="text-sm">Refund amount ({currency})</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-2xl font-black text-ink">{r.amountSar.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-ink-10 shadow-card-sm">
          <CardHeader>
            <CardTitle className="text-sm">Buyer / initiator</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[14px] font-semibold text-ink">{r.requestedByLabel || '—'}</p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-ink-10 shadow-card-sm">
          <CardHeader>
            <CardTitle className="text-sm">Created</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[14px] font-semibold text-ink">{new Date(r.createdAt).toLocaleString()}</p>
          </CardContent>
        </Card>
        {r.processedAt ? (
          <Card className="rounded-3xl border-ink-10 shadow-card-sm md:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm">Processed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[14px] font-semibold text-ink">{new Date(r.processedAt).toLocaleString()}</p>
            </CardContent>
          </Card>
        ) : null}
        <Card className="rounded-3xl border-ink-10 shadow-card-sm md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Event</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[14px] text-ink">{r.eventTitle ?? '—'}</p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-ink-10 shadow-card-sm md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Reason</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-[14px] font-semibold capitalize text-ink">{humanizeReasonCode(r.reason)}</p>
            {r.description ? (
              <p className="text-[14px] leading-relaxed text-ink-60">{r.description}</p>
            ) : null}
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-ink-10 shadow-card-sm md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Order</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {r.orderId ? (
              <Link to={`/orders/${r.orderId}`} className="inline-block font-mono font-semibold text-coral hover:underline">
                Open order {r.orderReference ?? `#${r.orderId}`}
              </Link>
            ) : (
              <span className="text-ink-40">—</span>
            )}
          </CardContent>
        </Card>
        {r.paymentTransaction ? <PaymentTransactionCard tx={r.paymentTransaction} /> : null}
      </div>
    </div>
  );
}
