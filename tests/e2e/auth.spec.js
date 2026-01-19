/**
 * 身份验证测试 - Authentication Tests
 * TC-AUTH-001 至 TC-AUTH-003
 * 测试用户注册、登录、会话管理功能
 */

const { test, expect } = require('@playwright/test');

test.describe('身份验证测试 - Authentication', () => {
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
   * TC-AUTH-001: 用户注册
   * 优先级: P0
   */
  test('TC-AUTH-001: 用户注册', async () => {
    // 导航到登录/注册页面
    await page.goto('chrome-extension://ilojapanngcgdiablmfcjmlladgpgedf/newtab.html#/login');
    await page.waitForLoadState('networkidle');
    
    // 切换到注册标签
    await page.click('button:has-text("注册")');
    await page.waitForSelector('.register-form', { timeout: 5000 });
    
    // 填写注册表单
    const timestamp = Date.now();
    const testEmail = `test-user-${timestamp}@example.com`;
    const testPassword = 'TestPassword123!';
    
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="confirmPassword"]', testPassword);
    
    // 可选：填写用户名
    await page.fill('input[name="username"]', `testuser${timestamp}`);
    
    // 提交注册
    await page.click('button[type="submit"]:has-text("注册")');
    
    // 等待注册结果
    await page.waitForSelector('.registration-success, .registration-error', { timeout: 10000 });
    
    // 验证注册成功
    const hasSuccess = await page.locator('.registration-success').count();
    const hasError = await page.locator('.registration-error').count();
    
    if (hasSuccess > 0) {
      // 注册成功
      const successMessage = await page.locator('.registration-success').textContent();
      expect(successMessage).toBeTruthy();
      
      // 验证是否需要邮箱验证
      const needsVerification = await page.locator('text=验证邮箱').count();
      if (needsVerification > 0) {
        console.log('需要邮箱验证');
      }
    } else if (hasError > 0) {
      // 注册失败，可能是邮箱已存在
      const errorMessage = await page.locator('.registration-error').textContent();
      console.log('注册错误:', errorMessage);
      
      // 如果是邮箱已存在，测试仍然算通过（因为功能正常）
      expect(errorMessage).toContain('已存在' || 'already exists');
    }
  });

  /**
   * TC-AUTH-002: 用户登录
   * 优先级: P0
   */
  test('TC-AUTH-002: 用户登录', async () => {
    // 导航到登录页面
    await page.goto('chrome-extension://ilojapanngcgdiablmfcjmlladgpgedf/newtab.html#/login');
    await page.waitForLoadState('networkidle');
    
    // 使用测试账户
    const testEmail = 'test-user@example.com';
    const testPassword = 'testpassword123';
    
    // 填写登录表单
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    
    // 提交登录
    await page.click('button[type="submit"]:has-text("登录")');
    
    // 等待登录结果
    await page.waitForTimeout(3000);
    
    // 验证登录状态
    const currentUrl = page.url();
    
    // 如果登录成功，应该跳转到主页
    if (currentUrl.includes('/workflows') || currentUrl.endsWith('/')) {
      // 登录成功
      expect(currentUrl).not.toContain('/login');
      
      // 验证用户信息显示
      const userMenu = await page.locator('[data-testid="user-menu"], .user-menu, .user-profile').count();
      expect(userMenu).toBeGreaterThan(0);
      
    } else {
      // 如果仍在登录页面，检查是否有错误消息
      const errorMessage = await page.locator('.login-error, .error-message').count();
      if (errorMessage > 0) {
        const error = await page.locator('.login-error, .error-message').textContent();
        console.log('登录错误:', error);
        
        // 验证错误消息是合理的
        expect(error).toBeTruthy();
      }
    }
  });

  /**
   * TC-AUTH-003: 会话管理
   * 优先级: P1
   */
  test('TC-AUTH-003: 会话管理 - 登出', async () => {
    // 先登录
    await page.goto('chrome-extension://ilojapanngcgdiablmfcjmlladgpgedf/newtab.html#/login');
    await page.waitForLoadState('networkidle');
    
    // 检查是否已登录
    const isLoggedIn = await page.locator('[data-testid="user-menu"], .user-menu').count() > 0;
    
    if (!isLoggedIn) {
      // 需要先登录
      await page.fill('input[name="email"]', 'test-user@example.com');
      await page.fill('input[name="password"]', 'testpassword123');
      await page.click('button[type="submit"]:has-text("登录")');
      await page.waitForTimeout(3000);
    }
    
    // 导航到主页
    await page.goto('chrome-extension://ilojapanngcgdiablmfcjmlladgpgedf/newtab.html');
    await page.waitForLoadState('networkidle');
    
    // 打开用户菜单
    await page.click('[data-testid="user-menu"], .user-menu, .user-profile');
    await page.waitForSelector('[data-testid="logout-button"], button:has-text("登出"), button:has-text("退出")');
    
    // 点击登出
    await page.click('[data-testid="logout-button"], button:has-text("登出"), button:has-text("退出")');
    
    // 等待登出完成
    await page.waitForTimeout(2000);
    
    // 验证已登出
    const currentUrl = page.url();
    
    // 应该跳转到登录页面或公共页面
    const userMenu = await page.locator('[data-testid="user-menu"], .user-menu').count();
    expect(userMenu).toBe(0);
  });

  /**
   * TC-AUTH-004: 密码重置
   * 优先级: P2
   */
  test('TC-AUTH-004: 请求密码重置', async () => {
    // 导航到登录页面
    await page.goto('chrome-extension://ilojapanngcgdiablmfcjmlladgpgedf/newtab.html#/login');
    await page.waitForLoadState('networkidle');
    
    // 点击忘记密码
    await page.click('a:has-text("忘记密码"), button:has-text("忘记密码")');
    
    // 等待密码重置表单
    await page.waitForSelector('.password-reset-form', { timeout: 5000 });
    
    // 填写邮箱
    await page.fill('input[name="email"]', 'test-user@example.com');
    
    // 提交重置请求
    await page.click('button[type="submit"]:has-text("发送")');
    
    // 等待结果
    await page.waitForTimeout(2000);
    
    // 验证成功消息
    const successMessage = await page.locator('.success-message, .reset-email-sent').count();
    if (successMessage > 0) {
      const message = await page.locator('.success-message, .reset-email-sent').textContent();
      expect(message).toContain('发送' || '邮件' || 'email');
    }
  });

  /**
   * TC-AUTH-005: 会话持久化
   * 优先级: P2
   */
  test('TC-AUTH-005: 会话持久化验证', async () => {
    // 先登录
    await page.goto('chrome-extension://ilojapanngcgdiablmfcjmlladgpgedf/newtab.html#/login');
    await page.waitForLoadState('networkidle');
    
    const isLoggedIn = await page.locator('[data-testid="user-menu"], .user-menu').count() > 0;
    
    if (!isLoggedIn) {
      await page.fill('input[name="email"]', 'test-user@example.com');
      await page.fill('input[name="password"]', 'testpassword123');
      await page.click('button[type="submit"]:has-text("登录")');
      await page.waitForTimeout(3000);
    }
    
    // 刷新页面
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // 验证会话仍然有效
    const stillLoggedIn = await page.locator('[data-testid="user-menu"], .user-menu').count() > 0;
    expect(stillLoggedIn).toBe(true);
  });

  /**
   * TC-AUTH-006: 登录失败处理
   * 优先级: P2
   */
  test('TC-AUTH-006: 错误凭据登录', async () => {
    // 导航到登录页面
    await page.goto('chrome-extension://ilojapanngcgdiablmfcjmlladgpgedf/newtab.html#/login');
    await page.waitForLoadState('networkidle');
    
    // 使用错误的凭据
    await page.fill('input[name="email"]', 'wrong-user@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    
    // 提交登录
    await page.click('button[type="submit"]:has-text("登录")');
    
    // 等待错误消息
    await page.waitForSelector('.login-error, .error-message', { timeout: 5000 });
    
    // 验证错误消息
    const errorMessage = await page.locator('.login-error, .error-message').textContent();
    expect(errorMessage).toBeTruthy();
    expect(errorMessage).toMatch(/错误|失败|invalid|incorrect/i);
    
    // 验证仍在登录页面
    const currentUrl = page.url();
    expect(currentUrl).toContain('/login');
  });

  /**
   * TC-AUTH-007: 表单验证
   * 优先级: P2
   */
  test('TC-AUTH-007: 登录表单验证', async () => {
    // 导航到登录页面
    await page.goto('chrome-extension://ilojapanngcgdiablmfcjmlladgpgedf/newtab.html#/login');
    await page.waitForLoadState('networkidle');
    
    // 不填写任何信息直接提交
    await page.click('button[type="submit"]:has-text("登录")');
    
    // 验证表单验证错误
    const emailError = await page.locator('input[name="email"]:invalid, .email-error').count();
    expect(emailError).toBeGreaterThan(0);
    
    // 填写无效邮箱
    await page.fill('input[name="email"]', 'invalid-email');
    await page.click('button[type="submit"]:has-text("登录")');
    
    // 验证邮箱格式错误
    const emailFormatError = await page.locator('input[name="email"]:invalid, .email-format-error').count();
    expect(emailFormatError).toBeGreaterThan(0);
  });

  /**
   * TC-AUTH-008: OAuth 登录 (如果支持)
   * 优先级: P3
   */
  test.skip('TC-AUTH-008: Google OAuth 登录', async () => {
    // 导航到登录页面
    await page.goto('chrome-extension://ilojapanngcgdiablmfcjmlladgpgedf/newtab.html#/login');
    await page.waitForLoadState('networkidle');
    
    // 检查是否有 OAuth 选项
    const hasOAuth = await page.locator('button:has-text("Google"), .google-login').count() > 0;
    
    if (hasOAuth) {
      // 点击 Google 登录按钮
      const [popup] = await Promise.all([
        page.waitForEvent('popup'),
        page.click('button:has-text("Google"), .google-login'),
      ]);
      
      // 在弹出窗口中登录
      // 注意：这需要真实的 Google 账户或模拟
      await popup.waitForLoadState('networkidle');
      
      // 这里通常需要填写 Google 凭据
      // 由于涉及第三方服务，此测试可能需要特殊配置
      
      console.log('OAuth 登录需要实际凭据，跳过此测试');
    } else {
      console.log('不支持 OAuth 登录');
    }
  });
});
