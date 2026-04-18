import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { notifyError, notifySuccess } from '@/lib/notify';
import { feeConfigurationFormSchema, type FeeConfiguration } from '@/schemas/settings.schema';
import { useGetFeeConfigurationQuery, useUpdateFeeConfigurationMutation } from '@/services/adminApi';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

export function FeesPage() {
  const q = useGetFeeConfigurationQuery();
  const [save, saveState] = useUpdateFeeConfigurationMutation();
  const form = useForm<FeeConfiguration>({
    resolver: zodResolver(feeConfigurationFormSchema),
  });

  useEffect(() => {
    if (q.data) form.reset(q.data);
  }, [q.data, form]);

  if (q.isLoading) return <p className="text-ink-60">Loading…</p>;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-40">Platform</p>
        <h1 className="text-3xl font-extrabold text-ink">Fee configuration</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-ink-60">
          Percentage, flat, payer, auction commission, and third-party splits — all adjustable (mock persistence).
        </p>
      </div>

      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid max-w-xl gap-4"
            onSubmit={form.handleSubmit(async (values) => {
              try {
                await save(values).unwrap();
                notifySuccess('Fee configuration saved (mock).');
              } catch {
                notifyError('Could not save fee configuration.');
              }
            })}
          >
            <label className="block">
              <span className="text-[12px] font-semibold text-ink-60">Fee type</span>
              <select
                className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px] outline-none focus:border-coral focus:ring-2 focus:ring-coral/30"
                {...form.register('feeType')}
              >
                <option value="percent">Percentage</option>
                <option value="flat">Flat</option>
                <option value="combined">Combined</option>
              </select>
            </label>
            <label className="block">
              <span className="text-[12px] font-semibold text-ink-60">Percent (%)</span>
              <input
                type="number"
                step="0.1"
                className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 font-mono text-[14px] outline-none focus:border-coral focus:ring-2 focus:ring-coral/30"
                {...form.register('percent', { valueAsNumber: true })}
              />
            </label>
            <label className="block">
              <span className="text-[12px] font-semibold text-ink-60">Flat fee (SAR)</span>
              <input
                type="number"
                step="0.5"
                className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 font-mono text-[14px] outline-none focus:border-coral focus:ring-2 focus:ring-coral/30"
                {...form.register('flatSar', { valueAsNumber: true })}
              />
            </label>
            <label className="block">
              <span className="text-[12px] font-semibold text-ink-60">Fee payer</span>
              <select
                className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px] outline-none focus:border-coral focus:ring-2 focus:ring-coral/30"
                {...form.register('payer')}
              >
                <option value="buyer">Buyer (added on top)</option>
                <option value="organizer">Organizer (deducted from revenue)</option>
              </select>
            </label>
            <label className="block">
              <span className="text-[12px] font-semibold text-ink-60">Auction commission (%)</span>
              <input
                type="number"
                step="0.1"
                className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 font-mono text-[14px] outline-none focus:border-coral focus:ring-2 focus:ring-coral/30"
                {...form.register('auctionCommissionPercent', { valueAsNumber: true })}
              />
            </label>
            <label className="block">
              <span className="text-[12px] font-semibold text-ink-60">Third-party share (%)</span>
              <input
                type="number"
                step="0.1"
                className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 font-mono text-[14px] outline-none focus:border-coral focus:ring-2 focus:ring-coral/30"
                {...form.register('thirdPartySharePercent', { valueAsNumber: true })}
              />
            </label>
            <Button type="submit" variant="dark" loading={saveState.isLoading}>
              Save (mock)
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
