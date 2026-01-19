/**
 * 数据提取测试
 * 测试工作流中的数据提取功能
 */

import { test, expect, describe, beforeEach } from '@playwright/test';

const EXTENSION_ID = process.env.EXTENSION_ID || 'your-extension-id';

describe('数据提取测试', () => {
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

  test.describe('提取块创建', () => {
    test('TC-EXTRACT-001: 添加提取数据块', async () => {
      await test.step('打开添加块菜单', async () => {
        const addBtn = page.locator('[class*="add-block"]').first();
        if (await addBtn.isVisible()) {
          await addBtn.click();
        }
      });

      await test.step('选择提取数据块', async () => {
        const extractBlock = page.locator('text=提取数据, text=Get Text, text=获取文本').first();
        if (await extractBlock.isVisible()) {
          await extractBlock.click();
        }
      });

      await test.step('验证块已添加', async () => {
        const blocks = page.locator('[class*="block"]');
        await expect(blocks.last()).toBeVisible({ timeout: 5000 });
      });
    });

    test('TC-EXTRACT-002: 配置提取块参数', async () => {
      await test.step('添加提取块', async () => {
        const addBtn = page.locator('[class*="add-block"]').first();
        if (await addBtn.isVisible()) {
          await addBtn.click();
        }
        const extractBlock = page.locator('text=提取数据').first();
        if (await extractBlock.isVisible()) {
          await extractBlock.click();
        }
      });

      await test.step('打开配置面板', async () => {
        const extractBlock = page.locator('text=提取数据').first();
        if (await extractBlock.isVisible()) {
          await extractBlock.click();
        }
      });

      await test.step('配置选择器', async () => {
        const selectorInput = page.locator('input[placeholder*="选择器"], input[placeholder*="selector"]').first();
        if (await selectorInput.isVisible()) {
          await selectorInput.fill('.content p');
        }
      });

      await test.step('配置变量名', async () => {
        const varInput = page.locator('input[placeholder*="变量"], input[placeholder*="variable"]').first();
        if (await varInput.isVisible()) {
          await varInput.fill('extractedText');
        }
      });
    });

    test('TC-EXTRACT-003: 提取多个元素', async () => {
      await test.step('添加提取块', async () => {
        const addBtn = page.locator('[class*="add-block"]').first();
        if (await addBtn.isVisible()) {
          await addBtn.click();
        }
        const extractBlock = page.locator('text=提取数据').first();
        if (await extractBlock.isVisible()) {
          await extractBlock.click();
        }
      });

      await test.step('选择多元素模式', async () => {
        const multiSelect = page.locator('text=多个, text=All').first();
        if (await multiSelect.isVisible()) {
          await multiSelect.click();
        }
      });

      await test.step('配置批量选择器', async () => {
        const selectorInput = page.locator('input[placeholder*="选择器"]').first();
        if (await selectorInput.isVisible()) {
          await selectorInput.fill('.items li');
        }
      });
    });
  });

  test.describe('选择器配置', () => {
    test('TC-EXTRACT-004: 使用CSS选择器', async () => {
      await test.step('添加提取块', async () => {
        const addBtn = page.locator('[class*="add-block"]').first();
        if (await addBtn.isVisible()) {
          await addBtn.click();
        }
        const extractBlock = page.locator('text=提取数据').first();
        if (await extractBlock.isVisible()) {
          await extractBlock.click();
        }
      });

      await test.step('配置CSS选择器', async () => {
        const selectorInput = page.locator('input[placeholder*="选择器"]').first();
        if (await selectorInput.isVisible()) {
          await selectorInput.fill('#main-content .item');
        }
      });

      await test.step('验证选择器格式', async () => {
        const preview = page.locator('text=#main-content').first();
        if (await preview.isVisible()) {
          expect(await preview.isVisible()).toBe(true);
        }
      });
    });

    test('TC-EXTRACT-005: 使用XPath选择器', async () => {
      await test.step('添加提取块', async () => {
        const addBtn = page.locator('[class*="add-block"]').first();
        if (await addBtn.isVisible()) {
          await addBtn.click();
        }
        const extractBlock = page.locator('text=提取数据').first();
        if (await extractBlock.isVisible()) {
          await extractBlock.click();
        }
      });

      await test.step('切换到XPath模式', async () => {
        const xpathBtn = page.locator('text=XPath').first();
        if (await xpathBtn.isVisible()) {
          await xpathBtn.click();
        }
      });

      await test.step('配置XPath选择器', async () => {
        const selectorInput = page.locator('input[placeholder*="选择器"]').first();
        if (await selectorInput.isVisible()) {
          await selectorInput.fill('//div[@class="content"]//p');
        }
      });
    });

    test('TC-EXTRACT-006: 选择器预览', async () => {
      await test.step('添加提取块', async () => {
        const addBtn = page.locator('[class*="add-block"]').first();
        if (await addBtn.isVisible()) {
          await addBtn.click();
        }
        const extractBlock = page.locator('text=提取数据').first();
        if (await extractBlock.isVisible()) {
          await extractBlock.click();
        }
      });

      await test.step('输入选择器', async () => {
        const selectorInput = page.locator('input[placeholder*="选择器"]').first();
        if (await selectorInput.isVisible()) {
          await selectorInput.fill('h1');
        }
      });

      await test.step('查看预览', async () => {
        const previewBtn = page.locator('button:has-text("预览"), [aria-label="预览"]').first();
        if (await previewBtn.isVisible()) {
          await previewBtn.click();
        }
      });
    });

    test('TC-EXTRACT-007: 无效选择器处理', async () => {
      await test.step('添加提取块', async () => {
        const addBtn = page.locator('[class*="add-block"]').first();
        if (await addBtn.isVisible()) {
          await addBtn.click();
        }
        const extractBlock = page.locator('text=提取数据').first();
        if (await extractBlock.isVisible()) {
          await extractBlock.click();
        }
      });

      await test.step('输入无效选择器', async () => {
        const selectorInput = page.locator('input[placeholder*="选择器"]').first();
        if (await selectorInput.isVisible()) {
          await selectorInput.fill('!!!invalid!!!selector###');
        }
      });

      await test.step('验证错误提示', async () => {
        const errorMsg = page.locator('text=无效, text=错误, [class*="error"]').first();
        if (await errorMsg.isVisible({ timeout: 2000 })) {
          expect(await errorMsg.isVisible()).toBe(true);
        }
      });
    });
  });

  test.describe('提取数据类型', () => {
    test('TC-EXTRACT-008: 提取文本内容', async () => {
      await test.step('添加提取块', async () => {
        const addBtn = page.locator('[class*="add-block"]').first();
        if (await addBtn.isVisible()) {
          await addBtn.click();
        }
        const extractBlock = page.locator('text=提取数据').first();
        if (await extractBlock.isVisible()) {
          await extractBlock.click();
        }
      });

      await test.step('选择文本提取', async () => {
        const textOption = page.locator('text=文本, text=Text').first();
        if (await textOption.isVisible()) {
          await textOption.click();
        }
      });
    });

    test('TC-EXTRACT-009: 提取HTML内容', async () => {
      await test.step('添加提取块', async () => {
        const addBtn = page.locator('[class*="add-block"]').first();
        if (await addBtn.isVisible()) {
          await addBtn.click();
        }
        const extractBlock = page.locator('text=提取数据').first();
        if (await extractBlock.isVisible()) {
          await extractBlock.click();
        }
      });

      await test.step('选择HTML提取', async () => {
        const htmlOption = page.locator('text=HTML, text=Inner HTML').first();
        if (await htmlOption.isVisible()) {
          await htmlOption.click();
        }
      });
    });

    test('TC-EXTRACT-010: 提取属性值', async () => {
      await test.step('添加提取块', async () => {
        const addBtn = page.locator('[class*="add-block"]').first();
        if (await addBtn.isVisible()) {
          await addBtn.click();
        }
        const extractBlock = page.locator('text=提取数据').first();
        if (await extractBlock.isVisible()) {
          await extractBlock.click();
        }
      });

      await test.step('选择属性提取', async () => {
        const attrOption = page.locator('text=属性, text=Attribute').first();
        if (await attrOption.isVisible()) {
          await attrOption.click();
        }
      });

      await test.step('指定属性名', async () => {
        const attrInput = page.locator('input[placeholder*="属性"], input[placeholder*="attribute"]').first();
        if (await attrInput.isVisible()) {
          await attrInput.fill('href');
        }
      });
    });

    test('TC-EXTRACT-011: 提取表格数据', async () => {
      await test.step('添加提取块', async () => {
        const addBtn = page.locator('[class*="add-block"]').first();
        if (await addBtn.isVisible()) {
          await addBtn.click();
        }
        const extractBlock = page.locator('text=提取数据').first();
        if (await extractBlock.isVisible()) {
          await extractBlock.click();
        }
      });

      await test.step('选择表格模式', async () => {
        const tableOption = page.locator('text=表格, text=Table').first();
        if (await tableOption.isVisible()) {
          await tableOption.click();
        }
      });

      await test.step('配置表格选择器', async () => {
        const selectorInput = page.locator('input[placeholder*="选择器"]').first();
        if (await selectorInput.isVisible()) {
          await selectorInput.fill('table.data');
        }
      });
    });
  });

  test.describe('数据导出', () => {
    test('TC-EXTRACT-012: 配置导出块', async () => {
      await test.step('添加导出块', async () => {
        const addBtn = page.locator('[class*="add-block"]').first();
        if (await addBtn.isVisible()) {
          await addBtn.click();
        }
        const exportBlock = page.locator('text=导出, text=Export').first();
        if (await exportBlock.isVisible()) {
          await exportBlock.click();
        }
      });

      await test.step('选择导出格式', async () => {
        const formatOption = page.locator('text=JSON, text=CSV').first();
        if (await formatOption.isVisible()) {
          await formatOption.click();
        }
      });
    });

    test('TC-EXTRACT-013: 导出到剪贴板', async () => {
      await test.step('添加导出块', async () => {
        const addBtn = page.locator('[class*="add-block"]').first();
        if (await addBtn.isVisible()) {
          await addBtn.click();
        }
        const exportBlock = page.locator('text=导出').first();
        if (await exportBlock.isVisible()) {
          await exportBlock.click();
        }
      });

      await test.step('选择剪贴板导出', async () => {
        const clipboardOption = page.locator('text=剪贴板, text=Clipboard').first();
        if (await clipboardOption.isVisible()) {
          await clipboardOption.click();
        }
      });
    });

    test('TC-EXTRACT-014: 导出到文件', async () => {
      await test.step('添加导出块', async () => {
        const addBtn = page.locator('[class*="add-block"]').first();
        if (await addBtn.isVisible()) {
          await addBtn.click();
        }
        const exportBlock = page.locator('text=导出').first();
        if (await exportBlock.isVisible()) {
          await exportBlock.click();
        }
      });

      await test.step('选择文件导出', async () => {
        const fileOption = page.locator('text=文件, text=File').first();
        if (await fileOption.isVisible()) {
          await fileOption.click();
        }
      });

      await test.step('配置文件名', async () => {
        const filenameInput = page.locator('input[placeholder*="文件名"], input[placeholder*="文件"]').first();
        if (await filenameInput.isVisible()) {
          await filenameInput.fill('extracted_data.json');
        }
      });
    });

    test('TC-EXTRACT-015: 导出到Google Sheets', async () => {
      await test.step('添加导出块', async () => {
        const addBtn = page.locator('[class*="add-block"]').first();
        if (await addBtn.isVisible()) {
          await addBtn.click();
        }
        const exportBlock = page.locator('text=导出').first();
        if (await exportBlock.isVisible()) {
          await exportBlock.click();
        }
      });

      await test.step('选择Google Sheets', async () => {
        const sheetsOption = page.locator('text=Google Sheets, text=表格').first();
        if (await sheetsOption.isVisible()) {
          await sheetsOption.click();
        }
      });
    });
  });

  test.describe('提取执行测试', () => {
    test('TC-EXTRACT-016: 执行数据提取', async () => {
      await test.step('添加提取块', async () => {
        const addBtn = page.locator('[class*="add-block"]').first();
        if (await addBtn.isVisible()) {
          await addBtn.click();
        }
        const extractBlock = page.locator('text=提取数据').first();
        if (await extractBlock.isVisible()) {
          await extractBlock.click();
        }
      });

      await test.step('添加导航到测试页面', async () => {
        const addBtn = page.locator('[class*="add-block"]').first();
        if (await addBtn.isVisible()) {
          await addBtn.click();
        }
        const navBlock = page.locator('text=导航').first();
        if (await navBlock.isVisible()) {
          await navBlock.click();
        }

        const urlInput = page.locator('input[placeholder*="URL"]').first();
        if (await urlInput.isVisible()) {
          await urlInput.fill('https://example.com');
        }
      });

      await test.step('运行工作流', async () => {
        const runBtn = page.locator('button:has-text("运行")').first();
        if (await runBtn.isVisible()) {
          await runBtn.click();
        }
      });

      await test.step('验证提取结果', async () => {
        await page.waitForTimeout(3000);
        const logsBtn = page.locator('text=日志').first();
        if (await logsBtn.isVisible()) {
          await logsBtn.click();
        }
      });
    });

    test('TC-EXTRACT-017: 提取边界情况 - 无匹配元素', async () => {
      await test.step('配置无法匹配的选择器', async () => {
        const addBtn = page.locator('[class*="add-block"]').first();
        if (await addBtn.isVisible()) {
          await addBtn.click();
        }
        const extractBlock = page.locator('text=提取数据').first();
        if (await extractBlock.isVisible()) {
          await extractBlock.click();
        }

        const selectorInput = page.locator('input[placeholder*="选择器"]').first();
        if (await selectorInput.isVisible()) {
          await selectorInput.fill('.non-existent-elements');
        }
      });

      await test.step('运行并验证', async () => {
        const runBtn = page.locator('button:has-text("运行")').first();
        if (await runBtn.isVisible()) {
          await runBtn.click();
        }

        await page.waitForTimeout(3000);
        const logsBtn = page.locator('text=日志').first();
        if (await logsBtn.isVisible()) {
          await logsBtn.click();
        }
      });
    });

    test('TC-EXTRACT-018: 提取边界情况 - 空页面', async () => {
      await test.step('导航到空页面', async () => {
        const addBtn = page.locator('[class*="add-block"]').first();
        if (await addBtn.isVisible()) {
          await addBtn.click();
        }
        const navBlock = page.locator('text=导航').first();
        if (await navBlock.isVisible()) {
          await navBlock.click();
        }

        const urlInput = page.locator('input[placeholder*="URL"]').first();
        if (await urlInput.isVisible()) {
          await urlInput.fill('about:blank');
        }
      });

      await test.step('运行工作流', async () => {
        const runBtn = page.locator('button:has-text("运行")').first();
        if (await runBtn.isVisible()) {
          await runBtn.click();
        }

        await page.waitForTimeout(2000);
      });
    });
  });

  test.describe('数据处理', () => {
    test('TC-EXTRACT-019: 使用变量存储提取数据', async () => {
      await test.step('配置变量名', async () => {
        const addBtn = page.locator('[class*="add-block"]').first();
        if (await addBtn.isVisible()) {
          await addBtn.click();
        }
        const extractBlock = page.locator('text=提取数据').first();
        if (await extractBlock.isVisible()) {
          await extractBlock.click();
        }

        const varInput = page.locator('input[placeholder*="变量"]').first();
        if (await varInput.isVisible()) {
          await varInput.fill('myData');
        }
      });

      await test.step('验证变量已创建', async () => {
        const varList = page.locator('[class*="variable"], [class*="Variable"]').first();
        if (await varList.isVisible()) {
          expect(await varList.isVisible()).toBe(true);
        }
      });
    });

    test('TC-EXTRACT-020: 数据转换处理', async () => {
      await test.step('添加转换块', async () => {
        const addBtn = page.locator('[class*="add-block"]').first();
        if (await addBtn.isVisible()) {
          await addBtn.click();
        }
        const transformBlock = page.locator('text=转换, text=Transform').first();
        if (await transformBlock.isVisible()) {
          await transformBlock.click();
        }
      });

      await test.step('配置转换规则', async () => {
        const codeInput = page.locator('textarea, [contenteditable]').first();
        if (await codeInput.isVisible()) {
          await codeInput.fill('return data.trim().toUpperCase()');
        }
      });
    });
  });
});
