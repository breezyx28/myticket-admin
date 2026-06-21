import i18n from '@/i18n';
import { z } from 'zod';

const VALIDATION_PREFIX = 'validation.';

/** Translate schema messages like `validation.passwordMin4` for display. */
export function translateValidationMessage(message: string): string {
  if (message.startsWith(VALIDATION_PREFIX)) {
    const key = message.slice(VALIDATION_PREFIX.length);
    return i18n.t(key, { ns: 'validation', defaultValue: message });
  }
  return message;
}

export function setupZodI18n() {
  const errorMap: z.ZodErrorMap = (issue, ctx) => {
    const raw = issue.message ?? ctx.defaultError;
    return { message: translateValidationMessage(raw) };
  };
  z.setErrorMap(errorMap);
}
