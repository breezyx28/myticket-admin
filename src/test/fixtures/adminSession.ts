import { DEMO_ADMIN_EMAIL } from '@/config/demoAuth';
import type { PersistedAdminSessionV2 } from '@/lib/authSession';
import type { SessionUser } from '@/contexts/adminAuthContext';

export const TEST_ACCESS_TOKEN = 'test-access-token';
export const TEST_REFRESH_TOKEN = 'test-refresh-token';

export function createTestAdminUser(overrides?: Partial<SessionUser>): SessionUser {
  return {
    email: DEMO_ADMIN_EMAIL,
    name: 'Test Admin',
    role: 'admin',
    id: 'admin-1',
    ...overrides,
  };
}

export function createTestAdminSession(
  overrides?: Partial<PersistedAdminSessionV2>,
): PersistedAdminSessionV2 {
  return {
    v: 2,
    user: createTestAdminUser(overrides?.user),
    accessToken: TEST_ACCESS_TOKEN,
    refreshToken: TEST_REFRESH_TOKEN,
    ...overrides,
  };
}

export function createDemoSessionWithoutToken(): PersistedAdminSessionV2 {
  return {
    v: 2,
    user: createTestAdminUser(),
    accessToken: null,
    refreshToken: null,
  };
}
