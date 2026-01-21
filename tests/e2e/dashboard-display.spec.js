import { test, expect, describe } from '@playwright/test';

describe('Dashboard显示测试', () => {
  test('从popup打开dashboard并验证显示', async ({ page, context }) => {
    console.log('开始测试dashboard显示...');

    // 首先打开popup页面
    const popupUrl = 'chrome-extension://build/popup.html';
    await page.goto(popupUrl);

    console.log('Popup页面URL:', page.url());

    // 等待popup加载完成
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    // 查找dashboard按钮
    const dashboardButton = page.locator(
      '[title*="Dashboard"], [title*="主面板"], button[variant="accent"]'
    );

    const buttonCount = await dashboardButton.count();
    console.log('找到的dashboard按钮数量:', buttonCount);

    if (buttonCount > 0) {
      // 点击第一个dashboard按钮
      await dashboardButton.first().click();
      console.log('已点击dashboard按钮');

      // 等待新标签页打开
      await page.waitForTimeout(1000);

      // 获取所有页面
      const pages = context.pages();
      console.log('当前打开的页面数量:', pages.length);

      // 查找dashboard页面
      const dashboardPage = pages.find((p) => p.url().includes('newtab.html'));

      if (dashboardPage) {
        console.log('Dashboard页面URL:', dashboardPage.url());

        // 等待页面加载
        await dashboardPage.waitForLoadState('domcontentloaded');
        await dashboardPage.waitForTimeout(3000);

        // 检查页面标题
        const title = await dashboardPage.title();
        console.log('Dashboard页面标题:', title);
        expect(title).toContain('Automa');

        // 检查#app元素是否存在
        const appDiv = dashboardPage.locator('#app');
        const appExists = await appDiv.count();
        console.log('#app元素数量:', appExists);
        expect(appExists).toBeGreaterThan(0);

        // 检查#app元素是否可见
        const isVisible = await appDiv.isVisible();
        console.log('#app元素是否可见:', isVisible);
        expect(isVisible).toBe(true);

        // 检查是否有加载中的spinner
        const spinner = dashboardPage.locator(
          '.ui-spinner, [class*="spinner"]'
        );
        const spinnerCount = await spinner.count();
        console.log('Spinner元素数量:', spinnerCount);

        // 检查是否有侧边栏
        const sidebar = dashboardPage.locator('.app-sidebar, aside');
        const sidebarCount = await sidebar.count();
        console.log('侧边栏元素数量:', sidebarCount);

        // 检查是否有主要内容区域
        const main = dashboardPage.locator('main');
        const mainCount = await main.count();
        console.log('Main元素数量:', mainCount);

        // 截图以便调试
        await dashboardPage.screenshot({
          path: 'test-dashboard-screenshot.png',
        });
        console.log('已保存截图: test-dashboard-screenshot.png');

        // 检查控制台错误
        const errors = [];
        dashboardPage.on('console', (msg) => {
          if (msg.type() === 'error') {
            errors.push(msg.text());
            console.error('控制台错误:', msg.text());
          }
        });

        // 等待一段时间，确保没有新的错误
        await dashboardPage.waitForTimeout(2000);

        if (errors.length > 0) {
          console.error('发现控制台错误:', errors);
        }

        // 检查页面内容
        const bodyText = await dashboardPage.locator('body').textContent();
        console.log('页面文本内容长度:', bodyText?.length || 0);

        // 如果页面是空白的，打印更多信息
        if (!bodyText || bodyText.length < 100) {
          console.error('警告: 页面内容可能为空或过少');
          console.error(
            '页面HTML:',
            await dashboardPage.locator('body').innerHTML()
          );
        }
      } else {
        console.error('未能找到dashboard页面');
        throw new Error('Dashboard页面未打开');
      }
    } else {
      console.error('未能找到dashboard按钮');
      throw new Error('Dashboard按钮未找到');
    }
  });

  test('直接访问dashboard页面', async ({ page }) => {
    console.log('直接访问dashboard页面...');

    // 直接访问newtab页面
    const dashboardUrl = 'chrome-extension://build/newtab.html#/workflows';
    await page.goto(dashboardUrl);

    console.log('Dashboard页面URL:', page.url());

    // 等待页面加载
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000);

    // 检查页面标题
    const title = await page.title();
    console.log('页面标题:', title);
    expect(title).toBeTruthy();

    // 检查#app元素
    const appDiv = page.locator('#app');
    const isVisible = await appDiv.isVisible();
    console.log('#app元素是否可见:', isVisible);
    expect(isVisible).toBe(true);

    // 检查是否有内容
    const bodyText = await page.locator('body').textContent();
    console.log('页面文本内容长度:', bodyText?.length || 0);

    // 截图
    await page.screenshot({ path: 'test-direct-dashboard-screenshot.png' });
    console.log('已保存截图: test-direct-dashboard-screenshot.png');
  });
});
