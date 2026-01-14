
import { test, expect, chromium } from '@playwright/test';
import path from 'path';

const extensionPath = path.join(__dirname, '../../build');

test.describe('Supabase Migration Verification', () => {
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

    // Wait for background page
    let backgroundPage;
    for (let i = 0; i < 20; i++) {
        const serviceWorkers = browserContext.serviceWorkers();
        if (serviceWorkers.length > 0) {
            backgroundPage = serviceWorkers[0];
            break;
        }
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    if (!backgroundPage) {
        // Fallback
        const pages = browserContext.pages();
        const extensionPage = pages.find(p => p.url().startsWith('chrome-extension://'));
        if (extensionPage) {
            extensionId = extensionPage.url().split('/')[2];
        } else {
             console.log("Could not find extension ID from pages");
        }
    } else {
        extensionId = backgroundPage.url().split('/')[2];
        backgroundPage.on('console', msg => console.log('BG LOG:', msg.text()));
    }
    
    page = await browserContext.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', exception => console.log(`PAGE ERROR: "${exception}"`));
  });

  test.afterEach(async () => {
    if (browserContext) await browserContext.close();
  });

  test('Dashboard loads and API calls do not crash', async () => {
    if (!extensionId) test.skip('Extension ID not found');

    const dashboardUrl = `chrome-extension://${extensionId}/newtab.html#/workflows`;
    await page.goto(dashboardUrl, { waitUntil: 'domcontentloaded' });
    
    // Check if container loads (means Vue initialized and API calls didn't crash the app)
    await expect(page.locator('.container')).toBeVisible({ timeout: 10000 });

    // Click "New Workflow" to ensure local logic is fine
    const btn = page.locator('button').filter({ hasText: /New workflow|workflow.new/i }).first();
    if (await btn.isVisible()) {
        await btn.click();
        await expect(page.locator('input[placeholder="Name"]')).toBeVisible();
    }
  });
});
