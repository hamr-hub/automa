import { test, expect, chromium } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const extensionPath = path.join(__dirname, '../../build');

test.describe('Automa Extension E2E', () => {
  let browserContext;
  let extensionId;
  let page;

  test.beforeEach(async () => {
    // Launch browser with extension
    browserContext = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
      ],
    });

    // Wait for background worker to initialize
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
      // Fallback: try to deduce ID from pages if any opened (e.g. welcome page)
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

    // Enable console logging
    page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', (exception) =>
      console.log(`PAGE ERROR: "${exception}"`)
    );
  });

  test.afterEach(async () => {
    await browserContext.close();
  });

  test('Import and run Amazon workflow', async () => {
    const dashboardUrl = `chrome-extension://${extensionId}/newtab.html#/workflows`;
    console.log('Navigating to:', dashboardUrl);
    await page.goto(dashboardUrl);

    // Wait for the page to load
    await page.waitForSelector('text=New workflow', { timeout: 10000 });
    console.log('Dashboard loaded');

    // 1. Import Workflow
    // Use a more robust selector for the dropdown trigger
    // It is the button inside the popover trigger, which has an arrow icon.
    // Based on index.vue, it's a ui-button with a v-remixicon inside.

    // Attempt to find the button by its icon class if possible, or by position.
    // The "New workflow" button is followed by the popover trigger.

    // Try to click the button with the arrow icon
    const dropdownBtn = page
      .locator(
        'button:has(.ri-arrow-down-s-line), button:has(svg[data-name="riArrowDownSLine"])'
      )
      .first();
    // If that fails, try to find "New workflow" and get the next button
    // const dropdownBtn = page.getByText('New workflow', { exact: true }).locator('..').locator('button').last();

    await dropdownBtn.click();
    console.log('Dropdown clicked');

    // Now wait for "Import workflow" text
    const importBtn = page.getByText('Import workflow');
    await importBtn.waitFor();
    console.log('Import button found');

    // Setup file chooser
    const fileChooserPromise = page.waitForEvent('filechooser');
    await importBtn.click();
    const fileChooser = await fileChooserPromise;
    console.log('File chooser opened');

    // Upload file
    await fileChooser.setFiles(
      path.join(__dirname, '../fixtures/amazon-workflow.json')
    );
    console.log('File uploaded');

    // 2. Verify Import
    // Wait for the workflow to appear in the list.
    // The name is "Amazon Laptop Scraper"
    await expect(page.getByText('Amazon Laptop Scraper')).toBeVisible({
      timeout: 10000,
    });
    console.log('Workflow imported successfully');

    // 3. Run Workflow
    // Find the run button for this workflow.
    // The card for the workflow should contain a play button.
    const workflowCard = page.locator('.workflow-card, .ui-card', {
      hasText: 'Amazon Laptop Scraper',
    });

    // Log the card HTML to see structure if needed
    // const cardHtml = await workflowCard.innerHTML();
    // console.log('Card HTML:', cardHtml);

    const runBtn = workflowCard.locator('button .ri-play-line').first();
    // Or just find the play button inside the card
    // const runBtn = workflowCard.getByRole('button').filter({ has: page.locator('.ri-play-line') });

    await expect(runBtn).toBeVisible();

    // We need to handle the case where a new tab opens.
    const newPagePromise = browserContext.waitForEvent('page');
    await runBtn.click();
    console.log('Run button clicked');

    const amazonPage = await newPagePromise;
    await amazonPage.waitForLoadState();
    console.log('New page opened:', amazonPage.url());

    // Verify we are on Amazon
    await expect(amazonPage).toHaveURL(/amazon\.com/, { timeout: 20000 });
    console.log('Verified Amazon URL');

    // Wait for scraping to finish.
    await amazonPage.waitForTimeout(5000);

    // Verify logs in Automa Dashboard
    await page.goto(`${dashboardUrl}/logs`);
    await expect(page.getByText('Amazon Laptop Scraper').first()).toBeVisible();
    console.log('Verified logs');
  });
});
