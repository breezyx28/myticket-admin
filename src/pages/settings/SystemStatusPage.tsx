import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentLocale } from '@/i18n';
import { formatDateTime } from '@/lib/localeFormat';
import { useGetAdminHealthQuery, useGetAdminVersionQuery } from '@/services/adminApi';
import { Trans, useTranslation } from 'react-i18next';

export function SystemStatusPage() {
  const { t } = useTranslation(['settings', 'common', 'nav']);
  const locale = getCurrentLocale();
  const healthQ = useGetAdminHealthQuery();
  const versionQ = useGetAdminVersionQuery();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-40">
          {t('nav:groups.platform')}
        </p>
        <h1 className="text-3xl font-extrabold text-ink">{t('settings:systemStatus.title')}</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-ink-60">
          <Trans
            ns="settings"
            i18nKey="systemStatus.subtitle"
            components={{ mono: <span className="font-mono text-ink" /> }}
          />
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => void healthQ.refetch()}>
          {t('settings:systemStatus.refreshHealth')}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => void versionQ.refetch()}>
          {t('settings:systemStatus.refreshVersion')}
        </Button>
      </div>

      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">{t('settings:systemStatus.healthTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          {healthQ.isLoading ? <p className="text-sm text-ink-60">{t('common:loading')}</p> : null}
          {healthQ.isError ? (
            <p className="text-sm font-semibold text-coral">{t('settings:systemStatus.healthLoadFailed')}</p>
          ) : null}
          {healthQ.data ? (
            <div className="space-y-3">
              <p className="text-[15px] text-ink">
                {t('settings:systemStatus.statusLabel')}{' '}
                <span className="font-mono font-semibold capitalize text-ink">{healthQ.data.status}</span>
              </p>
              {healthQ.data.message ? <p className="text-[14px] text-ink-60">{healthQ.data.message}</p> : null}
              {healthQ.data.checkedAt ? (
                <p className="font-mono text-[13px] text-ink-60">
                  {t('settings:systemStatus.checkedAt', {
                    time: formatDateTime(healthQ.data.checkedAt, locale),
                  })}
                </p>
              ) : null}
              <pre className="max-h-80 overflow-auto rounded-xl bg-ink-5 p-4 font-mono text-[12px] text-ink">
                {JSON.stringify(healthQ.data, null, 2)}
              </pre>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">{t('settings:systemStatus.versionTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          {versionQ.isLoading ? <p className="text-sm text-ink-60">{t('common:loading')}</p> : null}
          {versionQ.isError ? (
            <p className="text-sm font-semibold text-coral">{t('settings:systemStatus.versionLoadFailed')}</p>
          ) : null}
          {versionQ.data ? (
            <div className="space-y-3">
              <dl className="grid gap-3 text-[14px] sm:grid-cols-2">
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
                    {t('settings:systemStatus.versionLabel')}
                  </dt>
                  <dd className="font-mono font-semibold text-ink">{versionQ.data.version}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
                    {t('settings:systemStatus.commitLabel')}
                  </dt>
                  <dd className="font-mono text-ink-60">{versionQ.data.commit ?? t('common:none')}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
                    {t('settings:systemStatus.buildLabel')}
                  </dt>
                  <dd className="font-mono text-ink-60">
                    {versionQ.data.buildDate ? formatDateTime(versionQ.data.buildDate, locale) : t('common:none')}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
                    {t('settings:systemStatus.environmentLabel')}
                  </dt>
                  <dd className="text-ink-60">{versionQ.data.environment ?? t('common:none')}</dd>
                </div>
              </dl>
              <pre className="max-h-64 overflow-auto rounded-xl bg-ink-5 p-4 font-mono text-[12px] text-ink">
                {JSON.stringify(versionQ.data, null, 2)}
              </pre>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
