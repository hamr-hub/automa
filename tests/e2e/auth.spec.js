import { test, expect } from '@playwright/test';

// 测试配置
const BASE_URL = 'http://localhost:3000'; // 根据实际情况修改
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'TestPassword123!';

test.describe('用户认证系统测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/#/login`);
  });

  test('注册流程 - 完整三步注册', async ({ page }) => {
    // 1. 点击注册按钮
    await page.click('text=注册');
    
    // 2. 步骤 1: 填写基本信息
    await expect(page.locator('text=创建新账号')).toBeVisible();
    
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[placeholder*="设置密码"]', TEST_PASSWORD);
    await page.fill('input[placeholder*="确认密码"]', TEST_PASSWORD);
    
    // 检查密码强度组件是否显示
    await expect(page.locator('.password-strength')).toBeVisible();
    
    // 点击下一步
    await page.click('button:has-text("下一步")');
    
    // 3. 步骤 2: 安全验证 (Captcha)
    await expect(page.locator('text=为了保障您的账号安全')).toBeVisible();
    
    // 点击 Captcha (开发模式自动通过)
    await page.click('.cf-turnstile, div:has-text("点击进行人机验证")');
    await page.waitForTimeout(1000); // 等待验证完成
    
    // 点击创建账号
    await page.click('button:has-text("创建账号")');
    
    // 4. 步骤 3: 注册成功
    await expect(page.locator('text=注册成功')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=请检查您的邮箱完成验证')).toBeVisible();
    
    // 返回登录
    await page.click('button:has-text("返回登录")');
    await expect(page.locator('text=登录 Automa')).toBeVisible();
  });

  test('登录流程 - 密码登录', async ({ page }) => {
    // 1. 确保在密码登录 Tab
    await page.click('button:has-text("密码登录")');
    
    // 2. 填写登录信息
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    
    // 3. 点击 Captcha
    await page.click('div:has-text("点击进行人机验证")');
    await page.waitForTimeout(500);
    
    // 4. 勾选记住我
    await page.check('input[type="checkbox"]');
    
    // 5. 点击登录
    await page.click('button:has-text("登录")');
    
    // 6. 验证登录成功 (根据实际路由调整)
    await expect(page).toHaveURL(/\/#\//, { timeout: 10000 });
  });

  test('登录流程 - OTP 验证码登录', async ({ page }) => {
    // 1. 切换到验证码登录
    await page.click('button:has-text("验证码登录")');
    
    // 2. 填写邮箱
    await page.fill('input[type="email"]', TEST_EMAIL);
    
    // 3. 点击 Captcha
    await page.click('div:has-text("点击进行人机验证")');
    await page.waitForTimeout(500);
    
    // 4. 点击发送验证码
    await page.click('button:has-text("发送验证码")');
    
    // 5. 等待提示信息
    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('验证码已发送');
      await dialog.accept();
    });
  });

  test('登录流程 - Passkey 登录 (浏览器支持)', async ({ page, browserName }) => {
    // Passkey 需要浏览器原生支持,可能在某些测试环境无法模拟
    test.skip(browserName !== 'chromium', 'Passkey 仅在 Chromium 测试');
    
    // 1. 检查 Passkey 按钮是否显示
    const passkeyButton = page.locator('button:has-text("使用 Passkey 登录")');
    if (await passkeyButton.isVisible()) {
      await page.fill('input[type="email"]', TEST_EMAIL);
      
      // 注意: 实际 WebAuthn 交互需要浏览器原生支持,测试环境可能需要 mock
      // 这里仅测试按钮点击
      await passkeyButton.click();
    }
  });

  test('忘记密码流程', async ({ page }) => {
    // 1. 填写邮箱
    await page.fill('input[type="email"]', TEST_EMAIL);
    
    // 2. 点击忘记密码
    await page.click('a:has-text("忘记密码")');
    
    // 3. 等待提示信息
    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('重置密码邮件已发送');
      await dialog.accept();
    });
  });

  test('社交登录按钮显示', async ({ page }) => {
    // 检查社交登录组件是否渲染
    await expect(page.locator('.social-login')).toBeVisible();
    
    // 检查具体的登录按钮 (根据实际配置)
    const googleButton = page.locator('button:has-text("Google")');
    const githubButton = page.locator('button:has-text("GitHub")');
    
    // 至少应该有一个社交登录按钮
    const buttonCount = await page.locator('.social-login button').count();
    expect(buttonCount).toBeGreaterThan(0);
  });
});

test.describe('个人中心 - MFA 设置', () => {
  test.beforeEach(async ({ page }) => {
    // 假设用户已登录,直接访问设置页
    await page.goto(`${BASE_URL}/#/settings/profile`);
  });

  test('开启两步验证 (MFA)', async ({ page }) => {
    // 1. 点击开启按钮
    await page.click('button:has-text("开启"):near(text="两步验证")');
    
    // 2. 验证 MFA 设置模态框打开
    await expect(page.locator('text=设置两步验证')).toBeVisible();
    
    // 3. 检查二维码显示
    await expect(page.locator('img[alt*="QR"], canvas')).toBeVisible();
    
    // 4. 填写验证码 (模拟输入)
    await page.fill('input[placeholder*="验证码"]', '123456');
    
    // 5. 点击确认 (可能失败,因为验证码不正确)
    await page.click('button:has-text("确认")');
  });

  test('关闭两步验证 (MFA)', async ({ page }) => {
    // 假设用户已开启 MFA
    const disableButton = page.locator('button:has-text("关闭"):near(text="两步验证")');
    
    if (await disableButton.isVisible()) {
      // 1. 点击关闭按钮
      await disableButton.click();
      
      // 2. 确认弹窗
      page.once('dialog', async dialog => {
        expect(dialog.message()).toContain('确定要关闭');
        await dialog.accept();
      });
    }
  });
});

test.describe('个人中心 - Passkey 管理', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/#/settings/profile`);
  });

  test('打开 Passkey 管理模态框', async ({ page }) => {
    // 1. 点击管理按钮
    await page.click('button:has-text("管理"):near(text="Passkey")');
    
    // 2. 验证模态框打开
    await expect(page.locator('text=管理 Passkey')).toBeVisible();
    
    // 3. 检查说明文字
    await expect(page.locator('text=Passkey 是一种更安全、更便捷的无密码登录方式')).toBeVisible();
  });

  test('注册新 Passkey (浏览器支持)', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Passkey 仅在 Chromium 测试');
    
    // 1. 打开管理模态框
    await page.click('button:has-text("管理"):near(text="Passkey")');
    
    // 2. 点击注册按钮
    const registerButton = page.locator('button:has-text("注册新 Passkey")');
    if (await registerButton.isVisible()) {
      // 注意: 实际注册需要浏览器原生 WebAuthn 支持
      await registerButton.click();
    }
  });
});

test.describe('个人中心 - 修改密码', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/#/settings/profile`);
  });

  test('修改密码流程', async ({ page }) => {
    // 1. 点击修改密码按钮
    await page.click('button:has-text("修改密码")');
    
    // 2. 验证模态框打开
    await expect(page.locator('text=修改密码')).toBeVisible();
    
    // 3. 填写新密码
    const newPassword = 'NewPassword456!';
    await page.fill('input[type="password"]', newPassword);
    
    // 4. 检查密码强度组件
    await expect(page.locator('.password-strength')).toBeVisible();
    
    // 5. 提交
    await page.click('button:has-text("保存")');
    
    // 6. 等待成功提示
    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('修改成功');
      await dialog.accept();
    });
  });
});

test.describe('个人中心 - 活动日志', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/#/settings/profile`);
  });

  test('查看近期活动日志', async ({ page }) => {
    // 1. 滚动到活动日志区域
    await page.locator('text=近期活动').scrollIntoViewIfNeeded();
    
    // 2. 验证表格存在
    await expect(page.locator('table')).toBeVisible();
    
    // 3. 检查表头
    await expect(page.locator('th:has-text("操作")')).toBeVisible();
    await expect(page.locator('th:has-text("时间")')).toBeVisible();
    await expect(page.locator('th:has-text("Details")')).toBeVisible();
    
    // 4. 检查是否有日志记录 (或显示"暂无数据")
    const hasLogs = await page.locator('tbody tr').count();
    expect(hasLogs).toBeGreaterThanOrEqual(1);
  });
});
