import { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD } from '@/config/demoAuth';
import { test as base, type Page } from '@playwright/test';

export const test = base.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ page }, use) => {
    await page.goto('/login');
    await page.getByTestId('login-email').fill(DEMO_ADMIN_EMAIL);
    await page.getByTestId('login-password').fill(DEMO_ADMIN_PASSWORD);
    await page.getByTestId('login-submit').click();
    await page.waitForURL('/');
    await use(page);
  },
});

export { expect } from '@playwright/test';
