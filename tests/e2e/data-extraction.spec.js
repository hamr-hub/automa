/**
 * 数据提取测试 - Data Extraction Tests
 * TC-EXTRACT-001 至 TC-EXTRACT-003
 * 测试创建数据提取工作流、配置选择器、导出数据功能
 */

const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test.describe('数据提取测试 - Data Extraction', () => {
  let page;
  let context;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext({
      permissions: ['downloads'],
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
   * TC-EXTRACT-001: 创建提取工作流
   * 优先级: P0
   */
  test('TC-EXTRACT-001: 创建数据提取工作流', async () => {
    // 创建新工作流
    await page.click('text=新建工作流');
    await page.waitForSelector('.workflow-editor', { timeout: 10000 });
    
    // 添加新标签页块
    await page.click('[data-testid="add-block-button"]');
    await page.click('text=新标签页');
    await page.click('.vue-flow__node');
    await page.fill('input[name="url"]', 'https://example.com');
    await page.click('button:has-text("保存")');
    
    // 添加提取数据块
    await page.click('[data-testid="add-block-button"]');
    await page.click('text=提取数据');
    
    // 验证提取数据块已添加
    const extractBlock = await page.locator('.vue-flow__node[data-block-type="extract-data"]');
    expect(await extractBlock.count()).toBe(1);
    
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
    await page.fill('input[name="workflowName"]', '数据提取工作流');
    await page.click('button:has-text("确认")');
    await page.waitForTimeout(1000);
    
    // 验证工作流已保存
    await page.goto('chrome-extension://ilojapanngcgdiablmfcjmlladgpgedf/newtab.html');
    const workflowCard = await page.locator('text=数据提取工作流');
    expect(await workflowCard.count()).toBe(1);
  });

  /**
   * TC-EXTRACT-002: 配置选择器
   * 优先级: P0
   */
  test('TC-EXTRACT-002: 配置 CSS 选择器', async () => {
    // 创建新工作流
    await page.click('text=新建工作流');
    await page.waitForSelector('.workflow-editor', { timeout: 10000 });
    
    // 添加提取数据块
    await page.click('[data-testid="add-block-button"]');
    await page.click('text=提取数据');
    
    // 点击配置提取块
    await page.click('.vue-flow__node[data-block-type="extract-data"]');
    await page.waitForSelector('[data-testid="block-config-panel"]', { timeout: 5000 });
    
    // 配置提取规则
    await page.click('button:has-text("添加规则")');
    
    // 设置字段名
    await page.fill('input[name="fieldName"]', 'title');
    
    // 设置 CSS 选择器
    await page.fill('input[name="selector"]', 'h1.title');
    
    // 选择提取类型
    await page.selectOption('select[name="extractType"]', 'text');
    
    // 保存配置
    await page.click('button:has-text("保存")');
    await page.waitForTimeout(500);
    
    // 验证配置已保存
    await page.click('.vue-flow__node[data-block-type="extract-data"]');
    const fieldName = await page.inputValue('input[name="fieldName"]');
    expect(fieldName).toBe('title');
  });

  /**
   * TC-EXTRACT-003: 导出数据
   * 优先级: P1
   */
  test('TC-EXTRACT-003: 导出提取的数据', async () => {
    // 创建新工作流
    await page.click('text=新建工作流');
    await page.waitForSelector('.workflow-editor', { timeout: 10000 });
    
    // 添加新标签页块
    await page.click('[data-testid="add-block-button"]');
    await page.click('text=新标签页');
    await page.click('.vue-flow__node');
    await page.fill('input[name="url"]', 'https://example.com');
    await page.click('button:has-text("保存")');
    
    // 添加提取数据块
    await page.click('[data-testid="add-block-button"]');
    await page.click('text=提取数据');
    await page.click('.vue-flow__node:nth-child(2)');
    
    // 配置提取规则
    await page.click('button:has-text("添加规则")');
    await page.fill('input[name="fieldName"]', 'title');
    await page.fill('input[name="selector"]', 'h1');
    await page.click('button:has-text("保存")');
    
    // 连接块
    const sourceHandle = await page.locator('.vue-flow__node').first().locator('.vue-flow__handle-right');
    const targetHandle = await page.locator('.vue-flow__node').nth(1).locator('.vue-flow__handle-left');
    await sourceHandle.hover();
    await page.mouse.down();
    const targetBox = await targetHandle.boundingBox();
    await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2);
    await page.mouse.up();
    
    // 添加导出数据块
    await page.click('[data-testid="add-block-button"]');
    await page.click('text=导出数据');
    await page.click('.vue-flow__node:nth-child(3)');
    
    // 配置导出格式
    await page.selectOption('select[name="exportFormat"]', 'json');
    await page.fill('input[name="fileName"]', 'extracted-data');
    await page.click('button:has-text("保存")');
    
    // 连接导出块
    const extractHandle = await page.locator('.vue-flow__node').nth(1).locator('.vue-flow__handle-right');
    const exportHandle = await page.locator('.vue-flow__node').nth(2).locator('.vue-flow__handle-left');
    await extractHandle.hover();
    await page.mouse.down();
    const exportBox = await exportHandle.boundingBox();
    await page.mouse.move(exportBox.x + exportBox.width / 2, exportBox.y + exportBox.height / 2);
    await page.mouse.up();
    
    // 保存工作流
    await page.click('[data-testid="save-workflow"]');
    await page.fill('input[name="workflowName"]', '数据导出工作流');
    await page.click('button:has-text("确认")');
    
    // 设置下载监听
    const downloadPromise = page.waitForEvent('download');
    
    // 运行工作流
    await page.click('[data-testid="run-workflow"]');
    
    // 等待下载
    const download = await downloadPromise;
    
    // 验证下载文件
    expect(download.suggestedFilename()).toContain('extracted-data');
    
    // 保存文件到临时目录
    const downloadPath = path.join(__dirname, '../../test-results', download.suggestedFilename());
    await download.saveAs(downloadPath);
    
    // 验证文件存在
    expect(fs.existsSync(downloadPath)).toBe(true);
  });

  /**
   * TC-EXTRACT-004: 多字段提取
   * 优先级: P2
   */
  test('TC-EXTRACT-004: 提取多个字段', async () => {
    // 创建新工作流
    await page.click('text=新建工作流');
    await page.waitForSelector('.workflow-editor', { timeout: 10000 });
    
    // 添加提取数据块
    await page.click('[data-testid="add-block-button"]');
    await page.click('text=提取数据');
    await page.click('.vue-flow__node');
    
    // 添加第一个提取规则
    await page.click('button:has-text("添加规则")');
    await page.fill('input[name="fieldName"]', 'title');
    await page.fill('input[name="selector"]', 'h1.title');
    
    // 添加第二个提取规则
    await page.click('button:has-text("添加规则")');
    await page.locator('input[name="fieldName"]').nth(1).fill('description');
    await page.locator('input[name="selector"]').nth(1).fill('p.description');
    
    // 添加第三个提取规则
    await page.click('button:has-text("添加规则")');
    await page.locator('input[name="fieldName"]').nth(2).fill('price');
    await page.locator('input[name="selector"]').nth(2).fill('span.price');
    
    // 保存配置
    await page.click('button:has-text("保存")');
    await page.waitForTimeout(500);
    
    // 验证所有规则已添加
    await page.click('.vue-flow__node');
    const rules = await page.locator('input[name="fieldName"]').count();
    expect(rules).toBe(3);
  });

  /**
   * TC-EXTRACT-005: 循环提取列表数据
   * 优先级: P2
   */
  test('TC-EXTRACT-005: 提取列表数据', async () => {
    // 创建新工作流
    await page.click('text=新建工作流');
    await page.waitForSelector('.workflow-editor', { timeout: 10000 });
    
    // 添加新标签页块
    await page.click('[data-testid="add-block-button"]');
    await page.click('text=新标签页');
    await page.click('.vue-flow__node');
    await page.fill('input[name="url"]', 'https://example.com');
    await page.click('button:has-text("保存")');
    
    // 添加循环块
    await page.click('[data-testid="add-block-button"]');
    await page.click('text=循环数据');
    await page.click('.vue-flow__node:nth-child(2)');
    
    // 配置循环选择器（选择所有列表项）
    await page.fill('input[name="loopSelector"]', 'ul.items > li');
    await page.click('button:has-text("保存")');
    
    // 添加提取数据块
    await page.click('[data-testid="add-block-button"]');
    await page.click('text=提取数据');
    await page.click('.vue-flow__node:nth-child(3)');
    
    // 配置提取规则（从每个列表项中提取）
    await page.click('button:has-text("添加规则")');
    await page.fill('input[name="fieldName"]', 'itemName');
    await page.fill('input[name="selector"]', '.item-name');
    await page.click('button:has-text("保存")');
    
    // 连接所有块
    // 新标签页 -> 循环
    let sourceHandle = await page.locator('.vue-flow__node').first().locator('.vue-flow__handle-right');
    let targetHandle = await page.locator('.vue-flow__node').nth(1).locator('.vue-flow__handle-left');
    await sourceHandle.hover();
    await page.mouse.down();
    let targetBox = await targetHandle.boundingBox();
    await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2);
    await page.mouse.up();
    
    // 循环 -> 提取数据
    sourceHandle = await page.locator('.vue-flow__node').nth(1).locator('.vue-flow__handle-right');
    targetHandle = await page.locator('.vue-flow__node').nth(2).locator('.vue-flow__handle-left');
    await sourceHandle.hover();
    await page.mouse.down();
    targetBox = await targetHandle.boundingBox();
    await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2);
    await page.mouse.up();
    
    // 保存工作流
    await page.click('[data-testid="save-workflow"]');
    await page.fill('input[name="workflowName"]', '列表数据提取工作流');
    await page.click('button:has-text("确认")');
    
    // 验证工作流已保存
    await page.goto('chrome-extension://ilojapanngcgdiablmfcjmlladgpgedf/newtab.html');
    const workflowCard = await page.locator('text=列表数据提取工作流');
    expect(await workflowCard.count()).toBe(1);
  });

  /**
   * TC-EXTRACT-006: 导出为不同格式
   * 优先级: P2
   */
  test('TC-EXTRACT-006: 导出为 CSV 格式', async () => {
    // 创建新工作流
    await page.click('text=新建工作流');
    await page.waitForSelector('.workflow-editor', { timeout: 10000 });
    
    // 添加导出数据块
    await page.click('[data-testid="add-block-button"]');
    await page.click('text=导出数据');
    await page.click('.vue-flow__node');
    
    // 配置导出为 CSV
    await page.selectOption('select[name="exportFormat"]', 'csv');
    await page.fill('input[name="fileName"]', 'data-export');
    await page.click('button:has-text("保存")');
    
    // 验证配置
    await page.click('.vue-flow__node');
    const format = await page.locator('select[name="exportFormat"]').inputValue();
    expect(format).toBe('csv');
  });
});
