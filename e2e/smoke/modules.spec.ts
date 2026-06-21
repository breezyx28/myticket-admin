import { test, expect } from '../fixtures/authenticatedPage';

test.describe('E-S05 approvals', () => {
  test('opens role applications list', async ({ authenticatedPage: page }) => {
    await page.goto('/approvals/roles');
    await expect(page.locator('h1').first()).toBeVisible();
  });
});

test.describe('E-S06 events', () => {
  test('loads events list', async ({ authenticatedPage: page }) => {
    await page.goto('/events');
    await expect(page.locator('h1').first()).toBeVisible();
  });
});

test.describe('E-S07 tourism ads', () => {
  test('loads tourism ads page', async ({ authenticatedPage: page }) => {
    await page.goto('/tourism-ads');
    await expect(page.locator('h1').first()).toBeVisible();
  });
});

test.describe('E-S08 support', () => {
  test('loads support inbox', async ({ authenticatedPage: page }) => {
    await page.goto('/support');
    await expect(page.locator('h1').first()).toBeVisible();
  });
});

test.describe('E-S09 settings fees', () => {
  test('loads fees page', async ({ authenticatedPage: page }) => {
    await page.goto('/settings/fees');
    await expect(page.locator('h1').first()).toBeVisible();
  });
});
