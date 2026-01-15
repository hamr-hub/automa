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
    const newWorkflowBtn = page.locator('button').filter({ hasText: /New workflow|workflow.new/i });
    await newWorkflowBtn.waitFor();
    await newWorkflowBtn.click();

    const nameInput = page.locator('input[placeholder="Name"]');
    await expect(nameInput).toBeVisible();
    const workflowName = 'Loop Test ' + Date.now();
    await nameInput.fill(workflowName);
    await page.getByRole('button', { name: 'Add', exact: true }).click().catch(() => {
        return page.locator('.ui-modal button.bg-accent').click();
    });

    await expect(page).toHaveURL(/\/workflows\/[\w-]+/);

    // 2. Add Loop Data Block
    // Search
    const sidebarSearch = page.locator('#search-input input');
    await sidebarSearch.fill('Loop Data');
    const loopBlockItem = page.locator('.bg-input').filter({ hasText: 'Loop Data' }).first();
    await expect(loopBlockItem).toBeVisible();

    // Drag Loop Data
    await loopBlockItem.evaluate((element, canvasSelector) => {
      const canvas = document.querySelector(canvasSelector);
      const dataTransfer = new DataTransfer();
      const dragStartEvent = new DragEvent('dragstart', {
        bubbles: true, cancelable: true, dataTransfer: dataTransfer,
      });
      element.dispatchEvent(dragStartEvent);
      const dropEvent = new DragEvent('drop', {
        bubbles: true, cancelable: true,
        clientX: canvas.getBoundingClientRect().left + 400,
        clientY: canvas.getBoundingClientRect().top + 200,
        dataTransfer: dataTransfer,
      });
      canvas.dispatchEvent(dropEvent);
    }, '.vue-flow__pane');

    const loopBlock = page.locator('.vue-flow__node-BlockBasic').filter({ hasText: 'Loop Data' });
    await expect(loopBlock).toBeVisible();

    // 3. Configure Loop Data (Numbers 1 to 2)
    await loopBlock.dblclick();
    // Wait for settings
    await expect(page.locator('#workflow-edit-block')).toBeVisible();
    
    // Select "Numbers"
    const loopThroughSelect = page.locator('#workflow-edit-block select').first();
    await loopThroughSelect.selectOption('numbers');

    // Fill From and To
    const numberInputs = page.locator('#workflow-edit-block input[type="number"]');
    await expect(numberInputs).toHaveCount(2);
    await numberInputs.nth(0).fill('1'); // From
    await numberInputs.nth(1).fill('2'); // To

    // Close sidebar
    const closeSidebarBtn = page.locator('#workflow-edit-block button').first();
    await closeSidebarBtn.click();
    
    // 4. Connect Trigger -> Loop Data
    const triggerNode = page.locator('.vue-flow__node-BlockBasic').filter({ hasText: 'Trigger' });
    const triggerSource = triggerNode.locator('.source');
    const loopTarget = loopBlock.locator('.target');
    await triggerSource.hover({ force: true });
    await page.mouse.down();
    await loopTarget.hover({ force: true });
    await page.mouse.up();
    
    // Verify edges
    await expect(page.locator('.vue-flow__edge')).toHaveCount(1);
    
    // 5. Save
    // Try multiple ways to save
    const saveBtn = page.getByRole('button', { name: 'Save' });
    if (await saveBtn.isVisible()) {
        await saveBtn.click();
    } else {
        // Try finding by icon class if it uses font icons
        const saveIconBtn = page.locator('button i.ri-save-line, button svg.ri-save-line').first(); 
        if (await saveIconBtn.isVisible()) {
             await saveIconBtn.locator('..').click();
        } else {
             // Fallback to keyboard
             await page.keyboard.press('Control+s');
        }
    }
    
    // Wait for "Workflow saved" toast
    // Toast class: .Vue-Toastification__toast--success
    try {
        await expect(page.locator('.Vue-Toastification__toast--success')).toBeVisible({ timeout: 5000 });
    } catch (e) {
        console.log('Save toast not found. Checking if saved anyway...');
    }
    
    await page.waitForTimeout(1000);

    // 9. Execute
    const runBtn = page.locator('button').filter({ has: page.locator('path[d^="M16.394 12"]') }).first();
    await expect(runBtn).toBeVisible();
    await runBtn.click({ force: true });
    console.log('Clicked Run');
    
    // Wait for execution to finish (button should eventually be play again, or check for stop icon temporarily)
    // If execution is fast, we might miss the stop icon.
    // But we can wait for the toast "Workflow started" or similar if it exists.
    
    await page.waitForTimeout(5000); 

    // 10. Verify Workflow Exists
    await page.goto(`chrome-extension://${extensionId}/newtab.html#/workflows`);
    
    // Find the workflow card
    const workflowCard = page.locator('.local-workflow').filter({ hasText: workflowName }).first();
    await expect(workflowCard).toBeVisible();
    
    const cardText = await workflowCard.innerText();
    console.log('Workflow Card Text:', cardText);
    
    // Verify logs
    const logsLink = page.locator('aside a[href="#"]');
    if (await logsLink.count() > 0) {
        await logsLink.click();
    } else {
        // Fallback if sidebar not found or logic changed (e.g. mobile view?)
        // Try to find by icon
        await page.locator('aside a').filter({ has: page.locator('svg') }).nth(5).click(); // Approximate
    }
    
    const logsModal = page.locator('.modal-ui__content-container').last();
    await expect(logsModal).toBeVisible({ timeout: 10000 });
    
    // Debug: print modal content
    const modalText = await logsModal.innerText();
    console.log('Modal Content:', modalText);
    
    // Reload logs if empty?
    if (!modalText.includes(workflowName)) {
        console.log('Workflow name not found, trying to reload logs...');
        // Maybe close and reopen?
        await page.keyboard.press('Escape');
        await page.waitForTimeout(1000);
        await logsLink.click();
        await expect(logsModal).toBeVisible();
        console.log('Modal Content 2:', await logsModal.innerText());
    }
    
    await logsModal.getByText(workflowName).first().click();
    
    // Wait for success status
    await expect(logsModal.getByText('Success')).toBeVisible({ timeout: 10000 });
    
    // Verify we have logs for blocks
    // "Loop Data"
    await expect(logsModal.getByText('Loop Data')).toBeVisible();
  });
});
