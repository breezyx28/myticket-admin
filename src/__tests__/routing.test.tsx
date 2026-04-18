import { AuthProvider } from '@/contexts/AuthContext';
import { RequireAdmin } from '@/components/auth/RequireAdmin';
import { LoginPage } from '@/pages/auth/LoginPage';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '@/app/store';
import { describe, expect, it } from 'vitest';

describe('RequireAdmin routing', () => {
  it('redirects unauthenticated users to login', async () => {
    sessionStorage.removeItem('myticket_admin_session_v1');
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/']}>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route element={<RequireAdmin />}>
                <Route path="/" element={<div>Protected</div>} />
              </Route>
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      </Provider>
    );
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /sign in/i })).toBeTruthy();
    });
  });
});
