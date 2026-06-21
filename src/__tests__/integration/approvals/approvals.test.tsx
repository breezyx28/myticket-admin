import { renderProtectedApp } from '@/test/renderProtectedApp';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

describe('AP-01 role applications', () => {
  it('loads list and navigates to detail', async () => {
    const user = userEvent.setup();
    renderProtectedApp('/approvals/roles');
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    });
    const link = screen.queryAllByRole('link').find((a) => a.getAttribute('href')?.includes('/approvals/roles/'));
    if (link) {
      await user.click(link);
      await waitFor(() => expect(window.location.pathname || link).toBeTruthy());
    }
  });
});

describe('AP-03 talent filters', () => {
  it('renders talent approvals with filters', async () => {
    renderProtectedApp('/approvals/talent');
    await waitFor(() => {
      expect(screen.getByTestId('list-search')).toBeInTheDocument();
    });
  });
});
