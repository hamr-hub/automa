/**
 * 工作流执行测试 - Workflow Execution Tests
 * TC-EXEC-001 至 TC-EXEC-004
 * 测试工作流的运行、日志查看、停止执行、执行历史功能
 */

const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('工作流执行测试 - Workflow Execution', () => {
  let page;
  let context;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
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
   * TC-EXEC-001: 运行工作流
   * 优先级: P0
   */
  test('TC-EXEC-001: 运行简单工作流', async () => {
    // 创建新工作流
    await page.click('text=新建工作流');
    await page.waitForSelector('.workflow-editor', { timeout: 10000 });
    
    // 添加一个简单的等待块
    await page.click('[data-testid="add-block-button"]');
    await page.click('text=等待');
    
    // 配置等待时间为 1 秒
    await page.click('.vue-flow__node');
    await page.waitForSelector('[data-testid="block-config-panel"]');
    await page.fill('input[name="duration"]', '1000');
    await page.click('button:has-text("保存")');
    
    // 保存工作流
    await page.click('[data-testid="save-workflow"]');
    await page.fill('input[name="workflowName"]', '测试执行工作流');
    await page.click('button:has-text("确认")');
    
    // 运行工作流
    await page.click('[data-testid="run-workflow"]');
    
    // 等待执行开始
    await page.waitForSelector('.workflow-status.running', { timeout: 5000 });
    
    // 验证执行状态
    const status = await page.locator('.workflow-status').textContent();
    expect(status).toContain('运行中');
    
    // 等待执行完成
    await page.waitForSelector('.workflow-status.completed', { timeout: 10000 });
    
    // 验证执行成功
    const finalStatus = await page.locator('.workflow-status').textContent();
    expect(finalStatus).toContain('已完成');
  });

  /**
   * TC-EXEC-002: 查看执行日志
   * 优先级: P0
   */
  test('TC-EXEC-002: 查看执行日志', async () => {
    // 导入测试工作流
    const workflowPath = path.join(__dirname, '../fixtures/amazon-workflow.json');
    await page.click('[data-testid="import-workflow"]');
    await page.setInputFiles('input[type="file"]', workflowPath);
    await page.waitForTimeout(1000);
    
    // 打开工作流编辑器
    await page.click('.workflow-card', { timeout: 5000 });
    await page.waitForSelector('.workflow-editor', { timeout: 10000 });
    
    // 运行工作流
    await page.click('[data-testid="run-workflow"]');
    await page.waitForTimeout(2000);
    
    // 打开日志面板
    await page.click('[data-testid="toggle-logs"]');
    
    // 等待日志面板出现
    await page.waitForSelector('.execution-logs', { timeout: 5000 });
    
    // 验证日志内容
    const logEntries = await page.locator('.log-entry').count();
    expect(logEntries).toBeGreaterThan(0);
    
    // 验证日志包含时间戳
    const firstLogTime = await page.locator('.log-entry').first().locator('.log-time').textContent();
    expect(firstLogTime).toBeTruthy();
    
    // 验证日志包含消息
    const firstLogMessage = await page.locator('.log-entry').first().locator('.log-message').textContent();
    expect(firstLogMessage).toBeTruthy();
  });

  /**
   * TC-EXEC-003: 停止执行
   * 优先级: P1
   */
  test('TC-EXEC-003: 停止工作流执行', async () => {
    // 创建包含长时间等待的工作流
    await page.click('text=新建工作流');
    await page.waitForSelector('.workflow-editor', { timeout: 10000 });
    
    // 添加等待块，设置长时间等待
    await page.click('[data-testid="add-block-button"]');
    await page.click('text=等待');
    await page.click('.vue-flow__node');
    await page.fill('input[name="duration"]', '30000'); // 30秒
    await page.click('button:has-text("保存")');
    
    // 保存工作流
    await page.click('[data-testid="save-workflow"]');
    await page.fill('input[name="workflowName"]', '长时间执行工作流');
    await page.click('button:has-text("确认")');
    
    // 运行工作流
    await page.click('[data-testid="run-workflow"]');
    
    // 等待执行开始
    await page.waitForSelector('.workflow-status.running', { timeout: 5000 });
    
    // 点击停止按钮
    await page.click('[data-testid="stop-workflow"]');
    
    // 等待停止状态
    await page.waitForSelector('.workflow-status.stopped', { timeout: 5000 });
    
    // 验证执行已停止
    const status = await page.locator('.workflow-status').textContent();
    expect(status).toContain('已停止');
  });

  /**
   * TC-EXEC-004: 查看执行历史
   * 优先级: P1
   */
  test('TC-EXEC-004: 查看执行历史', async () => {
    // 导航到日志页面
    await page.click('a[href*="/logs"]');
    await page.waitForSelector('.logs-page', { timeout: 5000 });
    
    // 验证执行历史列表
    const historyEntries = await page.locator('.history-entry').count();
    expect(historyEntries).toBeGreaterThanOrEqual(0);
    
    // 如果有历史记录，验证记录详情
    if (historyEntries > 0) {
      // 点击第一条记录
      await page.click('.history-entry');
      
      // 验证详情面板
      await page.waitForSelector('.execution-details', { timeout: 5000 });
      
      // 验证显示执行时间
      const executionTime = await page.locator('.execution-time').textContent();
      expect(executionTime).toBeTruthy();
      
      // 验证显示执行状态
      const executionStatus = await page.locator('.execution-status').textContent();
      expect(executionStatus).toBeTruthy();
      
      // 验证显示执行日志
      const logs = await page.locator('.execution-logs .log-entry').count();
      expect(logs).toBeGreaterThan(0);
    }
  });

  /**
   * TC-EXEC-005: 带参数运行工作流
   * 优先级: P2
   */
  test('TC-EXEC-005: 带参数运行工作流', async () => {
    // 创建新工作流
    await page.click('text=新建工作流');
    await page.waitForSelector('.workflow-editor', { timeout: 10000 });
    
    // 添加新标签页块
    await page.click('[data-testid="add-block-button"]');
    await page.click('text=新标签页');
    
    // 配置 URL 参数
    await page.click('.vue-flow__node');
    await page.fill('input[name="url"]', '{{targetUrl}}');
    await page.click('button:has-text("保存")');
    
    // 保存工作流
    await page.click('[data-testid="save-workflow"]');
    await page.fill('input[name="workflowName"]', '参数化工作流');
    await page.click('button:has-text("确认")');
    
    // 运行工作流并提供参数
    await page.click('[data-testid="run-workflow-with-params"]');
    await page.waitForSelector('.params-dialog', { timeout: 5000 });
    
    // 填写参数
    await page.fill('input[name="targetUrl"]', 'https://example.com');
    await page.click('button:has-text("运行")');
    
    // 验证执行开始
    await page.waitForSelector('.workflow-status.running', { timeout: 5000 });
  });

  /**
   * TC-EXEC-006: 执行失败处理
   * 优先级: P2
   */
  test('TC-EXEC-006: 执行失败处理', async () => {
    // 创建会失败的工作流（无效的选择器）
    await page.click('text=新建工作流');
    await page.waitForSelector('.workflow-editor', { timeout: 10000 });
    
    // 添加新标签页块
    await page.click('[data-testid="add-block-button"]');
    await page.click('text=新标签页');
    await page.click('.vue-flow__node');
    await page.fill('input[name="url"]', 'https://example.com');
    await page.click('button:has-text("保存")');
    
    // 添加点击元素块（使用无效选择器）
    await page.click('[data-testid="add-block-button"]');
    await page.click('text=点击元素');
    await page.click('.vue-flow__node:nth-child(2)');
    await page.fill('input[name="selector"]', '#nonexistent-element-12345');
    await page.click('button:has-text("保存")');
    
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
    await page.fill('input[name="workflowName"]', '失败测试工作流');
    await page.click('button:has-text("确认")');
    
    // 运行工作流
    await page.click('[data-testid="run-workflow"]');
    
    // 等待执行失败
    await page.waitForSelector('.workflow-status.failed', { timeout: 30000 });
    
    // 验证错误状态
    const status = await page.locator('.workflow-status').textContent();
    expect(status).toContain('失败');
    
    // 打开日志查看错误信息
    await page.click('[data-testid="toggle-logs"]');
    await page.waitForSelector('.execution-logs', { timeout: 5000 });
    
    // 验证错误日志存在
    const errorLogs = await page.locator('.log-entry.error').count();
    expect(errorLogs).toBeGreaterThan(0);
  });
});
