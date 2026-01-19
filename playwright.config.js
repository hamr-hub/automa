import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  fullyParallel: false,
  forbidOnly: false,
  retries: 0,
  workers: 1,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }],
    ['list'],
  ],
  use: {
    trace: 'on-first-retry',
    headless: false,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        headless: false,
        // 以开发者模式启动浏览器并加载扩展
        args: [
          '--load-extension=./build',
          '--disable-extensions-except=./build',
          '--enable-features=ExtensionsOnChromeURLs',
          '--disable-features=BlockThirdPartyCookies',
          '--auto-open-devtools-for-tabs',
          '--no-sandbox',
          '--disable-setuid-sandbox',
        ],
      },
    },
  ],
});
