import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { notifyError, notifySuccess } from '@/lib/notify';
import { feeConfigurationFormSchema, type FeeConfiguration } from '@/schemas/settings.schema';
import { useGetFeeConfigurationQuery, useUpdateFeeConfigurationMutation } from '@/services/adminApi';
import { i18nZodResolver } from '@/lib/i18nZodResolver';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export function FeesPage() {
  const { t } = useTranslation(['settings', 'common', 'nav']);
  const q = useGetFeeConfigurationQuery();
  const [save, saveState] = useUpdateFeeConfigurationMutation();
  const form = useForm<FeeConfiguration>({
    resolver: i18nZodResolver(feeConfigurationFormSchema),
  });

  useEffect(() => {
    if (q.data) form.reset(q.data);
  }, [q.data, form]);

  if (q.isLoading) return <p className="text-ink-60">{t('common:loading')}</p>;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-40">
          {t('nav:groups.platform')}
        </p>
        <h1 className="text-3xl font-extrabold text-ink">{t('settings:fees.title')}</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-ink-60">{t('settings:fees.subtitle')}</p>
      </div>

      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">{t('settings:fees.rulesTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid max-w-xl gap-4"
            onSubmit={form.handleSubmit(async (values) => {
              try {
                await save(values).unwrap();
                notifySuccess(t('settings:fees.notifySaved'));
              } catch {
                notifyError(t('settings:fees.notifySaveFailed'));
              }
            })}
          >
            <label className="block">
              <span className="text-[12px] font-semibold text-ink-60">{t('settings:fees.feeTypeLabel')}</span>
              <select
                className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px] outline-none focus:border-coral focus:ring-2 focus:ring-coral/30"
                {...form.register('feeType')}
              >
                <option value="percent">{t('settings:feeType.percent')}</option>
                <option value="flat">{t('settings:feeType.flat')}</option>
                <option value="combined">{t('settings:feeType.combined')}</option>
              </select>
            </label>
            <label className="block">
              <span className="text-[12px] font-semibold text-ink-60">{t('settings:fees.percentLabel')}</span>
              <input
                type="number"
                step="0.1"
                className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 font-mono text-[14px] outline-none focus:border-coral focus:ring-2 focus:ring-coral/30"
                {...form.register('percent', { valueAsNumber: true })}
              />
            </label>
            <label className="block">
              <span className="text-[12px] font-semibold text-ink-60">{t('settings:fees.flatSarLabel')}</span>
              <input
                type="number"
                step="0.5"
                className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 font-mono text-[14px] outline-none focus:border-coral focus:ring-2 focus:ring-coral/30"
                {...form.register('flatSar', { valueAsNumber: true })}
              />
            </label>
            <label className="block">
              <span className="text-[12px] font-semibold text-ink-60">{t('settings:fees.payerLabel')}</span>
              <select
                className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px] outline-none focus:border-coral focus:ring-2 focus:ring-coral/30"
                {...form.register('payer')}
              >
                <option value="buyer">{t('settings:feePayer.buyer')}</option>
                <option value="organizer">{t('settings:feePayer.organizer')}</option>
              </select>
            </label>
            <label className="block">
              <span className="text-[12px] font-semibold text-ink-60">{t('settings:fees.auctionCommissionLabel')}</span>
              <input
                type="number"
                step="0.1"
                className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 font-mono text-[14px] outline-none focus:border-coral focus:ring-2 focus:ring-coral/30"
                {...form.register('auctionCommissionPercent', { valueAsNumber: true })}
              />
            </label>
            <label className="block">
              <span className="text-[12px] font-semibold text-ink-60">{t('settings:fees.thirdPartyShareLabel')}</span>
              <input
                type="number"
                step="0.1"
                className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 font-mono text-[14px] outline-none focus:border-coral focus:ring-2 focus:ring-coral/30"
                {...form.register('thirdPartySharePercent', { valueAsNumber: true })}
              />
            </label>
            <Button type="submit" variant="dark" loading={saveState.isLoading}>
              {t('common:save')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
