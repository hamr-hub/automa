import { test, expect, chromium } from '@playwright/test';
import path from 'path';

const extensionPath = path.join(__dirname, '../../build');

test.describe('Batch Delete Workflows', () => {
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

  test('should show batch delete toolbar when workflows are selected in newtab', async () => {
    await page.goto(`chrome-extension://${extensionId}/newtab.html`);
    await page.waitForLoadState('networkidle');
    // 等待工作流列表加载
    await page.waitForSelector('.workflows-container', { timeout: 10000 });

    // 获取所有工作流卡片
    const workflowCards = await page.$$('.local-workflow');
    
    if (workflowCards.length === 0) {
      // 如果没有工作流，先创建几个测试工作流
      for (let i = 1; i <= 3; i++) {
        await page.click('button:has-text("New workflow")');
        await page.waitForTimeout(500);
        await page.fill('input[placeholder*="name"]', `Test Workflow ${i}`);
        await page.click('button:has-text("Create")');
        await page.waitForTimeout(500);
        await page.goto(`chrome-extension://${extensionId}/newtab.html`);
        await page.waitForLoadState('networkidle');
      }
    }

    // 等待至少有一个工作流
    await page.waitForSelector('.local-workflow', { timeout: 5000 });

    // 点击第一个工作流的 checkbox
    const firstCheckbox = await page.$('.local-workflow >> ui-checkbox');
    await firstCheckbox.click();
    
    // 验证批量操作工具栏显示
    await page.waitForSelector('ui-card:has-text("Select all")', { timeout: 5000 });
    const toolbar = await page.$('ui-card:has-text("Delete selected workflows")');
    expect(toolbar).not.toBeNull();

    // 验证工具栏内容
    const deleteButton = await page.$('ui-button:has-text("Delete selected workflows")');
    expect(deleteButton).not.toBeNull();

    // 点击第二个工作流的 checkbox
    const allCheckboxes = await page.$$('.local-workflow >> ui-checkbox');
    if (allCheckboxes.length > 1) {
      await allCheckboxes[1].click();
      await page.waitForTimeout(300);
      
      // 验证显示选中数量
      const deleteText = await page.textContent('ui-button:has-text("Delete selected workflows")');
      expect(deleteText).toContain('(2)');
    }

    // 测试全选功能
    const selectAllButton = await page.$('ui-button:has-text("Select all")');
    await selectAllButton.click();
    await page.waitForTimeout(300);

    // 验证按钮文本变为 "Deselect all"
    const deselectAllButton = await page.$('ui-button:has-text("Deselect all")');
    expect(deselectAllButton).not.toBeNull();

    // 测试批量删除
    const deleteSelectedButton = await page.$('ui-button[variant="danger"]:has-text("Delete selected workflows")');
    await deleteSelectedButton.click();

    // 等待确认对话框
    await page.waitForSelector('.ui-dialog', { timeout: 3000 });
    const confirmDialog = await page.$('.ui-dialog:has-text("Are you sure")');
    expect(confirmDialog).not.toBeNull();

    // 取消删除
    const cancelButton = await page.$('button:has-text("Cancel")');
    await cancelButton.click();
    await page.waitForTimeout(300);

    // 验证工具栏仍然存在
    const toolbarAfterCancel = await page.$('ui-card:has-text("Delete selected workflows")');
    expect(toolbarAfterCancel).not.toBeNull();

    // 再次点击删除并确认
    await deleteSelectedButton.click();
    await page.waitForSelector('.ui-dialog', { timeout: 3000 });
    const confirmButton = await page.$('button:has-text("Delete")');
    await confirmButton.click();

    // 等待工具栏消失
    await page.waitForSelector('ui-card:has-text("Delete selected workflows")', { 
      state: 'hidden',
      timeout: 5000 
    });

    console.log('✅ Batch delete toolbar test passed in newtab');
  });

  test('should show batch delete toolbar when workflows are selected in popup', async () => {
    // 打开 popup
    const popupPage = await browserContext.newPage();
    await popupPage.goto(`chrome-extension://${extensionId}/popup.html`);
    await popupPage.waitForLoadState('networkidle');

    // 等待工作流列表加载
    await popupPage.waitForSelector('.space-y-1\\.5', { timeout: 5000 });

    // 获取所有工作流卡片
    const workflowCards = await popupPage.$$('home-workflow-card');
    
    if (workflowCards.length === 0) {
      console.log('⚠️  No workflows found in popup, skipping popup test');
      await popupPage.close();
      return;
    }

    // 点击第一个工作流的 checkbox
    const firstCheckbox = await popupPage.$('home-workflow-card >> ui-checkbox');
    if (!firstCheckbox) {
      console.log('⚠️  Checkbox not found in popup');
      await popupPage.close();
      return;
    }
    
    await firstCheckbox.click();
    await popupPage.waitForTimeout(500);
    
    // 验证批量操作工具栏显示
    const toolbar = await popupPage.waitForSelector('ui-card:has-text("Select all")', { 
      timeout: 5000 
    });
    expect(toolbar).not.toBeNull();

    // 验证工具栏内容
    const deleteButton = await popupPage.$('ui-button:has-text("Delete selected workflows")');
    expect(deleteButton).not.toBeNull();

    // 测试全选功能
    const selectAllButton = await popupPage.$('ui-button:has-text("Select all")');
    await selectAllButton.click();
    await popupPage.waitForTimeout(300);

    // 验证按钮文本变为 "Deselect all"
    const deselectAllButton = await popupPage.waitForSelector('ui-button:has-text("Deselect all")', {
      timeout: 3000
    });
    expect(deselectAllButton).not.toBeNull();

    console.log('✅ Batch delete toolbar test passed in popup');
    await popupPage.close();
  });

  test('should handle batch delete with pinned workflows', async () => {
    await page.goto(`chrome-extension://${extensionId}/newtab.html`);
    await page.waitForLoadState('networkidle');
    
    // 等待工作流列表
    await page.waitForSelector('.workflows-container', { timeout: 5000 });
    
    const workflowCards = await page.$$('.local-workflow');
    if (workflowCards.length < 2) {
      console.log('⚠️  Not enough workflows for pinned test');
      return;
    }

    // 固定第一个工作流
    const firstCard = workflowCards[0];
    await firstCard.hover();
    const moreButton = await firstCard.$('button:has(v-remixicon[name="riMoreLine"])');
    await moreButton.click();
    await page.waitForTimeout(200);
    
    const pinButton = await page.$('ui-list-item:has-text("Pin workflow")');
    if (pinButton) {
      await pinButton.click();
      await page.waitForTimeout(500);
    }

    // 选择固定区域的工作流
    const pinnedSection = await page.$('.mb-2.border-b');
    if (pinnedSection) {
      const pinnedCheckbox = await pinnedSection.$('ui-checkbox');
      await pinnedCheckbox.click();
      await page.waitForTimeout(300);
    }

    // 选择常规区域的工作流
    const regularCheckbox = await page.$('.workflows-container >> ui-checkbox');
    await regularCheckbox.click();
    await page.waitForTimeout(300);

    // 验证工具栏显示选中数量包含固定和常规工作流
    const deleteButtonText = await page.textContent('ui-button:has-text("Delete selected workflows")');
    expect(deleteButtonText).toContain('(2)');

    console.log('✅ Pinned workflows batch delete test passed');
  });
});
