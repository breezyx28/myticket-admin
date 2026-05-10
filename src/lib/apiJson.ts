/**
 * Helpers for normalizing admin API JSON (Laravel-style envelopes, snake_case keys).
 * Used by live reads in `adminApi.ts` and future `adminMappers`.
 */

export class ApiJsonError extends Error {
  constructor(
    message: string,
    readonly code: 'expected_object' | 'expected_array' | 'invalid_json_root',
    options?: { cause?: unknown }
  ) {
    super(message, options);
    this.name = 'ApiJsonError';
  }
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/**
 * Unwrap common `{ data: T }` envelopes; otherwise return the root (arrays included).
 */
export function unwrapApiJson(json: unknown): unknown {
  if (json === null || json === undefined) {
    throw new ApiJsonError('API JSON was null or undefined', 'invalid_json_root');
  }
  if (!isPlainObject(json)) return json;
  if ('data' in json && json.data !== undefined) return json.data;
  return json;
}

/** After `unwrapApiJson`, require a non-null object record (not an array). */
export function asObject(value: unknown): Record<string, unknown> {
  if (!isPlainObject(value)) {
    throw new ApiJsonError('Expected JSON object', 'expected_object', { cause: value });
  }
  return value;
}

/** After `unwrapApiJson`, require an array. */
export function asArray(value: unknown): unknown[] {
  if (!Array.isArray(value)) {
    throw new ApiJsonError('Expected JSON array', 'expected_array', { cause: value });
  }
  return value;
}

/** Read first defined string property from the object (tries keys in order). */
export function pickStr(source: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const k of keys) {
    const v = source[k];
    if (typeof v === 'string' && v.length > 0) return v;
  }
  return undefined;
}

export function pickNum(source: Record<string, unknown>, ...keys: string[]): number | undefined {
  for (const k of keys) {
    const v = source[k];
    if (typeof v === 'number' && Number.isFinite(v)) return v;
    if (typeof v === 'string' && v.trim() !== '') {
      const n = Number(v);
      if (Number.isFinite(n)) return n;
    }
  }
  return undefined;
}

export function pickBool(source: Record<string, unknown>, ...keys: string[]): boolean | undefined {
  for (const k of keys) {
    const v = source[k];
    if (typeof v === 'boolean') return v;
    if (v === 1 || v === 0) return v === 1;
    if (typeof v === 'string') {
      const s = v.toLowerCase();
      if (s === 'true' || s === '1') return true;
      if (s === 'false' || s === '0') return false;
    }
  }
  return undefined;
}
