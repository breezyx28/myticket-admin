import { WEEKDAY_KEYS, type OpeningHours } from '@/schemas/tourismAd.schema';

const DAY_LABELS: Record<(typeof WEEKDAY_KEYS)[number], string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
};

type Props = {
  value: OpeningHours;
  onChange: (next: OpeningHours) => void;
  disabled?: boolean;
};

export function OpeningHoursEditor({ value, onChange, disabled }: Props) {
  return (
    <div className="space-y-3">
      {WEEKDAY_KEYS.map((day) => {
        const row = value[day];
        return (
          <div
            key={day}
            className="grid gap-3 rounded-2xl border border-ink-10 bg-surface-tint/40 p-4 sm:grid-cols-[120px_1fr_1fr_auto]"
          >
            <p className="text-[13px] font-bold text-ink">{DAY_LABELS[day]}</p>
            <label className="flex flex-col gap-1 text-[12px] font-semibold text-ink-60">
              Opens
              <input
                type="time"
                disabled={disabled || row.closed}
                value={row.opens ?? ''}
                onChange={(e) => onChange({ ...value, [day]: { ...row, opens: e.target.value } })}
                className="h-10 rounded-xl border border-ink-10 bg-white px-3 text-[14px] text-ink disabled:opacity-50"
              />
            </label>
            <label className="flex flex-col gap-1 text-[12px] font-semibold text-ink-60">
              Closes
              <input
                type="time"
                disabled={disabled || row.closed}
                value={row.closes ?? ''}
                onChange={(e) => onChange({ ...value, [day]: { ...row, closes: e.target.value } })}
                className="h-10 rounded-xl border border-ink-10 bg-white px-3 text-[14px] text-ink disabled:opacity-50"
              />
            </label>
            <label className="flex items-end gap-2 pb-2 text-[12px] font-semibold text-ink-60">
              <input
                type="checkbox"
                disabled={disabled}
                checked={row.closed}
                onChange={(e) =>
                  onChange({
                    ...value,
                    [day]: e.target.checked
                      ? { closed: true }
                      : { closed: false, opens: '09:00', closes: '18:00' },
                  })
                }
                className="size-4 rounded border-ink-20"
              />
              Closed
            </label>
          </div>
        );
      })}
    </div>
  );
}
