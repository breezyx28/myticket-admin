import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentLocale } from '@/i18n';
import { formatDateTime } from '@/lib/localeFormat';
import { notifyError, notifySuccess } from '@/lib/notify';
import {
  useApproveOrganizerKycDocumentMutation,
  useCreateFeeAdjustmentMutation,
  useGetOrganizerKycQuery,
  useRejectOrganizerKycDocumentMutation,
} from '@/services/adminApi';
import { skipToken } from '@reduxjs/toolkit/query';
import { useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

const inputClass =
  'mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px] outline-none focus:border-coral focus:ring-2 focus:ring-coral/30';

export function FinanceCompliancePage() {
  const { t } = useTranslation(['settings', 'common', 'nav']);
  const locale = getCurrentLocale();
  const [orgKycId, setOrgKycId] = useState('org-riyadh-nights');
  const kycQ = useGetOrganizerKycQuery(orgKycId.trim() ? orgKycId.trim() : skipToken);
  const [approveDoc] = useApproveOrganizerKycDocumentMutation();
  const [rejectDoc] = useRejectOrganizerKycDocumentMutation();
  const [createAdj] = useCreateFeeAdjustmentMutation();
  const [adjOrg, setAdjOrg] = useState('org-riyadh-nights');
  const [adjAmount, setAdjAmount] = useState('250');
  const [adjReason, setAdjReason] = useState('');
  const [adjRef, setAdjRef] = useState('');
  const [busyDoc, setBusyDoc] = useState<string | null>(null);
  const [adjBusy, setAdjBusy] = useState(false);

  const hintIds = useMemo(() => ['org-riyadh-nights', 'org-desert-sound'], []);

  useEffect(() => {
    setAdjReason(t('settings:financeCompliance.defaultReason'));
  }, [t]);

  async function runDocAction(docId: string, okMsg: string, exec: () => Promise<unknown>) {
    setBusyDoc(docId);
    try {
      await exec();
      notifySuccess(okMsg);
    } catch {
      notifyError(t('settings:notifyActionFailed'));
    } finally {
      setBusyDoc(null);
    }
  }

  async function submitAdjustment() {
    setAdjBusy(true);
    try {
      const amountSar = Number(adjAmount);
      if (!Number.isFinite(amountSar)) {
        notifyError(t('settings:financeCompliance.notifyAmountInvalid'));
        return;
      }
      await createAdj({
        organizerId: adjOrg.trim(),
        amountSar,
        reason: adjReason.trim(),
        reference: adjRef.trim() || undefined,
      }).unwrap();
      notifySuccess(t('settings:financeCompliance.notifyAdjustmentSubmitted'));
    } catch {
      notifyError(t('settings:financeCompliance.notifyAdjustmentFailed'));
    } finally {
      setAdjBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-40">
          {t('nav:groups.platform')}
        </p>
        <h1 className="text-3xl font-extrabold text-ink">{t('settings:financeCompliance.title')}</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-ink-60">
          <Trans
            ns="settings"
            i18nKey="financeCompliance.subtitle"
            values={{ ids: hintIds.join(' · ') }}
            components={{ mono: <span className="font-mono text-ink" /> }}
          />
        </p>
      </div>

      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">{t('settings:financeCompliance.feeAdjustmentTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid max-w-xl gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              void submitAdjustment();
            }}
          >
            <label className="block">
              <span className="text-[12px] font-semibold text-ink-60">
                {t('settings:financeCompliance.organizerIdLabel')}
              </span>
              <input className={`font-mono ${inputClass}`} value={adjOrg} onChange={(e) => setAdjOrg(e.target.value)} />
            </label>
            <label className="block">
              <span className="text-[12px] font-semibold text-ink-60">
                {t('settings:financeCompliance.amountLabel')}
              </span>
              <input
                type="number"
                step="0.01"
                className={`font-mono ${inputClass}`}
                value={adjAmount}
                onChange={(e) => setAdjAmount(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-[12px] font-semibold text-ink-60">
                {t('settings:financeCompliance.reasonLabel')}
              </span>
              <textarea
                rows={3}
                className={inputClass}
                value={adjReason}
                onChange={(e) => setAdjReason(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-[12px] font-semibold text-ink-60">
                {t('settings:financeCompliance.referenceLabel')}
              </span>
              <input className={inputClass} value={adjRef} onChange={(e) => setAdjRef(e.target.value)} />
            </label>
            <Button type="submit" disabled={adjBusy} loading={adjBusy}>
              {t('settings:financeCompliance.submitAdjustment')}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">{t('settings:financeCompliance.kycTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <label className="mb-4 block max-w-md">
            <span className="text-[12px] font-semibold text-ink-60">
              {t('settings:financeCompliance.organizerIdLabel')}
            </span>
            <input
              className={`font-mono ${inputClass}`}
              value={orgKycId}
              onChange={(e) => setOrgKycId(e.target.value)}
            />
          </label>
          {kycQ.isLoading ? <p className="text-sm text-ink-60">{t('common:loading')}</p> : null}
          {kycQ.isError ? (
            <p className="mb-3 text-sm font-semibold text-coral">{t('settings:financeCompliance.kycLoadFailed')}</p>
          ) : null}
          {kycQ.data ? (
            <div className="space-y-3">
              <p className="text-[14px] text-ink-60">
                <span className="font-semibold text-ink">
                  {kycQ.data.organizerName ?? t('settings:financeCompliance.organizerFallback')}
                </span>
                <span className="font-mono text-[13px] text-ink-40"> · {kycQ.data.organizerId}</span>
              </p>
              {kycQ.data.documents.length === 0 ? (
                <p className="text-sm text-ink-60">{t('settings:financeCompliance.noDocuments')}</p>
              ) : (
                <div className="admin-table-scroll">
                  <table className="w-full min-w-[640px] text-left text-[14px]">
                    <thead className="text-[11px] font-bold uppercase tracking-wide text-ink-40">
                      <tr>
                        <th className="px-4 py-3">{t('settings:financeCompliance.columns.document')}</th>
                        <th className="px-4 py-3">{t('settings:financeCompliance.columns.type')}</th>
                        <th className="px-4 py-3">{t('settings:financeCompliance.columns.status')}</th>
                        <th className="px-4 py-3">{t('settings:financeCompliance.columns.uploaded')}</th>
                        <th className="px-4 py-3">{t('common:actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {kycQ.data.documents.map((doc) => (
                        <tr key={doc.id} className="border-t border-ink-10 hover:bg-surface-tint">
                          <td className="px-4 py-3">
                            <p className="font-medium text-ink">{doc.label ?? doc.id}</p>
                            <p className="font-mono text-[12px] text-ink-60">{doc.id}</p>
                          </td>
                          <td className="px-4 py-3 text-ink-60">{doc.docType ?? t('common:none')}</td>
                          <td className="px-4 py-3 capitalize text-ink-60">{doc.status}</td>
                          <td className="px-4 py-3 font-mono text-[13px] text-ink-60">
                            {doc.uploadedAt ? formatDateTime(doc.uploadedAt, locale) : t('common:none')}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1.5">
                              {doc.status === 'pending' || doc.status === 'unknown' ? (
                                <>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="dark"
                                    disabled={busyDoc !== null}
                                    loading={busyDoc === doc.id}
                                    onClick={() =>
                                      void runDocAction(doc.id, t('settings:financeCompliance.notifyDocApproved'), () =>
                                        approveDoc({ organizerId: kycQ.data!.organizerId, docId: doc.id }).unwrap()
                                      )
                                    }
                                  >
                                    {t('settings:payouts.approve')}
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    disabled={busyDoc !== null}
                                    loading={busyDoc === doc.id}
                                    onClick={() => {
                                      const reason = window.prompt(t('settings:financeCompliance.rejectReasonPrompt')) ?? undefined;
                                      void runDocAction(doc.id, t('settings:financeCompliance.notifyDocRejected'), () =>
                                        rejectDoc({
                                          organizerId: kycQ.data!.organizerId,
                                          docId: doc.id,
                                          reason: reason?.trim() || undefined,
                                        }).unwrap()
                                      );
                                    }}
                                  >
                                    {t('settings:payouts.reject')}
                                  </Button>
                                </>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
