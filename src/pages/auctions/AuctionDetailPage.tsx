import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentLocale } from '@/i18n';
import { formatSarCompact } from '@/lib/formatSar';
import { formatDateTime, formatNumber } from '@/lib/localeFormat';
import { notifyError, notifySuccess } from '@/lib/notify';
import type { AdminAuctionPartySummary, AdminAuctionStatus } from '@/schemas/auction.schema';
import { useFinalizeAuctionMutation, useGetAuctionQuery } from '@/services/adminApi';
import type { ReactNode } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';

function canFinalizeListing(status: AdminAuctionStatus): boolean {
  return status === 'live';
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
  const { t } = useTranslation('operations');

  return (
    <Card className="rounded-3xl border-ink-10 shadow-card-sm">
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1.5">
        <p className="text-[15px] font-semibold text-ink">{party.fullName}</p>
        {party.email ? (
          <p className="text-[14px] text-ink-60">
            <span className="text-ink-40">{t('auctions.email')}</span> · {party.email}
          </p>
        ) : null}
        {party.phone ? (
          <p className="font-mono text-[13px] text-ink-60">
            <span className="text-ink-40">{t('auctions.phone')}</span> · {party.phone}
          </p>
        ) : null}
        <p className="font-mono text-[12px] text-ink-40">{t('auctions.userId', { id: party.id })}</p>
      </CardContent>
    </Card>
  );
}

export function AuctionDetailPage() {
  const { t } = useTranslation(['operations', 'common']);
  const locale = getCurrentLocale();
  const { id = '' } = useParams();
  const q = useGetAuctionQuery(id, { skip: !id });
  const [finalize, finalizeState] = useFinalizeAuctionMutation();

  function statusLabel(s: AdminAuctionStatus): string {
    return t(`operations:auctionStatus.${s}`);
  }

  function fmtMoney(n: number | undefined, currency: string | undefined): string {
    if (n === undefined) return t('common:none');
    const cur = currency ?? 'SAR';
    if (cur === 'SAR') return formatSarCompact(n, locale);
    return `${formatNumber(n, locale)} ${cur}`;
  }

  function fmtDt(iso: string | undefined): string {
    if (!iso) return t('common:none');
    return formatDateTime(iso, locale);
  }

  if (q.isLoading) return <p className="text-ink-60">{t('common:loading')}</p>;
  if (!q.data || q.isError) {
    return (
      <div className="rounded-3xl border border-ink-10 bg-white p-8">
        <p className="font-semibold text-ink">{t('operations:auctions.notFound')}</p>
        <Link to="/auctions" className="mt-4 inline-block text-coral hover:underline">
          {t('operations:auctions.backToAuctions')}
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
          {t('operations:auctions.backLink')}
        </Link>
        <h1 className="mt-2 text-3xl font-extrabold text-ink">{a.title}</h1>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[13px] text-ink-60">
          {a.listingCode ? (
            <span>
              {t('operations:auctions.code')}{' '}
              <span className="font-mono font-semibold text-ink">{a.listingCode}</span>
            </span>
          ) : null}
          <span>
            {t('operations:auctions.id')}{' '}
            <span className="font-mono font-semibold text-ink">{a.id}</span>
          </span>
          <span>{t('operations:auctions.statusLabel', { status: statusLabel(a.status) })}</span>
        </div>
        {canFinalizeListing(a.status) ? (
          <p className="mt-2 max-w-2xl text-[13px] text-ink-50">
            <Trans
              ns="operations"
              i18nKey="auctions.finalizeHint"
              components={{ mono: <span className="font-mono" /> }}
            />
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-3xl border-ink-10 shadow-card-sm">
          <CardHeader>
            <CardTitle className="text-sm">{t('operations:auctions.sellerListing')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[14px] font-semibold text-ink">{a.organizerName || t('common:none')}</p>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-ink-10 shadow-card-sm">
          <CardHeader>
            <CardTitle className="text-sm">{t('operations:auctions.salePrice', { currency: cur })}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-2xl font-black text-ink">{formatSarCompact(a.highBidSar, locale)}</p>
            {a.salePriceSar !== undefined && a.salePriceSar !== a.highBidSar ? (
              <p className="mt-1 text-[12px] text-ink-50">
                {t('operations:auctions.recordedSale', {
                  amount: formatSarCompact(a.salePriceSar, locale),
                })}
              </p>
            ) : null}
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-ink-10 shadow-card-sm">
          <CardHeader>
            <CardTitle className="text-sm">{t('operations:auctions.listingEnds')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[14px] font-semibold text-ink">{fmtDt(a.endsAt)}</p>
            {a.startsAt ? (
              <p className="mt-1 text-[12px] text-ink-50">
                {t('operations:auctions.started', { date: fmtDt(a.startsAt) })}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {(a.originalPriceSar !== undefined ||
        a.commissionPct !== undefined ||
        a.commissionAmountSar !== undefined ||
        a.sellerProceedsSar !== undefined) && (
        <Card className="rounded-3xl border-ink-10 shadow-card-sm">
          <CardHeader>
            <CardTitle className="text-lg">{t('operations:auctions.pricingFees')}</CardTitle>
          </CardHeader>
          <CardContent>
            <dl>
              <DetailLine label={t('operations:auctions.originalList')}>
                {fmtMoney(a.originalPriceSar, cur)}
              </DetailLine>
              <DetailLine label={t('operations:auctions.saleAmount')}>
                {fmtMoney(a.salePriceSar ?? a.highBidSar, cur)}
              </DetailLine>
              <DetailLine label={t('operations:auctions.commissionPct')}>
                {a.commissionPct !== undefined ? `${a.commissionPct}%` : t('common:none')}
              </DetailLine>
              <DetailLine label={t('operations:auctions.commission')}>
                {fmtMoney(a.commissionAmountSar, cur)}
              </DetailLine>
              <DetailLine label={t('operations:auctions.sellerProceeds')}>
                {fmtMoney(a.sellerProceedsSar, cur)}
              </DetailLine>
            </dl>
          </CardContent>
        </Card>
      )}

      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">{t('operations:auctions.timeline')}</CardTitle>
        </CardHeader>
        <CardContent>
          <dl>
            <DetailLine label={t('operations:auctions.listingStart')}>{fmtDt(a.startsAt)}</DetailLine>
            <DetailLine label={t('operations:auctions.listingEnd')}>{fmtDt(a.endsAt)}</DetailLine>
            <DetailLine label={t('operations:auctions.soldAt')}>{fmtDt(a.soldAt)}</DetailLine>
            <DetailLine label={t('operations:auctions.cancelled')}>{fmtDt(a.cancelledAt)}</DetailLine>
            {a.cancellationReason ? (
              <DetailLine label={t('operations:auctions.cancellationReason')}>
                <span className="text-ink-60">{a.cancellationReason}</span>
              </DetailLine>
            ) : null}
          </dl>
        </CardContent>
      </Card>

      {(a.seatLabelCache || a.ticketTypeCache) && (
        <Card className="rounded-3xl border-ink-10 shadow-card-sm">
          <CardHeader>
            <CardTitle className="text-sm">{t('operations:auctions.seatTicket')}</CardTitle>
          </CardHeader>
          <CardContent>
            <dl>
              {a.seatLabelCache ? (
                <DetailLine label={t('operations:auctions.seat')}>{a.seatLabelCache}</DetailLine>
              ) : null}
              {a.ticketTypeCache ? (
                <DetailLine label={t('operations:orders.ticketType')}>{a.ticketTypeCache}</DetailLine>
              ) : null}
            </dl>
          </CardContent>
        </Card>
      )}

      {hasDetail ? (
        <div className="space-y-4">
          <h2 className="text-lg font-extrabold text-ink">{t('operations:auctions.linkedRecords')}</h2>

          {a.eventSummary ? (
            <Card className="rounded-3xl border-ink-10 shadow-card-sm">
              <CardHeader>
                <CardTitle className="text-lg">{t('operations:refunds.event')}</CardTitle>
              </CardHeader>
              <CardContent>
                <dl>
                  {a.eventSummary.title ? (
                    <DetailLine label={t('operations:events.columns.title')}>
                      {a.eventSummary.title}
                    </DetailLine>
                  ) : null}
                  {a.eventSummary.code ? (
                    <DetailLine label={t('operations:auctions.eventCode')}>
                      <span className="font-mono">{a.eventSummary.code}</span>
                    </DetailLine>
                  ) : null}
                  {a.eventSummary.status ? (
                    <DetailLine label={t('operations:auctions.eventStatus')}>
                      <span>{a.eventSummary.status}</span>
                    </DetailLine>
                  ) : null}
                  {a.eventSummary.venueName ? (
                    <DetailLine label={t('operations:auctions.venue')}>{a.eventSummary.venueName}</DetailLine>
                  ) : null}
                  {a.eventSummary.venueAddress ? (
                    <DetailLine label={t('operations:auctions.address')}>{a.eventSummary.venueAddress}</DetailLine>
                  ) : null}
                  {a.eventSummary.capacity !== undefined ? (
                    <DetailLine label={t('operations:auctions.capacity')}>
                      {formatNumber(a.eventSummary.capacity, locale)}
                    </DetailLine>
                  ) : null}
                  {a.eventSummary.startsAt ? (
                    <DetailLine label={t('operations:auctions.eventStarts')}>
                      {fmtDt(a.eventSummary.startsAt)}
                    </DetailLine>
                  ) : null}
                  {a.eventSummary.endsAt ? (
                    <DetailLine label={t('operations:auctions.eventEnds')}>
                      {fmtDt(a.eventSummary.endsAt)}
                    </DetailLine>
                  ) : null}
                  {a.eventSummary.timezone ? (
                    <DetailLine label={t('operations:auctions.timezone')}>
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
                <CardTitle className="text-lg">{t('operations:orders.tickets')}</CardTitle>
              </CardHeader>
              <CardContent>
                <dl>
                  <DetailLine label={t('operations:auctions.ticketCode')}>
                    <span className="font-mono font-semibold">{a.ticketSummary.code}</span>
                  </DetailLine>
                  {a.ticketSummary.status ? (
                    <DetailLine label={t('operations:orders.colStatus')}>
                      <span>{a.ticketSummary.status}</span>
                    </DetailLine>
                  ) : null}
                  {a.ticketSummary.pricePaidSar !== undefined ? (
                    <DetailLine label={t('operations:auctions.pricePaid')}>
                      {fmtMoney(a.ticketSummary.pricePaidSar, cur)}
                    </DetailLine>
                  ) : null}
                  {a.ticketSummary.orderReference ? (
                    <DetailLine label={t('operations:auctions.orderReference')}>
                      <span className="font-mono">{a.ticketSummary.orderReference}</span>
                    </DetailLine>
                  ) : null}
                  {a.ticketSummary.orderId ? (
                    <DetailLine label={t('operations:refunds.order')}>
                      <Link
                        to={`/orders/${encodeURIComponent(a.ticketSummary.orderId)}`}
                        className="font-mono font-semibold text-coral hover:underline"
                      >
                        {t('operations:auctions.openOrder', { id: a.ticketSummary.orderId })}
                      </Link>
                    </DetailLine>
                  ) : null}
                </dl>
              </CardContent>
            </Card>
          ) : null}

          {(a.seller || a.buyer) && (
            <div className="grid gap-4 md:grid-cols-2">
              {a.seller ? (
                <PartyCard title={t('operations:auctions.sellerAccount')} party={a.seller} />
              ) : null}
              {a.buyer ? (
                <PartyCard title={t('operations:auctions.buyerAccount')} party={a.buyer} />
              ) : null}
            </div>
          )}

          {a.ledgerTransactions && a.ledgerTransactions.length > 0 ? (
            <Card className="rounded-3xl border-ink-10 shadow-card-sm">
              <CardHeader>
                <CardTitle className="text-lg">{t('operations:auctions.ledger')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="admin-table-scroll">
                  <table className="w-full min-w-[560px] text-left text-[14px]">
                    <thead className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
                      <tr>
                        <th className="px-3 py-2">{t('operations:auctions.colType')}</th>
                        <th className="px-3 py-2">{t('operations:auctions.colAmount')}</th>
                        <th className="px-3 py-2">{t('operations:auctions.colWhen')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {a.ledgerTransactions.map((row) => (
                        <tr key={row.id} className="border-t border-ink-10">
                          <td className="px-3 py-2.5 font-mono text-[13px] text-ink">{row.transactionType}</td>
                          <td className="px-3 py-2.5 font-mono text-ink">
                            {row.currency === 'SAR'
                              ? formatSarCompact(row.amount, locale)
                              : `${formatNumber(row.amount, locale)} ${row.currency}`}
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
            <CardTitle className="text-lg">{t('operations:auctions.finalizeSection')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              variant="dark"
              loading={finalizeState.isLoading}
              onClick={async () => {
                if (!window.confirm(t('operations:auctions.confirmFinalize'))) return;
                try {
                  await finalize(a.id).unwrap();
                  notifySuccess(t('operations:auctions.notifyFinalized'));
                } catch {
                  notifyError(t('operations:auctions.notifyFinalizeFailed'));
                }
              }}
            >
              {t('operations:auctions.finalizeListing')}
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
