import { Button } from '@/components/ui/Button';
import { getCurrentLocale } from '@/i18n';
import { getApiErrorMessage } from '@/lib/apiError';
import { formatDateTime } from '@/lib/localeFormat';
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
import { i18nZodResolver } from '@/lib/i18nZodResolver';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';

export function SupportThreadPage() {
  const { t } = useTranslation(['support', 'common', 'errors']);
  const locale = getCurrentLocale();
  const { id = '' } = useParams();
  const q = useGetSupportThreadQuery(id, { skip: !id });
  const [update, updateState] = useUpdateSupportStatusMutation();
  const [reopen, reopenState] = useReopenSupportCaseMutation();
  const [reply, replyState] = useAddSupportReplyMutation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const form = useForm<UpdateSupportStatusInput>({
    resolver: i18nZodResolver(updateSupportStatusSchema),
    defaultValues: { status: 'open', resolutionNote: '' },
  });
  const replyForm = useForm<SupportReplyInput>({
    resolver: i18nZodResolver(supportReplySchema),
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
        <p className="text-sm font-medium text-ink-60">{t('support:thread.loading')}</p>
      </div>
    );
  }

  if (!q.data) {
    return (
      <div className="rounded-3xl border border-ink-10 bg-white p-8">
        <p className="font-semibold text-ink">{t('support:thread.notFound')}</p>
        <Link to="/support" className="mt-4 inline-block text-[13px] font-semibold text-coral hover:underline">
          {t('support:thread.backToInbox')}
        </Link>
      </div>
    );
  }

  const thread = q.data;

  return (
    <div className="flex min-h-[calc(100dvh-7rem)] flex-col gap-3">
      <Link
        to="/support"
        className="inline-flex w-fit items-center gap-1 text-[13px] font-semibold text-coral hover:underline"
      >
        {t('support:thread.inbox')}
      </Link>

      <div className="flex min-h-[min(640px,calc(100dvh-9rem))] flex-1 flex-col overflow-hidden rounded-3xl border border-ink-10 bg-white shadow-card-sm lg:min-h-0 lg:flex-row">
        {/* Chat column */}
        <section className="flex min-h-0 min-w-0 flex-1 flex-col border-ink-10 lg:border-r">
          <header className="shrink-0 border-b border-ink-10 bg-white px-4 py-4 sm:px-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <h1 className="text-xl font-extrabold tracking-tight text-ink sm:text-2xl">{thread.subject}</h1>
                {thread.requesterDisplayName ? (
                  <p className="text-[15px] font-semibold text-ink">{thread.requesterDisplayName}</p>
                ) : null}
                <p className={cn('text-[13px]', thread.requesterDisplayName ? 'text-ink-50' : 'text-ink-60')}>
                  {thread.userEmail}
                </p>
                {thread.code ? (
                  <p className="font-mono text-[11px] font-semibold uppercase tracking-wide text-ink-40">{thread.code}</p>
                ) : null}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <span
                  className={cn(
                    'rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide',
                    supportStatusBadgeClass(thread.status),
                  )}
                >
                  {t(`support:status.${thread.status}`)}
                </span>
                {thread.priority ? (
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                      supportPriorityBadgeClass(thread.priority),
                    )}
                  >
                    {t('support:priority.suffix', { priority: t(`support:priority.${thread.priority}`) })}
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
              {thread.messages.map((m) => {
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
                        {m.author === 'admin' ? t('support:thread.authorAdmin') : t('support:thread.authorCustomer')}
                      </p>
                      <p className={`mt-1.5 whitespace-pre-wrap ${isAdmin ? 'text-white' : 'text-ink'}`}>{m.body}</p>
                      <p className={`mt-2 text-[11px] ${isAdmin ? 'text-white/60' : 'text-ink-40'}`}>
                        {formatDateTime(m.sentAt, locale)}
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
                await reply({ threadId: thread.id, body: values.body }).unwrap();
                notifySuccess(t('support:thread.notify.replySent'));
                replyForm.reset({ body: '' });
              } catch (err) {
                notifyError(getApiErrorMessage(err, t('errors:requestFailed')));
              }
            })}
          >
            <div className="mx-auto flex max-w-3xl flex-col gap-2">
              <label className="block">
                <span className="sr-only">{t('support:thread.messageLabel')}</span>
                <textarea
                  className="min-h-[88px] w-full resize-y rounded-2xl border border-ink-10 bg-ink-5/30 px-4 py-3 text-[14px] outline-none transition-colors placeholder:text-ink-40 focus:border-coral focus:bg-white focus:ring-2 focus:ring-coral/25"
                  placeholder={t('support:thread.replyPlaceholder')}
                  rows={3}
                  {...replyForm.register('body')}
                />
              </label>
              {replyForm.formState.errors.body ? (
                <p className="text-[12px] font-medium text-coral">{replyForm.formState.errors.body.message}</p>
              ) : null}
              <div className="flex justify-end">
                <Button type="submit" variant="dark" loading={replyState.isLoading}>
                  {t('support:thread.sendMessage')}
                </Button>
              </div>
            </div>
          </form>
        </section>

        {/* Desk tools — same actions as before */}
        <aside className="flex w-full shrink-0 flex-col gap-4 border-t border-ink-10 bg-white p-4 sm:p-5 lg:w-[min(100%,320px)] lg:border-l lg:border-t-0">
          <div>
            <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-40">{t('support:thread.deskTitle')}</h2>
            <p className="mt-1 text-[12px] leading-relaxed text-ink-60">{t('support:thread.deskDescription')}</p>
          </div>

          {thread.status === 'resolved' ? (
            <div className="rounded-2xl border border-ink-10 bg-ink-5/40 p-4">
              <p className="text-[13px] font-semibold text-ink">{t('support:thread.resolvedTitle')}</p>
              {thread.resolutionNote ? (
                <p className="mt-2 rounded-xl border border-emerald-200/80 bg-emerald-50/80 px-3 py-2 text-[12px] leading-relaxed text-emerald-950">
                  <span className="font-bold uppercase tracking-wide text-emerald-800">
                    {t('support:thread.resolutionNote')}
                  </span>
                  <span className="mt-1 block whitespace-pre-wrap text-emerald-950/90">{thread.resolutionNote}</span>
                </p>
              ) : null}
              <Button
                type="button"
                className="mt-3"
                variant="outline"
                loading={reopenState.isLoading}
                onClick={async () => {
                  try {
                    await reopen(thread.id).unwrap();
                    notifySuccess(t('support:thread.notify.reopened'));
                  } catch (err) {
                    notifyError(getApiErrorMessage(err, t('errors:requestFailed')));
                  }
                }}
              >
                {t('support:thread.reopenCase')}
              </Button>
              <p className="mt-2 text-[11px] leading-snug text-ink-50">
                <Trans
                  i18nKey="support:thread.reopenHint"
                  components={[<span key="1" className="font-mono text-ink" />]}
                />
              </p>
            </div>
          ) : null}

          <form
            className="space-y-3 rounded-2xl border border-ink-10 p-4"
            onSubmit={form.handleSubmit(async (values) => {
              try {
                await update({ id: thread.id, body: values }).unwrap();
                notifySuccess(t('support:thread.notify.statusUpdated'));
              } catch (err) {
                notifyError(getApiErrorMessage(err, t('errors:requestFailed')));
              }
            })}
          >
            <p className="text-[12px] font-semibold text-ink">{t('support:thread.updateStatus')}</p>
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-50">
                {t('support:thread.statusLabel')}
              </span>
              <select
                className="mt-1.5 w-full rounded-xl border border-ink-10 bg-white px-3 py-2.5 text-[14px] outline-none focus:border-coral focus:ring-2 focus:ring-coral/25"
                {...form.register('status')}
              >
                <option value="open">{t('support:status.open')}</option>
                <option value="in_progress">{t('support:status.in_progress')}</option>
                <option value="resolved">{t('support:status.resolved')}</option>
              </select>
            </label>
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-50">
                {t('support:thread.resolutionNoteOptional')}
              </span>
              <textarea
                className="mt-1.5 min-h-[72px] w-full rounded-xl border border-ink-10 px-3 py-2.5 text-[14px] outline-none focus:border-coral focus:ring-2 focus:ring-coral/25"
                {...form.register('resolutionNote')}
              />
            </label>
            <Button type="submit" variant="secondary" className="w-full" loading={updateState.isLoading}>
              {t('support:thread.saveStatus')}
            </Button>
          </form>
        </aside>
      </div>
    </div>
  );
}
