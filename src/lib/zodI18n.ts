import i18n from '@/i18n';
import { z } from 'zod';

const VALIDATION_PREFIX = 'validation.';

function translateMessage(message: string): string {
  if (message.startsWith(VALIDATION_PREFIX)) {
    const key = message.slice(VALIDATION_PREFIX.length);
    return i18n.t(key, { ns: 'validation', defaultValue: message });
  }
  return message;
}

export function setupZodI18n() {
  const errorMap: z.ZodErrorMap = (issue, ctx) => {
    if (issue.message) {
      return { message: translateMessage(issue.message) };
    }
    return { message: ctx.defaultError };
  };
  z.setErrorMap(errorMap);
}
