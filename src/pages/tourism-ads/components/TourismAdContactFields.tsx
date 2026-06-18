import type { TourismAdContact } from '@/schemas/tourismAd.schema';
import { useTranslation } from 'react-i18next';

type Props = {
  value: TourismAdContact;
  onChange: (next: TourismAdContact) => void;
  disabled?: boolean;
  errors?: Partial<Record<keyof TourismAdContact | 'root', string>>;
};

const fieldKeys: (keyof TourismAdContact)[] = ['phone', 'email', 'website', 'whatsapp'];

export function TourismAdContactFields({ value, onChange, disabled, errors }: Props) {
  const { t } = useTranslation('operations');

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fieldKeys.map((key) => (
        <label key={key} className="flex flex-col gap-1 text-[12px] font-semibold text-ink-60">
          {t(`tourismAds.contactLabels.${key}`)}
          <input
            type="text"
            disabled={disabled}
            value={value[key] ?? ''}
            onChange={(e) => onChange({ ...value, [key]: e.target.value || undefined })}
            placeholder={t(`tourismAds.contactPlaceholders.${key}`)}
            className="h-11 rounded-xl border border-ink-10 bg-white px-3 text-[14px] font-normal text-ink disabled:opacity-50"
          />
          {errors?.[key] ? (
            <span className="text-[12px] font-semibold text-coral">{errors[key]}</span>
          ) : null}
        </label>
      ))}
      {errors?.root ? <p className="sm:col-span-2 text-[12px] font-semibold text-coral">{errors.root}</p> : null}
    </div>
  );
}
