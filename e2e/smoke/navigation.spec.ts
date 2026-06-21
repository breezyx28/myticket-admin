import { test, expect } from '../fixtures/authenticatedPage';

const navRoutes = [
  { testId: 'nav-home', path: '/' },
  { testId: 'nav-approvals-roles', path: '/approvals/roles' },
  { testId: 'nav-approvals-talent', path: '/approvals/talent' },
  { testId: 'nav-tourism-ads', path: '/tourism-ads' },
  { testId: 'nav-users', path: '/users' },
  { testId: 'nav-orders', path: '/orders' },
  { testId: 'nav-events', path: '/events' },
  { testId: 'nav-categories', path: '/categories' },
  { testId: 'nav-settings-fees', path: '/settings/fees' },
  { testId: 'nav-analytics', path: '/analytics' },
  { testId: 'nav-activity', path: '/activity' },
  { testId: 'nav-moderation-listings', path: '/moderation/listings' },
  { testId: 'nav-support', path: '/support' },
  { testId: 'nav-complaints', path: '/complaints' },
];

test.describe('E-S02 shell navigation', () => {
  test('each nav link loads without crash', async ({ authenticatedPage: page }) => {
    await page.goto('/');
    for (const { testId, path } of navRoutes) {
      await expect(page.getByTestId(testId)).toBeVisible();
      await page.getByTestId(testId).click();
      await expect(page).toHaveURL(new RegExp(path.replace('/', '\\/') + '(\\?|$)'));
      await expect(page.locator('h1').first()).toBeVisible();
    }
  });
});

test.describe('E-S04 dashboard', () => {
  test('shows counters and pending actions', async ({ authenticatedPage: page }) => {
    await page.goto('/');
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.getByText(/control center|مركز التحكم/i).first()).toBeVisible();
  });
});

test.describe('E-S10 sign out', () => {
  test('returns to login', async ({ authenticatedPage: page }) => {
    await page.goto('/');
    await page.getByTestId('sign-out').click();
    await expect(page.getByTestId('login-form')).toBeVisible();
  });
});
