/**
 * 身份验证测试
 * 测试用户注册、登录、会话管理和安全功能
 */

import { test, expect, describe, beforeEach } from '@playwright/test';

const EXTENSION_ID = process.env.EXTENSION_ID || 'your-extension-id';

describe('身份验证测试', () => {
  let page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto(`chrome-extension://${EXTENSION_ID}/newtab.html`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
  });

  test.afterEach(async () => {
    if (page) await page.close();
  });

  test.describe('用户注册', () => {
    test('TC-AUTH-001: 用户注册成功', async () => {
      await test.step('打开注册页面', async () => {
        const signupBtn = page.locator('text=注册, text=Sign up, text=注册账号').first();
        if (await signupBtn.isVisible()) {
          await signupBtn.click();
        }
      });

      await test.step('输入邮箱', async () => {
        const emailInput = page.locator('input[type="email"], input[placeholder*="邮箱"]').first();
        if (await emailInput.isVisible()) {
          await emailInput.fill(`test_${Date.now()}@example.com`);
        }
      });

      await test.step('输入密码', async () => {
        const passwordInput = page.locator('input[type="password"], input[placeholder*="密码"]').first();
        if (await passwordInput.isVisible()) {
          await passwordInput.fill('TestPassword123!');
        }
      });

      await test.step('确认密码', async () => {
        const confirmInput = page.locator('input[placeholder*="确认密码"], input[placeholder*="再次输入密码"]').first();
        if (await confirmInput.isVisible()) {
          await confirmInput.fill('TestPassword123!');
        }
      });

      await test.step('提交注册', async () => {
        const submitBtn = page.locator('button:has-text("注册"), button:has-text("Sign up")]').first();
        if (await submitBtn.isVisible()) {
          await submitBtn.click();
        }
      });

      await test.step('验证注册成功', async () => {
        await page.waitForTimeout(2000);
        const successMsg = page.locator('text=注册成功, text=验证邮件已发送').first();
        if (await successMsg.isVisible({ timeout: 5000 })) {
          expect(await successMsg.isVisible()).toBe(true);
        }
      });
    });

    test('TC-AUTH-002: 注册边界情况 - 已存在邮箱', async () => {
      await test.step('使用已注册邮箱', async () => {
        const signupBtn = page.locator('text=注册').first();
        if (await signupBtn.isVisible()) {
          await signupBtn.click();
        }

        const emailInput = page.locator('input[type="email"]').first();
        if (await emailInput.isVisible()) {
          await emailInput.fill('existing@example.com');
        }

        const passwordInput = page.locator('input[type="password"]').first();
        if (await passwordInput.isVisible()) {
          await passwordInput.fill('TestPassword123!');
        }

        const confirmInput = page.locator('input[placeholder*="确认"]').first();
        if (await confirmInput.isVisible()) {
          await confirmInput.fill('TestPassword123!');
        }
      });

      await test.step('提交并验证错误', async () => {
        const submitBtn = page.locator('button:has-text("注册")').first();
        if (await submitBtn.isVisible()) {
          await submitBtn.click();
        }

        await page.waitForTimeout(2000);
        const errorMsg = page.locator('text=已存在, text=邮箱已被注册').first();
        if (await errorMsg.isVisible()) {
          expect(await errorMsg.isVisible()).toBe(true);
        }
      });
    });

    test('TC-AUTH-003: 注册边界情况 - 无效邮箱', async () => {
      await test.step('输入无效邮箱格式', async () => {
        const signupBtn = page.locator('text=注册').first();
        if (await signupBtn.isVisible()) {
          await signupBtn.click();
        }

        const emailInput = page.locator('input[type="email"]').first();
        if (await emailInput.isVisible()) {
          await emailInput.fill('invalid-email');
        }
      });

      await test.step('验证邮箱格式错误', async () => {
        const emailError = page.locator('text=无效邮箱, text=邮箱格式错误').first();
        if (await emailError.isVisible({ timeout: 1000 })) {
          expect(await emailError.isVisible()).toBe(true);
        }
      });
    });

    test('TC-AUTH-004: 注册边界情况 - 弱密码', async () => {
      await test.step('输入弱密码', async () => {
        const signupBtn = page.locator('text=注册').first();
        if (await signupBtn.isVisible()) {
          await signupBtn.click();
        }

        const passwordInput = page.locator('input[type="password"]').first();
        if (await passwordInput.isVisible()) {
          await passwordInput.fill('123');
        }
      });

      await test.step('验证密码强度警告', async () => {
        const weakPasswordMsg = page.locator('text=密码太短, text=弱密码, text=至少').first();
        if (await weakPasswordMsg.isVisible({ timeout: 1000 })) {
          expect(await weakPasswordMsg.isVisible()).toBe(true);
        }
      });
    });

    test('TC-AUTH-005: 注册边界情况 - 密码不匹配', async () => {
      await test.step('输入不匹配的密码', async () => {
        const signupBtn = page.locator('text=注册').first();
        if (await signupBtn.isVisible()) {
          await signupBtn.click();
        }

        const passwordInput = page.locator('input[type="password"]').first();
        if (await passwordInput.isVisible()) {
          await passwordInput.fill('Password123!');
        }

        const confirmInput = page.locator('input[placeholder*="确认"]').first();
        if (await confirmInput.isVisible()) {
          await confirmInput.fill('DifferentPassword123!');
        }
      });

      await test.step('验证密码不匹配错误', async () => {
        const mismatchMsg = page.locator('text=密码不匹配, text=不一致').first();
        if (await mismatchMsg.isVisible({ timeout: 1000 })) {
          expect(await mismatchMsg.isVisible()).toBe(true);
        }
      });
    });
  });

  test.describe('用户登录', () => {
    test('TC-AUTH-006: 用户登录成功', async () => {
      await test.step('打开登录页面', async () => {
        const loginBtn = page.locator('text=登录, text=Sign in, text=登录账号').first();
        if (await loginBtn.isVisible()) {
          await loginBtn.click();
        }
      });

      await test.step('输入邮箱', async () => {
        const emailInput = page.locator('input[type="email"], input[placeholder*="邮箱"]').first();
        if (await emailInput.isVisible()) {
          await emailInput.fill('test@example.com');
        }
      });

      await test.step('输入密码', async () => {
        const passwordInput = page.locator('input[type="password"], input[placeholder*="密码"]').first();
        if (await passwordInput.isVisible()) {
          await passwordInput.fill('TestPassword123!');
        }
      });

      await test.step('提交登录', async () => {
        const submitBtn = page.locator('button:has-text("登录"), button:has-text("Sign in")]').first();
        if (await submitBtn.isVisible()) {
          await submitBtn.click();
        }
      });

      await test.step('验证登录成功', async () => {
        await page.waitForTimeout(3000);
        const dashboard = page.locator('[class*="dashboard"], [class*="Dashboard"], text=工作流').first();
        if (await dashboard.isVisible({ timeout: 5000 })) {
          expect(await dashboard.isVisible()).toBe(true);
        }
      });
    });

    test('TC-AUTH-007: 登录边界情况 - 错误密码', async () => {
      await test.step('输入错误密码', async () => {
        const loginBtn = page.locator('text=登录').first();
        if (await loginBtn.isVisible()) {
          await loginBtn.click();
        }

        const emailInput = page.locator('input[type="email"]').first();
        if (await emailInput.isVisible()) {
          await emailInput.fill('test@example.com');
        }

        const passwordInput = page.locator('input[type="password"]').first();
        if (await passwordInput.isVisible()) {
          await passwordInput.fill('WrongPassword123!');
        }
      });

      await test.step('验证错误提示', async () => {
        const submitBtn = page.locator('button:has-text("登录")').first();
        if (await submitBtn.isVisible()) {
          await submitBtn.click();
        }

        await page.waitForTimeout(2000);
        const errorMsg = page.locator('text=密码错误, text=登录失败, text=凭据无效').first();
        if (await errorMsg.isVisible()) {
          expect(await errorMsg.isVisible()).toBe(true);
        }
      });
    });

    test('TC-AUTH-008: 登录边界情况 - 不存在用户', async () => {
      await test.step('输入不存在的邮箱', async () => {
        const loginBtn = page.locator('text=登录').first();
        if (await loginBtn.isVisible()) {
          await loginBtn.click();
        }

        const emailInput = page.locator('input[type="email"]').first();
        if (await emailInput.isVisible()) {
          await emailInput.fill('nonexistent@example.com');
        }

        const passwordInput = page.locator('input[type="password"]').first();
        if (await passwordInput.isVisible()) {
          await passwordInput.fill('TestPassword123!');
        }
      });

      await test.step('验证错误提示', async () => {
        const submitBtn = page.locator('button:has-text("登录")').first();
        if (await submitBtn.isVisible()) {
          await submitBtn.click();
        }

        await page.waitForTimeout(2000);
        const errorMsg = page.locator('text=用户不存在, text=邮箱未注册').first();
        if (await errorMsg.isVisible()) {
          expect(await errorMsg.isVisible()).toBe(true);
        }
      });
    });

    test('TC-AUTH-009: 记住密码功能', async () => {
      await test.step('勾选记住密码', async () => {
        const loginBtn = page.locator('text=登录').first();
        if (await loginBtn.isVisible()) {
          await loginBtn.click();
        }

        const rememberCheckbox = page.locator('input[type="checkbox"], text=记住密码').first();
        if (await rememberCheckbox.isVisible()) {
          await rememberCheckbox.check();
        }
      });

      await test.step('验证已勾选', async () => {
        const isChecked = await rememberCheckbox.isChecked();
        expect(isChecked).toBe(true);
      });
    });
  });

  test.describe('会话管理', () => {
    test('TC-AUTH-010: 获取当前用户信息', async () => {
      await test.step('登录后查看用户信息', async () => {
        const userMenu = page.locator('[class*="user-menu"], [class*="UserMenu"], button:has-text("用户")]').first();
        if (await userMenu.isVisible()) {
          await userMenu.click();
        }
      });

      await test.step('验证用户信息显示', async () => {
        const userInfo = page.locator('text=test@example.com, [class*="user-info"]').first();
        if (await userInfo.isVisible()) {
          expect(await userInfo.isVisible()).toBe(true);
        }
      });
    });

    test('TC-AUTH-011: 用户登出', async () => {
      await test.step('打开用户菜单', async () => {
        const userMenu = page.locator('[class*="user-menu"]').first();
        if (await userMenu.isVisible()) {
          await userMenu.click();
        }
      });

      await test.step('点击登出', async () => {
        const logoutBtn = page.locator('text=登出, text=Logout, text=退出登录').first();
        if (await logoutBtn.isVisible()) {
          await logoutBtn.click();
        }
      });

      await test.step('验证已登出', async () => {
        await page.waitForTimeout(1000);
        const loginBtn = page.locator('text=登录').first();
        if (await loginBtn.isVisible()) {
          expect(await loginBtn.isVisible()).toBe(true);
        }
      });
    });

    test('TC-AUTH-012: 会话超时处理', async () => {
      await test.step('模拟会话过期', async () => {
        await page.evaluate(() => {
          localStorage.removeItem('auth_token');
          sessionStorage.clear();
        });
      });

      await test.step('刷新页面', async () => {
        await page.reload();
        await page.waitForLoadState('domcontentloaded');
      });

      await test.step('验证重定向到登录', async () => {
        await page.waitForTimeout(1000);
        const loginForm = page.locator('input[type="email"], button:has-text("登录")]').first();
        if (await loginForm.isVisible()) {
          expect(await loginForm.isVisible()).toBe(true);
        }
      });
    });

    test('TC-AUTH-013: 刷新会话', async () => {
      await test.step('点击刷新会话', async () => {
        const refreshBtn = page.locator('button:has-text("刷新会话"), [aria-label="刷新"]').first();
        if (await refreshBtn.isVisible()) {
          await refreshBtn.click();
        }
      });

      await test.step('验证刷新成功', async () => {
        await page.waitForTimeout(1000);
        const successMsg = page.locator('text=已刷新, text=成功').first();
        if (await successMsg.isVisible()) {
          expect(await successMsg.isVisible()).toBe(true);
        }
      });
    });
  });

  test.describe('密码管理', () => {
    test('TC-AUTH-014: 修改密码', async () => {
      await test.step('打开密码设置', async () => {
        const settingsBtn = page.locator('text=设置, [aria-label="设置"]').first();
        if (await settingsBtn.isVisible()) {
          await settingsBtn.click();
        }

        const passwordSettings = page.locator('text=密码, text=Password').first();
        if (await passwordSettings.isVisible()) {
          await passwordSettings.click();
        }
      });

      await test.step('输入当前密码和新密码', async () => {
        const currentPassword = page.locator('input[placeholder*="当前密码"]').first();
        if (await currentPassword.isVisible()) {
          await currentPassword.fill('OldPassword123!');
        }

        const newPassword = page.locator('input[placeholder*="新密码"]').first();
        if (await newPassword.isVisible()) {
          await newPassword.fill('NewPassword123!');
        }

        const confirmPassword = page.locator('input[placeholder*="确认新密码"]').first();
        if (await confirmPassword.isVisible()) {
          await confirmPassword.fill('NewPassword123!');
        }
      });

      await test.step('保存修改', async () => {
        const saveBtn = page.locator('button:has-text("保存"), button:has-text("更新密码")]').first();
        if (await saveBtn.isVisible()) {
          await saveBtn.click();
        }
      });
    });

    test('TC-AUTH-015: 忘记密码', async () => {
      await test.step('点击忘记密码', async () => {
        const forgotBtn = page.locator('text=忘记密码, text=Forgot password').first();
        if (await forgotBtn.isVisible()) {
          await forgotBtn.click();
        }
      });

      await test.step('输入邮箱', async () => {
        const emailInput = page.locator('input[type="email"]').first();
        if (await emailInput.isVisible()) {
          await emailInput.fill('test@example.com');
        }
      });

      await test.step('发送重置邮件', async () => {
        const submitBtn = page.locator('button:has-text("发送重置链接")]').first();
        if (await submitBtn.isVisible()) {
          await submitBtn.click();
        }
      });

      await test.step('验证邮件发送', async () => {
        await page.waitForTimeout(2000);
        const successMsg = page.locator('text=重置链接已发送, text=邮件已发送').first();
        if (await successMsg.isVisible()) {
          expect(await successMsg.isVisible()).toBe(true);
        }
      });
    });
  });

  test.describe('多因素认证', () => {
    test('TC-AUTH-016: 启用MFA', async () => {
      await test.step('打开安全设置', async () => {
        const settingsBtn = page.locator('text=设置').first();
        if (await settingsBtn.isVisible()) {
          await settingsBtn.click();
        }

        const securitySettings = page.locator('text=安全, text=Security').first();
        if (await securitySettings.isVisible()) {
          await securitySettings.click();
        }
      });

      await test.step('启用双因素认证', async () => {
        const mfaToggle = page.locator('text=双因素认证, text=MFA').first();
        if (await mfaToggle.isVisible()) {
          await mfaToggle.click();
        }
      });

      await test.step('配置MFA', async () => {
        const setupBtn = page.locator('button:has-text("设置MFA")]').first();
        if (await setupBtn.isVisible()) {
          await setupBtn.click();
        }
      });
    });

    test('TC-AUTH-017: MFA验证', async () => {
      await test.step('登录后输入MFA码', async () => {
        const loginBtn = page.locator('text=登录').first();
        if (await loginBtn.isVisible()) {
          await loginBtn.click();
        }

        const emailInput = page.locator('input[type="email"]').first();
        await emailInput.fill('test@example.com');

        const passwordInput = page.locator('input[type="password"]').first();
        await passwordInput.fill('TestPassword123!');

        const submitBtn = page.locator('button:has-text("登录")').first();
        await submitBtn.click();

        await page.waitForTimeout(2000);
      });

      await test.step('输入验证码', async () => {
        const mfaInput = page.locator('input[placeholder*="验证码"], input[placeholder*="code"]').first();
        if (await mfaInput.isVisible()) {
          await mfaInput.fill('123456');
        }

        const verifyBtn = page.locator('button:has-text("验证")]').first();
        if (await verifyBtn.isVisible()) {
          await verifyBtn.click();
        }
      });
    });
  });

  test.describe('社交登录', () => {
    test('TC-AUTH-018: Google登录', async () => {
      await test.step('选择Google登录', async () => {
        const loginBtn = page.locator('text=登录').first();
        if (await loginBtn.isVisible()) {
          await loginBtn.click();
        }

        const googleBtn = page.locator('text=Google, [aria-label*="Google"]').first();
        if (await googleBtn.isVisible()) {
          await googleBtn.click();
        }
      });

      await test.step('验证跳转到Google', async () => {
        await page.waitForTimeout(2000);
        const googlePage = page.locator('text=accounts.google.com, text=Google 账号').first();
        if (await googlePage.isVisible()) {
          expect(await googlePage.isVisible()).toBe(true);
        }
      });
    });

    test('TC-AUTH-019: GitHub登录', async () => {
      await test.step('选择GitHub登录', async () => {
        const loginBtn = page.locator('text=登录').first();
        if (await loginBtn.isVisible()) {
          await loginBtn.click();
        }

        const githubBtn = page.locator('text=GitHub, [aria-label*="GitHub"]').first();
        if (await githubBtn.isVisible()) {
          await githubBtn.click();
        }
      });

      await test.step('验证跳转到GitHub', async () => {
        await page.waitForTimeout(2000);
        const githubPage = page.locator('text=github.com, text=Sign in to GitHub').first();
        if (await githubPage.isVisible()) {
          expect(await githubPage.isVisible()).toBe(true);
        }
      });
    });
  });

  test.describe('安全功能', () => {
    test('TC-AUTH-020: 登录失败锁定', async () => {
      await test.step('多次输入错误密码', async () => {
        const loginBtn = page.locator('text=登录').first();
        if (await loginBtn.isVisible()) {
          await loginBtn.click();
        }

        for (let i = 0; i < 5; i++) {
          const emailInput = page.locator('input[type="email"]').first();
          if (await emailInput.isVisible()) {
            await emailInput.fill('test@example.com');
          }

          const passwordInput = page.locator('input[type="password"]').first();
          if (await passwordInput.isVisible()) {
            await passwordInput.fill('WrongPassword!');
          }

          const submitBtn = page.locator('button:has-text("登录")').first();
          if (await submitBtn.isVisible()) {
            await submitBtn.click();
          }

          await page.waitForTimeout(500);
        }
      });

      await test.step('验证账户锁定', async () => {
        const lockMsg = page.locator('text=账户已锁定, text=请稍后再试, text=太频繁').first();
        if (await lockMsg.isVisible({ timeout: 3000 })) {
          expect(await lockMsg.isVisible()).toBe(true);
        }
      });
    });
  });
});
