import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { notifyError, notifySuccess } from '@/lib/notify';
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
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useParams } from 'react-router-dom';

export function SupportThreadPage() {
  const { id = '' } = useParams();
  const q = useGetSupportThreadQuery(id, { skip: !id });
  const [update, updateState] = useUpdateSupportStatusMutation();
  const [reopen, reopenState] = useReopenSupportCaseMutation();
  const [reply, replyState] = useAddSupportReplyMutation();
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

  if (q.isLoading) return <p className="text-ink-60">Loading…</p>;
  if (!q.data) {
    return (
      <div className="rounded-3xl border border-ink-10 bg-white p-8">
        <p className="font-semibold text-ink">Thread not found.</p>
        <Link to="/support" className="mt-4 inline-block text-coral hover:underline">
          Back
        </Link>
      </div>
    );
  }

  const t = q.data;

  return (
    <div className="space-y-6">
      <div>
        <Link to="/support" className="text-[13px] font-semibold text-coral hover:underline">
          ← Inbox
        </Link>
        <h1 className="mt-2 text-3xl font-extrabold text-ink">{t.subject}</h1>
        <p className="text-[14px] text-ink-60">{t.userEmail}</p>
      </div>

      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">Conversation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {t.messages.map((m) => (
            <div
              key={m.id}
              className={`rounded-2xl px-4 py-3 text-[14px] ${
                m.author === 'admin' ? 'ml-8 bg-ink text-white' : 'mr-8 bg-surface-tint text-ink'
              }`}
            >
              <p className="text-[11px] font-bold uppercase opacity-60">{m.author}</p>
              <p className="mt-1 whitespace-pre-wrap">{m.body}</p>
              <p className="mt-2 text-[11px] opacity-60">{new Date(m.sentAt).toLocaleString()}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">Admin reply</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="max-w-xl space-y-3"
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
            <label className="block">
              <span className="text-[12px] font-semibold text-ink-60">Message</span>
              <textarea
                className="mt-1.5 min-h-[100px] w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px] outline-none focus:border-coral focus:ring-2 focus:ring-coral/30"
                placeholder="Type a reply to append to the thread…"
                {...replyForm.register('body')}
              />
            </label>
            {replyForm.formState.errors.body ? (
              <p className="text-[12px] font-medium text-coral">{replyForm.formState.errors.body.message}</p>
            ) : null}
            <Button type="submit" variant="secondary" loading={replyState.isLoading}>
              Send reply
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardHeader>
          <CardTitle className="text-lg">Status</CardTitle>
        </CardHeader>
        <CardContent>
          {t.status === 'resolved' ? (
            <div className="mb-6">
              <Button
                type="button"
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
              <p className="mt-2 text-[12px] text-ink-60">
                POST <span className="font-mono text-ink">/support-cases/{'{id}'}/reopen</span> — empty body. The API may return{' '}
                <span className="font-mono text-ink">422</span> if the case is not resolved or closed.
              </p>
            </div>
          ) : null}
          <form
            className="max-w-md space-y-4"
            onSubmit={form.handleSubmit(async (values) => {
              try {
                await update({ id: t.id, body: values }).unwrap();
                notifySuccess('Support status updated.');
              } catch {
                notifyError('Could not update status.');
              }
            })}
          >
            <label className="block">
              <span className="text-[12px] font-semibold text-ink-60">Status</span>
              <select
                className="mt-1.5 w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px] outline-none focus:border-coral focus:ring-2 focus:ring-coral/30"
                {...form.register('status')}
              >
                <option value="open">Open</option>
                <option value="in_progress">In progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </label>
            <label className="block">
              <span className="text-[12px] font-semibold text-ink-60">Resolution note (optional)</span>
              <textarea
                className="mt-1.5 min-h-[80px] w-full rounded-xl border border-ink-10 px-4 py-3 text-[14px] outline-none focus:border-coral focus:ring-2 focus:ring-coral/30"
                {...form.register('resolutionNote')}
              />
            </label>
            <Button type="submit" variant="dark" loading={updateState.isLoading}>
              Update
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
