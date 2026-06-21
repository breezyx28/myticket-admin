import { defineConfig, devices } from '@playwright/test';

const PORT = 5175;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['list']] : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/admin.json',
      },
      dependencies: ['setup'],
      testIgnore: [/live\//],
    },
    {
      name: 'live',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /live\/.*\.spec\.ts/,
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    env: {
      VITE_ALLOW_DEMO_AUTH: 'true',
      VITE_ADMIN_READS_SOURCE: 'mock',
      VITE_API_BASE_URL: 'http://localhost:9999',
    },
  },
});
