import { renderProtectedApp } from '@/test/renderProtectedApp';
import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('S-02 fees', () => {
  it('loads fee configuration page', async () => {
    renderProtectedApp('/settings/fees');
    await waitFor(() => expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument());
  });
});

describe('S-01 profile', () => {
  it('loads admin profile page', async () => {
    renderProtectedApp('/profile');
    await waitFor(() => expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument());
  });
});

describe('S-07 system status', () => {
  it('loads system status page', async () => {
    renderProtectedApp('/settings/system');
    await waitFor(() => expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument());
  });
});

describe('S-04 payouts', () => {
  it('loads payouts page', async () => {
    renderProtectedApp('/settings/payouts');
    await waitFor(() => expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument());
  });
});
