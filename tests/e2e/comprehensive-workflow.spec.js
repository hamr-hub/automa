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

    // 3. Add Delay Block
    await sidebarSearch.fill('Delay');
    const delayBlockItem = page.locator('.bg-input').filter({ hasText: 'Delay' }).first();
    // Drag Delay
    await delayBlockItem.evaluate((element, canvasSelector) => {
      const canvas = document.querySelector(canvasSelector);
      const dataTransfer = new DataTransfer();
      const dragStartEvent = new DragEvent('dragstart', {
        bubbles: true, cancelable: true, dataTransfer: dataTransfer,
      });
      element.dispatchEvent(dragStartEvent);
      const dropEvent = new DragEvent('drop', {
        bubbles: true, cancelable: true,
        clientX: canvas.getBoundingClientRect().left + 600,
        clientY: canvas.getBoundingClientRect().top + 200,
        dataTransfer: dataTransfer,
      });
      canvas.dispatchEvent(dropEvent);
    }, '.vue-flow__pane');
    const delayBlock = page.locator('.vue-flow__node-BlockBasic').filter({ hasText: 'Delay' });
    await expect(delayBlock).toBeVisible();

    // 4. Connect Trigger -> Loop Data
    const triggerNode = page.locator('.vue-flow__node-BlockBasic').filter({ hasText: 'Trigger' });
    const triggerSource = triggerNode.locator('.source');
    const loopTarget = loopBlock.locator('.target');
    await triggerSource.hover({ force: true });
    await page.mouse.down();
    await loopTarget.hover({ force: true });
    await page.mouse.up();

    // 5. Connect Loop Data -> Delay
    const loopSource = loopBlock.locator('.source');
    const delayTarget = delayBlock.locator('.target');
    await loopSource.hover({ force: true });
    await page.mouse.down();
    await delayTarget.hover({ force: true });
    await page.mouse.up();
    
    // Verify edges
    await expect(page.locator('.vue-flow__edge')).toHaveCount(2);

    // 6. Configure Loop Data (Numbers 1 to 2)
    await loopBlock.dblclick();
    // Wait for settings
    await expect(page.locator('#workflow-edit-block')).toBeVisible();
    
    // Select "Numbers"
    // The select is the first ui-select in the edit block, or check label
    // Based on EditLoopData.vue, it has a label 'workflow.blocks.loop-data.loopThrough.placeholder'
    // But we might just use the order or class.
    // The select is likely the third input control (Description, LoopID, Select LoopThrough)
    
    // Let's find the select by its options or label if possible.
    // Since translation keys are used, text depends on locale (en).
    // "Loop through"
    
    // Assuming 'Numbers' is one of the options.
    const loopThroughSelect = page.locator('#workflow-edit-block select').first();
    await loopThroughSelect.selectOption('numbers');

    // Fill From and To
    // Inputs with type number
    const numberInputs = page.locator('#workflow-edit-block input[type="number"]');
    await expect(numberInputs).toHaveCount(2);
    await numberInputs.nth(0).fill('1'); // From
    await numberInputs.nth(1).fill('2'); // To

    // Close sidebar
    const closeSidebarBtn = page.locator('#workflow-edit-block button').first();
    await closeSidebarBtn.click();

    // 7. Configure Delay (Optional, default is fine)
    // Just verify it's there
    await delayBlock.dblclick();
    await expect(page.locator('#workflow-edit-block')).toBeVisible();
    await closeSidebarBtn.click();

    // 8. Save
    await page.keyboard.press('Control+s');
    await page.waitForTimeout(1000);

    // 9. Execute
    const runBtn = page.locator('button').filter({ has: page.locator('path[d^="M16.394 12"]') }).first();
    await expect(runBtn).toBeVisible();
    await runBtn.click({ force: true });
    console.log('Clicked Run');
    
    // 10. Verify Logs
    await page.waitForTimeout(5000); // Wait for execution
    
    // Navigate to Logs using Sidebar
    // The Logs tab in sidebar has href="#" to prevent navigation and trigger modal
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
    // "Loop Data", "Delay"
    await expect(logsModal.getByText('Loop Data')).toBeVisible();
    await expect(logsModal.getByText('Delay')).toBeVisible();
  });
});
