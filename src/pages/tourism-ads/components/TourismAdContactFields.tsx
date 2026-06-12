import type { TourismAdContact } from '@/schemas/tourismAd.schema';

type Props = {
  value: TourismAdContact;
  onChange: (next: TourismAdContact) => void;
  disabled?: boolean;
  errors?: Partial<Record<keyof TourismAdContact | 'root', string>>;
};

const fields: { key: keyof TourismAdContact; label: string; placeholder: string }[] = [
  { key: 'phone', label: 'Phone', placeholder: '+966500000000' },
  { key: 'email', label: 'Email', placeholder: 'contact@example.com' },
  { key: 'website', label: 'Website', placeholder: 'https://example.com' },
  { key: 'whatsapp', label: 'WhatsApp', placeholder: '+966500000000' },
];

export function TourismAdContactFields({ value, onChange, disabled, errors }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map((field) => (
        <label key={field.key} className="flex flex-col gap-1 text-[12px] font-semibold text-ink-60">
          {field.label}
          <input
            type="text"
            disabled={disabled}
            value={value[field.key] ?? ''}
            onChange={(e) => onChange({ ...value, [field.key]: e.target.value || undefined })}
            placeholder={field.placeholder}
            className="h-11 rounded-xl border border-ink-10 bg-white px-3 text-[14px] font-normal text-ink disabled:opacity-50"
          />
          {errors?.[field.key] ? (
            <span className="text-[12px] font-semibold text-coral">{errors[field.key]}</span>
          ) : null}
        </label>
      ))}
      {errors?.root ? <p className="sm:col-span-2 text-[12px] font-semibold text-coral">{errors.root}</p> : null}
    </div>
  );
}
