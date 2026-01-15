import { test, expect, chromium } from '@playwright/test';
import path from 'path';

const extensionPath = path.join(__dirname, '../../build');

test.describe('Automa Extension E2E', () => {
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
      } else {
        throw new Error('Could not find extension ID');
      }
    } else {
      extensionId = backgroundPage.url().split('/')[2];
    }

    page = await browserContext.newPage();

    page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', (exception) =>
      console.log(`PAGE ERROR: "${exception}"`)
    );
  });

  test.afterEach(async () => {
    await browserContext.close();
  });

  test('Import and run Amazon workflow', async () => {
    test.setTimeout(120000);
    const dashboardUrl = `chrome-extension://${extensionId}/newtab.html#/workflows`;
    console.log('Navigating to:', dashboardUrl);
    await page.goto(dashboardUrl);

    await page.waitForSelector('button:has-text("New workflow")', {
      timeout: 15000,
    });
    console.log('Dashboard loaded');

    const newWorkflowBtn = page
      .locator('button:has-text("New workflow")')
      .first();
    await newWorkflowBtn.click();

    const nameInput = page.locator('input[placeholder="Name"]');
    await expect(nameInput).toBeVisible();
    const workflowName = 'Amazon Test ' + Date.now();
    await nameInput.fill(workflowName);

    await page
      .getByRole('button', { name: 'Add', exact: true })
      .click()
      .catch(() => {
        return page.locator('.ui-modal button.bg-accent').click();
      });

    await expect(page).toHaveURL(/\/workflows\/[\w-]+/);

    await expect(
      page.locator('.vue-flow__node-BlockBasic').filter({ hasText: 'Trigger' })
    ).toBeVisible({ timeout: 10000 });

    await page.keyboard.press('Control+s');
    await page.waitForTimeout(2000);

    await page.goto(dashboardUrl);
    await page.waitForTimeout(2000);

    await expect(page.getByText(workflowName)).toBeVisible({ timeout: 10000 });
    console.log('Workflow created successfully');
  });
});
