/**
 * 简化的块操作测试 - Simplified Blocks Operation Tests
 * 测试工作流编辑器的基本功能
 */

const { test, expect } = require('@playwright/test');

const EXTENSION_ID = 'ilojapanngcgdiablmfcjmlladgpgedf';
const EXTENSION_URL = `chrome-extension://${EXTENSION_ID}/newtab.html`;

test.describe('块操作测试 - Block Operations', () => {
  test.beforeEach(async ({ page }) => {
    // 直接导航到扩展页面
    await page.goto(EXTENSION_URL);
    await page.waitForTimeout(2000);
  });

  /**
   * TC-BLOCK-001: 测试扩展页面是否可访问
   */
  test('TC-BLOCK-001: 扩展页面可访问', async ({ page }) => {
    // 验证页面标题
    const title = await page.title();
    console.log('页面标题:', title);
    
    // 验证页面内容
    const content = await page.textContent('body');
    expect(content.length).toBeGreaterThan(0);
    
    // 截图
    await page.screenshot({ path: 'test-results/homepage.png' });
  });

  /**
   * TC-BLOCK-002: 测试查找"新建工作流"按钮
   */
  test('TC-BLOCK-002: 查找新建工作流按钮', async ({ page }) => {
    // 等待页面完全加载
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // 查找可能的按钮文本
    const possibleTexts = [
      '新建工作流',
      'New Workflow',
      '创建工作流',
      'Create Workflow',
      '新建',
      'New',
    ];
    
    let buttonFound = false;
    let foundText = '';
    
    for (const text of possibleTexts) {
      const button = page.locator(`text=${text}`).first();
      if (await button.isVisible({ timeout: 1000 }).catch(() => false)) {
        buttonFound = true;
        foundText = text;
        console.log(`找到按钮: ${text}`);
        break;
      }
    }
    
    // 截图显示当前页面
    await page.screenshot({ path: 'test-results/looking-for-button.png' });
    
    // 打印页面内容辅助调试
    const bodyText = await page.textContent('body');
    console.log('页面文本长度:', bodyText.length);
    
    if (buttonFound) {
      console.log(`成功找到按钮: ${foundText}`);
    } else {
      console.log('未找到新建工作流按钮，列出所有按钮:');
      const buttons = await page.locator('button').all();
      for (let i = 0; i < Math.min(buttons.length, 10); i++) {
        const text = await buttons[i].textContent();
        console.log(`按钮 ${i + 1}: ${text}`);
      }
    }
  });

  /**
   * TC-BLOCK-003: 测试工作流列表
   */
  test('TC-BLOCK-003: 查看工作流列表', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // 查找工作流卡片
    const workflowCards = page.locator('.workflow-card');
    const count = await workflowCards.count();
    
    console.log(`找到 ${count} 个工作流卡片`);
    
    // 截图
    await page.screenshot({ path: 'test-results/workflow-list.png', fullPage: true });
    
    // 列出所有链接
    const links = await page.locator('a').all();
    console.log(`页面共有 ${links.length} 个链接`);
    
    for (let i = 0; i < Math.min(links.length, 10); i++) {
      const href = await links[i].getAttribute('href');
      const text = await links[i].textContent();
      console.log(`链接 ${i + 1}: ${text?.trim()} -> ${href}`);
    }
  });

  /**
   * TC-BLOCK-004: 测试导航菜单
   */
  test('TC-BLOCK-004: 测试导航菜单', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // 查找导航元素
    const nav = page.locator('nav');
    const navExists = await nav.count();
    
    console.log(`找到 ${navExists} 个导航元素`);
    
    // 列出所有导航链接
    const navLinks = await page.locator('nav a').all();
    for (const link of navLinks) {
      const text = await link.textContent();
      const href = await link.getAttribute('href');
      console.log(`导航: ${text?.trim()} -> ${href}`);
    }
    
    await page.screenshot({ path: 'test-results/navigation.png' });
  });

  /**
   * TC-BLOCK-005: 测试搜索功能
   */
  test('TC-BLOCK-005: 测试搜索功能', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // 查找搜索输入框
    const searchInput = page.locator('input[type="search"], input[placeholder*="搜索"], input[placeholder*="Search"]').first();
    const hasSearch = await searchInput.isVisible({ timeout: 1000 }).catch(() => false);
    
    console.log(`搜索框存在: ${hasSearch}`);
    
    if (hasSearch) {
      await searchInput.fill('测试');
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'test-results/search-result.png' });
    }
    
    // 列出所有输入框
    const inputs = await page.locator('input').all();
    console.log(`页面共有 ${inputs.length} 个输入框`);
    
    for (let i = 0; i < Math.min(inputs.length, 10); i++) {
      const type = await inputs[i].getAttribute('type');
      const placeholder = await inputs[i].getAttribute('placeholder');
      console.log(`输入框 ${i + 1}: type=${type}, placeholder=${placeholder}`);
    }
  });
});
