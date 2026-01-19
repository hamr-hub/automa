/**
 * Automa 扩展端到端测试配置文件
 * 包含所有核心功能模块的测试配置
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: './test-results',
  timeout: 120000,
  expect: {
    timeout: 15000,
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  reporter: [
    ['html', { outputFolder: 'playwright-html-reports' }],
    ['json', { outputFile: 'test-results.json' }],
    ['line'],
    ['allure-playwright', { outputFolder: 'allure-results' }],
  ],
  use: {
    trace: 'on-first-retry',
    headless: false,
    viewport: { width: 1280, height: 800 },
    actionTimeout: 30000,
    baseURL: 'chrome-extension://',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'chromium-headed',
      use: { ...devices['Desktop Chrome'], headless: false },
    },
    {
      name: 'blocks',
      testMatch: /blocks\.spec\.js/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'workflow-execution',
      testMatch: /workflow-execution\.spec\.js/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'data-extraction',
      testMatch: /data-extraction\.spec\.js/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'import-export',
      testMatch: /import-export\.spec\.js/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'scheduling',
      testMatch: /scheduling\.spec\.js/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'auth',
      testMatch: /auth\.spec\.js/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'ai-integration',
      testMatch: /ai-integration\.spec\.js/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'supabase',
      testMatch: /supabase\.spec\.js/,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: false,
});
