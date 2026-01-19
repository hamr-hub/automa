/**
 * 简单的扩展功能测试
 * 验证扩展是否能成功执行基本功能
 */

import { test, expect, describe } from '@playwright/test';

describe('扩展功能测试', () => {
  test('验证浏览器正常启动', async ({ page }) => {
    // 访问一个普通网页，而不是chrome://页面
    await page.goto('https://example.com');
    await page.waitForLoadState('domcontentloaded');

    // 验证页面加载成功
    const pageTitle = page.locator('h1');
    await expect(pageTitle).toBeVisible({ timeout: 5000 });
    await expect(pageTitle).toHaveText('Example Domain');

    console.log('浏览器正常启动，页面加载成功！');
  });
});
