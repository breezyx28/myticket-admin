import { describe, expect, it } from 'vitest';
import { store } from '@/app/store';
import { adminApi } from '@/services/adminApi';

describe('Redux store', () => {
  it('includes adminApi reducer', () => {
    const state = store.getState();
    expect(state[adminApi.reducerPath]).toBeDefined();
  });

  it('includes analytics UI slice', () => {
    const state = store.getState();
    expect(state.analyticsUi.revenueChartRange).toBe('7d');
  });
});
