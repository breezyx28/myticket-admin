import { Button } from '@/components/ui/Button';
import {
  USER_SUSPENSION_CUSTOM_OPTION,
  USER_SUSPENSION_PRESET_REASONS,
} from '@/lib/userSuspensionReasons';
import { cn } from '@/lib/utils';
import type { SuspendUserInput } from '@/schemas/user.schema';
import { AlertTriangle } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';

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
  const titleId = useId();
  const [preset, setPreset] = useState<string>(USER_SUSPENSION_PRESET_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [permanent, setPermanent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setPreset(USER_SUSPENSION_PRESET_REASONS[0]);
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
  const resolvedReason = usingCustom ? customReason.trim() : preset;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-ink/55 backdrop-blur-[1px]"
        aria-label="Close dialog"
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
              Suspend account
            </h2>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-60">
              This revokes all active sessions for{' '}
              <span className="font-semibold text-ink">{userLabel}</span>. The action is recorded in
              the admin audit log.
            </p>
          </div>
        </div>

        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (resolvedReason.length < 3) {
              setError('Provide a suspension reason (at least 3 characters).');
              return;
            }
            setError(null);
            void onConfirm({ reason: resolvedReason, permanent });
          }}
        >
          <label className="block space-y-2">
            <span className="text-[12px] font-semibold uppercase tracking-wide text-ink-40">
              Reason
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
              {USER_SUSPENSION_PRESET_REASONS.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
              <option value={USER_SUSPENSION_CUSTOM_OPTION}>Custom reason…</option>
            </select>
          </label>

          {usingCustom ? (
            <label className="block space-y-2">
              <span className="text-[12px] font-semibold uppercase tracking-wide text-ink-40">
                Custom reason
              </span>
              <textarea
                className="min-h-[96px] w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px] outline-none focus:border-coral focus:ring-2 focus:ring-coral/30"
                placeholder="Describe why this account is being suspended"
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
              <span className="font-semibold text-ink">Permanent suspension</span>
              <span className="mt-0.5 block text-[13px] text-ink-60">
                Leave unchecked for a temporary suspension that can be reversed later.
              </span>
            </span>
          </label>

          {error ? <p className="text-[12px] font-medium text-coral">{error}</p> : null}

          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <Button type="button" variant="outline" disabled={loading} onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" loading={loading}>
              Confirm suspend
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
