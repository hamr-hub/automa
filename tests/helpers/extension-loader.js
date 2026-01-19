/**
 * Chrome扩展测试启动器
 * 使用Playwright加载扩展进行测试
 */

import { chromium } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const EXTENSION_PATH = path.join(__dirname, '..', 'dist', 'chrome');

async function launchBrowserWithExtension(extensionPath = EXTENSION_PATH) {
  const browser = await chromium.launch({
    headless: false,
    args: [
      `--load-extension=${extensionPath}`,
      '--disable-extensions-except=' + extensionPath,
      '--enable-extensions',
    ],
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  return { browser, context, page };
}

async function getExtensionIds(extensionPath = EXTENSION_PATH) {
  const browser = await chromium.launch({
    headless: true,
    args: [`--load-extension=${extensionPath}`],
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('chrome://extensions');
  await page.waitForLoadState('domcontentloaded');

  const extensions = await page.evaluate(() => {
    const items = document.querySelectorAll('extensions-item-list > template');
    return Array.from(items).map(item => {
      const name = item.shadowRoot?.querySelector('div.name')?.textContent || 'Unknown';
      const id = item.getAttribute('id') || 'Unknown';
      return { name, id };
    });
  });

  await browser.close();
  return extensions;
}

async function installExtension(page, extensionPath = EXTENSION_PATH) {
  await page.goto('chrome://extensions');
  await page.waitForLoadState('domcontentloaded');

  const enableDevModeBtn = page.locator('text=开发者模式').first();
  if (await enableDevModeBtn.isVisible()) {
    await enableDevModeBtn.click();
  }

  const loadUnpackedBtn = page.locator('text=加载已解压的扩展程序').first();
  if (await loadUnpackedBtn.isVisible()) {
    await loadUnpackedBtn.click();
    await page.waitForTimeout(500);

    const dialog = page.locator('dialog[open], [role="dialog"]').first();
    if (await dialog.isVisible()) {
      const input = dialog.locator('input[type="directory"], input[webkitdirectory]').first();
      if (await input.isVisible()) {
        await input.setInputFiles(extensionPath);
      }
    }
  }
}

export {
  launchBrowserWithExtension,
  getExtensionIds,
  installExtension,
  EXTENSION_PATH,
};

export default {
  launchBrowserWithExtension,
  getExtensionIds,
  installExtension,
  EXTENSION_PATH,
};
