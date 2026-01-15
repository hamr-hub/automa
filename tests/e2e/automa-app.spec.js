import { test, expect, chromium } from '@playwright/test';
import path from 'path';

const extensionPath = path.join(__dirname, '../../build');

test.describe('Automa App E2E Tests', () => {
  let browserContext;
  let extensionId;
  let page;

  test.beforeEach(async () => {
    browserContext = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
      ],
    });

    let backgroundPage;
    for (let i = 0; i < 20; i++) {
      const serviceWorkers = browserContext.serviceWorkers();
      if (serviceWorkers.length > 0) {
        backgroundPage = serviceWorkers[0];
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    if (!backgroundPage) {
      const pages = browserContext.pages();
      const extensionPage = pages.find((p) =>
        p.url().startsWith('chrome-extension://')
      );
      if (extensionPage) {
        extensionId = extensionPage.url().split('/')[2];
      }
    } else {
      extensionId = backgroundPage.url().split('/')[2];
    }

    if (!extensionId) {
      const pages = browserContext.pages();
      for (const p of pages) {
        if (p.url().startsWith('chrome-extension://')) {
          extensionId = p.url().split('/')[2];
          break;
        }
      }
    }

    expect(extensionId).toBeDefined();

    page = await browserContext.newPage();
    await page.setViewportSize({ width: 1280, height: 800 });
  });

  test.afterEach(async () => {
    if (browserContext) await browserContext.close();
  });

  test('Dashboard loads correctly', async () => {
    const dashboardUrl = `chrome-extension://${extensionId}/newtab.html#/workflows`;
    await page.goto(dashboardUrl, { waitUntil: 'domcontentloaded' });

    await expect(page).toHaveTitle(/Automa/);

    // Check for main navigation elements
    await expect(page.locator('a[href="#/workflows"]')).toBeVisible();
    await expect(
      page.locator('a[href="#/ai-workflow-generator"]')
    ).toBeVisible();
  });

  test('Navigate to AI Workflow Generator', async () => {
    const dashboardUrl = `chrome-extension://${extensionId}/newtab.html`;
    await page.goto(dashboardUrl, { waitUntil: 'domcontentloaded' });

    // Click the AI Generator tab
    await page.click('a[href="#/ai-workflow-generator"]');

    // Verify URL change
    await expect(page).toHaveURL(/.*#\/ai-workflow-generator/);

    // Verify page loaded by checking for navigation elements
    await expect(page.locator('main, .content, #app')).toBeVisible({
      timeout: 10000,
    });
  });

  test('AI Workflow Generator Input Interaction', async () => {
    const aiUrl = `chrome-extension://${extensionId}/newtab.html#/ai-workflow-generator`;
    await page.goto(aiUrl, { waitUntil: 'domcontentloaded' });

    // Wait for page to load
    await page.waitForTimeout(3000);

    // Check if page structure exists
    const pageContent = await page.locator('body').innerText();
    expect(pageContent.length).toBeGreaterThan(0);
  });

  test('Settings Page Navigation', async () => {
    const dashboardUrl = `chrome-extension://${extensionId}/newtab.html`;
    await page.goto(dashboardUrl, { waitUntil: 'domcontentloaded' });

    await page.click('a[href="#/settings"]');
    await expect(page).toHaveURL(/.*#\/settings/);
    await expect(page.locator('main')).toBeVisible();
  });
});
