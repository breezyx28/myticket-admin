import { ListFiltersBar } from '@/components/admin/ListFiltersBar';
import { filterSelectClassName } from '@/lib/adminFilters';
import { AdminEventCard } from '@/components/events/AdminEventCard';
import { AdminSection } from '@/components/layout/AdminSection';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { rowMatchesSearch } from '@/lib/listQuery';
import { notifyError, notifySuccess } from '@/lib/notify';
import { cancelEventSchema, type CancelEventInput } from '@/schemas/event.schema';
import type { AdminEventRow } from '@/schemas/event.schema';
import { useCancelEventMutation, useGetEventsQuery } from '@/services/adminApi';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { useMemo, useState } from 'react';

function canCancelEvent(e: AdminEventRow) {
  return e.status === 'active';
}

export function EventCancellationPage() {
  const { data, isLoading } = useGetEventsQuery();
  const [cancel, cancelState] = useCancelEventMutation();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | AdminEventRow['status']>('all');
  const [category, setCategory] = useState<string>('all');
  const [selected, setSelected] = useState<string | null>(null);
  const form = useForm<CancelEventInput>({
    resolver: zodResolver(cancelEventSchema),
    defaultValues: { eventId: '', confirmTitle: '', acknowledgement: false },
  });
  const acknowledgement = useWatch({ control: form.control, name: 'acknowledgement' });
  const selectedEvent = data?.find((e) => e.id === selected);
  const showForm = Boolean(selectedEvent && canCancelEvent(selectedEvent));

  const categories = useMemo(() => {
    const s = new Set((data ?? []).map((e) => e.category));
    return Array.from(s).sort();
  }, [data]);

  const filtered = useMemo(() => {
    const rows = data ?? [];
    return rows.filter((e) => {
      if (status !== 'all' && e.status !== status) return false;
      if (category !== 'all' && e.category !== category) return false;
      return rowMatchesSearch(search, [e.title, e.organizerName, e.city, e.category, e.venueName, e.id]);
    });
  }, [data, search, status, category]);

  return (
    <div className="space-y-12">
      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-ink-40">Events</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">Event cancellation</h1>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-60">
          Professional cards surface the same KPIs as the overview dashboard. Only active events can enter the
          cancellation wizard; ended or cancelled rows stay visible for audit context.
        </p>
      </div>

      <AdminSection
        eyebrow="Selection"
        title="Choose an event"
        description="Tap a card to load the destructive confirmation panel. Metrics help verify you are targeting the correct production."
      >
        <ListFiltersBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search title, organizer, venue…"
          className="mb-6"
        >
          <select className={filterSelectClassName()} value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="ended">Ended</option>
            <option value="cancelled">Cancelled</option>
            <option value="archived">Archived</option>
          </select>
          <select className={filterSelectClassName()} value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </ListFiltersBar>
        {isLoading ? <p className="text-sm text-ink-60">Loading…</p> : null}
        {!isLoading && filtered.length === 0 ? (
          <p className="mb-4 text-sm font-semibold text-ink-60">No events match your search and filters.</p>
        ) : null}
        <div className="grid gap-6 md:grid-cols-2">
          {filtered.map((e) => {
            const eligible = canCancelEvent(e);
            return (
              <AdminEventCard
                key={e.id}
                event={e}
                selectable
                selected={selected === e.id}
                onSelect={() => {
                  setSelected(e.id);
                  form.reset({ eventId: e.id, confirmTitle: '', acknowledgement: false });
                }}
                showDetailLink
                eligible={eligible}
                eligibilityHint={eligible ? undefined : e.status === 'cancelled' ? 'Already cancelled' : 'Not active'}
              />
            );
          })}
        </div>
      </AdminSection>

      {showForm ? (
        <AdminSection
          divider
          eyebrow="Confirmation"
          title="Destructive action"
          description="Title match plus acknowledgement protect against fat-finger cancels while refunds are still mocked."
        >
          <Card className="rounded-3xl border-coral/25 bg-coral/5 shadow-card-md">
            <CardHeader>
              <CardTitle className="text-xl font-extrabold text-coral">Cancel event (mock)</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                className="space-y-4"
                onSubmit={form.handleSubmit(async (values) => {
                  const title = data?.find((e) => e.id === selected)?.title;
                  if (title && values.confirmTitle.trim() !== title) {
                    form.setError('confirmTitle', { message: 'Must match the event title exactly.' });
                    notifyError('Title does not match — cancellation aborted.');
                    return;
                  }
                  try {
                    await cancel(values).unwrap();
                    notifySuccess('Event marked as cancelled (mock). Attendees would be notified in production.');
                    setSelected(null);
                  } catch {
                    notifyError('Cancellation failed (mock).');
                  }
                })}
              >
                <input type="hidden" {...form.register('eventId')} />
                <p className="text-[13px] font-medium text-ink-60">
                  Type the exact event title to confirm:{' '}
                  <span className="font-extrabold text-ink">{data?.find((e) => e.id === selected)?.title}</span>
                </p>
                <label className="block">
                  <span className="text-[12px] font-bold text-ink-60">Confirm title</span>
                  <input
                    className="mt-1.5 w-full rounded-xl border border-ink-10 bg-white px-4 py-3 text-[14px] outline-none focus:border-coral focus:ring-2 focus:ring-coral/30"
                    {...form.register('confirmTitle')}
                  />
                </label>
                <label className="flex items-center gap-2 text-[14px] font-semibold text-ink">
                  <input
                    type="checkbox"
                    checked={Boolean(acknowledgement)}
                    onChange={(e) =>
                      form.setValue('acknowledgement', e.target.checked, { shouldValidate: true, shouldDirty: true })
                    }
                  />
                  I understand tickets will be marked cancelled and users notified (mock).
                </label>
                {form.formState.errors.confirmTitle ? (
                  <p className="text-[12px] font-bold text-coral">{form.formState.errors.confirmTitle.message}</p>
                ) : null}
                {form.formState.errors.acknowledgement ? (
                  <p className="text-[12px] font-bold text-coral">{form.formState.errors.acknowledgement.message}</p>
                ) : null}
                <Button type="submit" variant="danger" loading={cancelState.isLoading}>
                  Cancel event (mock)
                </Button>
              </form>
            </CardContent>
          </Card>
        </AdminSection>
      ) : null}
    </div>
  );
}
