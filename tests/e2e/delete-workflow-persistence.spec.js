import { test, expect, chromium } from '@playwright/test';
import path from 'path';

const extensionPath = path.join(__dirname, '../../build');

test.describe('Delete Workflow Persistence', () => {
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
  });

  test.afterEach(async () => {
    await browserContext.close();
  });

  test('should persist workflow deletion after page reload', async () => {
    await page.goto(`chrome-extension://${extensionId}/newtab.html`);
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.workflows-container', { timeout: 10000 });

    // Get initial workflow count
    let workflowCards = await page.locator('.local-workflow').all();
    const initialCount = workflowCards.length;
    
    console.log(`Initial workflow count: ${initialCount}`);
    
    if (initialCount === 0) {
      console.log('⚠️ No workflows found, skipping test');
      return;
    }

    // Get the name of the first workflow to verify deletion
    const firstWorkflowName = await page
      .locator('.local-workflow')
      .first()
      .locator('p.text-overflow')
      .first()
      .textContent();
    
    console.log(`Workflow to delete: "${firstWorkflowName}"`);

    // Click checkbox to select the first workflow
    const firstCheckbox = page.locator('.local-workflow .checkbox-ui').first();
    await firstCheckbox.click({ force: true });
    await page.waitForTimeout(1000);

    // Wait for delete button to appear
    const deleteButton = page.locator('button:has-text("Delete selected workflows")');
    await expect(deleteButton).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Delete button visible');

    // Click delete button
    await deleteButton.click();
    await page.waitForTimeout(500);

    // Confirm deletion in dialog
    const confirmButton = page.locator('button:has-text("Delete")').last();
    await confirmButton.click();
    await page.waitForTimeout(2000);

    console.log('✅ Clicked delete and confirm');

    // Verify workflow is removed from UI immediately
    workflowCards = await page.locator('.local-workflow').all();
    const countAfterDelete = workflowCards.length;
    
    console.log(`Workflow count after delete: ${countAfterDelete}`);
    expect(countAfterDelete).toBe(initialCount - 1);

    // Verify the specific workflow is gone
    const allWorkflowNames = await page.locator('.local-workflow p.text-overflow').allTextContents();
    expect(allWorkflowNames).not.toContain(firstWorkflowName);
    
    console.log('✅ Workflow removed from UI');

    // **Critical test: Reload page and verify deletion persists**
    console.log('🔄 Reloading page...');
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.workflows-container', { timeout: 10000 });

    // Get workflow count after reload
    workflowCards = await page.locator('.local-workflow').all();
    const countAfterReload = workflowCards.length;
    
    console.log(`Workflow count after reload: ${countAfterReload}`);

    // Verify count is still reduced
    expect(countAfterReload).toBe(initialCount - 1);

    // Verify the deleted workflow is still gone
    const allWorkflowNamesAfterReload = await page.locator('.local-workflow p.text-overflow').allTextContents();
    expect(allWorkflowNamesAfterReload).not.toContain(firstWorkflowName);

    console.log('✅ Deletion persisted after reload');
  });

  test('should persist batch deletion of multiple workflows', async () => {
    await page.goto(`chrome-extension://${extensionId}/newtab.html`);
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.workflows-container', { timeout: 10000 });

    let workflowCards = await page.locator('.local-workflow').all();
    const initialCount = workflowCards.length;
    
    console.log(`Initial workflow count: ${initialCount}`);
    
    if (initialCount < 2) {
      console.log('⚠️ Need at least 2 workflows for batch delete test');
      return;
    }

    // Get names of first two workflows
    const firstWorkflowName = await page.locator('.local-workflow').nth(0).locator('p.text-overflow').first().textContent();
    const secondWorkflowName = await page.locator('.local-workflow').nth(1).locator('p.text-overflow').first().textContent();
    
    console.log(`Workflows to delete: "${firstWorkflowName}", "${secondWorkflowName}"`);

    // Select first two workflows
    await page.locator('.local-workflow .checkbox-ui').nth(0).click({ force: true });
    await page.waitForTimeout(500);
    await page.locator('.local-workflow .checkbox-ui').nth(1).click({ force: true });
    await page.waitForTimeout(1000);

    // Delete selected workflows
    const deleteButton = page.locator('button:has-text("Delete selected workflows")');
    await deleteButton.click();
    await page.waitForTimeout(500);
    
    const confirmButton = page.locator('button:has-text("Delete")').last();
    await confirmButton.click();
    await page.waitForTimeout(2000);

    console.log('✅ Deleted 2 workflows');

    // Reload and verify
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.workflows-container', { timeout: 10000 });

    workflowCards = await page.locator('.local-workflow').all();
    const countAfterReload = workflowCards.length;
    
    console.log(`Workflow count after reload: ${countAfterReload}`);
    expect(countAfterReload).toBe(initialCount - 2);

    const allWorkflowNamesAfterReload = await page.locator('.local-workflow p.text-overflow').allTextContents();
    expect(allWorkflowNamesAfterReload).not.toContain(firstWorkflowName);
    expect(allWorkflowNamesAfterReload).not.toContain(secondWorkflowName);

    console.log('✅ Batch deletion persisted after reload');
  });
});
