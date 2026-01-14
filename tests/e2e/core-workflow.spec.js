import { test, expect, chromium } from '@playwright/test';
import path from 'path';

const extensionPath = path.join(__dirname, '../../build');

test.describe('Automa Core Workflow Features', () => {
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
        // Fallback for some environments
        // Assuming default ID or trying to navigate to find it
        // But for now let's throw if not found, as we need it
        // In persistent context, usually we can get it.
        // Let's try to open a known page to trigger extension load if needed
        const p = await browserContext.newPage();
        await p.goto('chrome://extensions');
        // This is tricky without knowing ID.
        // Let's rely on background page being found eventually or existing pages.
      }
    }

    if (backgroundPage) {
      extensionId = backgroundPage.url().split('/')[2];

      // Initialize storage to skip update/welcome modals
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
    } else {
      // Try to find via targets
      // This part is a bit flaky in some playwright envs, but let's try
    }

    // Ensure we have an extension ID
    if (!extensionId) {
      // Last resort hack: navigate to a relative path and see if it resolves? No.
      // Let's assume standard ID if not found? No, it changes.
      // Let's iterate pages again.
      const pages = browserContext.pages();
      for (const p of pages) {
        if (p.url().startsWith('chrome-extension://')) {
          extensionId = p.url().split('/')[2];
          break;
        }
      }
    }

    page = await browserContext.newPage();
    await page.setViewportSize({ width: 1280, height: 800 });
  });

  test.afterEach(async () => {
    if (browserContext) await browserContext.close();
  });

  test('Create, Edit, Save, and Execute a Workflow', async () => {
    test.setTimeout(120000);
    // 1. Open Dashboard
    const dashboardUrl = `chrome-extension://${extensionId}/newtab.html#/workflows`;
    await page.goto(dashboardUrl, { waitUntil: 'domcontentloaded' });

    // Wait for "New workflow" button
    const newWorkflowBtn = page
      .locator('button')
      .filter({ hasText: /New workflow|workflow.new/i });
    await newWorkflowBtn.waitFor();
    await newWorkflowBtn.click();

    // 2. Create Workflow
    const nameInput = page.locator('input[placeholder="Name"]');
    await expect(nameInput).toBeVisible();
    const workflowName = 'Core Test Workflow ' + Date.now();
    await nameInput.fill(workflowName);

    // Click Create/Add
    await page
      .getByRole('button', { name: 'Add', exact: true })
      .click()
      .catch(() => {
        return page.locator('.ui-modal button.bg-accent').click();
      });

    // 3. Editor Interaction
    await expect(page).toHaveURL(/\/workflows\/[\w-]+/);

    // Wait for Trigger block
    await expect(
      page.locator('.vue-flow__node-BlockBasic').filter({ hasText: 'Trigger' })
    ).toBeVisible();

    // Add "Log Data" block
    // 1. Search in sidebar
    const sidebarSearch = page.locator('#search-input input');
    await sidebarSearch.fill('Log Data');

    // 2. Find block in sidebar
    const blockItem = page
      .locator('.bg-input')
      .filter({ hasText: 'Log Data' })
      .first();
    await expect(blockItem).toBeVisible();

    // 3. Drag to canvas
    const canvas = page.locator('.vue-flow__pane');

    // Use manual drag event dispatching to ensure dataTransfer is handled
    await blockItem.evaluate((element, canvasSelector) => {
      const canvas = document.querySelector(canvasSelector);
      const dataTransfer = new DataTransfer();

      // Trigger dragstart to let Vue populate dataTransfer
      const dragStartEvent = new DragEvent('dragstart', {
        bubbles: true,
        cancelable: true,
        dataTransfer: dataTransfer,
      });
      element.dispatchEvent(dragStartEvent);

      // Trigger drop on canvas
      const dropEvent = new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        clientX: canvas.getBoundingClientRect().left + 300,
        clientY: canvas.getBoundingClientRect().top + 200,
        dataTransfer: dataTransfer,
      });
      canvas.dispatchEvent(dropEvent);
    }, '.vue-flow__pane');

    // Verify Block Added
    const logBlock = page
      .locator('.vue-flow__node-BlockBasic')
      .filter({ hasText: 'Log Data' });
    await expect(logBlock).toBeVisible({ timeout: 5000 });

    // Connect Trigger to Log Data
    // Trigger output handle (source)
    const triggerNode = page
      .locator('.vue-flow__node-BlockBasic')
      .filter({ hasText: 'Trigger' });
    const triggerSource = triggerNode.locator('.source');

    // Log Data input handle (target)
    const logTarget = logBlock.locator('.target');

    // Drag and drop connection
    await triggerSource.hover();
    await page.mouse.down();
    await logTarget.hover();
    await page.mouse.up();

    // Verify connection line exists
    await expect(page.locator('.vue-flow__edge')).toBeVisible();

    // Edit Log Data Block
    // Double click to open settings
    await logBlock.dblclick();

    // Wait for settings sidebar
    // Selector for the edit block title
    await expect(
      page
        .locator('#workflow-edit-block p.font-semibold')
        .filter({ hasText: 'Log Data' })
    ).toBeVisible({ timeout: 5000 });

    // Find textarea for data
    const logInput = page.locator('textarea').first();
    await logInput.fill('Hello Automa');
    console.log('Filled Log Data');

    // Close sidebar to ensure main actions are accessible
    const closeSidebarBtn = page.locator('#workflow-edit-block button').first();
    if (await closeSidebarBtn.isVisible()) {
      await closeSidebarBtn.click();
      await expect(page.locator('#workflow-edit-block')).not.toBeVisible();
      console.log('Sidebar closed');
    }

    // 4. Save Workflow
    // Use button with text "Save" if visible, or shortcut
    const saveBtn = page.getByRole('button', { name: 'Save' });
    if (await saveBtn.isVisible()) {
      await saveBtn.click();
    } else {
      await page.keyboard.press('Control+s');
    }
    console.log('Saved Workflow');

    // Wait for saving indication (ping animation or just wait)
    await page.waitForTimeout(2000);

    // 5. Execute Workflow
    // Find play button by SVG path (riPlayLine)
    const runBtn = page
      .locator('button')
      .filter({
        has: page.locator('path[d^="M16.394 12"]'),
      })
      .first();

    await expect(runBtn).toBeVisible();
    await runBtn.click({ force: true });
    console.log('Clicked Run');

    // Wait for execution to finish
    await page.waitForTimeout(2000);

    // 6. Verify Logs
    console.log('Navigating to Logs...');
    // Go to dashboard first
    await page.goto(`chrome-extension://${extensionId}/newtab.html#/workflows`);
    await page.waitForTimeout(1000);

    // Click Logs in sidebar (assuming standard dashboard layout)
    // Try to find the link
    const logsLink = page.locator('a[href="#/logs"]');
    if (await logsLink.isVisible()) {
      await logsLink.click();
    } else {
      // Fallback: goto logs url directly from dashboard
      await page.goto(`chrome-extension://${extensionId}/newtab.html#/logs`);
    }

    // Wait for Logs Modal
    const logsModal = page.locator('.ui-modal').last();
    await expect(logsModal).toBeVisible({ timeout: 10000 });

    // Check if our workflow is in the logs list
    await expect(logsModal.getByText(workflowName)).toBeVisible();

    // Click it to see details
    await logsModal.getByText(workflowName).first().click();

    // Wait for running to finish
    await expect(logsModal.getByText('Running')).not.toBeVisible({
      timeout: 10000,
    });

    // Check status "Success"
    await expect(logsModal.getByText('Success')).toBeVisible();

    // Check log content "Hello Automa"
    await expect(logsModal.getByText('Hello Automa')).toBeVisible();

    // Check status
    // Wait for any status badge
    // In logs detail, status is usually prominent

    // Wait for execution to complete (it might be 'Running' for a moment)
    await page.waitForTimeout(1000);

    // If we see 'Running', wait more
    const running = page.getByText('Running');
    if (await running.isVisible()) {
      console.log('Workflow is still running, waiting...');
      await expect(running).not.toBeVisible({ timeout: 10000 });
    }

    // Check status "Success"
    const success = page.getByText('Success');
    if (!(await success.isVisible())) {
      // Debug failure
      const body = await page.locator('body').innerText();
      console.log('Page Text:', body);
    }
    await expect(success).toBeVisible();

    // Check log content "Hello Automa"
    await expect(page.getByText('Hello Automa')).toBeVisible();
  });
});
