import { describe, expect, it } from 'vitest';
import {
  ApiJsonError,
  asArray,
  asObject,
  pickBool,
  pickNum,
  pickStr,
  unwrapApiJson,
} from '@/lib/apiJson';

describe('unwrapApiJson', () => {
  it('returns inner data for Laravel envelope', () => {
    expect(unwrapApiJson({ data: { a: 1 } })).toEqual({ a: 1 });
  });
  it('returns root when no data', () => {
    expect(unwrapApiJson({ foo: 'bar' })).toEqual({ foo: 'bar' });
  });
  it('returns arrays at root', () => {
    expect(unwrapApiJson([1, 2])).toEqual([1, 2]);
  });
  it('throws on null', () => {
    expect(() => unwrapApiJson(null)).toThrow(ApiJsonError);
  });
});

describe('asObject / asArray', () => {
  it('asObject accepts plain object', () => {
    expect(asObject({ x: 1 })).toEqual({ x: 1 });
  });
  it('asObject rejects array', () => {
    expect(() => asObject([])).toThrow(ApiJsonError);
  });
  it('asArray accepts array', () => {
    expect(asArray([1])).toEqual([1]);
  });
  it('asArray rejects object', () => {
    expect(() => asArray({})).toThrow(ApiJsonError);
  });
});

describe('pickStr / pickNum / pickBool', () => {
  it('pickStr tries keys in order', () => {
    expect(pickStr({ name_ar: 'x', name_en: 'y' }, 'name_en', 'name_ar')).toBe('y');
    expect(pickStr({ name_ar: 'x' }, 'name_en', 'name_ar')).toBe('x');
  });
  it('pickNum coerces string numbers', () => {
    expect(pickNum({ display_order: '3' }, 'display_order')).toBe(3);
  });
  it('pickBool parses common forms', () => {
    expect(pickBool({ is_active: 'true' }, 'is_active')).toBe(true);
    expect(pickBool({ is_active: 0 }, 'is_active')).toBe(false);
  });
});
