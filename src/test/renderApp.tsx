import { store } from '@/app/store';
import { AuthProvider } from '@/contexts/AuthContext';
import { clearPersistedSession, savePersistedSession, type PersistedAdminSessionV2 } from '@/lib/authSession';
import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom';

type RenderAppOptions = {
  route?: string;
  routerProps?: MemoryRouterProps;
  session?: PersistedAdminSessionV2 | null;
} & Omit<RenderOptions, 'wrapper'>;

export function seedSession(session: PersistedAdminSessionV2 | null) {
  if (session) savePersistedSession(session);
  else clearPersistedSession();
}

export function renderApp(ui: ReactElement, options: RenderAppOptions = {}) {
  const { route = '/', routerProps, session = null, ...renderOptions } = options;
  seedSession(session);

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]} {...routerProps}>
          <AuthProvider>{children}</AuthProvider>
        </MemoryRouter>
      </Provider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}
