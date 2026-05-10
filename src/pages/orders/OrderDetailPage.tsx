import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { notifyError, notifySuccess } from '@/lib/notify';
import { useForceRefundOrderMutation, useGetOrderQuery } from '@/services/adminApi';
import { Link, useParams } from 'react-router-dom';

export function OrderDetailPage() {
  const { id = '' } = useParams();
  const q = useGetOrderQuery(id, { skip: !id });
  const [forceRefund, refundState] = useForceRefundOrderMutation();

  if (q.isLoading) return <p className="text-ink-60">Loading…</p>;
  if (!q.data) {
    return (
      <div className="rounded-3xl border border-ink-10 bg-white p-8">
        <p className="font-semibold text-ink">Order not found.</p>
        <Link to="/orders" className="mt-4 inline-block text-coral hover:underline">
          Back to orders
        </Link>
      </div>
    );
  }

  const o = q.data;
  const canForceRefund = o.status === 'paid' || o.status === 'completed' || o.status === 'processing';

  return (
    <div className="space-y-6">
      <div>
        <Link to="/orders" className="text-[13px] font-semibold text-coral hover:underline">
          ← Orders
        </Link>
        <h1 className="mt-2 font-mono text-2xl font-extrabold text-ink">{o.id}</h1>
        <p className="text-[14px] capitalize text-ink-60">{o.status}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-3xl border-ink-10 shadow-card-sm">
          <CardHeader>
            <CardTitle className="text-sm">Total (SAR)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-3xl font-black text-ink">{o.totalSar.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-ink-10 shadow-card-sm">
          <CardHeader>
            <CardTitle className="text-sm">Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-3xl font-black text-ink">{o.ticketCount}</p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-ink-10 shadow-card-sm">
          <CardHeader>
            <CardTitle className="text-sm">Placed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[14px] font-semibold text-ink">{new Date(o.createdAt).toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">Buyer & event</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-[14px]">
          <p>
            <span className="font-semibold text-ink-60">Buyer: </span>
            <span className="text-ink">{o.buyerLabel}</span>
            {o.buyerEmail ? <span className="text-ink-60"> ({o.buyerEmail})</span> : null}
          </p>
          <p>
            <span className="font-semibold text-ink-60">Event: </span>
            <span className="text-ink">{o.eventTitle}</span>
            {o.eventId ? <span className="font-mono text-ink-60"> · {o.eventId}</span> : null}
          </p>
          {o.paymentReference ? (
            <p>
              <span className="font-semibold text-ink-60">Payment ref: </span>
              <span className="font-mono text-ink">{o.paymentReference}</span>
            </p>
          ) : null}
          {o.notes ? (
            <p className="rounded-xl border border-ink-10 bg-surface-tint px-4 py-3 text-ink-60">{o.notes}</p>
          ) : null}
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">Force refund</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-[14px] text-ink-60">
            Calls{' '}
            <span className="font-mono text-ink">POST /api/v1/admin/orders/{'{id}'}/force-refund</span>. Use only when
            policy allows a full reversal outside the normal buyer flow.
          </p>
          {canForceRefund ? (
            <Button
              type="button"
              variant="outline"
              disabled={refundState.isLoading}
              onClick={async () => {
                if (!window.confirm('Run force refund for this order?')) return;
                try {
                  await forceRefund(o.id).unwrap();
                  notifySuccess('Refund processed.');
                } catch {
                  notifyError('Force refund failed.');
                }
              }}
            >
              {refundState.isLoading ? 'Processing…' : 'Force refund'}
            </Button>
          ) : (
            <p className="text-[14px] font-medium text-ink-60">
              This order is not in a state that supports force refund from the admin UI.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
