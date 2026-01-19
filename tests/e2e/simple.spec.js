/**
 * 简单的扩展加载测试
 * 验证扩展是否能成功加载
 */

import { test, expect, describe } from '@playwright/test';

describe('扩展加载测试', () => {
  test('验证扩展加载成功', async ({ page }) => {
    // 访问Chrome扩展管理页面
    await page.goto('chrome://extensions/');
    await page.waitForLoadState('domcontentloaded');
    
    // 验证扩展列表中存在Automa扩展
    const extensionName = page.locator('text=Automa-Dev');
    await expect(extensionName).toBeVisible({ timeout: 5000 });
    
    console.log('扩展加载成功！');
  });
});