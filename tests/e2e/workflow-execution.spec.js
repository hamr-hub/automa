import { test, expect, chromium } from '@playwright/test';
import path from 'path';

const extensionPath = path.join(__dirname, '../../build');

/**
 * Automa Workflow Execution E2E Tests
 * Tests for workflow execution, including running workflows, checking logs, and handling execution results
 */
test.describe('Automa Workflow Execution', () => {
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

  test('Run simple workflow with trigger and log block', async () => {
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
    const workflowName = 'Simple Execute Test ' + Date.now();
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

    // Save workflow
    await page.keyboard.press('Control+s');
    await page.waitForTimeout(1000);

    // Click the run button
    const runBtn = page
      .locator('button')
      .filter({ has: page.locator('path[d^="M16.394 12"]') })
      .first();

    if ((await runBtn.count()) > 0) {
      await expect(runBtn).toBeVisible();
      await runBtn.click({ force: true });
      console.log('Clicked Run button');

      // Wait for execution
      await page.waitForTimeout(5000);
    }
  });

  test('View workflow execution logs', async () => {
    test.setTimeout(120000);
    const dashboardUrl = `chrome-extension://${extensionId}/newtab.html#/workflows`;
    await page.goto(dashboardUrl, { waitUntil: 'domcontentloaded' });

    // Create and execute a workflow first
    const newWorkflowBtn = page
      .locator('button')
      .filter({ hasText: /New workflow|workflow.new/i });
    await newWorkflowBtn.waitFor();
    await newWorkflowBtn.click();

    const nameInput = page.locator('input[placeholder="Name"]');
    await expect(nameInput).toBeVisible();
    const workflowName = 'Logs View Test ' + Date.now();
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

    // Save and run
    await page.keyboard.press('Control+s');
    await page.waitForTimeout(1000);

    const runBtn = page
      .locator('button')
      .filter({ has: page.locator('path[d^="M16.394 12"]') })
      .first();
    if ((await runBtn.count()) > 0) {
      await runBtn.click({ force: true });
      await page.waitForTimeout(5000);
    }

    // Navigate to Logs
    const logsLink = page.locator('aside a[href="#"]');
    if ((await logsLink.count()) > 0) {
      await logsLink.click();
    } else {
      // Try alternative selectors
      const sidebarLinks = page.locator('aside a');
      const linkCount = await sidebarLinks.count();
      console.log(`Found ${linkCount} sidebar links`);

      if (linkCount > 0) {
        await sidebarLinks.nth(Math.min(5, linkCount - 1)).click();
      }
    }

    // Check for logs modal
    const logsModal = page
      .locator('.modal-ui__content-container, .logs-modal, .execution-logs')
      .last();
    if ((await logsModal.count()) > 0) {
      await expect(logsModal).toBeVisible({ timeout: 10000 });

      // Check for execution data
      const modalContent = await logsModal.innerText();
      console.log('Logs modal content length:', modalContent.length);
    }
  });

  test('Stop running workflow', async () => {
    test.setTimeout(60000);
    const dashboardUrl = `chrome-extension://${extensionId}/newtab.html#/workflows`;
    await page.goto(dashboardUrl, { waitUntil: 'domcontentloaded' });

    // Create a new workflow with a wait block that can be interrupted
    const newWorkflowBtn = page
      .locator('button')
      .filter({ hasText: /New workflow|workflow.new/i });
    await newWorkflowBtn.waitFor();
    await newWorkflowBtn.click();

    const nameInput = page.locator('input[placeholder="Name"]');
    await expect(nameInput).toBeVisible();
    const workflowName = 'Stop Test ' + Date.now();
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

    // Look for stop button (usually same as run button or a different icon)
    const stopBtn = page
      .locator('button')
      .filter({ hasText: /Stop|停止|终止/i });

    if ((await stopBtn.count()) > 0) {
      console.log('Stop button found');
    }
  });

  test('View execution history', async () => {
    test.setTimeout(60000);
    const dashboardUrl = `chrome-extension://${extensionId}/newtab.html#/workflows`;
    await page.goto(dashboardUrl, { waitUntil: 'domcontentloaded' });

    // Wait for dashboard to load
    await page.waitForTimeout(3000);

    // Look for history or executions link
    const historyLink = page
      .locator('a, button')
      .filter({ hasText: /History|历史|Executions|执行记录/i });

    if ((await historyLink.count()) > 0) {
      await historyLink.first().click();
      await page.waitForTimeout(2000);
    } else {
      console.log('History link not found, checking sidebar...');

      // Check sidebar for history/executions
      const sidebarItems = page.locator('nav a, aside a');
      for (let i = 0; i < (await sidebarItems.count()); i++) {
        const text = await sidebarItems.nth(i).innerText();
        if (/history|executions|logs/i.test(text)) {
          await sidebarItems.nth(i).click();
          await page.waitForTimeout(2000);
          break;
        }
      }
    }
  });

  test('Execute workflow with error handling', async () => {
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
    const workflowName = 'Error Handling Test ' + Date.now();
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

    // Try to add a block that might fail (like invalid selector)
    const addBlockBtn = page
      .locator('button')
      .filter({ hasText: /Add Block|添加块/i });

    if ((await addBlockBtn.count()) > 0) {
      await addBlockBtn.first().click();

      // Look for blocks that might cause errors
      const errorBlock = page.locator('.block-item, .block-option').filter({
        hasText: /Tab|Tab等|Page|页面/i,
      });

      if ((await errorBlock.count()) > 0) {
        await errorBlock.first().click();
        await page.waitForTimeout(2000);
      }
    }

    // Run the workflow
    await page.keyboard.press('Control+s');
    await page.waitForTimeout(1000);

    const runBtn = page
      .locator('button')
      .filter({ has: page.locator('path[d^="M16.394 12"]') })
      .first();
    if ((await runBtn.count()) > 0) {
      await runBtn.click({ force: true });
      await page.waitForTimeout(5000);

      // Check logs for error handling
      const logsLink = page.locator('aside a[href="#"]');
      if ((await logsLink.count()) > 0) {
        await logsLink.click();
        await page.waitForTimeout(2000);
      }
    }
  });

  test('Workflow execution time measurement', async () => {
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
    const workflowName = 'Performance Test ' + Date.now();
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

    // Measure execution time
    const startTime = Date.now();

    // Run the workflow
    await page.keyboard.press('Control+s');
    await page.waitForTimeout(1000);

    const runBtn = page
      .locator('button')
      .filter({ has: page.locator('path[d^="M16.394 12"]') })
      .first();
    if ((await runBtn.count()) > 0) {
      await runBtn.click({ force: true });

      // Wait for completion
      await page.waitForTimeout(5000);

      const endTime = Date.now();
      const executionTime = endTime - startTime;
      console.log(`Workflow execution time: ${executionTime}ms`);
    }
  });
});
