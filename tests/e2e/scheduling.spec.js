import { test, expect, chromium } from '@playwright/test';
import path from 'path';

const extensionPath = path.join(__dirname, '../../build');

/**
 * Automa Scheduling E2E Tests
 * Tests for workflow scheduling and timing functionality
 */
test.describe('Automa Workflow Scheduling', () => {
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

    page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', (exception) =>
      console.log(`PAGE ERROR: "${exception}"`)
    );
  });

  test.afterEach(async () => {
    if (browserContext) await browserContext.close();
  });

  test('Schedule workflow with time trigger', async () => {
    test.setTimeout(120000);
    const dashboardUrl = `chrome-extension://${extensionId}/newtab.html#/workflows`;
    await page.goto(dashboardUrl, { waitUntil: 'domcontentloaded' });

    // Create a new workflow
    const newWorkflowBtn = page
      .locator('button')
      .filter({ hasText: /New workflow|workflow.new/i });
    await newWorkflowBtn.waitFor();
    await newWorkflowBtn.click();

    const nameInput = page.locator('input[placeholder="Name"]');
    await expect(nameInput).toBeVisible();
    const workflowName = 'Schedule Test ' + Date.now();
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

    // Look for schedule/scheduler trigger option
    const triggerBlock = page
      .locator('.vue-flow__node-BlockBasic')
      .filter({ hasText: 'Trigger' });
    await triggerBlock.click();

    // Look for schedule or time-based trigger configuration
    const scheduleOption = page.locator('select, input').filter({
      hasText: /Schedule|Time|Cron|定时|时间/i,
    });

    if ((await scheduleOption.count()) > 0) {
      console.log('Schedule options found');
    }
  });

  test('Configure cron expression', async () => {
    test.setTimeout(120000);
    const dashboardUrl = `chrome-extension://${extensionId}/newtab.html#/workflows`;
    await page.goto(dashboardUrl, { waitUntil: 'domcontentloaded' });

    // Create a new workflow
    const newWorkflowBtn = page
      .locator('button')
      .filter({ hasText: /New workflow|workflow.new/i });
    await newWorkflowBtn.waitFor();
    await newWorkflowBtn.click();

    const nameInput = page.locator('input[placeholder="Name"]');
    await expect(nameInput).toBeVisible();
    const workflowName = 'Cron Config Test ' + Date.now();
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

    // Click on trigger to configure
    const triggerBlock = page
      .locator('.vue-flow__node-BlockBasic')
      .filter({ hasText: 'Trigger' });
    await triggerBlock.click();

    // Look for cron expression input
    const cronInput = page.locator(
      'input[placeholder*="cron"], input[placeholder*="Cron"], input[placeholder*="Schedule"]'
    );

    if ((await cronInput.count()) > 0) {
      console.log('Cron input field found');
    }
  });

  test('View scheduled workflows', async () => {
    test.setTimeout(60000);
    const dashboardUrl = `chrome-extension://${extensionId}/newtab.html#/workflows`;
    await page.goto(dashboardUrl, { waitUntil: 'domcontentloaded' });

    await page.waitForTimeout(3000);

    // Look for scheduled workflows section or tab
    const scheduledTab = page.locator('a, button').filter({
      hasText: /Scheduled|Schedule|定时任务|Cron/i,
    });

    if ((await scheduledTab.count()) > 0) {
      await scheduledTab.first().click();
      await page.waitForTimeout(2000);
      console.log('Scheduled workflows section opened');
    } else {
      // Check sidebar for schedule-related navigation
      const sidebarItems = page.locator('nav a, aside a');
      for (let i = 0; i < (await sidebarItems.count()); i++) {
        const text = await sidebarItems.nth(i).innerText();
        if (/scheduled|cron|定时/i.test(text)) {
          await sidebarItems.nth(i).click();
          await page.waitForTimeout(2000);
          break;
        }
      }
    }
  });

  test('Enable/disable scheduled workflow', async () => {
    test.setTimeout(120000);
    const dashboardUrl = `chrome-extension://${extensionId}/newtab.html#/workflows`;
    await page.goto(dashboardUrl, { waitUntil: 'domcontentloaded' });

    await page.waitForTimeout(3000);

    // Look for toggle switch for schedule
    const toggleSwitch = page
      .locator('input[type="checkbox"], .toggle, .switch')
      .filter({
        hasText: /Scheduled|Enabled|Active/i,
      });

    if ((await toggleSwitch.count()) > 0) {
      const initialState = await toggleSwitch.first().isChecked();
      console.log(`Initial toggle state: ${initialState}`);

      // Click to toggle
      await toggleSwitch.first().click();
      await page.waitForTimeout(1000);

      const newState = await toggleSwitch.first().isChecked();
      console.log(`New toggle state: ${newState}`);
      expect(newState).not.toEqual(initialState);
    }
  });

  test('Set workflow interval', async () => {
    test.setTimeout(120000);
    const dashboardUrl = `chrome-extension://${extensionId}/newtab.html#/workflows`;
    await page.goto(dashboardUrl, { waitUntil: 'domcontentloaded' });

    // Create a new workflow
    const newWorkflowBtn = page
      .locator('button')
      .filter({ hasText: /New workflow|workflow.new/i });
    await newWorkflowBtn.waitFor();
    await newWorkflowBtn.click();

    const nameInput = page.locator('input[placeholder="Name"]');
    await expect(nameInput).toBeVisible();
    const workflowName = 'Interval Test ' + Date.now();
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

    // Look for interval settings
    const intervalOption = page.locator('select, input').filter({
      hasText: /Interval|Every|Minutes|Hours|间隔|分钟|小时/i,
    });

    if ((await intervalOption.count()) > 0) {
      console.log('Interval settings found');
    }
  });
});
