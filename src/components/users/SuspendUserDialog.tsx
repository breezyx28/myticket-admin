import { Button } from '@/components/ui/Button';
import {
  USER_SUSPENSION_CUSTOM_OPTION,
  USER_SUSPENSION_PRESET_REASON_KEYS,
} from '@/lib/userSuspensionReasons';
import { cn } from '@/lib/utils';
import type { SuspendUserInput } from '@/schemas/user.schema';
import { AlertTriangle } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { Trans, useTranslation } from 'react-i18next';

type SuspendUserDialogProps = {
  open: boolean;
  userLabel: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (values: SuspendUserInput) => void | Promise<void>;
};

export function SuspendUserDialog({
  open,
  userLabel,
  loading = false,
  onClose,
  onConfirm,
}: SuspendUserDialogProps) {
  const { t } = useTranslation(['operations', 'common', 'validation']);
  const titleId = useId();
  const [preset, setPreset] = useState<string>(USER_SUSPENSION_PRESET_REASON_KEYS[0]);
  const [customReason, setCustomReason] = useState('');
  const [permanent, setPermanent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setPreset(USER_SUSPENSION_PRESET_REASON_KEYS[0]);
    setCustomReason('');
    setPermanent(false);
    setError(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, loading, onClose]);

  if (!open || typeof document === 'undefined') return null;

  const usingCustom = preset === USER_SUSPENSION_CUSTOM_OPTION;
  const resolvedReason = usingCustom ? customReason.trim() : t(`operations:${preset}`);

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
        className="relative z-[101] w-full max-w-lg rounded-3xl border border-ink-10 bg-white p-6 shadow-card-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="flex gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-coral/15 text-coral">
            <AlertTriangle className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="text-lg font-extrabold tracking-tight text-ink">
              {t('operations:users.suspendDialogTitle')}
            </h2>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-60">
              <Trans
                ns="operations"
                i18nKey="users.suspendDialogBody"
                values={{ name: userLabel }}
                components={{ strong: <span className="font-semibold text-ink" /> }}
              />
            </p>
          </div>
        </div>

        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (resolvedReason.length < 3) {
              setError(t('validation:suspensionReasonMin'));
              return;
            }
            setError(null);
            void onConfirm({ reason: resolvedReason, permanent });
          }}
        >
          <label className="block space-y-2">
            <span className="text-[12px] font-semibold uppercase tracking-wide text-ink-40">
              {t('operations:users.reason')}
            </span>
            <select
              className={cn(
                'w-full rounded-xl border border-ink-10 bg-white px-4 py-2.5 text-[14px] font-medium text-ink outline-none',
                'focus:border-coral focus:ring-2 focus:ring-coral/30',
              )}
              value={preset}
              disabled={loading}
              onChange={(e) => {
                setPreset(e.target.value);
                setError(null);
              }}
            >
              {USER_SUSPENSION_PRESET_REASON_KEYS.map((reasonKey) => (
                <option key={reasonKey} value={reasonKey}>
                  {t(`operations:${reasonKey}`)}
                </option>
              ))}
              <option value={USER_SUSPENSION_CUSTOM_OPTION}>{t('operations:suspensionReason.custom')}</option>
            </select>
          </label>

          {usingCustom ? (
            <label className="block space-y-2">
              <span className="text-[12px] font-semibold uppercase tracking-wide text-ink-40">
                {t('operations:suspensionReason.customLabel')}
              </span>
              <textarea
                className="min-h-[96px] w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px] outline-none focus:border-coral focus:ring-2 focus:ring-coral/30"
                placeholder={t('operations:suspensionReason.customPlaceholder')}
                value={customReason}
                disabled={loading}
                onChange={(e) => {
                  setCustomReason(e.target.value);
                  setError(null);
                }}
              />
            </label>
          ) : null}

          <label className="flex items-start gap-3 rounded-2xl border border-ink-10 bg-surface-tint/60 px-4 py-3 text-[14px]">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={permanent}
              disabled={loading}
              onChange={(e) => setPermanent(e.target.checked)}
            />
            <span>
              <span className="font-semibold text-ink">{t('operations:users.permanentSuspension')}</span>
              <span className="mt-0.5 block text-[13px] text-ink-60">
                {t('operations:users.permanentSuspensionHint')}
              </span>
            </span>
          </label>

          {error ? <p className="text-[12px] font-medium text-coral">{error}</p> : null}

          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <Button type="button" variant="outline" disabled={loading} onClick={onClose}>
              {t('common:cancel')}
            </Button>
            <Button type="submit" variant="danger" loading={loading}>
              {t('operations:users.confirmSuspend')}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
