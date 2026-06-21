# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.setup.ts >> authenticate demo admin
- Location: e2e\auth.setup.ts:6:1

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected: "http://localhost:5175/"
Received: "http://localhost:5175/login"
Timeout:  5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    13 × unexpected value "http://localhost:5175/login"

```

```yaml
- region "Notifications alt+T":
  - list:
    - listitem:
      - button "Close toast":
        - img
      - img
      - text: Invalid email or password.
- group "Language":
  - button "English"
  - button "العربية"
- paragraph: Admin Area
- heading "Sign in" [level=1]
- paragraph: No self-registration — admin accounts are provisioned internally. No social login on this surface.
- text: Email
- textbox "Email":
  - /placeholder: admin@myticket.demo
  - text: admin@myticket.demo
- text: Password
- textbox "Password":
  - /placeholder: password
  - text: password
- paragraph: Invalid credentials.
- button "Continue"
- link "Forgot password":
  - /url: /forgot-password
```

# Test source

```ts
  1  | import { test as setup, expect } from '@playwright/test';
  2  | import { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD } from '../src/config/demoAuth';
  3  | 
  4  | const authFile = 'e2e/.auth/admin.json';
  5  | 
  6  | setup('authenticate demo admin', async ({ page }) => {
  7  |   await page.goto('/login');
  8  |   await page.getByTestId('login-email').fill(DEMO_ADMIN_EMAIL);
  9  |   await page.getByTestId('login-password').fill(DEMO_ADMIN_PASSWORD);
  10 |   await page.getByTestId('login-submit').click();
> 11 |   await expect(page).toHaveURL('/');
     |                      ^ Error: expect(page).toHaveURL(expected) failed
  12 |   await page.context().storageState({ path: authFile });
  13 | });
  14 | 
```