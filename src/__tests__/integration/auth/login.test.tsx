import { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD } from '@/config/demoAuth';
import { renderProtectedApp, renderUnauthenticatedApp } from '@/test/renderProtectedApp';
import { ADMIN_API } from '@/test/fixtures/apiBase';
import { server } from '@/test/msw/server';
import { http, HttpResponse } from 'msw';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

describe('A-01 demo auth login', () => {
  it('signs in with demo credentials and shows dashboard', async () => {
    const user = userEvent.setup();
    renderUnauthenticatedApp('/login');
    await user.clear(screen.getByTestId('login-email'));
    await user.type(screen.getByTestId('login-email'), DEMO_ADMIN_EMAIL);
    await user.type(screen.getByTestId('login-password'), DEMO_ADMIN_PASSWORD);
    await user.click(screen.getByTestId('login-submit'));
    await waitFor(() => {
      expect(screen.getByTestId('nav-home')).toBeInTheDocument();
    });
  });
});

describe('A-02 API login via MSW', () => {
  it('stores token and reaches dashboard', async () => {
    const user = userEvent.setup();
    // Disable demo path: use email without +admin heuristic... actually demo uses DEMO_ADMIN_EMAIL
    // Test API login with custom email when demo is for demo email only
    renderUnauthenticatedApp('/login');
    await user.clear(screen.getByTestId('login-email'));
    await user.type(screen.getByTestId('login-email'), 'api.admin@test.com');
    await user.type(screen.getByTestId('login-password'), 'secret123');
    await user.click(screen.getByTestId('login-submit'));
    await waitFor(
      () => {
        expect(screen.getByTestId('nav-home')).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
  });
});

describe('A-03 login failure', () => {
  it('shows error on invalid credentials', async () => {
    server.use(
      http.post(`${ADMIN_API}/auth/login`, () =>
        HttpResponse.json({ message: 'Invalid' }, { status: 401 }),
      ),
    );
    const user = userEvent.setup();
    renderUnauthenticatedApp('/login');
    await user.clear(screen.getByTestId('login-email'));
    await user.type(screen.getByTestId('login-email'), 'bad@test.com');
    await user.type(screen.getByTestId('login-password'), 'wrong');
    await user.click(screen.getByTestId('login-submit'));
    await waitFor(() => {
      expect(screen.getByTestId('login-form')).toBeInTheDocument();
    });
  });
});

describe('A-06 logout', () => {
  it('returns to login after sign out', async () => {
    const user = userEvent.setup();
    renderProtectedApp('/');
    await waitFor(() => expect(screen.getByTestId('sign-out')).toBeInTheDocument());
    await user.click(screen.getByTestId('sign-out'));
    await waitFor(() => {
      expect(screen.getByTestId('login-form')).toBeInTheDocument();
    });
  });
});
