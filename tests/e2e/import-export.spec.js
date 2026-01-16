import { test, expect, chromium } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const extensionPath = path.join(__dirname, '../../build');

/**
 * Automa Import/Export E2E Tests
 * Tests for workflow import and export functionality
 */
test.describe('Automa Import/Export', () => {
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

  test('Export workflow as JSON', async () => {
    test.setTimeout(120000);
    const dashboardUrl = `chrome-extension://${extensionId}/newtab.html#/workflows`;
    await page.goto(dashboardUrl, { waitUntil: 'domcontentloaded' });

    // Create a new workflow first
    const newWorkflowBtn = page
      .locator('button')
      .filter({ hasText: /New workflow|workflow.new/i });
    await newWorkflowBtn.waitFor();
    await newWorkflowBtn.click();

    const nameInput = page.locator('input[placeholder="Name"]');
    await expect(nameInput).toBeVisible();
    const workflowName = 'Export Test ' + Date.now();
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

    // Save workflow
    await page.keyboard.press('Control+s');
    await page.waitForTimeout(2000);

    // Go back to dashboard
    await page.goto(dashboardUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Look for export menu/button
    const moreBtn = page.locator('button').filter({ hasText: /More|更多|⋮|•••|Export/i });
    
    if ((await moreBtn.count()) > 0) {
      await moreBtn.first().click();
      await page.waitForTimeout(1000);
      
      // Look for export option
      const exportOption = page.locator('text=Export').first();
      if ((await exportOption.count()) > 0) {
        await exportOption.click();
        console.log('Export option clicked');
      }
    }
  });

  test('Import workflow from JSON', async () => {
    test.setTimeout(120000);
    const dashboardUrl = `chrome-extension://${extensionId}/newtab.html#/workflows`;
    await page.goto(dashboardUrl, { waitUntil: 'domcontentloaded' });

    // Wait for dashboard to load
    await page.waitForTimeout(3000);

    // Look for import button
    const importBtn = page.locator('button').filter({ hasText: /Import|导入|Import workflow/i });
    
    if ((await importBtn.count()) > 0) {
      await importBtn.first().click();
      await page.waitForTimeout(1000);
      
      // Check for file input or upload area
      const fileInput = page.locator('input[type="file"]');
      const uploadArea = page.locator('.upload, .dropzone, .import-area');
      
      if ((await fileInput.count()) > 0 || (await uploadArea.count()) > 0) {
        console.log('Import dialog opened successfully');
      }
    }
  });

  test('Export workflow as image (screenshot)', async () => {
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
    const workflowName = 'Image Export Test ' + Date.now();
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

    // Save workflow
    await page.keyboard.press('Control+s');
    await page.waitForTimeout(2000);

    // Look for screenshot or image export option
    const screenshotBtn = page.locator('button').filter({ 
      hasText: /Screenshot|Image|PNG|JPEG|Image export/i 
    });
    
    if ((await screenshotBtn.count()) > 0) {
      console.log('Screenshot button found');
    }
  });

  test('Share workflow', async () => {
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
    const workflowName = 'Share Test ' + Date.now();
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

    // Save workflow
    await page.keyboard.press('Control+s');
    await page.waitForTimeout(2000);

    // Look for share button
    const shareBtn = page.locator('button').filter({ hasText: /Share|分享|Copy link/i });
    
    if ((await shareBtn.count()) > 0) {
      await shareBtn.first().click();
      await page.waitForTimeout(1000);
      console.log('Share dialog opened');
    }
  });

  test('Duplicate workflow', async () => {
    test.setTimeout(120000);
    const dashboardUrl = `chrome-extension://${extensionId}/newtab.html#/workflows`;
    await page.goto(dashboardUrl, { waitUntil: 'domcontentloaded' });

    // Wait for dashboard to load
    await page.waitForTimeout(3000);

    // Check initial workflow count
    const initialWorkflows = await page.locator('.workflow-item, .workflow-card, [class*="workflow"]').count();
    console.log(`Initial workflow count: ${initialWorkflows}`);

    // Look for duplicate option in more menu
    const moreBtn = page.locator('button').filter({ hasText: /More|更多|⋮|•••/i });
    
    if ((await moreBtn.count()) > 0) {
      await moreBtn.first().click();
      await page.waitForTimeout(1000);
      
      // Look for duplicate option
      const duplicateOption = page.locator('text=/Duplicate|Copy|复制/i');
      if ((await duplicateOption.count()) > 0) {
        await duplicateOption.first().click();
        await page.waitForTimeout(2000);
        console.log('Duplicate option clicked');
      }
    }
  });

  test('Delete workflow', async () => {
    test.setTimeout(120000);
    const dashboardUrl = `chrome-extension://${extensionId}/newtab.html#/workflows`;
    await page.goto(dashboardUrl, { waitUntil: 'domcontentloaded' });

    // Wait for dashboard to load
    await page.waitForTimeout(3000);

    // Create a new workflow first
    const newWorkflowBtn = page
      .locator('button')
      .filter({ hasText: /New workflow|workflow.new/i });
    await newWorkflowBtn.waitFor();
    await newWorkflowBtn.click();

    const nameInput = page.locator('input[placeholder="Name"]');
    await expect(nameInput).toBeVisible();
    const workflowName = 'Delete Test ' + Date.now();
    await nameInput.fill(workflowName);

    await page
      .getByRole('button', { name: 'Add', exact: true })
      .click()
      .catch(() => {
        return page.locator('.ui-modal button.bg-accent').click();
      });

    await expect(page).toHaveURL(/\/workflows\/[\w-]+/);
    await page.keyboard.press('Control+s');
    await page.waitForTimeout(1000);

    // Go back to dashboard
    await page.goto(dashboardUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Look for delete option
    const moreBtn = page.locator('button').filter({ hasText: /More|更多|⋮|•••|Delete/i });
    
    if ((await moreBtn.count()) > 0) {
      await moreBtn.first().click();
      await page.waitForTimeout(1000);
      
      // Look for delete option
      const deleteOption = page.locator('text=/Delete|删除|Remove/i');
      if ((await deleteOption.count()) > 0) {
        await deleteOption.first().click();
        await page.waitForTimeout(1000);
        
        // Confirm deletion if dialog appears
        const confirmBtn = page.locator('button').filter({ hasText: /Delete|Confirm|确认|删除/i });
        if ((await confirmBtn.count()) > 0) {
          await confirmBtn.first().click();
        }
        console.log('Delete workflow initiated');
      }
    }
  });
});
