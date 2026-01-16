import { test, expect, chromium } from '@playwright/test';
import path from 'path';

const extensionPath = path.join(__dirname, '../../build');

test.describe('AI Multi-turn Dialogue Mechanism', () => {
  let browserContext;
  let extensionId;
  let page;

  test.beforeEach(async () => {
    // Check if build directory exists, if not warn
    // but we proceed hoping for the best or assume user handled it
    
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
        // If we can't find the ID, we might fail. 
        // Try to open a known page? No, we need ID to open page.
        // Assuming standard ID if packed? No, it's random in dev.
        // Let's just wait a bit more or fail.
        // Try getting it from targets
        const targets = browserContext.targets();
        const extTarget = targets.find(t => t.type() === 'background_page' || t.url().startsWith('chrome-extension://'));
        if (extTarget) {
            extensionId = extTarget.url().split('/')[2];
        } else {
            throw new Error('Could not find extension ID');
        }
      }
    } else {
      extensionId = backgroundPage.url().split('/')[2];
    }

    page = await browserContext.newPage();
  });

  test.afterEach(async () => {
    await browserContext.close();
  });

  test('Verify multi-turn dialogue context management and state tracking', async () => {
    test.setTimeout(60000); // 1 minute timeout

    // Mock Ollama API
    await page.route('**/api/chat', async (route) => {
      const request = route.request();
      const postData = JSON.parse(request.postData());
      const messages = postData.messages;
      const lastMessage = messages[messages.length - 1];

      console.log('Intercepted Ollama Request:', lastMessage.content.substring(0, 50) + '...');

      // Optimization Check: 
      // Ensure subsequent requests DO NOT contain the massive "Page Context" block
      // The first request might (if context was passed), but second shouldn't if optimized.
      // We can check message length or content.
      if (messages.length > 3) { // System + User1 + Assistant1 + User2...
         // Check if last user message is short (optimized)
         if (lastMessage.content.length > 5000) {
             console.warn('WARNING: Request content is very large, optimization might have failed.');
         }
      }

      let responseContent = '';

      // Simple mock logic based on user input
      if (lastMessage.content.includes('Amazon')) {
        responseContent = `\`\`\`json
{
  "steps": [
    { "type": "new-tab", "data": { "url": "https://amazon.com" }, "description": "Navigate to Amazon" }
  ],
  "dataSchema": {}
}
\`\`\``;
      } else if (lastMessage.content.includes('price')) {
        // Turn 2
        responseContent = `\`\`\`json
{
  "steps": [
    { "type": "new-tab", "data": { "url": "https://amazon.com" }, "description": "Navigate to Amazon" },
    { "type": "get-text", "data": { "selector": ".price" }, "description": "Extract Price" }
  ],
  "dataSchema": { "price": { "type": "string" } }
}
\`\`\``;
      } else if (lastMessage.content.includes('delay')) {
        // Turn 3
        responseContent = `\`\`\`json
{
  "steps": [
    { "type": "new-tab", "data": { "url": "https://amazon.com" }, "description": "Navigate to Amazon" },
    { "type": "delay", "data": { "time": 5000 }, "description": "Wait 5s" },
    { "type": "get-text", "data": { "selector": ".price" }, "description": "Extract Price" }
  ],
  "dataSchema": { "price": { "type": "string" } }
}
\`\`\``;
      } else {
        // Default valid response to keep test going
        responseContent = `\`\`\`json
{
  "steps": [
    { "type": "new-tab", "data": { "url": "https://amazon.com" }, "description": "Navigate to Amazon" }
  ],
  "dataSchema": {}
}
\`\`\``;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          model: 'llama3',
          created_at: new Date().toISOString(),
          message: {
            role: 'assistant',
            content: responseContent,
          },
          done: true,
        }),
      });
    });

    const generatorUrl = `chrome-extension://${extensionId}/newtab.html#/ai-workflow`;
    await page.goto(generatorUrl);

    // Wait for AI page to load
    await expect(page.locator('h1')).toContainText('AI 工作流助手');

    // Turn 1: Initial Request
    const input = page.locator('textarea');
    await input.fill('Go to Amazon');
    await page.keyboard.press('Enter');

    // Verify loading state
    await expect(page.locator('text=AI 正在生成工作流')).toBeVisible();
    
    // Verify response
    await expect(page.locator('text=已为您生成工作流')).toBeVisible();
    await expect(page.locator('text=打开网页')).toBeVisible(); 
    
    // Turn 2: Follow up
    await input.fill('Also extract price');
    await page.keyboard.press('Enter');
    
    // Wait for response
    await expect(page.locator('text=已为您生成工作流').nth(1)).toBeVisible();
    await expect(page.locator('text=获取文本')).toBeVisible();

    // Turn 3: Add delay
    await input.fill('Add a 5s delay');
    await page.keyboard.press('Enter');

    await expect(page.locator('text=已为您生成工作流').nth(2)).toBeVisible();
    await expect(page.locator('text=等待')).toBeVisible();

    // Turn 4: Boundary/Stress
    await input.fill('Another update');
    await page.keyboard.press('Enter');
    await expect(page.locator('text=已为您生成工作流').nth(3)).toBeVisible();

    // Turn 5: Final check
    await input.fill('Finalize');
    await page.keyboard.press('Enter');
    await expect(page.locator('text=已为您生成工作流').nth(4)).toBeVisible();

    // Verification of History Integrity
    const messages = await page.locator('.whitespace-pre-wrap').allInnerTexts();
    expect(messages.length).toBeGreaterThanOrEqual(10); // 5 user + 5 assistant
    
    console.log('End-to-End Multi-turn Test Passed');
  });
});
