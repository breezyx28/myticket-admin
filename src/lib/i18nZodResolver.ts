import { translateValidationMessage } from '@/lib/zodI18n';
import { zodResolver } from '@hookform/resolvers/zod';
import type { FieldError, FieldValues, Resolver } from 'react-hook-form';
import type { ZodType } from 'zod';

function translateFieldError(error: FieldError): FieldError {
  if (typeof error.message === 'string') {
    return { ...error, message: translateValidationMessage(error.message) };
  }
  return error;
}

function translateFieldErrors(errors: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(errors)) {
    if (!value || typeof value !== 'object') continue;
    if ('message' in value && typeof (value as FieldError).message === 'string') {
      out[key] = translateFieldError(value as FieldError);
    } else {
      out[key] = translateFieldErrors(value as Record<string, unknown>);
    }
  }
  return out;
}

/** Zod resolver that translates `validation.*` messages after parse. */
export function i18nZodResolver<T extends FieldValues>(
  schema: ZodType<T>,
  schemaOptions?: Parameters<typeof zodResolver>[1],
  resolverOptions?: Parameters<typeof zodResolver>[2],
): Resolver<T> {
  // @hookform/resolvers v5 types target Zod 4; runtime works with Zod 3 schemas.
  const base = (
    resolverOptions
      ? zodResolver(
          schema as unknown as Parameters<typeof zodResolver>[0],
          schemaOptions,
          resolverOptions,
        )
      : zodResolver(schema as unknown as Parameters<typeof zodResolver>[0], schemaOptions)
  ) as Resolver<T>;

  return async (values, context, options) => {
    const result = await base(values, context, options);
    if (!result.errors || Object.keys(result.errors).length === 0) return result;
    return {
      ...result,
      errors: translateFieldErrors(result.errors as Record<string, unknown>) as typeof result.errors,
    } as typeof result;
  };
}
