import { App } from '@/App';
import { renderApp } from '@/test/renderApp';
import { createTestAdminSession } from '@/test/fixtures/adminSession';

export function renderProtectedApp(route = '/') {
  return renderApp(<App />, {
    route,
    session: createTestAdminSession(),
  });
}

export function renderPublicApp(route = '/login') {
  return renderApp(<App />, {
    route,
    session: null,
  });
}

export function renderUnauthenticatedApp(route = '/') {
  return renderApp(<App />, { route, session: null });
}
