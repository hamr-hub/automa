/**
 * 块操作测试 - Blocks Operation Tests
 * TC-BLOCK-001 至 TC-BLOCK-005
 * 测试工作流块的添加、配置、连接、删除、复制功能
 */

const { test, expect } = require('@playwright/test');

test.describe('块操作测试 - Block Operations', () => {
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
    // 导航到工作流编辑器
    await page.goto('chrome-extension://ilojapanngcgdiablmfcjmlladgpgedf/newtab.html');
    await page.waitForLoadState('networkidle');
    
    // 创建新工作流
    await page.click('text=新建工作流');
    await page.waitForSelector('.workflow-editor', { timeout: 10000 });
  });

  /**
   * TC-BLOCK-001: 添加新块
   * 优先级: P0
   */
  test('TC-BLOCK-001: 添加新块到工作流', async () => {
    // 点击添加块按钮
    await page.click('[data-testid="add-block-button"]');
    
    // 等待块选择器出现
    await page.waitForSelector('.block-selector', { timeout: 5000 });
    
    // 选择 "新标签页" 块类型
    await page.click('text=新标签页');
    
    // 验证块已添加到画布
    const blockCount = await page.locator('.vue-flow__node').count();
    expect(blockCount).toBeGreaterThan(0);
    
    // 验证块类型正确
    const blockType = await page.locator('.vue-flow__node').first().getAttribute('data-block-type');
    expect(blockType).toBe('new-tab');
  });

  /**
   * TC-BLOCK-002: 配置块属性
   * 优先级: P0
   */
  test('TC-BLOCK-002: 配置块属性', async () => {
    // 先添加一个块
    await page.click('[data-testid="add-block-button"]');
    await page.click('text=新标签页');
    
    // 点击块打开配置面板
    await page.click('.vue-flow__node');
    
    // 等待配置面板出现
    await page.waitForSelector('[data-testid="block-config-panel"]', { timeout: 5000 });
    
    // 修改块名称
    await page.fill('input[name="blockName"]', '测试块');
    
    // 修改块描述
    await page.fill('textarea[name="blockDescription"]', '这是一个测试块');
    
    // 保存配置
    await page.click('button:has-text("保存")');
    
    // 等待保存完成
    await page.waitForTimeout(1000);
    
    // 验证配置已保存
    await page.click('.vue-flow__node');
    const blockName = await page.inputValue('input[name="blockName"]');
    expect(blockName).toBe('测试块');
  });

  /**
   * TC-BLOCK-003: 连接块
   * 优先级: P0
   */
  test('TC-BLOCK-003: 连接块', async () => {
    // 添加第一个块
    await page.click('[data-testid="add-block-button"]');
    await page.click('text=新标签页');
    await page.waitForTimeout(500);
    
    // 添加第二个块
    await page.click('[data-testid="add-block-button"]');
    await page.click('text=等待');
    await page.waitForTimeout(500);
    
    // 获取第一个块的输出端点
    const sourceHandle = await page.locator('.vue-flow__node').first().locator('.vue-flow__handle-right');
    
    // 获取第二个块的输入端点
    const targetHandle = await page.locator('.vue-flow__node').nth(1).locator('.vue-flow__handle-left');
    
    // 从第一个块拖拽到第二个块创建连接
    await sourceHandle.hover();
    await page.mouse.down();
    
    const targetBox = await targetHandle.boundingBox();
    await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2);
    await page.mouse.up();
    
    // 验证连接已创建
    const edgeCount = await page.locator('.vue-flow__edge').count();
    expect(edgeCount).toBeGreaterThan(0);
  });

  /**
   * TC-BLOCK-004: 删除块
   * 优先级: P1
   */
  test('TC-BLOCK-004: 删除块', async () => {
    // 添加一个块
    await page.click('[data-testid="add-block-button"]');
    await page.click('text=新标签页');
    
    // 获取初始块数量
    const initialBlockCount = await page.locator('.vue-flow__node').count();
    
    // 选择块
    await page.click('.vue-flow__node');
    
    // 按 Delete 键删除
    await page.keyboard.press('Delete');
    
    // 等待删除完成
    await page.waitForTimeout(500);
    
    // 验证块已删除
    const finalBlockCount = await page.locator('.vue-flow__node').count();
    expect(finalBlockCount).toBeLessThan(initialBlockCount);
  });

  /**
   * TC-BLOCK-005: 复制块
   * 优先级: P1
   */
  test('TC-BLOCK-005: 复制块', async () => {
    // 添加一个块
    await page.click('[data-testid="add-block-button"]');
    await page.click('text=新标签页');
    
    // 配置块
    await page.click('.vue-flow__node');
    await page.fill('input[name="blockName"]', '原始块');
    await page.click('button:has-text("保存")');
    
    // 获取初始块数量
    const initialBlockCount = await page.locator('.vue-flow__node').count();
    
    // 选择块并复制 (Ctrl+C / Cmd+C)
    await page.click('.vue-flow__node');
    const isMac = process.platform === 'darwin';
    await page.keyboard.press(isMac ? 'Meta+C' : 'Control+C');
    
    // 粘贴 (Ctrl+V / Cmd+V)
    await page.keyboard.press(isMac ? 'Meta+V' : 'Control+V');
    
    // 等待粘贴完成
    await page.waitForTimeout(500);
    
    // 验证块已复制
    const finalBlockCount = await page.locator('.vue-flow__node').count();
    expect(finalBlockCount).toBeGreaterThan(initialBlockCount);
  });

  /**
   * TC-BLOCK-006: 批量选择块
   * 优先级: P2
   */
  test('TC-BLOCK-006: 批量选择块', async () => {
    // 添加多个块
    await page.click('[data-testid="add-block-button"]');
    await page.click('text=新标签页');
    await page.waitForTimeout(300);
    
    await page.click('[data-testid="add-block-button"]');
    await page.click('text=等待');
    await page.waitForTimeout(300);
    
    await page.click('[data-testid="add-block-button"]');
    await page.click('text=点击元素');
    await page.waitForTimeout(300);
    
    // 使用 Ctrl + 点击选择多个块
    const isMac = process.platform === 'darwin';
    const modifier = isMac ? 'Meta' : 'Control';
    
    await page.locator('.vue-flow__node').first().click();
    await page.keyboard.down(modifier);
    await page.locator('.vue-flow__node').nth(1).click();
    await page.locator('.vue-flow__node').nth(2).click();
    await page.keyboard.up(modifier);
    
    // 验证多个块被选中
    const selectedBlocks = await page.locator('.vue-flow__node.selected').count();
    expect(selectedBlocks).toBe(3);
  });

  /**
   * TC-BLOCK-007: 拖拽调整块位置
   * 优先级: P2
   */
  test('TC-BLOCK-007: 拖拽调整块位置', async () => {
    // 添加一个块
    await page.click('[data-testid="add-block-button"]');
    await page.click('text=新标签页');
    
    // 获取初始位置
    const initialBox = await page.locator('.vue-flow__node').first().boundingBox();
    
    // 拖拽块到新位置
    await page.locator('.vue-flow__node').first().hover();
    await page.mouse.down();
    await page.mouse.move(initialBox.x + 200, initialBox.y + 100);
    await page.mouse.up();
    
    // 等待位置更新
    await page.waitForTimeout(500);
    
    // 获取新位置
    const newBox = await page.locator('.vue-flow__node').first().boundingBox();
    
    // 验证位置已改变
    expect(newBox.x).not.toBe(initialBox.x);
    expect(newBox.y).not.toBe(initialBox.y);
  });
});
