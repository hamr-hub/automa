/**
 * 导入导出测试 - Import/Export Tests
 * TC-IMPORT-001 至 TC-IMPORT-004
 * 测试工作流的导出、导入、图片导出、分享功能
 */

const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test.describe('导入导出测试 - Import/Export', () => {
  let page;
  let context;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext({
      permissions: ['downloads', 'clipboard-read', 'clipboard-write'],
    });
    page = await context.newPage();
  });

  test.afterAll(async () => {
    await context.close();
  });

  test.beforeEach(async () => {
    // 导航到工作流页面
    await page.goto('chrome-extension://ilojapanngcgdiablmfcjmlladgpgedf/newtab.html');
    await page.waitForLoadState('networkidle');
  });

  /**
   * TC-IMPORT-001: 导出工作流
   * 优先级: P0
   */
  test('TC-IMPORT-001: 导出工作流为 JSON', async () => {
    // 创建新工作流
    await page.click('text=新建工作流');
    await page.waitForSelector('.workflow-editor', { timeout: 10000 });
    
    // 添加一些块
    await page.click('[data-testid="add-block-button"]');
    await page.click('text=新标签页');
    
    await page.click('[data-testid="add-block-button"]');
    await page.click('text=等待');
    
    // 保存工作流
    await page.click('[data-testid="save-workflow"]');
    await page.fill('input[name="workflowName"]', '导出测试工作流');
    await page.click('button:has-text("确认")');
    await page.waitForTimeout(1000);
    
    // 设置下载监听
    const downloadPromise = page.waitForEvent('download');
    
    // 点击导出按钮
    await page.click('[data-testid="export-workflow"]');
    
    // 等待下载
    const download = await downloadPromise;
    
    // 验证下载文件
    expect(download.suggestedFilename()).toMatch(/\.json$/);
    
    // 保存文件到测试结果目录
    const downloadPath = path.join(__dirname, '../../test-results', download.suggestedFilename());
    await download.saveAs(downloadPath);
    
    // 验证文件存在
    expect(fs.existsSync(downloadPath)).toBe(true);
    
    // 验证 JSON 内容
    const content = JSON.parse(fs.readFileSync(downloadPath, 'utf-8'));
    expect(content.name).toBe('导出测试工作流');
    expect(content.drawflow).toBeDefined();
    expect(content.drawflow.nodes).toBeDefined();
  });

  /**
   * TC-IMPORT-002: 导入工作流
   * 优先级: P0
   */
  test('TC-IMPORT-002: 导入 JSON 工作流', async () => {
    // 准备测试文件
    const testWorkflowPath = path.join(__dirname, '../fixtures/amazon-workflow.json');
    
    // 点击导入按钮
    await page.click('[data-testid="import-workflow"]');
    
    // 选择文件
    await page.setInputFiles('input[type="file"]', testWorkflowPath);
    
    // 等待导入完成
    await page.waitForTimeout(2000);
    
    // 验证工作流已导入
    const workflowCards = await page.locator('.workflow-card').count();
    expect(workflowCards).toBeGreaterThan(0);
    
    // 打开导入的工作流
    await page.click('.workflow-card:last-child');
    await page.waitForSelector('.workflow-editor', { timeout: 10000 });
    
    // 验证工作流内容
    const blocks = await page.locator('.vue-flow__node').count();
    expect(blocks).toBeGreaterThan(0);
  });

  /**
   * TC-IMPORT-003: 导出为图片
   * 优先级: P1
   */
  test('TC-IMPORT-003: 导出工作流为图片', async () => {
    // 创建新工作流
    await page.click('text=新建工作流');
    await page.waitForSelector('.workflow-editor', { timeout: 10000 });
    
    // 添加一些块
    await page.click('[data-testid="add-block-button"]');
    await page.click('text=新标签页');
    
    await page.click('[data-testid="add-block-button"]');
    await page.click('text=等待');
    
    // 连接块
    const sourceHandle = await page.locator('.vue-flow__node').first().locator('.vue-flow__handle-right');
    const targetHandle = await page.locator('.vue-flow__node').nth(1).locator('.vue-flow__handle-left');
    await sourceHandle.hover();
    await page.mouse.down();
    const targetBox = await targetHandle.boundingBox();
    await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2);
    await page.mouse.up();
    
    // 保存工作流
    await page.click('[data-testid="save-workflow"]');
    await page.fill('input[name="workflowName"]', '图片导出工作流');
    await page.click('button:has-text("确认")');
    
    // 设置下载监听
    const downloadPromise = page.waitForEvent('download');
    
    // 点击导出为图片按钮
    await page.click('[data-testid="export-as-image"]');
    
    // 等待下载
    const download = await downloadPromise;
    
    // 验证下载文件
    expect(download.suggestedFilename()).toMatch(/\.(png|jpg|jpeg)$/);
    
    // 保存文件
    const downloadPath = path.join(__dirname, '../../test-results', download.suggestedFilename());
    await download.saveAs(downloadPath);
    
    // 验证文件存在且有大小
    expect(fs.existsSync(downloadPath)).toBe(true);
    const stats = fs.statSync(downloadPath);
    expect(stats.size).toBeGreaterThan(0);
  });

  /**
   * TC-IMPORT-004: 分享工作流
   * 优先级: P1
   */
  test('TC-IMPORT-004: 生成分享链接', async () => {
    // 创建新工作流
    await page.click('text=新建工作流');
    await page.waitForSelector('.workflow-editor', { timeout: 10000 });
    
    // 添加块
    await page.click('[data-testid="add-block-button"]');
    await page.click('text=新标签页');
    
    // 保存工作流
    await page.click('[data-testid="save-workflow"]');
    await page.fill('input[name="workflowName"]', '分享测试工作流');
    await page.click('button:has-text("确认")');
    
    // 点击分享按钮
    await page.click('[data-testid="share-workflow"]');
    
    // 等待分享对话框
    await page.waitForSelector('.share-dialog', { timeout: 5000 });
    
    // 点击生成链接
    await page.click('button:has-text("生成链接")');
    
    // 等待链接生成
    await page.waitForSelector('.share-link', { timeout: 5000 });
    
    // 获取分享链接
    const shareLink = await page.locator('.share-link').textContent();
    expect(shareLink).toBeTruthy();
    expect(shareLink).toContain('http');
    
    // 验证复制按钮
    await page.click('button:has-text("复制链接")');
    
    // 验证复制成功提示
    await page.waitForSelector('text=已复制', { timeout: 3000 });
  });

  /**
   * TC-IMPORT-005: 批量导出工作流
   * 优先级: P2
   */
  test('TC-IMPORT-005: 批量导出多个工作流', async () => {
    // 返回首页
    await page.goto('chrome-extension://ilojapanngcgdiablmfcjmlladgpgedf/newtab.html');
    await page.waitForLoadState('networkidle');
    
    // 选择多个工作流（假设已有工作流）
    const workflowCards = await page.locator('.workflow-card');
    const count = await workflowCards.count();
    
    if (count > 1) {
      // 选择前两个工作流
      await workflowCards.nth(0).locator('[data-testid="select-checkbox"]').click();
      await workflowCards.nth(1).locator('[data-testid="select-checkbox"]').click();
      
      // 设置下载监听
      const downloadPromise = page.waitForEvent('download');
      
      // 点击批量导出按钮
      await page.click('[data-testid="batch-export"]');
      
      // 等待下载
      const download = await downloadPromise;
      
      // 验证下载的是 zip 文件
      expect(download.suggestedFilename()).toMatch(/\.zip$/);
      
      // 保存文件
      const downloadPath = path.join(__dirname, '../../test-results', download.suggestedFilename());
      await download.saveAs(downloadPath);
      
      // 验证文件存在
      expect(fs.existsSync(downloadPath)).toBe(true);
    }
  });

  /**
   * TC-IMPORT-006: 导入验证
   * 优先级: P2
   */
  test('TC-IMPORT-006: 导入无效 JSON 文件处理', async () => {
    // 创建无效的 JSON 文件
    const invalidJsonPath = path.join(__dirname, '../../test-results/invalid-workflow.json');
    fs.writeFileSync(invalidJsonPath, '{"invalid": "json without required fields"}');
    
    // 尝试导入
    await page.click('[data-testid="import-workflow"]');
    await page.setInputFiles('input[type="file"]', invalidJsonPath);
    
    // 等待错误提示
    await page.waitForSelector('.error-message', { timeout: 5000 });
    
    // 验证错误消息
    const errorMessage = await page.locator('.error-message').textContent();
    expect(errorMessage).toBeTruthy();
    expect(errorMessage).toContain('无效' || 'invalid');
    
    // 清理测试文件
    fs.unlinkSync(invalidJsonPath);
  });

  /**
   * TC-IMPORT-007: 导出包含变量的工作流
   * 优先级: P2
   */
  test('TC-IMPORT-007: 导出包含变量的工作流', async () => {
    // 创建新工作流
    await page.click('text=新建工作流');
    await page.waitForSelector('.workflow-editor', { timeout: 10000 });
    
    // 添加新标签页块
    await page.click('[data-testid="add-block-button"]');
    await page.click('text=新标签页');
    await page.click('.vue-flow__node');
    
    // 使用变量配置 URL
    await page.fill('input[name="url"]', '{{baseUrl}}/page');
    await page.click('button:has-text("保存")');
    
    // 添加变量
    await page.click('[data-testid="manage-variables"]');
    await page.click('button:has-text("添加变量")');
    await page.fill('input[name="variableName"]', 'baseUrl');
    await page.fill('input[name="variableValue"]', 'https://example.com');
    await page.click('button:has-text("保存")');
    
    // 保存工作流
    await page.click('[data-testid="save-workflow"]');
    await page.fill('input[name="workflowName"]', '变量工作流');
    await page.click('button:has-text("确认")');
    
    // 导出
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="export-workflow"]');
    const download = await downloadPromise;
    
    // 保存并验证
    const downloadPath = path.join(__dirname, '../../test-results', download.suggestedFilename());
    await download.saveAs(downloadPath);
    
    // 验证 JSON 包含变量
    const content = JSON.parse(fs.readFileSync(downloadPath, 'utf-8'));
    expect(content.globalData).toBeDefined();
    expect(content.globalData.variables).toBeDefined();
    expect(content.globalData.variables.baseUrl).toBe('https://example.com');
  });
});
