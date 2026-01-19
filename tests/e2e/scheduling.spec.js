/**
 * 定时任务测试 - Scheduling Tests
 * TC-SCHED-001 至 TC-SCHED-004
 * 测试定时触发、Cron 表达式、定时任务管理功能
 */

const { test, expect } = require('@playwright/test');

test.describe('定时任务测试 - Scheduling', () => {
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
   * TC-SCHED-001: 配置定时触发
   * 优先级: P0
   */
  test('TC-SCHED-001: 创建定时触发工作流', async () => {
    // 创建新工作流
    await page.click('text=新建工作流');
    await page.waitForSelector('.workflow-editor', { timeout: 10000 });
    
    // 添加触发器块
    await page.click('[data-testid="add-block-button"]');
    await page.click('text=触发器');
    
    // 点击触发器块配置
    await page.click('.vue-flow__node[data-block-type="trigger"]');
    await page.waitForSelector('[data-testid="block-config-panel"]', { timeout: 5000 });
    
    // 选择定时触发类型
    await page.selectOption('select[name="triggerType"]', 'schedule');
    
    // 配置触发时间（每天 9:00）
    await page.fill('input[name="hour"]', '9');
    await page.fill('input[name="minute"]', '0');
    
    // 选择重复频率
    await page.selectOption('select[name="frequency"]', 'daily');
    
    // 保存配置
    await page.click('button:has-text("保存")');
    await page.waitForTimeout(500);
    
    // 验证配置已保存
    await page.click('.vue-flow__node[data-block-type="trigger"]');
    const hour = await page.inputValue('input[name="hour"]');
    const minute = await page.inputValue('input[name="minute"]');
    expect(hour).toBe('9');
    expect(minute).toBe('0');
    
    // 保存工作流
    await page.click('[data-testid="save-workflow"]');
    await page.fill('input[name="workflowName"]', '定时任务工作流');
    await page.click('button:has-text("确认")');
  });

  /**
   * TC-SCHED-002: 配置 Cron 表达式
   * 优先级: P0
   */
  test('TC-SCHED-002: 使用 Cron 表达式配置定时', async () => {
    // 创建新工作流
    await page.click('text=新建工作流');
    await page.waitForSelector('.workflow-editor', { timeout: 10000 });
    
    // 添加触发器块
    await page.click('[data-testid="add-block-button"]');
    await page.click('text=触发器');
    await page.click('.vue-flow__node[data-block-type="trigger"]');
    
    // 选择定时触发
    await page.selectOption('select[name="triggerType"]', 'schedule');
    
    // 切换到 Cron 模式
    await page.click('[data-testid="toggle-cron-mode"]');
    
    // 输入 Cron 表达式（每小时的第 30 分钟）
    await page.fill('input[name="cronExpression"]', '30 * * * *');
    
    // 验证 Cron 表达式
    await page.click('button:has-text("验证")');
    
    // 等待验证结果
    await page.waitForSelector('.cron-validation-result', { timeout: 5000 });
    
    // 获取验证结果
    const validationText = await page.locator('.cron-validation-result').textContent();
    expect(validationText).toContain('有效' || '每小时');
    
    // 保存配置
    await page.click('button:has-text("保存")');
    await page.waitForTimeout(500);
    
    // 验证配置已保存
    await page.click('.vue-flow__node[data-block-type="trigger"]');
    const cronValue = await page.inputValue('input[name="cronExpression"]');
    expect(cronValue).toBe('30 * * * *');
  });

  /**
   * TC-SCHED-003: 查看定时任务列表
   * 优先级: P1
   */
  test('TC-SCHED-003: 查看所有定时任务', async () => {
    // 导航到定时任务页面
    await page.click('a[href*="/scheduled"]');
    await page.waitForSelector('.scheduled-workflows-page', { timeout: 5000 });
    
    // 验证页面标题
    const pageTitle = await page.locator('h1').textContent();
    expect(pageTitle).toContain('定时任务' || '计划任务');
    
    // 获取定时任务数量
    const taskCount = await page.locator('.scheduled-task-item').count();
    expect(taskCount).toBeGreaterThanOrEqual(0);
    
    // 如果有任务，验证任务详情
    if (taskCount > 0) {
      // 验证任务名称
      const taskName = await page.locator('.scheduled-task-item').first().locator('.task-name').textContent();
      expect(taskName).toBeTruthy();
      
      // 验证下次执行时间
      const nextRun = await page.locator('.scheduled-task-item').first().locator('.next-run').textContent();
      expect(nextRun).toBeTruthy();
      
      // 验证任务状态
      const taskStatus = await page.locator('.scheduled-task-item').first().locator('.task-status');
      expect(await taskStatus.count()).toBeGreaterThan(0);
    }
  });

  /**
   * TC-SCHED-004: 启用/禁用定时任务
   * 优先级: P1
   */
  test('TC-SCHED-004: 切换定时任务状态', async () => {
    // 先创建一个定时任务
    await page.click('text=新建工作流');
    await page.waitForSelector('.workflow-editor', { timeout: 10000 });
    
    await page.click('[data-testid="add-block-button"]');
    await page.click('text=触发器');
    await page.click('.vue-flow__node[data-block-type="trigger"]');
    await page.selectOption('select[name="triggerType"]', 'schedule');
    await page.fill('input[name="hour"]', '10');
    await page.fill('input[name="minute"]', '0');
    await page.click('button:has-text("保存")');
    
    await page.click('[data-testid="save-workflow"]');
    await page.fill('input[name="workflowName"]', '测试定时任务');
    await page.click('button:has-text("确认")');
    
    // 导航到定时任务页面
    await page.click('a[href*="/scheduled"]');
    await page.waitForSelector('.scheduled-workflows-page', { timeout: 5000 });
    
    // 找到刚创建的任务
    const task = await page.locator('text=测试定时任务').first();
    await task.waitFor({ timeout: 5000 });
    
    // 获取任务卡片
    const taskCard = await task.locator('..').locator('..');
    
    // 获取初始状态
    const initialStatus = await taskCard.locator('.task-status').textContent();
    
    // 点击启用/禁用开关
    await taskCard.locator('[data-testid="toggle-task"]').click();
    await page.waitForTimeout(1000);
    
    // 验证状态已改变
    const newStatus = await taskCard.locator('.task-status').textContent();
    expect(newStatus).not.toBe(initialStatus);
    
    // 再次切换回原状态
    await taskCard.locator('[data-testid="toggle-task"]').click();
    await page.waitForTimeout(1000);
    
    // 验证状态恢复
    const restoredStatus = await taskCard.locator('.task-status').textContent();
    expect(restoredStatus).toBe(initialStatus);
  });

  /**
   * TC-SCHED-005: 编辑定时任务
   * 优先级: P2
   */
  test('TC-SCHED-005: 编辑现有定时任务', async () => {
    // 导航到定时任务页面
    await page.click('a[href*="/scheduled"]');
    await page.waitForSelector('.scheduled-workflows-page', { timeout: 5000 });
    
    // 获取任务数量
    const taskCount = await page.locator('.scheduled-task-item').count();
    
    if (taskCount > 0) {
      // 点击编辑按钮
      await page.locator('.scheduled-task-item').first().locator('[data-testid="edit-task"]').click();
      
      // 等待编辑器加载
      await page.waitForSelector('.workflow-editor', { timeout: 10000 });
      
      // 点击触发器块
      await page.click('.vue-flow__node[data-block-type="trigger"]');
      
      // 修改时间
      await page.fill('input[name="hour"]', '11');
      await page.fill('input[name="minute"]', '30');
      
      // 保存更改
      await page.click('button:has-text("保存")');
      await page.waitForTimeout(500);
      
      // 保存工作流
      await page.click('[data-testid="save-workflow"]');
      
      // 返回定时任务页面验证
      await page.click('a[href*="/scheduled"]');
      await page.waitForTimeout(1000);
      
      // 验证时间已更新（这取决于 UI 如何显示时间）
      const taskDetails = await page.locator('.scheduled-task-item').first().textContent();
      expect(taskDetails).toContain('11:30' || '11' || '30');
    }
  });

  /**
   * TC-SCHED-006: 删除定时任务
   * 优先级: P2
   */
  test('TC-SCHED-006: 删除定时任务', async () => {
    // 先创建一个定时任务
    await page.click('text=新建工作流');
    await page.waitForSelector('.workflow-editor', { timeout: 10000 });
    
    await page.click('[data-testid="add-block-button"]');
    await page.click('text=触发器');
    await page.click('.vue-flow__node[data-block-type="trigger"]');
    await page.selectOption('select[name="triggerType"]', 'schedule');
    await page.fill('input[name="hour"]', '12');
    await page.fill('input[name="minute"]', '0');
    await page.click('button:has-text("保存")');
    
    await page.click('[data-testid="save-workflow"]');
    await page.fill('input[name="workflowName"]', '待删除定时任务');
    await page.click('button:has-text("确认")');
    
    // 导航到定时任务页面
    await page.click('a[href*="/scheduled"]');
    await page.waitForSelector('.scheduled-workflows-page', { timeout: 5000 });
    
    // 获取初始任务数量
    const initialCount = await page.locator('.scheduled-task-item').count();
    
    // 找到待删除的任务并删除
    const task = await page.locator('text=待删除定时任务').first();
    const taskCard = await task.locator('..').locator('..');
    
    // 点击删除按钮
    await taskCard.locator('[data-testid="delete-task"]').click();
    
    // 确认删除
    await page.waitForSelector('.confirm-dialog', { timeout: 3000 });
    await page.click('button:has-text("确认")');
    
    // 等待删除完成
    await page.waitForTimeout(1000);
    
    // 验证任务已删除
    const finalCount = await page.locator('.scheduled-task-item').count();
    expect(finalCount).toBe(initialCount - 1);
  });

  /**
   * TC-SCHED-007: 验证无效 Cron 表达式
   * 优先级: P2
   */
  test('TC-SCHED-007: 输入无效 Cron 表达式', async () => {
    // 创建新工作流
    await page.click('text=新建工作流');
    await page.waitForSelector('.workflow-editor', { timeout: 10000 });
    
    // 添加触发器块
    await page.click('[data-testid="add-block-button"]');
    await page.click('text=触发器');
    await page.click('.vue-flow__node[data-block-type="trigger"]');
    
    // 选择定时触发
    await page.selectOption('select[name="triggerType"]', 'schedule');
    
    // 切换到 Cron 模式
    await page.click('[data-testid="toggle-cron-mode"]');
    
    // 输入无效的 Cron 表达式
    await page.fill('input[name="cronExpression"]', 'invalid cron');
    
    // 验证 Cron 表达式
    await page.click('button:has-text("验证")');
    
    // 等待验证结果
    await page.waitForSelector('.cron-validation-result.error', { timeout: 5000 });
    
    // 获取错误消息
    const errorMessage = await page.locator('.cron-validation-result.error').textContent();
    expect(errorMessage).toContain('无效' || '错误' || 'invalid');
    
    // 验证保存按钮被禁用
    const saveButton = await page.locator('button:has-text("保存")');
    const isDisabled = await saveButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  /**
   * TC-SCHED-008: 查看定时任务执行历史
   * 优先级: P2
   */
  test('TC-SCHED-008: 查看定时任务执行历史', async () => {
    // 导航到定时任务页面
    await page.click('a[href*="/scheduled"]');
    await page.waitForSelector('.scheduled-workflows-page', { timeout: 5000 });
    
    // 获取任务数量
    const taskCount = await page.locator('.scheduled-task-item').count();
    
    if (taskCount > 0) {
      // 点击第一个任务
      await page.locator('.scheduled-task-item').first().click();
      
      // 等待详情页面
      await page.waitForSelector('.task-details', { timeout: 5000 });
      
      // 点击执行历史标签
      await page.click('button:has-text("执行历史")');
      
      // 验证执行历史列表
      await page.waitForSelector('.execution-history', { timeout: 5000 });
      
      // 获取历史记录数量
      const historyCount = await page.locator('.history-entry').count();
      expect(historyCount).toBeGreaterThanOrEqual(0);
      
      // 如果有历史记录，验证记录详情
      if (historyCount > 0) {
        const firstEntry = await page.locator('.history-entry').first();
        
        // 验证执行时间
        const executionTime = await firstEntry.locator('.execution-time').textContent();
        expect(executionTime).toBeTruthy();
        
        // 验证执行状态
        const executionStatus = await firstEntry.locator('.execution-status').textContent();
        expect(executionStatus).toBeTruthy();
      }
    }
  });
});
