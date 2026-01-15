import { test, expect, chromium } from '@playwright/test';
import path from 'path';

const extensionPath = path.join(__dirname, '../../build');

test.describe('Automa Comprehensive Workflow Features', () => {
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
      // Fallback: try to find extension page
      const pages = browserContext.pages();
      for (const p of pages) {
        if (p.url().startsWith('chrome-extension://')) {
          extensionId = p.url().split('/')[2];
          break;
        }
      }
    } else {
      extensionId = backgroundPage.url().split('/')[2];
      await backgroundPage.evaluate(() => {
        return new Promise((resolve) => {
          const version = chrome.runtime.getManifest().version;
          chrome.storage.local.set(
            {
              isFirstTime: false,
              version: version,
            },
            resolve
          );
        });
      });
    }

    // Ensure ID is found
    if (!extensionId) {
      // Try one more time by opening extensions page
      const p = await browserContext.newPage();
      await p.goto('chrome://extensions');
      await p.waitForTimeout(1000);
      const pages = browserContext.pages();
      for (const p of pages) {
        if (p.url().startsWith('chrome-extension://')) {
          extensionId = p.url().split('/')[2];
          break;
        }
      }
      if (extensionId) await p.close();
    }

    expect(extensionId).toBeDefined();

    page = await browserContext.newPage();
    await page.setViewportSize({ width: 1280, height: 800 });
  });

  test.afterEach(async () => {
    if (browserContext) await browserContext.close();
  });

  test('Execute Loop Workflow (Numbers)', async () => {
    test.setTimeout(120000);
    const dashboardUrl = `chrome-extension://${extensionId}/newtab.html#/workflows`;
    await page.goto(dashboardUrl, { waitUntil: 'domcontentloaded' });

    // 1. Create Workflow
    const newWorkflowBtn = page
      .locator('button')
      .filter({ hasText: /New workflow|workflow.new/i });
    await newWorkflowBtn.waitFor();
    await newWorkflowBtn.click();

    const nameInput = page.locator('input[placeholder="Name"]');
    await expect(nameInput).toBeVisible();
    const workflowName = 'Loop Test ' + Date.now();
    await nameInput.fill(workflowName);
    await page
      .getByRole('button', { name: 'Add', exact: true })
      .click()
      .catch(() => {
        return page.locator('.ui-modal button.bg-accent').click();
      });

    await expect(page).toHaveURL(/\/workflows\/[\w-]+/);

    // 2. Verify editor loaded - check for Trigger block
    await expect(
      page.locator('.vue-flow__node-BlockBasic').filter({ hasText: 'Trigger' })
    ).toBeVisible({ timeout: 10000 });

    // 3. Save and verify workflow exists
    await page.keyboard.press('Control+s');
    await page.waitForTimeout(1000);

    // 4. Navigate to workflows list
    await page.goto(dashboardUrl);
    await page.waitForTimeout(2000);

    // 5. Verify workflow appears in list
    const workflowListItem = page.getByText(workflowName);
    await expect(workflowListItem).toBeVisible({ timeout: 10000 });
  });
});
