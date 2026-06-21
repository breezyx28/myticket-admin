import { renderProtectedApp } from '@/test/renderProtectedApp';
import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('O-01 users', () => {
  it('loads users list', async () => {
    renderProtectedApp('/users');
    await waitFor(() => expect(screen.getByTestId('list-search')).toBeInTheDocument());
  });
});

describe('O-06 events', () => {
  it('loads events list', async () => {
    renderProtectedApp('/events');
    await waitFor(() => expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument());
  });
});

describe('O-09 tourism ads', () => {
  it('loads tourism ads page with tabs', async () => {
    renderProtectedApp('/tourism-ads');
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });
  });
});

describe('O-02 orders', () => {
  it('loads orders list', async () => {
    renderProtectedApp('/orders');
    await waitFor(() => expect(screen.getByTestId('list-search')).toBeInTheDocument());
  });
});

describe('O-04 auctions', () => {
  it('loads auctions list', async () => {
    renderProtectedApp('/auctions');
    await waitFor(() => expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument());
  });
});

describe('O-07 categories', () => {
  it('loads categories hub', async () => {
    renderProtectedApp('/categories');
    await waitFor(() => expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument());
  });
});
