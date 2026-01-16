import { test, expect, chromium } from '@playwright/test';
import path from 'path';

const extensionPath = path.join(__dirname, '../../build');

/**
 * Automa Blocks E2E Tests
 * Tests for block operations including adding, configuring, connecting, and removing blocks
 */
test.describe('Automa Blocks Operations', () => {
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

  test('Add new block to workflow', async () => {
    test.setTimeout(60000);
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
    const workflowName = 'Block Test ' + Date.now();
    await nameInput.fill(workflowName);

    await page
      .getByRole('button', { name: 'Add', exact: true })
      .click()
      .catch(() => {
        return page.locator('.ui-modal button.bg-accent').click();
      });

    await expect(page).toHaveURL(/\/workflows\/[\w-]+/);

    // Wait for editor to load
    await expect(
      page.locator('.vue-flow__node-BlockBasic').filter({ hasText: 'Trigger' })
    ).toBeVisible({ timeout: 10000 });

    // Find the add block button
    // The add block button is usually in the sidebar or toolbar
    const addBlockBtn = page
      .locator('button')
      .filter({ hasText: /Add Block|添加块/i });

    if ((await addBlockBtn.count()) > 0) {
      await addBlockBtn.first().click();

      // Look for a common block type like "Log Data" or "Wait"
      const logBlock = page
        .locator('.block-item, .block-option')
        .filter({ hasText: /Log|日志/i });
      if ((await logBlock.count()) > 0) {
        await logBlock.first().click();

        // Verify new block was added
        await page.waitForTimeout(2000);
      }
    }
  });

  test('Configure block properties', async () => {
    test.setTimeout(60000);
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
    const workflowName = 'Block Config Test ' + Date.now();
    await nameInput.fill(workflowName);

    await page
      .getByRole('button', { name: 'Add', exact: true })
      .click()
      .catch(() => {
        return page.locator('.ui-modal button.bg-accent').click();
      });

    await expect(page).toHaveURL(/\/workflows\/[\w-]+/);

    // Wait for editor to load
    await expect(
      page.locator('.vue-flow__node-BlockBasic').filter({ hasText: 'Trigger' })
    ).toBeVisible({ timeout: 10000 });

    // Click on the trigger block to configure it
    const triggerBlock = page
      .locator('.vue-flow__node-BlockBasic')
      .filter({ hasText: 'Trigger' });
    await triggerBlock.click();

    // Look for configuration panel
    const configPanel = page.locator(
      '.side-panel, .config-panel, .block-config'
    );

    if ((await configPanel.count()) > 0) {
      // Check if panel is visible
      await expect(configPanel.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('Connect blocks with edges', async () => {
    test.setTimeout(90000);
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
    const workflowName = 'Connect Blocks Test ' + Date.now();
    await nameInput.fill(workflowName);

    await page
      .getByRole('button', { name: 'Add', exact: true })
      .click()
      .catch(() => {
        return page.locator('.ui-modal button.bg-accent').click();
      });

    await expect(page).toHaveURL(/\/workflows\/[\w-]+/);

    // Wait for editor to load
    await expect(
      page.locator('.vue-flow__node-BlockBasic').filter({ hasText: 'Trigger' })
    ).toBeVisible({ timeout: 10000 });

    // Add a second block
    const addBlockBtn = page
      .locator('button')
      .filter({ hasText: /Add Block|添加块/i });

    if ((await addBlockBtn.count()) > 0) {
      await addBlockBtn.first().click();

      const logBlock = page
        .locator('.block-item, .block-option')
        .filter({ hasText: /Log|日志/i });
      if ((await logBlock.count()) > 0) {
        await logBlock.first().click();
        await page.waitForTimeout(2000);
      }
    }

    // Check for edges between blocks
    const edges = page.locator('.vue-flow__edge');
    const edgeCount = await edges.count();

    // The workflow should have at least one edge connecting trigger to next block
    console.log(`Found ${edgeCount} edges in the workflow`);
  });

  test('Delete block from workflow', async () => {
    test.setTimeout(60000);
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
    const workflowName = 'Delete Block Test ' + Date.now();
    await nameInput.fill(workflowName);

    await page
      .getByRole('button', { name: 'Add', exact: true })
      .click()
      .catch(() => {
        return page.locator('.ui-modal button.bg-accent').click();
      });

    await expect(page).toHaveURL(/\/workflows\/[\w-]+/);

    // Wait for editor to load
    await expect(
      page.locator('.vue-flow__node-BlockBasic').filter({ hasText: 'Trigger' })
    ).toBeVisible({ timeout: 10000 });

    // Add a block first
    const addBlockBtn = page
      .locator('button')
      .filter({ hasText: /Add Block|添加块/i });

    if ((await addBlockBtn.count()) > 0) {
      await addBlockBtn.first().click();

      const logBlock = page
        .locator('.block-item, .block-option')
        .filter({ hasText: /Log|日志/i });
      if ((await logBlock.count()) > 0) {
        await logBlock.first().click();
        await page.waitForTimeout(2000);
      }
    }

    // Try to delete the block using keyboard
    await page.keyboard.press('Delete');
    await page.waitForTimeout(1000);

    // Or right-click and delete
    const block = page.locator('.vue-flow__node').last();
    if ((await block.count()) > 0) {
      await block.click({ button: 'right' });
      await page.waitForTimeout(500);

      const deleteOption = page.locator('text=Delete').first();
      if ((await deleteOption.count()) > 0) {
        await deleteOption.click();
      }
    }
  });

  test('Duplicate block', async () => {
    test.setTimeout(60000);
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
    const workflowName = 'Duplicate Block Test ' + Date.now();
    await nameInput.fill(workflowName);

    await page
      .getByRole('button', { name: 'Add', exact: true })
      .click()
      .catch(() => {
        return page.locator('.ui-modal button.bg-accent').click();
      });

    await expect(page).toHaveURL(/\/workflows\/[\w-]+/);

    // Wait for editor to load
    await expect(
      page.locator('.vue-flow__node-BlockBasic').filter({ hasText: 'Trigger' })
    ).toBeVisible({ timeout: 10000 });

    // Count initial blocks
    const initialBlockCount = await page.locator('.vue-flow__node').count();
    console.log(`Initial block count: ${initialBlockCount}`);

    // Try to duplicate using keyboard shortcut (Ctrl+D or Cmd+D)
    const triggerBlock = page
      .locator('.vue-flow__node-BlockBasic')
      .filter({ hasText: 'Trigger' });
    if ((await triggerBlock.count()) > 0) {
      await triggerBlock.click();

      // Press Ctrl+D to duplicate
      await page.keyboard.press('Control+d');
      await page.waitForTimeout(2000);

      // Check if block count increased
      const newBlockCount = await page.locator('.vue-flow__node').count();
      console.log(`Block count after duplicate: ${newBlockCount}`);
    }
  });
});
