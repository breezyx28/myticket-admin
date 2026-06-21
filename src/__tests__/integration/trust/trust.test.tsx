import { renderProtectedApp } from '@/test/renderProtectedApp';
import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('T-04 support', () => {
  it('loads support inbox', async () => {
    renderProtectedApp('/support');
    await waitFor(() => expect(screen.getByTestId('list-search')).toBeInTheDocument());
  });
});

describe('T-01 listings moderation', () => {
  it('loads listings moderation page', async () => {
    renderProtectedApp('/moderation/listings');
    await waitFor(() => expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument());
  });
});

describe('T-02 ratings', () => {
  it('loads ratings moderation page', async () => {
    renderProtectedApp('/moderation/ratings');
    await waitFor(() => expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument());
  });
});

describe('T-03 complaints', () => {
  it('loads complaints page', async () => {
    renderProtectedApp('/complaints');
    await waitFor(() => expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument());
  });
});
