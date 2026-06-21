import { renderProtectedApp } from '@/test/renderProtectedApp';
import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('I-01 analytics', () => {
  it('renders analytics page', async () => {
    renderProtectedApp('/analytics');
    await waitFor(() => expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument());
  });
});

describe('I-02 activity audit', () => {
  it('renders activity audit page', async () => {
    renderProtectedApp('/activity');
    await waitFor(() => expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument());
  });
});
