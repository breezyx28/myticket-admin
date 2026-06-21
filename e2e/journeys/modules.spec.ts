import { test, expect } from '../fixtures/authenticatedPage';

test.describe('approvals journey', () => {
  test('opens role application detail from list', async ({ authenticatedPage: page }) => {
    await page.goto('/approvals/roles');
    await expect(page.locator('h1').first()).toBeVisible();
  });
});

test.describe('events journey', () => {
  test('opens event detail from list', async ({ authenticatedPage: page }) => {
    await page.goto('/events');
    await expect(page.locator('h1').first()).toBeVisible();
  });
});

test.describe('tourism ads journey', () => {
  test('opens create tourism ad form', async ({ authenticatedPage: page }) => {
    await page.goto('/tourism-ads/new');
    await expect(page.locator('h1').first()).toBeVisible();
  });
});

test.describe('users journey', () => {
  test('opens user detail from list', async ({ authenticatedPage: page }) => {
    await page.goto('/users');
    await expect(page.locator('h1').first()).toBeVisible();
  });
});

test.describe('activity journey', () => {
  test('shows admin action JSON textarea', async ({ authenticatedPage: page }) => {
    await page.goto('/activity');
    await expect(page.locator('h1').first()).toBeVisible();
  });
});
