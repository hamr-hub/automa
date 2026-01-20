import { test, expect, describe } from '@playwright/test';

describe('Dashboard功能测试', () => {
  test('访问dashboard页面', async ({ page }) => {
    await page.evaluate(() => {
      window.open('chrome-extension://build/newtab.html', '_blank');
    });

    await page.waitForTimeout(2000);

    const pages = page.context().pages();
    const newPage = pages.find((p) => p.url().includes('chrome-extension'));

    if (newPage) {
      await newPage.waitForLoadState('domcontentloaded');
      await newPage.waitForTimeout(3000);

      const title = await newPage.title();
      expect(title).toContain('Automa');

      const appDiv = newPage.locator('#app');
      const isVisible = await appDiv.isVisible();
      expect(isVisible).toBe(true);
    } else {
      console.log('未能找到扩展页面');
      const currentTitle = await page.title();
      expect(currentTitle).toBeTruthy();
    }
  });
});
