import { test, expect } from '../fixtures/authenticatedPage';

test.describe('E-S03 language toggle RTL', () => {
  test('switches to Arabic with rtl direction', async ({ authenticatedPage: page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await page.getByTestId('lang-ar').first().click();
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.getByTestId('nav-approvals-roles')).toContainText(/طلبات|الأدوار/);

    const sidebar = page.getByTestId('admin-sidebar');
    await expect(sidebar).toBeVisible();
    const box = await sidebar.boundingBox();
    expect(box).not.toBeNull();
    // Inline-start column sits on the right half of the viewport in RTL.
    expect(box!.x + box!.width / 2).toBeGreaterThan(640);
  });
});
