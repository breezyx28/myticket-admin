import { Button } from '@/components/ui/Button';
import { BookOpen } from 'lucide-react';
import { useEffect, useId } from 'react';
import { createPortal } from 'react-dom';

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

const MINIMAL_EXAMPLE = `{
  "action_kind": "listing_moderate",
  "summary": "Reviewed queue item offline with legal; no code change."
}`;

export const DEFAULT_ADMIN_ACTION_POST_BODY = MINIMAL_EXAMPLE;

const FULL_EXAMPLE = `{
  "action_kind": "support_resolve",
  "target_type": "user",
  "target_id": 441,
  "summary": "Called complainant about refund; agreed to partial credit. No ticket change required.",
  "metadata": {
    "channel": "phone",
    "duration_minutes": 12,
    "case_reference": "SC-2026-0142",
    "follow_up": "none"
  }
}`;

type AdminActionsGuideDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function AdminActionsGuideDialog({ open, onClose }: AdminActionsGuideDialogProps) {
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
        aria-label="Close guide"
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
              Recording work on the activity timeline
            </h2>
            <p className="mt-1 text-[13px] text-ink-60">
              POST <span className="font-mono text-ink">/api/v1/admin/admin-actions</span> — append a narrative row for
              audit, separate from domain endpoints that change real state.
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5 text-[14px] leading-relaxed text-ink-60 sm:px-6 sm:py-6">
          <section className="space-y-2">
            <h3 className="text-[12px] font-bold uppercase tracking-[0.12em] text-ink-40">In one sentence</h3>
            <p className="text-ink">
              Each POST appends one row to <span className="font-mono text-[13px] text-ink">admin_actions</span>: which
              admin (from your session) performed which <strong className="text-ink">kind</strong> of action, optionally
              pointed at a target, with a short <strong className="text-ink">summary</strong> and optional structured{' '}
              <strong className="text-ink">metadata</strong>.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-[12px] font-bold uppercase tracking-[0.12em] text-ink-40">Who is the admin?</h3>
            <p>
              <span className="font-semibold text-ink">admin_user_id</span> is taken from the authenticated admin. Do{' '}
              <span className="font-semibold text-ink">not</span> send it in the JSON body.
            </p>
          </section>

          <section className="space-y-3 rounded-2xl border border-amber-200/80 bg-amber-50/60 px-4 py-3 text-[13px] text-amber-950">
            <h3 className="text-[12px] font-bold uppercase tracking-[0.12em] text-amber-900/80">
              Laravel vs database (important)
            </h3>
            <p>
              The API only validates <span className="font-mono">action_kind</span> as <strong>required string</strong>{' '}
              — there is <strong>no</strong> PHP whitelist of allowed values.
            </p>
            <p>
              The <span className="font-mono">admin_actions</span> table stores{' '}
              <span className="font-mono">action_kind</span> as a MySQL <strong>ENUM</strong> with a{' '}
              <strong>fixed list</strong>. If you send any other string, PHP may accept the request but the insert can
              fail at the DB layer (often a <strong>500</strong>).
            </p>
            <p className="font-medium text-amber-950">
              Practical rule: only use one of the allowed enum values below. Free-form kinds (e.g.{' '}
              <span className="font-mono">manual_phone_call</span>) need a schema change on the server.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-[12px] font-bold uppercase tracking-[0.12em] text-ink-40">Allowed action_kind values</h3>
            <p className="text-[13px]">
              Pick the value that best matches the story; put nuance in <span className="font-mono">summary</span> /{' '}
              <span className="font-mono">metadata</span>.
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
            <h3 className="text-[12px] font-bold uppercase tracking-[0.12em] text-ink-40">Fields the handler reads</h3>
            <dl className="grid gap-3 text-[13px] sm:grid-cols-1">
              <div className="rounded-xl border border-ink-10 bg-ink-5/40 px-3 py-2">
                <dt className="font-mono font-semibold text-ink">action_kind</dt>
                <dd className="mt-1">
                  Required. Must be one of the enum values above (DB-enforced), even though Laravel only checks
                  “string”.
                </dd>
              </div>
              <div className="rounded-xl border border-ink-10 bg-ink-5/40 px-3 py-2">
                <dt className="font-mono font-semibold text-ink">target_type</dt>
                <dd className="mt-1">
                  Optional. Free text for your audit trail (e.g. <span className="font-mono">user</span>,{' '}
                  <span className="font-mono">event</span>), max <strong>80</strong> characters in the DB. The API does
                  not verify the target exists.
                </dd>
              </div>
              <div className="rounded-xl border border-ink-10 bg-ink-5/40 px-3 py-2">
                <dt className="font-mono font-semibold text-ink">target_id</dt>
                <dd className="mt-1">Optional unsigned integer (or omit / null).</dd>
              </div>
              <div className="rounded-xl border border-ink-10 bg-ink-5/40 px-3 py-2">
                <dt className="font-mono font-semibold text-ink">summary</dt>
                <dd className="mt-1">
                  Optional narrative, max <strong>500</strong> characters — use this for the human-readable story.
                </dd>
              </div>
              <div className="rounded-xl border border-ink-10 bg-ink-5/40 px-3 py-2">
                <dt className="font-mono font-semibold text-ink">metadata</dt>
                <dd className="mt-1">
                  Optional JSON object (your own keys/shapes), as long as it serializes to valid JSON and fits storage.
                  Extra top-level keys in the request body are <strong>ignored</strong> unless the backend is extended
                  to read them.
                </dd>
              </div>
            </dl>
          </section>

          <section className="space-y-2">
            <h3 className="text-[12px] font-bold uppercase tracking-[0.12em] text-ink-40">When to use this</h3>
            <ul className="list-inside list-disc space-y-1 text-[13px]">
              <li>You already performed the real change via another endpoint, but want a clear line on the timeline.</li>
              <li>You did offline / manual work (phone, legal review) that should still appear under admin activity.</li>
            </ul>
            <p className="text-[13px]">
              New rows appear when you refresh <span className="font-mono text-ink">GET /api/v1/admin/admin-actions</span>{' '}
              (this page lists the catalog; your timeline / list view may differ by product wiring).
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-[12px] font-bold uppercase tracking-[0.12em] text-ink-40">Minimal valid body</h3>
            <pre className="max-h-48 overflow-auto rounded-2xl border border-ink-10 bg-ink-5/50 p-4 font-mono text-[12px] text-ink">
              {MINIMAL_EXAMPLE}
            </pre>
          </section>

          <section className="space-y-2">
            <h3 className="text-[12px] font-bold uppercase tracking-[0.12em] text-ink-40">Richer example (201 response)</h3>
            <p className="text-[13px]">
              The API returns the created row under <span className="font-mono text-ink">data</span> (including{' '}
              <span className="font-mono">id</span>, <span className="font-mono">admin_user_id</span>,{' '}
              <span className="font-mono">created_at</span>, etc.).
            </p>
            <pre className="max-h-56 overflow-auto rounded-2xl border border-ink-10 bg-ink-5/50 p-4 font-mono text-[12px] text-ink">
              {FULL_EXAMPLE}
            </pre>
          </section>
        </div>

        <div className="shrink-0 border-t border-ink-10 bg-ink-5/30 px-5 py-3 sm:px-6">
          <Button type="button" variant="dark" className="w-full sm:w-auto" onClick={onClose}>
            Got it
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
