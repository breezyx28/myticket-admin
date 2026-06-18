import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentLocale } from '@/i18n';
import { formatSarCompact } from '@/lib/formatSar';
import { formatDateTime } from '@/lib/localeFormat';
import { notifyError, notifySuccess } from '@/lib/notify';
import type { AdminOrderDetail, AdminOrderStatus } from '@/schemas/order.schema';
import { useForceRefundOrderMutation, useGetOrderQuery } from '@/services/adminApi';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Trans, useTranslation } from 'react-i18next';
import { Link, useParams, useSearchParams } from 'react-router-dom';

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
  const { t } = useTranslation(['operations', 'common']);

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-ink/55 backdrop-blur-[1px]"
        aria-label={t('common:close')}
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
              {t('operations:orders.forceRefundDialogTitle')}
            </h2>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-60">
              <Trans
                ns="operations"
                i18nKey="orders.forceRefundDialogBody"
                values={{ reference: order.reference ?? order.id }}
                components={{ strong: <span className="font-semibold text-ink" /> }}
              />
            </p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline" disabled={loading} onClick={onClose}>
            {t('common:cancel')}
          </Button>
          <Button
            type="button"
            variant="danger"
            className="!bg-red-600 !text-white hover:!bg-red-700 focus-visible:!ring-red-600"
            loading={loading}
            onClick={onConfirm}
          >
            <RotateCcw className="h-4 w-4 shrink-0" aria-hidden />
            {t('operations:orders.confirmForceRefund')}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function OrderDetailPage() {
  const { t } = useTranslation(['operations', 'common']);
  const locale = getCurrentLocale();
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

  function statusLabel(s: AdminOrderStatus | string): string {
    if (s in { paid: 1, pending: 1, processing: 1, completed: 1, refunded: 1, cancelled: 1, failed: 1, unknown: 1 }) {
      return t(`operations:orderStatus.${s as AdminOrderStatus}`);
    }
    return String(s);
  }

  function fmtMoney(amount: number, currency: string): string {
    if (currency === 'SAR') return formatSarCompact(amount, locale);
    return `${amount.toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US')} ${currency}`;
  }

  if (q.isLoading) return <p className="text-ink-60">{t('common:loading')}</p>;
  if (!q.data) {
    return (
      <div className="rounded-3xl border border-ink-10 bg-white p-8">
        <p className="font-semibold text-ink">{t('operations:orders.notFound')}</p>
        <Link to="/orders" className="mt-4 inline-block text-coral hover:underline">
          {t('operations:orders.backToOrders')}
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
          {t('operations:orders.backLink')}
        </Link>
        <h1 className="mt-2 font-mono text-2xl font-extrabold text-ink">{o.reference ?? o.id}</h1>
        {o.numericId ? (
          <p className="mt-1 font-mono text-[13px] text-ink-60">
            <Trans
              ns="operations"
              i18nKey="orders.orderId"
              values={{ id: o.numericId }}
              components={{ strong: <span className="text-ink" /> }}
            />
          </p>
        ) : null}
        <p className="mt-2 text-[14px] text-ink-60">{statusLabel(o.status)}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-3xl border-ink-10 shadow-card-sm">
          <CardHeader>
            <CardTitle className="text-sm">
              {t('operations:orders.subtotal', { currency })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-3xl font-black text-ink">
              {fmtMoney(o.subtotalSar ?? o.totalSar, currency)}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-ink-10 shadow-card-sm">
          <CardHeader>
            <CardTitle className="text-sm">{t('operations:orders.fees', { currency })}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-3xl font-black text-ink">{fmtMoney(o.feesSar ?? 0, currency)}</p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-ink-10 shadow-card-sm">
          <CardHeader>
            <CardTitle className="text-sm">{t('operations:orders.total', { currency })}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-3xl font-black text-ink">{fmtMoney(o.totalSar, currency)}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">{t('operations:orders.orderDetails')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-[14px]">
          <p>
            <span className="font-semibold text-ink-60">{t('operations:orders.reference')} </span>
            <span className="font-mono text-ink">{o.reference ?? o.id}</span>
          </p>
          {o.numericId ? (
            <p>
              <span className="font-semibold text-ink-60">{t('operations:orders.id')} </span>
              <span className="font-mono text-ink">#{o.numericId}</span>
            </p>
          ) : null}
          <p>
            <span className="font-semibold text-ink-60">{t('operations:orders.status')} </span>
            <span className="text-ink">{statusLabel(o.status)}</span>
          </p>
          <p>
            <span className="font-semibold text-ink-60">{t('operations:orders.quantity')} </span>
            <span className="text-ink">{o.ticketCount}</span>
          </p>
          {o.paymentMethod ? (
            <p>
              <span className="font-semibold text-ink-60">{t('operations:orders.paymentMethod')} </span>
              <span className="text-ink">
                {o.paymentMethod}
                {o.paymentCardLast4 ? ` ···· ${o.paymentCardLast4}` : ''}
              </span>
            </p>
          ) : null}
          {o.paidAt ? (
            <p>
              <span className="font-semibold text-ink-60">{t('operations:orders.paidAt')} </span>
              <span className="text-ink">{formatDateTime(o.paidAt, locale)}</span>
            </p>
          ) : null}
          <p>
            <span className="font-semibold text-ink-60">{t('operations:orders.created')} </span>
            <span className="text-ink">{formatDateTime(o.createdAt, locale)}</span>
          </p>
          {o.discountSar != null && o.discountSar > 0 ? (
            <p>
              <span className="font-semibold text-ink-60">{t('operations:orders.discount')} </span>
              <span className="text-ink">{fmtMoney(o.discountSar, currency)}</span>
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">{t('operations:orders.buyerAndEvent')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-[14px]">
          <p>
            <span className="font-semibold text-ink-60">{t('operations:orders.buyer')} </span>
            <span className="text-ink">{o.buyerLabel}</span>
            {o.buyerEmail ? <span className="text-ink-60"> ({o.buyerEmail})</span> : null}
            {o.buyerPhone ? <span className="text-ink-60"> · {o.buyerPhone}</span> : null}
          </p>
          <p>
            <span className="font-semibold text-ink-60">{t('operations:orders.event')} </span>
            <span className="text-ink">{o.eventTitle}</span>
            {o.eventId ? <span className="font-mono text-ink-60"> · #{o.eventId}</span> : null}
          </p>
          {o.paymentReference ? (
            <p>
              <span className="font-semibold text-ink-60">{t('operations:orders.paymentRef')} </span>
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
            <CardTitle className="text-lg">{t('operations:orders.lineItems')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="admin-table-scroll">
              <table className="w-full min-w-[640px] text-left text-[14px]">
                <thead className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
                  <tr>
                    <th className="px-4 py-3">{t('operations:orders.colItem')}</th>
                    <th className="px-4 py-3">{t('operations:orders.colQty')}</th>
                    <th className="px-4 py-3">{t('operations:orders.colUnit', { currency })}</th>
                    <th className="px-4 py-3">{t('operations:orders.colSubtotal', { currency })}</th>
                    <th className="px-4 py-3">{t('operations:orders.ticketType')}</th>
                  </tr>
                </thead>
                <tbody>
                  {o.items.map((row) => (
                    <tr key={row.id} className="border-t border-ink-10 hover:bg-surface-tint">
                      <td className="px-4 py-3 font-mono text-[13px] text-ink-60">{row.id}</td>
                      <td className="px-4 py-3 text-ink">{row.quantity}</td>
                      <td className="px-4 py-3 font-mono text-ink">{fmtMoney(row.unitPriceSar, currency)}</td>
                      <td className="px-4 py-3 font-mono text-ink">{fmtMoney(row.subtotalSar, currency)}</td>
                      <td className="px-4 py-3 text-ink-60">{row.ticketTypeId ?? t('common:none')}</td>
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
            <CardTitle className="text-lg">{t('operations:orders.tickets')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="admin-table-scroll">
              <table className="w-full min-w-[720px] text-left text-[14px]">
                <thead className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
                  <tr>
                    <th className="px-4 py-3">{t('operations:orders.colCode')}</th>
                    <th className="px-4 py-3">{t('operations:orders.colStatus')}</th>
                    <th className="px-4 py-3">{t('operations:orders.colPaid', { currency })}</th>
                    <th className="px-4 py-3">{t('operations:orders.colEvent')}</th>
                  </tr>
                </thead>
                <tbody>
                  {o.tickets.map((ticket) => {
                    const ticketFocused = focusTicketId !== undefined && ticket.id === focusTicketId;
                    return (
                      <tr
                        key={ticket.id}
                        ref={ticketFocused ? focusTicketRef : undefined}
                        className={cn(
                          'border-t border-ink-10 hover:bg-surface-tint',
                          ticketFocused && 'bg-coral/10 ring-1 ring-inset ring-coral/30',
                        )}
                      >
                        <td className="px-4 py-3 font-mono text-[13px] font-semibold text-ink">{ticket.code}</td>
                        <td className="px-4 py-3 text-ink-60">{ticket.status}</td>
                        <td className="px-4 py-3 font-mono text-ink">
                          {fmtMoney(ticket.pricePaidSar, currency)}
                        </td>
                        <td className="px-4 py-3 text-ink">{ticket.eventTitleCache ?? o.eventTitle}</td>
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
          <CardTitle className="text-lg">{t('operations:orders.forceRefund')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-[14px] text-ink-60">{t('operations:orders.forceRefundHint')}</p>
          {canForceRefund ? (
            <Button
              type="button"
              variant="danger"
              className="!bg-red-600 !text-white hover:!bg-red-700 focus-visible:!ring-red-600"
              disabled={refundState.isLoading}
              onClick={() => setRefundDialogOpen(true)}
            >
              <RotateCcw className="h-4 w-4 shrink-0" aria-hidden />
              {t('operations:orders.forceRefund')}
            </Button>
          ) : (
            <p className="text-[14px] font-medium text-ink-60">
              {t('operations:orders.forceRefundUnavailable')}
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
              notifySuccess(t('operations:orders.notifyRefundProcessed'));
              setRefundDialogOpen(false);
            } catch {
              notifyError(t('operations:orders.notifyForceRefundFailed'));
            }
          }}
        />
      ) : null}
    </div>
  );
}
