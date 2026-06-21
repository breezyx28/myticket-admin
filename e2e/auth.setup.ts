import { test as setup, expect } from '@playwright/test';
import { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD } from '../src/config/demoAuth';

const authFile = 'e2e/.auth/admin.json';

setup('authenticate demo admin', async ({ page }) => {
  await page.goto('/login');
  await page.getByTestId('login-email').fill(DEMO_ADMIN_EMAIL);
  await page.getByTestId('login-password').fill(DEMO_ADMIN_PASSWORD);
  await page.getByTestId('login-submit').click();
  await expect(page).toHaveURL('/');
  await page.context().storageState({ path: authFile });
});
