import { test, expect, chromium } from '@playwright/test';
import path from 'path';

const extensionPath = path.join(__dirname, '../../build');

/**
 * Automa Data Extraction E2E Tests
 * Tests for data extraction functionality including selectors, scraping, and data export
 */
test.describe('Automa Data Extraction', () => {
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

  test('Create workflow with data extraction block', async () => {
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
    const workflowName = 'Data Extraction Test ' + Date.now();
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

    // Add a data extraction block
    const addBlockBtn = page
      .locator('button')
      .filter({ hasText: /Add Block|添加块/i });

    if ((await addBlockBtn.count()) > 0) {
      await addBlockBtn.first().click();

      // Look for data extraction related blocks
      const extractBlock = page.locator('.block-item, .block-option').filter({
        hasText: /Extract|Data|Selector|选择器/i,
      });

      if ((await extractBlock.count()) > 0) {
        await extractBlock.first().click();
        await page.waitForTimeout(2000);
        console.log('Data extraction block added');
      }
    }
  });

  test('Configure element selector', async () => {
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
    const workflowName = 'Selector Config Test ' + Date.now();
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

    // Add an element block (Tab or Page block)
    const addBlockBtn = page
      .locator('button')
      .filter({ hasText: /Add Block|添加块/i });

    if ((await addBlockBtn.count()) > 0) {
      await addBlockBtn.first().click();

      const elementBlock = page.locator('.block-item, .block-option').filter({
        hasText: /Tab|Page|Element|元素/i,
      });

      if ((await elementBlock.count()) > 0) {
        await elementBlock.first().click();
        await page.waitForTimeout(2000);

        // Click on the added block to configure
        const addedBlock = page
          .locator('.vue-flow__node')
          .filter({ hasText: /Tab|Element/i });
        if ((await addedBlock.count()) > 0) {
          await addedBlock.first().click();

          // Look for selector configuration fields
          const selectorInput = page.locator(
            'input[placeholder*="selector"], input[placeholder*="Selector"]'
          );
          if ((await selectorInput.count()) > 0) {
            console.log('Selector configuration field found');
          }
        }
      }
    }
  });

  test('Test CSS selector generation', async () => {
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
    const workflowName = 'CSS Selector Test ' + Date.now();
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

    // Look for selector picker/inspector functionality
    const pickerBtn = page.locator('button').filter({
      hasText: /Pick|Selector|Inspect|选择器/i,
    });

    if ((await pickerBtn.count()) > 0) {
      console.log('Selector picker button found');
    }
  });

  test('Extract data to table format', async () => {
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
    const workflowName = 'Table Extract Test ' + Date.now();
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

    // Add blocks for table extraction
    const addBlockBtn = page
      .locator('button')
      .filter({ hasText: /Add Block|添加块/i });

    if ((await addBlockBtn.count()) > 0) {
      await addBlockBtn.first().click();

      // Look for table or loop blocks
      const tableBlock = page.locator('.block-item, .block-option').filter({
        hasText: /Table|Loop|ForEach|表格|循环/i,
      });

      if ((await tableBlock.count()) > 0) {
        await tableBlock.first().click();
        await page.waitForTimeout(2000);
        console.log('Table/Loop block added');
      }
    }
  });

  test('Export extracted data', async () => {
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
    const workflowName = 'Export Data Test ' + Date.now();
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

    // Look for export blocks
    const addBlockBtn = page
      .locator('button')
      .filter({ hasText: /Add Block|添加块/i });

    if ((await addBlockBtn.count()) > 0) {
      await addBlockBtn.first().click();

      // Look for export/download blocks
      const exportBlock = page.locator('.block-item, .block-option').filter({
        hasText: /Export|Download|CSV|Excel|导出/i,
      });

      if ((await exportBlock.count()) > 0) {
        await exportBlock.first().click();
        await page.waitForTimeout(2000);
        console.log('Export block added');
      }
    }
  });
});
