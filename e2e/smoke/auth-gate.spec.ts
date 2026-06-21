import { test, expect } from '@playwright/test';
import { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD } from '../../src/config/demoAuth';

test.describe('E-S01 auth gate', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('redirects unauthenticated users to login then lands on intended page', async ({ page }) => {
    await page.goto('/users');
    await expect(page).toHaveURL(/\/login/);
    await page.getByTestId('login-email').fill(DEMO_ADMIN_EMAIL);
    await page.getByTestId('login-password').fill(DEMO_ADMIN_PASSWORD);
    await page.getByTestId('login-submit').click();
    await expect(page.getByTestId('list-search')).toBeVisible({ timeout: 15_000 });
  });
});
