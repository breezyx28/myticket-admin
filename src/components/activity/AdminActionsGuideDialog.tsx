import { Button } from '@/components/ui/Button';
import { BookOpen } from 'lucide-react';
import { useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { Trans, useTranslation } from 'react-i18next';
import { getDefaultAdminActionPostBody } from '@/lib/i18nMessage';

export { getDefaultAdminActionPostBody };

const ALLOWED_ACTION_KINDS = [
  'user_suspend',
  'user_unsuspend',
  'role_application_approve',
  'role_application_reject',
  'talent_profile_approve',
  'talent_profile_reject',
  'event_cancel',
  'event_archive',
  'event_feature',
  'category_create',
  'category_update',
  'category_toggle',
  'fee_config_update',
  'notification_settings_update',
  'support_resolve',
  'rating_moderate',
  'listing_moderate',
  'payout_release',
  'payout_hold',
] as const;

type AdminActionsGuideDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function AdminActionsGuideDialog({ open, onClose }: AdminActionsGuideDialogProps) {
  const { t } = useTranslation(['insights', 'common']);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[10060] flex items-center justify-center p-4 sm:p-6" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-ink/50 backdrop-blur-[1px]"
        aria-label={t('insights:guide.closeAria')}
        onClick={onClose}
      />
      <div
        className="relative z-[10061] flex max-h-[min(90dvh,880px)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-ink-10 bg-white shadow-card-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="flex shrink-0 items-start gap-3 border-b border-ink-10 bg-ink-5/50 px-5 py-4 sm:px-6">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-coral shadow-sm ring-1 ring-ink-10">
            <BookOpen className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-lg font-extrabold tracking-tight text-ink sm:text-xl">
              {t('insights:guide.title')}
            </h2>
            <p className="mt-1 text-[13px] text-ink-60">
              <Trans
                i18nKey="insights:guide.subtitle"
                components={[<span key="1" className="font-mono text-ink" />]}
              />
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={onClose}>
            {t('common:close')}
          </Button>
        </div>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5 text-[14px] leading-relaxed text-ink-60 sm:px-6 sm:py-6">
          <section className="space-y-2">
            <h3 className="text-[12px] font-bold uppercase tracking-[0.12em] text-ink-40">
              {t('insights:guide.inOneSentence.heading')}
            </h3>
            <p className="text-ink">
              <Trans
                i18nKey="insights:guide.inOneSentence.body"
                components={[
                  <span key="1" className="font-mono text-[13px] text-ink" />,
                  <strong key="2" className="text-ink" />,
                  <strong key="3" className="text-ink" />,
                  <strong key="4" className="text-ink" />,
                ]}
              />
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-[12px] font-bold uppercase tracking-[0.12em] text-ink-40">
              {t('insights:guide.whoIsAdmin.heading')}
            </h3>
            <p>
              <Trans
                i18nKey="insights:guide.whoIsAdmin.body"
                components={[
                  <span key="1" className="font-semibold text-ink" />,
                  <span key="2" className="font-semibold text-ink" />,
                ]}
              />
            </p>
          </section>

          <section className="space-y-3 rounded-2xl border border-amber-200/80 bg-amber-50/60 px-4 py-3 text-[13px] text-amber-950">
            <h3 className="text-[12px] font-bold uppercase tracking-[0.12em] text-amber-900/80">
              {t('insights:guide.laravelVsDb.heading')}
            </h3>
            <p>
              <Trans
                i18nKey="insights:guide.laravelVsDb.p1"
                components={[
                  <span key="1" className="font-mono" />,
                  <strong key="2" />,
                  <strong key="3" />,
                ]}
              />
            </p>
            <p>
              <Trans
                i18nKey="insights:guide.laravelVsDb.p2"
                components={[
                  <span key="1" className="font-mono" />,
                  <span key="2" className="font-mono" />,
                  <strong key="3" />,
                  <strong key="4" />,
                  <strong key="5" />,
                ]}
              />
            </p>
            <p className="font-medium text-amber-950">
              <Trans
                i18nKey="insights:guide.laravelVsDb.p3"
                components={[<span key="1" className="font-mono" />]}
              />
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-[12px] font-bold uppercase tracking-[0.12em] text-ink-40">
              {t('insights:guide.allowedKinds.heading')}
            </h3>
            <p className="text-[13px]">
              <Trans
                i18nKey="insights:guide.allowedKinds.description"
                components={[
                  <span key="1" className="font-mono" />,
                  <span key="2" className="font-mono" />,
                ]}
              />
            </p>
            <ul className="columns-1 gap-x-8 font-mono text-[12px] text-ink sm:columns-2">
              {ALLOWED_ACTION_KINDS.map((k) => (
                <li key={k} className="break-all py-0.5">
                  {k}
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="text-[12px] font-bold uppercase tracking-[0.12em] text-ink-40">
              {t('insights:guide.fields.heading')}
            </h3>
            <dl className="grid gap-3 text-[13px] sm:grid-cols-1">
              <div className="rounded-xl border border-ink-10 bg-ink-5/40 px-3 py-2">
                <dt className="font-mono font-semibold text-ink">action_kind</dt>
                <dd className="mt-1">{t('insights:guide.fields.actionKind')}</dd>
              </div>
              <div className="rounded-xl border border-ink-10 bg-ink-5/40 px-3 py-2">
                <dt className="font-mono font-semibold text-ink">target_type</dt>
                <dd className="mt-1">
                  <Trans
                    i18nKey="insights:guide.fields.targetType"
                    components={[
                      <span key="1" className="font-mono" />,
                      <span key="2" className="font-mono" />,
                      <strong key="3" />,
                    ]}
                  />
                </dd>
              </div>
              <div className="rounded-xl border border-ink-10 bg-ink-5/40 px-3 py-2">
                <dt className="font-mono font-semibold text-ink">target_id</dt>
                <dd className="mt-1">{t('insights:guide.fields.targetId')}</dd>
              </div>
              <div className="rounded-xl border border-ink-10 bg-ink-5/40 px-3 py-2">
                <dt className="font-mono font-semibold text-ink">summary</dt>
                <dd className="mt-1">
                  <Trans i18nKey="insights:guide.fields.summary" components={[<strong key="1" />]} />
                </dd>
              </div>
              <div className="rounded-xl border border-ink-10 bg-ink-5/40 px-3 py-2">
                <dt className="font-mono font-semibold text-ink">metadata</dt>
                <dd className="mt-1">
                  <Trans i18nKey="insights:guide.fields.metadata" components={[<strong key="1" />]} />
                </dd>
              </div>
            </dl>
          </section>

          <section className="space-y-2">
            <h3 className="text-[12px] font-bold uppercase tracking-[0.12em] text-ink-40">
              {t('insights:guide.whenToUse.heading')}
            </h3>
            <ul className="list-inside list-disc space-y-1 text-[13px]">
              <li>{t('insights:guide.whenToUse.item1')}</li>
              <li>{t('insights:guide.whenToUse.item2')}</li>
            </ul>
            <p className="text-[13px]">
              <Trans
                i18nKey="insights:guide.whenToUse.footer"
                components={[<span key="1" className="font-mono text-ink" />]}
              />
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-[12px] font-bold uppercase tracking-[0.12em] text-ink-40">
              {t('insights:guide.minimalBody.heading')}
            </h3>
            <pre className="max-h-48 overflow-auto rounded-2xl border border-ink-10 bg-ink-5/50 p-4 font-mono text-[12px] text-ink">
              {t('insights:guide.minimalBody.json')}
            </pre>
          </section>

          <section className="space-y-2">
            <h3 className="text-[12px] font-bold uppercase tracking-[0.12em] text-ink-40">
              {t('insights:guide.richerExample.heading')}
            </h3>
            <p className="text-[13px]">
              <Trans
                i18nKey="insights:guide.richerExample.description"
                components={[
                  <span key="1" className="font-mono text-ink" />,
                  <span key="2" className="font-mono text-ink" />,
                  <span key="3" className="font-mono text-ink" />,
                  <span key="4" className="font-mono text-ink" />,
                ]}
              />
            </p>
            <pre className="max-h-56 overflow-auto rounded-2xl border border-ink-10 bg-ink-5/50 p-4 font-mono text-[12px] text-ink">
              {t('insights:guide.richerExample.json')}
            </pre>
          </section>
        </div>

        <div className="shrink-0 border-t border-ink-10 bg-ink-5/30 px-5 py-3 sm:px-6">
          <Button type="button" variant="dark" className="w-full sm:w-auto" onClick={onClose}>
            {t('insights:guide.gotIt')}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
