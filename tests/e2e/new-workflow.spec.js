
import { test, expect, chromium } from '@playwright/test';
import path from 'path';

const extensionPath = path.join(__dirname, '../../build');

test.describe('Automa Extension New Workflow', () => {
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
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    if (!backgroundPage) {
        const pages = browserContext.pages();
        const extensionPage = pages.find(p => p.url().startsWith('chrome-extension://'));
        if (extensionPage) {
            extensionId = extensionPage.url().split('/')[2];
        } else {
             throw new Error('Could not find extension ID');
        }
    } else {
        extensionId = backgroundPage.url().split('/')[2];
        backgroundPage.on('console', msg => console.log('BG LOG:', msg.text()));
        backgroundPage.on('pageerror', exception => console.log(`BG ERROR: "${exception}"`));
        
        // Initialize storage to skip update/welcome modals
        await backgroundPage.evaluate(() => {
            return new Promise((resolve) => {
                const version = chrome.runtime.getManifest().version;
                chrome.storage.local.set({
                    isFirstTime: false,
                    version: version
                }, resolve);
            });
        });
        console.log('Storage initialized via background page');
    }

    page = await browserContext.newPage();
    await page.setViewportSize({ width: 1280, height: 800 });
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', exception => console.log(`PAGE ERROR: "${exception}"`));
    page.on('crash', () => console.log('PAGE CRASHED'));
  });

  test.afterEach(async () => {
    // Keep browser open if test failed for debugging (optional, usually handled by Playwright config)
    if (browserContext) await browserContext.close();
  });

  test('Create new workflow and verify editor loads', async () => {
    // Ensure extension is ready
    await page.waitForTimeout(2000);

    const popupUrl = `chrome-extension://${extensionId}/popup.html`;
    console.log('Navigating to:', popupUrl);
    await page.goto(popupUrl, { waitUntil: 'domcontentloaded' });
    console.log('Popup navigated');
    
    // Check if popup loads
    // Popup usually has a list of workflows or a "Record" button
    // Based on src/popup/home/HomeStartRecording.vue, there might be a record button
    // Let's just wait for body to be visible
    await page.waitForSelector('body', { timeout: 10000 });
    console.log('Popup body loaded');

    const dashboardUrl = `chrome-extension://${extensionId}/newtab.html#/workflows`;
    console.log('Navigating to:', dashboardUrl);
    
    try {
      await page.goto(dashboardUrl, { waitUntil: 'domcontentloaded' });
    } catch (e) {
      console.log('Navigation failed:', e);
    }
    
    console.log('Page navigated, waiting for selector...');
    
    // Debug: dump page content if possible
    /*
    try {
        await page.waitForTimeout(2000);
        const content = await page.content();
        console.log('Page content length:', content.length);
        // console.log('Page content:', content); // Uncomment if needed
    } catch (e) {
        console.log('Failed to get content:', e);
    }
    */

    // Wait for the page to load with increased timeout
    await page.waitForSelector('.container', { timeout: 20000, state: 'visible' });
    console.log('Container loaded');
    
    // Check for button
    const btn = page.locator('button').filter({ hasText: /New workflow|workflow.new/i });
    if (await btn.count() > 0) {
        console.log('Button found');
        
        // Try force click
        await btn.first().click();
    } else {
        console.log('Button NOT found');
    }
    console.log('Clicked New workflow');

    // Wait for modal
    const nameInput = page.locator('input[placeholder="Name"]');
    await expect(nameInput).toBeVisible();
    await nameInput.fill('Test Workflow');

    // Click Create
    await page.getByRole('button', { name: 'Add', exact: true }).click().catch(() => {
        // Fallback if button name is different, try looking for the primary button in modal
        return page.locator('.ui-modal button.bg-accent').click();
    });
    console.log('Clicked Create');

    // Wait for navigation to editor
    // The URL should contain /workflows/ and not be the dashboard
    await expect(page).toHaveURL(/\/workflows\/[\w-]+/);
    console.log('Navigated to editor');

    // Check if editor is visible
    // Look for the vue-flow container or the trigger block
    await expect(page.locator('.vue-flow')).toBeVisible({ timeout: 10000 });
    console.log('VueFlow container visible');

    // Check for trigger block
    await expect(page.locator('.vue-flow__node-BlockBasic').filter({ hasText: 'Trigger' })).toBeVisible();
    console.log('Trigger block visible');
  });
});
