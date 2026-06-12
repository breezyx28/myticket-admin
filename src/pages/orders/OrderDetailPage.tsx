import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { notifyError, notifySuccess } from '@/lib/notify';
import type { AdminOrderDetail } from '@/schemas/order.schema';
import { useForceRefundOrderMutation, useGetOrderQuery } from '@/services/adminApi';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useParams, useSearchParams } from 'react-router-dom';

function statusLabel(s: string): string {
  return s === 'unknown' ? 'Other' : s.replace(/_/g, ' ');
}

function ForceRefundDialog({
  open,
  order,
  loading,
  onClose,
  onConfirm,
}: {
  open: boolean;
  order: AdminOrderDetail;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, loading, onClose]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-ink/55 backdrop-blur-[1px]"
        aria-label="Close dialog"
        disabled={loading}
        onClick={() => {
          if (!loading) onClose();
        }}
      />
      <div
        className="relative z-[101] w-full max-w-md rounded-3xl border border-ink-10 bg-white p-6 shadow-card-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="force-refund-title"
      >
        <div className="flex gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-700">
            <AlertTriangle className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="force-refund-title" className="text-lg font-extrabold text-ink">
              Force refund this order?
            </h2>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-60">
              This refunds <span className="font-semibold text-ink">{order.reference ?? order.id}</span> outside the
              normal buyer flow. Only continue if policy allows and you are ready to record it for audit. This may not
              be reversible.
            </p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline" disabled={loading} onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            className="!bg-red-600 !text-white hover:!bg-red-700 focus-visible:!ring-red-600"
            loading={loading}
            onClick={onConfirm}
          >
            <RotateCcw className="h-4 w-4 shrink-0" aria-hidden />
            Confirm force refund
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export function OrderDetailPage() {
  const { id = '' } = useParams();
  const [searchParams] = useSearchParams();
  const focusTicketId = searchParams.get('ticket')?.trim() || undefined;
  const focusTicketRef = useRef<HTMLTableRowElement | null>(null);
  const q = useGetOrderQuery(id, { skip: !id });
  const [forceRefund, refundState] = useForceRefundOrderMutation();
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);

  useEffect(() => {
    if (!focusTicketId || !focusTicketRef.current) return;
    focusTicketRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [focusTicketId, q.data]);

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
  const currency = o.currency ?? 'SAR';
  const orderIdForApi = String(o.numericId ?? o.id);

  return (
    <div className="space-y-6">
      <div>
        <Link to="/orders" className="text-[13px] font-semibold text-coral hover:underline">
          ← Orders
        </Link>
        <h1 className="mt-2 font-mono text-2xl font-extrabold text-ink">{o.reference ?? o.id}</h1>
        {o.numericId ? (
          <p className="mt-1 font-mono text-[13px] text-ink-60">
            Order id <span className="text-ink">#{o.numericId}</span>
          </p>
        ) : null}
        <p className="mt-2 text-[14px] capitalize text-ink-60">{statusLabel(o.status)}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-3xl border-ink-10 shadow-card-sm">
          <CardHeader>
            <CardTitle className="text-sm">Subtotal ({currency})</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-3xl font-black text-ink">{(o.subtotalSar ?? o.totalSar).toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-ink-10 shadow-card-sm">
          <CardHeader>
            <CardTitle className="text-sm">Fees ({currency})</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-3xl font-black text-ink">{(o.feesSar ?? 0).toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-ink-10 shadow-card-sm">
          <CardHeader>
            <CardTitle className="text-sm">Total ({currency})</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-3xl font-black text-ink">{o.totalSar.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">Order details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-[14px]">
          <p>
            <span className="font-semibold text-ink-60">Reference: </span>
            <span className="font-mono text-ink">{o.reference ?? o.id}</span>
          </p>
          {o.numericId ? (
            <p>
              <span className="font-semibold text-ink-60">ID: </span>
              <span className="font-mono text-ink">#{o.numericId}</span>
            </p>
          ) : null}
          <p>
            <span className="font-semibold text-ink-60">Status: </span>
            <span className="capitalize text-ink">{statusLabel(o.status)}</span>
          </p>
          <p>
            <span className="font-semibold text-ink-60">Quantity: </span>
            <span className="text-ink">{o.ticketCount}</span>
          </p>
          {o.paymentMethod ? (
            <p>
              <span className="font-semibold text-ink-60">Payment method: </span>
              <span className="capitalize text-ink">
                {o.paymentMethod}
                {o.paymentCardLast4 ? ` ···· ${o.paymentCardLast4}` : ''}
              </span>
            </p>
          ) : null}
          {o.paidAt ? (
            <p>
              <span className="font-semibold text-ink-60">Paid at: </span>
              <span className="text-ink">{new Date(o.paidAt).toLocaleString()}</span>
            </p>
          ) : null}
          <p>
            <span className="font-semibold text-ink-60">Created: </span>
            <span className="text-ink">{new Date(o.createdAt).toLocaleString()}</span>
          </p>
          {o.discountSar != null && o.discountSar > 0 ? (
            <p>
              <span className="font-semibold text-ink-60">Discount: </span>
              <span className="text-ink">
                {o.discountSar.toLocaleString()} {currency}
              </span>
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">Buyer &amp; event</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-[14px]">
          <p>
            <span className="font-semibold text-ink-60">Buyer: </span>
            <span className="text-ink">{o.buyerLabel}</span>
            {o.buyerEmail ? <span className="text-ink-60"> ({o.buyerEmail})</span> : null}
            {o.buyerPhone ? <span className="text-ink-60"> · {o.buyerPhone}</span> : null}
          </p>
          <p>
            <span className="font-semibold text-ink-60">Event: </span>
            <span className="text-ink">{o.eventTitle}</span>
            {o.eventId ? <span className="font-mono text-ink-60"> · #{o.eventId}</span> : null}
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

      {o.items && o.items.length > 0 ? (
        <Card className="rounded-3xl border-ink-10 shadow-card-sm">
          <CardHeader>
            <CardTitle className="text-lg">Line items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="admin-table-scroll">
              <table className="w-full min-w-[640px] text-left text-[14px]">
                <thead className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
                  <tr>
                    <th className="px-4 py-3">Item</th>
                    <th className="px-4 py-3">Qty</th>
                    <th className="px-4 py-3">Unit ({currency})</th>
                    <th className="px-4 py-3">Subtotal ({currency})</th>
                    <th className="px-4 py-3">Ticket type</th>
                  </tr>
                </thead>
                <tbody>
                  {o.items.map((row) => (
                    <tr key={row.id} className="border-t border-ink-10 hover:bg-surface-tint">
                      <td className="px-4 py-3 font-mono text-[13px] text-ink-60">{row.id}</td>
                      <td className="px-4 py-3 text-ink">{row.quantity}</td>
                      <td className="px-4 py-3 font-mono text-ink">{row.unitPriceSar.toLocaleString()}</td>
                      <td className="px-4 py-3 font-mono text-ink">{row.subtotalSar.toLocaleString()}</td>
                      <td className="px-4 py-3 text-ink-60">{row.ticketTypeId ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {o.tickets && o.tickets.length > 0 ? (
        <Card className="rounded-3xl border-ink-10 shadow-card-sm">
          <CardHeader>
            <CardTitle className="text-lg">Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="admin-table-scroll">
              <table className="w-full min-w-[720px] text-left text-[14px]">
                <thead className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
                  <tr>
                    <th className="px-4 py-3">Code</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Paid ({currency})</th>
                    <th className="px-4 py-3">Event</th>
                  </tr>
                </thead>
                <tbody>
                  {o.tickets.map((t) => {
                    const ticketFocused =
                      focusTicketId !== undefined && t.id === focusTicketId;
                    return (
                    <tr
                      key={t.id}
                      ref={ticketFocused ? focusTicketRef : undefined}
                      className={cn(
                        'border-t border-ink-10 hover:bg-surface-tint',
                        ticketFocused && 'bg-coral/10 ring-1 ring-inset ring-coral/30',
                      )}
                    >
                      <td className="px-4 py-3 font-mono text-[13px] font-semibold text-ink">{t.code}</td>
                      <td className="px-4 py-3 capitalize text-ink-60">{t.status}</td>
                      <td className="px-4 py-3 font-mono text-ink">{t.pricePaidSar.toLocaleString()}</td>
                      <td className="px-4 py-3 text-ink">{t.eventTitleCache ?? o.eventTitle}</td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">Force refund</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-[14px] text-ink-60">
            Reverses this order outside the normal buyer refund flow. Use only when your policy allows it; this action
            may be irreversible and should be recorded for audit.
          </p>
          {canForceRefund ? (
            <Button
              type="button"
              variant="danger"
              className="!bg-red-600 !text-white hover:!bg-red-700 focus-visible:!ring-red-600"
              disabled={refundState.isLoading}
              onClick={() => setRefundDialogOpen(true)}
            >
              <RotateCcw className="h-4 w-4 shrink-0" aria-hidden />
              Force refund
            </Button>
          ) : (
            <p className="text-[14px] font-medium text-ink-60">
              This order is not in a state that supports force refund from the admin UI.
            </p>
          )}
        </CardContent>
      </Card>

      {refundDialogOpen ? (
        <ForceRefundDialog
          open={refundDialogOpen}
          order={o}
          loading={refundState.isLoading}
          onClose={() => setRefundDialogOpen(false)}
          onConfirm={async () => {
            try {
              await forceRefund(orderIdForApi).unwrap();
              notifySuccess('Refund processed.');
              setRefundDialogOpen(false);
            } catch {
              notifyError('Force refund failed.');
            }
          }}
        />
      ) : null}
    </div>
  );
}
