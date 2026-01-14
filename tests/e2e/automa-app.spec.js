const { test, expect } = require('@playwright/test');

test.describe('Automa App E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Wait for the app to be ready
    await page.goto('http://localhost:3001/newtab.html', {
      waitUntil: 'networkidle',
    });
    
    // Ensure the main app container is visible
    await expect(page.locator('#app')).toBeVisible();
  });

  test('Dashboard loads correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/Automa/);
    
    // Check for main navigation elements using specific attributes or classes
    await expect(page.locator('a[href="#/workflows"]')).toBeVisible();
    await expect(page.locator('a[href="#/ai-workflow-generator"]')).toBeVisible();
  });

  test('Navigate to AI Workflow Generator', async ({ page }) => {
    // Click the AI Generator tab
    await page.click('a[href="#/ai-workflow-generator"]');
    
    // Verify URL change
    await expect(page).toHaveURL(/.*#\/ai-workflow-generator/);
    
    // Verify AI specific elements
    await expect(page.locator('h1', { hasText: 'AI 工作流助手' })).toBeVisible();
    
    // Verify input area exists
    const inputArea = page.locator('textarea');
    await expect(inputArea).toBeVisible({ timeout: 10000 });
    
    // Verify send button exists
    // The button has a send icon
    await expect(page.locator('button:has(svg.v-remixicon)')).toBeVisible();
  });

  test('AI Workflow Generator Input Interaction', async ({ page }) => {
    await page.goto('http://localhost:3001/newtab.html#/ai-workflow-generator');
    
    const input = page.locator('textarea');
    await expect(input).toBeVisible({ timeout: 10000 });
    
    await input.fill('Create a scraping workflow for Amazon');
    
    // Check if the input value is set
    await expect(input).toHaveValue('Create a scraping workflow for Amazon');
    
    // Check for send button inside the input area container
    // Based on component structure: .border-t button
    const sendBtn = page.locator('.border-t button'); 
    await expect(sendBtn).toBeVisible();
  });

  test('Settings Page Navigation', async ({ page }) => {
    await page.click('a[href="#/settings"]');
    await expect(page).toHaveURL(/.*#\/settings/);
    // Check for a settings-specific element, e.g., a header or specific setting option
    // Assuming "General" or similar text exists
    await expect(page.locator('main')).toBeVisible(); 
  });
});
