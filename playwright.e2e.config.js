/**
 * Playwright Configuration for E2E Tests with Chrome Extension
 * 配置 Playwright 以开发者模式加载 Chrome 扩展
 */

import { defineConfig, devices } from '@playwright/test';
import path from 'path';

const extensionPath = path.resolve(__dirname, 'build');

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: 'playwright-test-results',
  timeout: 120000,
  expect: {
    timeout: 15000,
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  reporter: [
    ['html', { outputFolder: 'playwright-html-reports/e2e' }],
    ['json', { outputFile: 'playwright-json-reports/e2e-results.json' }],
    ['line'],
    ['list'],
  ],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 30000,
  },
  projects: [
    {
      name: 'chromium-extension',
      use: { 
        ...devices['Desktop Chrome'],
        // 关键配置：以持久化上下文模式启动，模拟真实浏览器
        launchOptions: {
          headless: false, // 必须为 false，扩展需要可见的浏览器
          args: [
            `--disable-extensions-except=${extensionPath}`,
            `--load-extension=${extensionPath}`,
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-blink-features=AutomationControlled',
            '--disable-web-security', // 仅用于测试
          ],
        },
        viewport: { width: 1280, height: 800 },
      },
    },
  ],
});
