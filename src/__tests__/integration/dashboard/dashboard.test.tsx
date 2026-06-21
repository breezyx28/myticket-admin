import { renderProtectedApp } from '@/test/renderProtectedApp';
import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('D-01 dashboard summary', () => {
  it('renders counter stats from mock data', async () => {
    renderProtectedApp('/');
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });
    expect(screen.getByText(/control center|مركز التحكم/i)).toBeInTheDocument();
  });
});

describe('D-02 pending actions', () => {
  it('shows pending action links', async () => {
    renderProtectedApp('/');
    await waitFor(() => {
      expect(screen.getAllByText(/role applications|طلبات/i).length).toBeGreaterThan(0);
    });
  });
});
