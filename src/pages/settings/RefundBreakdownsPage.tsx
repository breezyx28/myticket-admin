import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentLocale } from '@/i18n';
import { formatSarCompact } from '@/lib/formatSar';
import { formatNumber } from '@/lib/localeFormat';
import { useGetRefundBreakdownsQuery } from '@/services/adminApi';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export function RefundBreakdownsPage() {
  const { t } = useTranslation(['settings', 'common', 'nav']);
  const locale = getCurrentLocale();
  const q = useGetRefundBreakdownsQuery();

  if (q.isLoading) return <p className="text-ink-60">{t('common:loading')}</p>;
  if (!q.data) return <p className="text-ink-60">{t('settings:noData')}</p>;

  const { rows, totalRefundedSar } = q.data;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-40">
          {t('nav:groups.platform')}
        </p>
        <h1 className="text-3xl font-extrabold text-ink">{t('settings:refundBreakdowns.title')}</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-ink-60">
          <Trans
            ns="settings"
            i18nKey="refundBreakdowns.subtitle"
            components={{ mono: <span className="font-mono text-ink" /> }}
          />
        </p>
      </div>

      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">{t('settings:refundBreakdowns.totalTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-mono text-4xl font-black text-ink">{formatSarCompact(totalRefundedSar, locale)}</p>
          <p className="mt-2 text-[13px] text-ink-60">{t('settings:refundBreakdowns.totalHint')}</p>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg">{t('settings:refundBreakdowns.bySegmentTitle')}</CardTitle>
          <Link to="/refunds" className="text-[13px] font-semibold text-coral hover:underline">
            {t('settings:refundBreakdowns.viewRefundRequests')}
          </Link>
        </CardHeader>
        <CardContent>
          <div className="admin-table-scroll">
            <table className="w-full min-w-[560px] text-left text-[14px]">
              <thead className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
                <tr>
                  <th className="px-4 py-3">{t('settings:refundBreakdowns.columns.segment')}</th>
                  <th className="px-4 py-3">{t('settings:refundBreakdowns.columns.refunds')}</th>
                  <th className="px-4 py-3">{t('settings:refundBreakdowns.columns.amount')}</th>
                  <th className="px-4 py-3">{t('settings:refundBreakdowns.columns.share')}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const share = totalRefundedSar > 0 ? (row.amountSar / totalRefundedSar) * 100 : 0;
                  return (
                    <tr key={row.key} className="border-t border-ink-10 hover:bg-surface-tint">
                      <td className="px-4 py-3 font-medium text-ink">{row.label}</td>
                      <td className="px-4 py-3 font-mono text-ink-60">{formatNumber(row.refundCount, locale)}</td>
                      <td className="px-4 py-3 font-mono text-ink">{formatSarCompact(row.amountSar, locale)}</td>
                      <td className="px-4 py-3 text-ink-60">
                        {formatNumber(share, locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
