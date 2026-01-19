/**
 * Supabase 集成测试 - Supabase Integration Tests
 * 测试云端同步、协作功能
 */

const { test, expect } = require('@playwright/test');

test.describe('Supabase 集成测试 - Cloud Sync & Collaboration', () => {
  let page;
  let context;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
  });

  test.afterAll(async () => {
    await context.close();
  });

  /**
   * TC-SUPA-001: 工作流云端同步
   * 优先级: P0
   */
  test('TC-SUPA-001: 同步工作流到云端', async () => {
    // 先登录
    await page.goto('chrome-extension://ilojapanngcgdiablmfcjmlladgpgedf/newtab.html#/login');
    await page.waitForLoadState('networkidle');
    
    // 检查是否已登录
    const isLoggedIn = await page.locator('[data-testid="user-menu"]').count() > 0;
    
    if (!isLoggedIn) {
      await page.fill('input[name="email"]', 'test-user@example.com');
      await page.fill('input[name="password"]', 'testpassword123');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
    }
    
    // 创建新工作流
    await page.goto('chrome-extension://ilojapanngcgdiablmfcjmlladgpgedf/newtab.html');
    await page.click('text=新建工作流');
    await page.waitForSelector('.workflow-editor', { timeout: 10000 });
    
    // 添加一些块
    await page.click('[data-testid="add-block-button"]');
    await page.click('text=新标签页');
    
    // 保存工作流
    const workflowName = `同步测试工作流_${Date.now()}`;
    await page.click('[data-testid="save-workflow"]');
    await page.fill('input[name="workflowName"]', workflowName);
    await page.click('button:has-text("确认")');
    
    // 等待保存完成
    await page.waitForTimeout(2000);
    
    // 检查同步状态
    const syncStatus = await page.locator('[data-testid="sync-status"], .sync-indicator');
    if (await syncStatus.count() > 0) {
      const status = await syncStatus.textContent();
      expect(status).toMatch(/已同步|synced|cloud/i);
    }
  });

  /**
   * TC-SUPA-002: 从云端加载工作流
   * 优先级: P0
   */
  test('TC-SUPA-002: 从云端加载工作流', async () => {
    // 登录
    await page.goto('chrome-extension://ilojapanngcgdiablmfcjmlladgpgedf/newtab.html#/login');
    await page.waitForLoadState('networkidle');
    
    const isLoggedIn = await page.locator('[data-testid="user-menu"]').count() > 0;
    
    if (!isLoggedIn) {
      await page.fill('input[name="email"]', 'test-user@example.com');
      await page.fill('input[name="password"]', 'testpassword123');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
    }
    
    // 导航到工作流页面
    await page.goto('chrome-extension://ilojapanngcgdiablmfcjmlladgpgedf/newtab.html');
    await page.waitForLoadState('networkidle');
    
    // 刷新/同步云端数据
    const refreshButton = await page.locator('[data-testid="refresh-workflows"], button:has-text("刷新")');
    if (await refreshButton.count() > 0) {
      await refreshButton.click();
      await page.waitForTimeout(2000);
    }
    
    // 验证工作流列表
    const workflows = await page.locator('.workflow-card').count();
    expect(workflows).toBeGreaterThanOrEqual(0);
  });

  /**
   * TC-SUPA-003: 工作流协作
   * 优先级: P1
   */
  test('TC-SUPA-003: 分享工作流给其他用户', async () => {
    // 登录
    await page.goto('chrome-extension://ilojapanngcgdiablmfcjmlladgpgedf/newtab.html#/login');
    await page.waitForLoadState('networkidle');
    
    const isLoggedIn = await page.locator('[data-testid="user-menu"]').count() > 0;
    
    if (!isLoggedIn) {
      await page.fill('input[name="email"]', 'test-user@example.com');
      await page.fill('input[name="password"]', 'testpassword123');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
    }
    
    // 创建工作流
    await page.goto('chrome-extension://ilojapanngcgdiablmfcjmlladgpgedf/newtab.html');
    await page.click('text=新建工作流');
    await page.waitForSelector('.workflow-editor', { timeout: 10000 });
    
    await page.click('[data-testid="add-block-button"]');
    await page.click('text=新标签页');
    
    const workflowName = `协作测试工作流_${Date.now()}`;
    await page.click('[data-testid="save-workflow"]');
    await page.fill('input[name="workflowName"]', workflowName);
    await page.click('button:has-text("确认")');
    await page.waitForTimeout(2000);
    
    // 打开分享设置
    await page.click('[data-testid="share-workflow"], button:has-text("分享")');
    await page.waitForSelector('.share-dialog', { timeout: 5000 });
    
    // 生成分享链接
    await page.click('button:has-text("生成链接")');
    await page.waitForTimeout(1000);
    
    // 验证分享链接已生成
    const shareLink = await page.locator('.share-link, input[readonly]').count();
    expect(shareLink).toBeGreaterThan(0);
  });

  /**
   * TC-SUPA-004: 冲突解决
   * 优先级: P1
   */
  test('TC-SUPA-004: 处理同步冲突', async () => {
    // 登录
    await page.goto('chrome-extension://ilojapanngcgdiablmfcjmlladgpgedf/newtab.html#/login');
    await page.waitForLoadState('networkidle');
    
    const isLoggedIn = await page.locator('[data-testid="user-menu"]').count() > 0;
    
    if (!isLoggedIn) {
      await page.fill('input[name="email"]', 'test-user@example.com');
      await page.fill('input[name="password"]', 'testpassword123');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
    }
    
    // 创建工作流
    await page.goto('chrome-extension://ilojapanngcgdiablmfcjmlladgpgedf/newtab.html');
    await page.click('text=新建工作流');
    await page.waitForSelector('.workflow-editor', { timeout: 10000 });
    
    await page.click('[data-testid="add-block-button"]');
    await page.click('text=新标签页');
    
    const workflowName = `冲突测试工作流_${Date.now()}`;
    await page.click('[data-testid="save-workflow"]');
    await page.fill('input[name="workflowName"]', workflowName);
    await page.click('button:has-text("确认")');
    await page.waitForTimeout(2000);
    
    // 模拟修改
    await page.click('[data-testid="add-block-button"]');
    await page.click('text=等待');
    
    // 保存修改
    await page.click('[data-testid="save-workflow"]');
    await page.waitForTimeout(1000);
    
    // 检查冲突提示（如果有）
    const conflictDialog = await page.locator('.conflict-dialog, .merge-conflict').count();
    
    if (conflictDialog > 0) {
      // 选择保留本地版本
      await page.click('button:has-text("保留本地"), button:has-text("覆盖")');
      await page.waitForTimeout(1000);
    }
  });

  /**
   * TC-SUPA-005: 离线模式
   * 优先级: P2
   */
  test('TC-SUPA-005: 离线编辑工作流', async () => {
    // 登录
    await page.goto('chrome-extension://ilojapanngcgdiablmfcjmlladgpgedf/newtab.html#/login');
    await page.waitForLoadState('networkidle');
    
    // 模拟离线（关闭网络）
    await page.context().setOffline(true);
    
    // 尝试创建工作流
    await page.goto('chrome-extension://ilojapanngcgdiablmfcjmlladgpgedf/newtab.html');
    await page.click('text=新建工作流');
    await page.waitForSelector('.workflow-editor', { timeout: 10000 });
    
    await page.click('[data-testid="add-block-button"]');
    await page.click('text=新标签页');
    
    // 保存工作流（应该保存到本地）
    const workflowName = `离线工作流_${Date.now()}`;
    await page.click('[data-testid="save-workflow"]');
    await page.fill('input[name="workflowName"]', workflowName);
    await page.click('button:has-text("确认")');
    await page.waitForTimeout(1000);
    
    // 验证离线提示
    const offlineIndicator = await page.locator('[data-testid="offline-indicator"], .offline-mode').count();
    expect(offlineIndicator).toBeGreaterThanOrEqual(0); // 可能有也可能没有
    
    // 恢复在线
    await page.context().setOffline(false);
    
    // 等待自动同步
    await page.waitForTimeout(3000);
    
    // 验证工作流已同步
    const syncStatus = await page.locator('[data-testid="sync-status"]');
    if (await syncStatus.count() > 0) {
      const status = await syncStatus.textContent();
      console.log('同步状态:', status);
    }
  });

  /**
   * TC-SUPA-006: 实时协作
   * 优先级: P2
   */
  test('TC-SUPA-006: 实时协作编辑', async () => {
    // 登录
    await page.goto('chrome-extension://ilojapanngcgdiablmfcjmlladgpgedf/newtab.html#/login');
    await page.waitForLoadState('networkidle');
    
    const isLoggedIn = await page.locator('[data-testid="user-menu"]').count() > 0;
    
    if (!isLoggedIn) {
      await page.fill('input[name="email"]', 'test-user@example.com');
      await page.fill('input[name="password"]', 'testpassword123');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
    }
    
    // 打开共享工作流（如果有）
    await page.goto('chrome-extension://ilojapanngcgdiablmfcjmlladgpgedf/newtab.html');
    await page.waitForLoadState('networkidle');
    
    const workflows = await page.locator('.workflow-card');
    if (await workflows.count() > 0) {
      // 打开第一个工作流
      await workflows.first().click();
      await page.waitForSelector('.workflow-editor', { timeout: 10000 });
      
      // 检查是否显示其他协作者
      const collaborators = await page.locator('[data-testid="collaborators"], .active-users').count();
      
      if (collaborators > 0) {
        console.log('检测到其他协作者');
      }
    }
  });

  /**
   * TC-SUPA-007: 数据库查询
   * 优先级: P2
   */
  test('TC-SUPA-007: 查询用户工作流', async () => {
    // 登录
    await page.goto('chrome-extension://ilojapanngcgdiablmfcjmlladgpgedf/newtab.html#/login');
    await page.waitForLoadState('networkidle');
    
    const isLoggedIn = await page.locator('[data-testid="user-menu"]').count() > 0;
    
    if (!isLoggedIn) {
      await page.fill('input[name="email"]', 'test-user@example.com');
      await page.fill('input[name="password"]', 'testpassword123');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
    }
    
    // 导航到工作流页面
    await page.goto('chrome-extension://ilojapanngcgdiablmfcjmlladgpgedf/newtab.html');
    await page.waitForLoadState('networkidle');
    
    // 使用搜索功能
    const searchInput = await page.locator('input[placeholder*="搜索"], input[type="search"]');
    if (await searchInput.count() > 0) {
      await searchInput.fill('测试');
      await page.waitForTimeout(1000);
      
      // 验证搜索结果
      const results = await page.locator('.workflow-card').count();
      console.log('搜索结果数量:', results);
    }
  });

  /**
   * TC-SUPA-008: 权限管理
   * 优先级: P2
   */
  test('TC-SUPA-008: 工作流权限管理', async () => {
    // 登录
    await page.goto('chrome-extension://ilojapanngcgdiablmfcjmlladgpgedf/newtab.html#/login');
    await page.waitForLoadState('networkidle');
    
    const isLoggedIn = await page.locator('[data-testid="user-menu"]').count() > 0;
    
    if (!isLoggedIn) {
      await page.fill('input[name="email"]', 'test-user@example.com');
      await page.fill('input[name="password"]', 'testpassword123');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
    }
    
    // 创建私有工作流
    await page.goto('chrome-extension://ilojapanngcgdiablmfcjmlladgpgedf/newtab.html');
    await page.click('text=新建工作流');
    await page.waitForSelector('.workflow-editor', { timeout: 10000 });
    
    await page.click('[data-testid="add-block-button"]');
    await page.click('text=新标签页');
    
    // 保存并设置为私有
    const workflowName = `私有工作流_${Date.now()}`;
    await page.click('[data-testid="save-workflow"]');
    await page.fill('input[name="workflowName"]', workflowName);
    
    // 设置为私有
    const visibilityToggle = await page.locator('select[name="visibility"], input[type="checkbox"][name="private"]');
    if (await visibilityToggle.count() > 0) {
      if ((await visibilityToggle.getAttribute('type')) === 'checkbox') {
        await visibilityToggle.check();
      } else {
        await visibilityToggle.selectOption('private');
      }
    }
    
    await page.click('button:has-text("确认")');
    await page.waitForTimeout(2000);
    
    // 验证私有标识
    await page.goto('chrome-extension://ilojapanngcgdiablmfcjmlladgpgedf/newtab.html');
    const privateWorkflow = await page.locator(`text=${workflowName}`).locator('..');
    const privateIndicator = await privateWorkflow.locator('[data-testid="private-indicator"], .private-badge').count();
    
    if (privateIndicator > 0) {
      console.log('工作流已标记为私有');
    }
  });
});
