import { test, expect } from '@playwright/test';

const email = process.env.E2E_ADMIN_EMAIL;
const password = process.env.E2E_ADMIN_PASSWORD;
const apiBase = process.env.E2E_API_BASE_URL ?? process.env.VITE_API_BASE_URL;

test.beforeEach(() => {
  test.skip(!email || !password || !apiBase, 'Set E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD, E2E_API_BASE_URL');
});

test.describe('L-S01 live login', () => {
  test('authenticates against staging API', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('login-email').fill(email!);
    await page.getByTestId('login-password').fill(password!);
    await page.getByTestId('login-submit').click();
    await expect(page).toHaveURL('/', { timeout: 30_000 });
  });
});

test.describe('L-S02 system status', () => {
  test('loads health on system status page after login', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('login-email').fill(email!);
    await page.getByTestId('login-password').fill(password!);
    await page.getByTestId('login-submit').click();
    await page.goto('/settings/system');
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 30_000 });
  });
});

test.describe('L-S03 users list read-only', () => {
  test('loads users without mutating', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('login-email').fill(email!);
    await page.getByTestId('login-password').fill(password!);
    await page.getByTestId('login-submit').click();
    await page.goto('/users');
    await expect(page.getByTestId('list-search')).toBeVisible({ timeout: 30_000 });
  });
});
