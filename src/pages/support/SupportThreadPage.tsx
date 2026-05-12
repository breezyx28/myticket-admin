import { Button } from '@/components/ui/Button';
import { notifyError, notifySuccess } from '@/lib/notify';
import { supportPriorityBadgeClass, supportStatusBadgeClass } from '@/lib/supportStatusUi';
import { cn } from '@/lib/utils';
import {
  supportReplySchema,
  updateSupportStatusSchema,
  type SupportReplyInput,
  type UpdateSupportStatusInput,
} from '@/schemas/support.schema';
import {
  useAddSupportReplyMutation,
  useGetSupportThreadQuery,
  useReopenSupportCaseMutation,
  useUpdateSupportStatusMutation,
} from '@/services/adminApi';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useParams } from 'react-router-dom';

function statusLabel(s: string): string {
  return s.replace(/_/g, ' ');
}

export function SupportThreadPage() {
  const { id = '' } = useParams();
  const q = useGetSupportThreadQuery(id, { skip: !id });
  const [update, updateState] = useUpdateSupportStatusMutation();
  const [reopen, reopenState] = useReopenSupportCaseMutation();
  const [reply, replyState] = useAddSupportReplyMutation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const form = useForm<UpdateSupportStatusInput>({
    resolver: zodResolver(updateSupportStatusSchema),
    defaultValues: { status: 'open', resolutionNote: '' },
  });
  const replyForm = useForm<SupportReplyInput>({
    resolver: zodResolver(supportReplySchema),
    defaultValues: { body: '' },
  });

  useEffect(() => {
    if (q.data) form.reset({ status: q.data.status, resolutionNote: '' });
  }, [q.data, form]);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [q.data?.messages]);

  if (q.isLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-3xl border border-ink-10 bg-white">
        <p className="text-sm font-medium text-ink-60">Loading conversation…</p>
      </div>
    );
  }

  if (!q.data) {
    return (
      <div className="rounded-3xl border border-ink-10 bg-white p-8">
        <p className="font-semibold text-ink">Thread not found.</p>
        <Link to="/support" className="mt-4 inline-block text-[13px] font-semibold text-coral hover:underline">
          ← Back to inbox
        </Link>
      </div>
    );
  }

  const t = q.data;

  return (
    <div className="flex min-h-[calc(100dvh-7rem)] flex-col gap-3">
      <Link
        to="/support"
        className="inline-flex w-fit items-center gap-1 text-[13px] font-semibold text-coral hover:underline"
      >
        ← Inbox
      </Link>

      <div className="flex min-h-[min(640px,calc(100dvh-9rem))] flex-1 flex-col overflow-hidden rounded-3xl border border-ink-10 bg-white shadow-card-sm lg:min-h-0 lg:flex-row">
        {/* Chat column */}
        <section className="flex min-h-0 min-w-0 flex-1 flex-col border-ink-10 lg:border-r">
          <header className="shrink-0 border-b border-ink-10 bg-white px-4 py-4 sm:px-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <h1 className="text-xl font-extrabold tracking-tight text-ink sm:text-2xl">{t.subject}</h1>
                {t.requesterDisplayName ? (
                  <p className="text-[15px] font-semibold text-ink">{t.requesterDisplayName}</p>
                ) : null}
                <p className={cn('text-[13px]', t.requesterDisplayName ? 'text-ink-50' : 'text-ink-60')}>
                  {t.userEmail}
                </p>
                {t.code ? (
                  <p className="font-mono text-[11px] font-semibold uppercase tracking-wide text-ink-40">{t.code}</p>
                ) : null}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <span
                  className={cn(
                    'rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide',
                    supportStatusBadgeClass(t.status),
                  )}
                >
                  {statusLabel(t.status)}
                </span>
                {t.priority ? (
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                      supportPriorityBadgeClass(t.priority),
                    )}
                  >
                    {t.priority} priority
                  </span>
                ) : null}
              </div>
            </div>
          </header>

          <div
            ref={scrollRef}
            className="min-h-0 flex-1 overflow-y-auto bg-ink-5/50 px-3 py-4 sm:px-5"
          >
            <div className="mx-auto flex max-w-3xl flex-col gap-3">
              {t.messages.map((m) => {
                const isAdmin = m.author === 'admin';
                return (
                  <div
                    key={m.id}
                    className={`flex w-full ${isAdmin ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[min(100%,28rem)] rounded-2xl px-4 py-3 text-[14px] leading-relaxed shadow-sm ${
                        isAdmin
                          ? 'rounded-br-md bg-ink text-white'
                          : 'rounded-bl-md border border-ink-10 bg-white text-ink'
                      }`}
                    >
                      <p
                        className={`text-[10px] font-bold uppercase tracking-wider ${
                          isAdmin ? 'text-white/70' : 'text-ink-40'
                        }`}
                      >
                        {m.author === 'admin' ? 'You (admin)' : 'Customer'}
                      </p>
                      <p className={`mt-1.5 whitespace-pre-wrap ${isAdmin ? 'text-white' : 'text-ink'}`}>{m.body}</p>
                      <p className={`mt-2 text-[11px] ${isAdmin ? 'text-white/60' : 'text-ink-40'}`}>
                        {new Date(m.sentAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <form
            className="shrink-0 border-t border-ink-10 bg-white p-3 sm:p-4"
            onSubmit={replyForm.handleSubmit(async (values) => {
              try {
                await reply({ threadId: t.id, body: values.body }).unwrap();
                notifySuccess('Reply sent.');
                replyForm.reset({ body: '' });
              } catch {
                notifyError('Could not send reply.');
              }
            })}
          >
            <div className="mx-auto flex max-w-3xl flex-col gap-2">
              <label className="block">
                <span className="sr-only">Message</span>
                <textarea
                  className="min-h-[88px] w-full resize-y rounded-2xl border border-ink-10 bg-ink-5/30 px-4 py-3 text-[14px] outline-none transition-colors placeholder:text-ink-40 focus:border-coral focus:bg-white focus:ring-2 focus:ring-coral/25"
                  placeholder="Write a reply…"
                  rows={3}
                  {...replyForm.register('body')}
                />
              </label>
              {replyForm.formState.errors.body ? (
                <p className="text-[12px] font-medium text-coral">{replyForm.formState.errors.body.message}</p>
              ) : null}
              <div className="flex justify-end">
                <Button type="submit" variant="dark" loading={replyState.isLoading}>
                  Send message
                </Button>
              </div>
            </div>
          </form>
        </section>

        {/* Desk tools — same actions as before */}
        <aside className="flex w-full shrink-0 flex-col gap-4 border-t border-ink-10 bg-white p-4 sm:p-5 lg:w-[min(100%,320px)] lg:border-l lg:border-t-0">
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-40">Desk</h2>
            <p className="mt-1 text-[12px] leading-relaxed text-ink-60">
              Resolve, assign, or reopen — same endpoints as before.
            </p>
          </div>

          {t.status === 'resolved' ? (
            <div className="rounded-2xl border border-ink-10 bg-ink-5/40 p-4">
              <p className="text-[13px] font-semibold text-ink">This case is resolved.</p>
              {t.resolutionNote ? (
                <p className="mt-2 rounded-xl border border-emerald-200/80 bg-emerald-50/80 px-3 py-2 text-[12px] leading-relaxed text-emerald-950">
                  <span className="font-bold uppercase tracking-wide text-emerald-800">Resolution note</span>
                  <span className="mt-1 block whitespace-pre-wrap text-emerald-950/90">{t.resolutionNote}</span>
                </p>
              ) : null}
              <Button
                type="button"
                className="mt-3"
                variant="outline"
                loading={reopenState.isLoading}
                onClick={async () => {
                  try {
                    await reopen(t.id).unwrap();
                    notifySuccess('Case reopened.');
                  } catch {
                    notifyError('Could not reopen case.');
                  }
                }}
              >
                Reopen case
              </Button>
              <p className="mt-2 text-[11px] leading-snug text-ink-50">
                Uses <span className="font-mono text-ink">POST …/support-cases/{'{id}'}/reopen</span>. The API may
                return 422 if the case is not in a resolved state.
              </p>
            </div>
          ) : null}

          <form
            className="space-y-3 rounded-2xl border border-ink-10 p-4"
            onSubmit={form.handleSubmit(async (values) => {
              try {
                await update({ id: t.id, body: values }).unwrap();
                notifySuccess('Support status updated.');
              } catch {
                notifyError('Could not update status.');
              }
            })}
          >
            <p className="text-[12px] font-semibold text-ink">Update status</p>
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-50">Status</span>
              <select
                className="mt-1.5 w-full rounded-xl border border-ink-10 bg-white px-3 py-2.5 text-[14px] outline-none focus:border-coral focus:ring-2 focus:ring-coral/25"
                {...form.register('status')}
              >
                <option value="open">Open</option>
                <option value="in_progress">In progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </label>
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-50">
                Resolution note (optional)
              </span>
              <textarea
                className="mt-1.5 min-h-[72px] w-full rounded-xl border border-ink-10 px-3 py-2.5 text-[14px] outline-none focus:border-coral focus:ring-2 focus:ring-coral/25"
                {...form.register('resolutionNote')}
              />
            </label>
            <Button type="submit" variant="secondary" className="w-full" loading={updateState.isLoading}>
              Save status
            </Button>
          </form>
        </aside>
      </div>
    </div>
  );
}
