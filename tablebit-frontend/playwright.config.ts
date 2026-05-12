import { defineConfig, devices } from '@playwright/test';
import { FRONTEND_URL } from './tests/e2e/fixtures/test-data';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  reporter: [['html', { outputFolder: 'playwright-report' }], ['list']],
  timeout: 30000,
  expect: { timeout: 10000 },

  use: {
    baseURL: FRONTEND_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 15000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
