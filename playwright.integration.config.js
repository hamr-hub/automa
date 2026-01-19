/**
 * Playwright Configuration for LangGraph + Supabase Integration Tests
 */

import { defineConfig, devices } from '@playwright/test';

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
    ['html', { outputFolder: 'playwright-html-reports/batch-delete' }],
    [
      'json',
      { outputFile: 'playwright-json-reports/batch-delete-results.json' },
    ],
    ['line'],
  ],
  use: {
    trace: 'on-first-retry',
    headless: false,
    viewport: { width: 1280, height: 800 },
    actionTimeout: 30000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'integration-tests',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'chrome-extension://',
      },
      testMatch: /langgraph-supabase-integration\.spec\.js/,
    },
  ],
  // Web server configuration - disabled since we use pre-built extension
  // webServer: false,
  // Cleanup
  use: {
    // ...
  },
});

// Environment variables for tests
process.env.SUPABASE_URL = process.env.SUPABASE_URL || '';
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
process.env.OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
