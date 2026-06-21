import { createTestAdminSession } from '@/test/fixtures/adminSession';
import { renderProtectedApp, renderUnauthenticatedApp } from '@/test/renderProtectedApp';
import { changeAppLanguage } from '@/i18n';
import { ADMIN_API } from '@/test/fixtures/apiBase';
import { server } from '@/test/msw/server';
import { ListFiltersBar } from '@/components/admin/ListFiltersBar';
import { http, HttpResponse } from 'msw';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

describe('X-01 unauthenticated route guard', () => {
  it('redirects to login when visiting protected route', async () => {
    renderUnauthenticatedApp('/users');
    await waitFor(() => {
      expect(screen.getByTestId('login-form')).toBeInTheDocument();
    });
  });
});

describe('X-02 non-admin role', () => {
  it('redirects non-admin users to access denied', async () => {
    const { renderApp } = await import('@/test/renderApp');
    const { App } = await import('@/App');
    renderApp(<App />, {
      route: '/users',
      session: createTestAdminSession({
        user: { email: 'u@test.com', name: 'User', role: 'user' as 'admin' },
      }),
    });
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /access denied|رفض الوصول/i })).toBeInTheDocument();
    });
  });
});

describe('X-05 locale switch EN to AR', () => {
  it('sets rtl and arabic nav labels', async () => {
    renderProtectedApp('/');
    await waitFor(() => expect(screen.getByTestId('nav-home')).toBeInTheDocument());
    await changeAppLanguage('ar');
    await waitFor(() => {
      expect(document.documentElement.dir).toBe('rtl');
      expect(screen.getByTestId('nav-approvals-roles')).toHaveTextContent(/طلبات|الأدوار/i);
    });
  });
});

describe('X-06 list search filter', () => {
  it('filters rows via ListFiltersBar', async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    render(
      <ListFiltersBar searchValue="" onSearchChange={onSearchChange} />,
    );
    const input = screen.getByTestId('list-search');
    await user.type(input, 'test');
    expect(onSearchChange).toHaveBeenCalled();
  });
});

describe('L-01 Accept-Language header', () => {
  it('sends Accept-Language on API reads when using api mode', async () => {
    let capturedLang: string | null = null;
    server.use(
      http.get(`${ADMIN_API}/dashboard/counters`, ({ request }) => {
        capturedLang = request.headers.get('Accept-Language');
        return HttpResponse.json({ data: { users_total: 1 } });
      }),
    );
    const { buildApiHeaders } = await import('@/lib/apiHeaders');
    const headers = buildApiHeaders();
    expect(headers.get('Accept-Language')).toBeTruthy();
    await fetch(`${ADMIN_API}/dashboard/counters`, { headers });
    expect(capturedLang).toBeTruthy();
  });
});
