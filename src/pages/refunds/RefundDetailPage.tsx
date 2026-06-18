import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentLocale } from '@/i18n';
import { formatSarCompact } from '@/lib/formatSar';
import { formatDateTime } from '@/lib/localeFormat';
import type { AdminRefundRow, AdminRefundStatus } from '@/schemas/refund.schema';
import { useGetRefundQuery } from '@/services/adminApi';
import { Trans, useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';

function humanizeReasonCode(s: string, none: string): string {
  const t = s.trim();
  if (!t) return none;
  return t.replace(/_/g, ' ');
}

function PaymentTransactionCard({
  tx,
  locale,
}: {
  tx: NonNullable<AdminRefundRow['paymentTransaction']>;
  locale: ReturnType<typeof getCurrentLocale>;
}) {
  const { t } = useTranslation(['operations', 'common']);
  const currency = tx.currency ?? 'SAR';

  return (
    <Card className="rounded-3xl border-ink-10 shadow-card-sm md:col-span-2">
      <CardHeader>
        <CardTitle className="text-sm">{t('operations:refunds.paymentTransaction')}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 text-[14px] sm:grid-cols-2">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
            {t('operations:refunds.gateway')}
          </p>
          <p className="mt-0.5 font-semibold text-ink">{tx.gateway ?? t('common:none')}</p>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
            {t('operations:refunds.gatewayRef')}
          </p>
          <p className="mt-0.5 font-mono text-[13px] text-ink">{tx.gatewayTransaction ?? t('common:none')}</p>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
            {t('operations:refunds.amount')}
          </p>
          <p className="mt-0.5 font-mono font-semibold text-ink">
            {currency === 'SAR'
              ? formatSarCompact(tx.amount, locale)
              : `${tx.amount.toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US')} ${currency}`}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
            {t('operations:orders.colStatus')}
          </p>
          <p className="mt-0.5 text-ink">{tx.status ?? t('common:none')}</p>
        </div>
        {tx.occurredAt ? (
          <div className="sm:col-span-2">
            <p className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
              {t('operations:refunds.occurred')}
            </p>
            <p className="mt-0.5 font-semibold text-ink">{formatDateTime(tx.occurredAt, locale)}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function RefundDetailPage() {
  const { t } = useTranslation(['operations', 'common']);
  const locale = getCurrentLocale();
  const { id = '' } = useParams();
  const q = useGetRefundQuery(id, { skip: !id });

  function statusLabel(s: AdminRefundStatus): string {
    return t(`operations:refundStatus.${s}`);
  }

  if (q.isLoading) return <p className="text-ink-60">{t('common:loading')}</p>;
  if (!q.data || q.isError) {
    return (
      <div className="rounded-3xl border border-ink-10 bg-white p-8">
        <p className="font-semibold text-ink">{t('operations:refunds.notFound')}</p>
        <Link to="/refunds" className="mt-4 inline-block text-coral hover:underline">
          {t('operations:refunds.backToRefunds')}
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
          {t('operations:refunds.backLink')}
        </Link>
        <h1 className="mt-2 text-3xl font-extrabold text-ink">{t('operations:refunds.detailTitle')}</h1>
        <p className="mt-1 font-mono text-[13px] text-ink-60">{r.id}</p>
        {r.orderReference ? (
          <p className="mt-1 text-[14px] text-ink-60">
            <Trans
              ns="operations"
              i18nKey="refunds.orderReference"
              values={{ reference: r.orderReference }}
              components={{ strong: <span className="font-mono font-semibold text-ink" /> }}
            />
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-3xl border-ink-10 shadow-card-sm">
          <CardHeader>
            <CardTitle className="text-sm">{t('operations:orders.colStatus')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[14px] font-semibold text-ink">{statusLabel(r.status)}</p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-ink-10 shadow-card-sm">
          <CardHeader>
            <CardTitle className="text-sm">{t('operations:refunds.refundAmount', { currency })}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-2xl font-black text-ink">
              {formatSarCompact(r.amountSar, locale)}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-ink-10 shadow-card-sm">
          <CardHeader>
            <CardTitle className="text-sm">{t('operations:refunds.buyerInitiator')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[14px] font-semibold text-ink">{r.requestedByLabel || t('common:none')}</p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-ink-10 shadow-card-sm">
          <CardHeader>
            <CardTitle className="text-sm">{t('operations:refunds.created')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[14px] font-semibold text-ink">{formatDateTime(r.createdAt, locale)}</p>
          </CardContent>
        </Card>
        {r.processedAt ? (
          <Card className="rounded-3xl border-ink-10 shadow-card-sm md:col-span-2">
            <CardHeader>
              <CardTitle className="text-sm">{t('operations:refunds.processed')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[14px] font-semibold text-ink">{formatDateTime(r.processedAt, locale)}</p>
            </CardContent>
          </Card>
        ) : null}
        <Card className="rounded-3xl border-ink-10 shadow-card-sm md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">{t('operations:refunds.event')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[14px] text-ink">{r.eventTitle ?? t('common:none')}</p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-ink-10 shadow-card-sm md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">{t('operations:refunds.reason')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-[14px] font-semibold text-ink">
              {humanizeReasonCode(r.reason, t('common:none'))}
            </p>
            {r.description ? (
              <p className="text-[14px] leading-relaxed text-ink-60">{r.description}</p>
            ) : null}
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-ink-10 shadow-card-sm md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">{t('operations:refunds.order')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {r.orderId ? (
              <Link
                to={`/orders/${r.orderId}`}
                className="inline-block font-mono font-semibold text-coral hover:underline"
              >
                {t('operations:refunds.openOrder', {
                  reference: r.orderReference ?? `#${r.orderId}`,
                })}
              </Link>
            ) : (
              <span className="text-ink-40">{t('common:none')}</span>
            )}
          </CardContent>
        </Card>
        {r.paymentTransaction ? (
          <PaymentTransactionCard tx={r.paymentTransaction} locale={locale} />
        ) : null}
      </div>
    </div>
  );
}
