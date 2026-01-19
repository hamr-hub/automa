/**
 * LangGraph AI 集成测试 - LangGraph AI Integration Tests
 * 测试 AI 工作流生成功能
 */

const { test, expect } = require('@playwright/test');

test.describe('LangGraph AI 集成测试 - AI Workflow Generation', () => {
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
   * TC-AI-001: AI 工作流生成器访问
   * 优先级: P0
   */
  test('TC-AI-001: 打开 AI 助手', async () => {
    // 创建新工作流
    await page.click('text=新建工作流');
    await page.waitForSelector('.workflow-editor', { timeout: 10000 });
    
    // 查找 AI 助手按钮
    const aiButton = await page.locator('[data-testid="ai-chat-toggle"], button:has-text("AI"), .ai-assistant-button');
    expect(await aiButton.count()).toBeGreaterThan(0);
    
    // 打开 AI 助手
    await aiButton.click();
    
    // 验证 AI 聊天界面出现
    await page.waitForSelector('.ai-chat-container, .ai-assistant', { timeout: 5000 });
    
    const chatContainer = await page.locator('.ai-chat-container, .ai-assistant');
    expect(await chatContainer.count()).toBeGreaterThan(0);
  });

  /**
   * TC-AI-002: 生成简单工作流
   * 优先级: P0
   */
  test('TC-AI-002: AI 生成简单工作流', async () => {
    // 创建新工作流
    await page.click('text=新建工作流');
    await page.waitForSelector('.workflow-editor', { timeout: 10000 });
    
    // 打开 AI 助手
    await page.click('[data-testid="ai-chat-toggle"], button:has-text("AI"), .ai-assistant-button');
    await page.waitForSelector('.ai-chat-container', { timeout: 5000 });
    
    // 输入提示词
    const prompt = '创建一个工作流，打开百度首页并搜索 Automa';
    await page.fill('textarea[placeholder*="输入"], textarea.ai-input, .ai-chat-input textarea', prompt);
    
    // 发送请求
    await page.click('button:has-text("发送"), button[type="submit"], .send-button');
    
    // 等待 AI 响应
    await page.waitForSelector('.ai-message, .assistant-message', { timeout: 30000 });
    
    // 验证有响应
    const messages = await page.locator('.ai-message, .assistant-message');
    expect(await messages.count()).toBeGreaterThan(0);
    
    // 验证工作流已生成（检查画布上是否有新块）
    await page.waitForTimeout(2000);
    const blocks = await page.locator('.vue-flow__node').count();
    expect(blocks).toBeGreaterThan(0);
  });

  /**
   * TC-AI-003: 多轮对话
   * 优先级: P1
   */
  test('TC-AI-003: AI 多轮对话', async () => {
    // 创建新工作流
    await page.click('text=新建工作流');
    await page.waitForSelector('.workflow-editor', { timeout: 10000 });
    
    // 打开 AI 助手
    await page.click('[data-testid="ai-chat-toggle"]');
    await page.waitForSelector('.ai-chat-container', { timeout: 5000 });
    
    // 第一轮对话
    await page.fill('.ai-chat-input textarea', '创建一个打开Google的工作流');
    await page.click('.send-button, button:has-text("发送")');
    await page.waitForSelector('.ai-message', { timeout: 30000 });
    await page.waitForTimeout(2000);
    
    // 第二轮对话 - 修改工作流
    await page.fill('.ai-chat-input textarea', '添加一个等待3秒的步骤');
    await page.click('.send-button, button:has-text("发送")');
    await page.waitForSelector('.ai-message:nth-child(4)', { timeout: 30000 });
    
    // 验证对话历史
    const messageCount = await page.locator('.ai-message').count();
    expect(messageCount).toBeGreaterThanOrEqual(2);
    
    // 验证工作流已更新
    const blocks = await page.locator('.vue-flow__node').count();
    expect(blocks).toBeGreaterThan(1);
  });

  /**
   * TC-AI-004: 错误处理
   * 优先级: P1
   */
  test('TC-AI-004: AI 错误处理', async () => {
    // 创建新工作流
    await page.click('text=新建工作流');
    await page.waitForSelector('.workflow-editor', { timeout: 10000 });
    
    // 打开 AI 助手
    await page.click('[data-testid="ai-chat-toggle"]');
    await page.waitForSelector('.ai-chat-container', { timeout: 5000 });
    
    // 发送无意义的请求
    await page.fill('.ai-chat-input textarea', 'asdfghjkl');
    await page.click('.send-button');
    
    // 等待响应
    await page.waitForSelector('.ai-message', { timeout: 30000 });
    
    // 验证 AI 能够处理模糊请求
    const response = await page.locator('.ai-message').last().textContent();
    expect(response).toBeTruthy();
  });

  /**
   * TC-AI-005: 清除对话历史
   * 优先级: P2
   */
  test('TC-AI-005: 清除聊天历史', async () => {
    // 创建新工作流
    await page.click('text=新建工作流');
    await page.waitForSelector('.workflow-editor', { timeout: 10000 });
    
    // 打开 AI 助手
    await page.click('[data-testid="ai-chat-toggle"]');
    await page.waitForSelector('.ai-chat-container', { timeout: 5000 });
    
    // 发送一条消息
    await page.fill('.ai-chat-input textarea', '测试消息');
    await page.click('.send-button');
    await page.waitForSelector('.ai-message', { timeout: 30000 });
    
    // 获取初始消息数量
    const initialCount = await page.locator('.chat-message, .ai-message, .user-message').count();
    expect(initialCount).toBeGreaterThan(0);
    
    // 清除历史
    await page.click('[data-testid="clear-chat"], button:has-text("清除"), .clear-chat-button');
    
    // 确认清除
    const confirmButton = await page.locator('button:has-text("确认"), button:has-text("是")');
    if (await confirmButton.count() > 0) {
      await confirmButton.click();
    }
    
    await page.waitForTimeout(1000);
    
    // 验证历史已清除
    const finalCount = await page.locator('.chat-message, .ai-message, .user-message').count();
    expect(finalCount).toBeLessThan(initialCount);
  });

  /**
   * TC-AI-006: 复杂工作流生成
   * 优先级: P2
   */
  test('TC-AI-006: 生成复杂工作流', async () => {
    // 创建新工作流
    await page.click('text=新建工作流');
    await page.waitForSelector('.workflow-editor', { timeout: 10000 });
    
    // 打开 AI 助手
    await page.click('[data-testid="ai-chat-toggle"]');
    await page.waitForSelector('.ai-chat-container', { timeout: 5000 });
    
    // 输入复杂的提示词
    const complexPrompt = `
      创建一个工作流：
      1. 打开 https://example.com
      2. 等待页面加载完成
      3. 提取页面标题
      4. 点击第一个链接
      5. 将提取的数据保存为 JSON
    `;
    
    await page.fill('.ai-chat-input textarea', complexPrompt);
    await page.click('.send-button');
    
    // 等待生成完成（复杂工作流可能需要更长时间）
    await page.waitForTimeout(5000);
    await page.waitForSelector('.ai-message', { timeout: 60000 });
    
    // 等待块生成完成
    await page.waitForTimeout(3000);
    
    // 验证生成了多个块
    const blocks = await page.locator('.vue-flow__node').count();
    expect(blocks).toBeGreaterThanOrEqual(3);
  });

  /**
   * TC-AI-007: 保存 AI 生成的工作流
   * 优先级: P2
   */
  test('TC-AI-007: 保存 AI 生成的工作流', async () => {
    // 创建新工作流
    await page.click('text=新建工作流');
    await page.waitForSelector('.workflow-editor', { timeout: 10000 });
    
    // 使用 AI 生成工作流
    await page.click('[data-testid="ai-chat-toggle"]');
    await page.waitForSelector('.ai-chat-container', { timeout: 5000 });
    
    await page.fill('.ai-chat-input textarea', '创建一个打开百度的工作流');
    await page.click('.send-button');
    await page.waitForTimeout(5000);
    
    // 保存工作流
    await page.click('[data-testid="save-workflow"]');
    await page.waitForSelector('input[name="workflowName"]', { timeout: 5000 });
    
    const workflowName = `AI生成工作流_${Date.now()}`;
    await page.fill('input[name="workflowName"]', workflowName);
    await page.click('button:has-text("确认")');
    
    await page.waitForTimeout(2000);
    
    // 返回首页验证
    await page.goto('chrome-extension://ilojapanngcgdiablmfcjmlladgpgedf/newtab.html');
    await page.waitForLoadState('networkidle');
    
    // 查找保存的工作流
    const savedWorkflow = await page.locator(`text=${workflowName}`);
    expect(await savedWorkflow.count()).toBeGreaterThan(0);
  });
});
