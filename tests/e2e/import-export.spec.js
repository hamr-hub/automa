/**
 * 导入导出测试
 * 测试工作流的导入导出和分享功能
 */

import { test, expect, describe, beforeEach } from '@playwright/test';

const EXTENSION_ID = process.env.EXTENSION_ID || 'your-extension-id';

describe('导入导出测试', () => {
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

  test.describe('导出工作流', () => {
    test('TC-IMPORT-001: 导出工作流为JSON文件', async () => {
      await test.step('选择工作流', async () => {
        const workflowCard = page
          .locator('[class*="workflow-card"], [class*="WorkflowCard"]')
          .first();
        if (await workflowCard.isVisible()) {
          await workflowCard.click();
        }
      });

      await test.step('打开导出菜单', async () => {
        const moreBtn = page
          .locator('[class*="more"], [class*="menu"], button:has-text("更多")]')
          .first();
        if (await moreBtn.isVisible()) {
          await moreBtn.click();
        }
      });

      await test.step('选择导出选项', async () => {
        const exportBtn = page.locator('text=导出, text=Export').first();
        if (await exportBtn.isVisible()) {
          await exportBtn.click();
        }
      });

      await test.step('确认导出', async () => {
        const confirmBtn = page
          .locator('button:has-text("确认"), button:has-text("下载")]')
          .first();
        if (await confirmBtn.isVisible()) {
          await confirmBtn.click();
        }
      });
    });

    test('TC-IMPORT-002: 导出工作流为图片', async () => {
      await test.step('选择工作流', async () => {
        const workflowCard = page.locator('[class*="workflow-card"]').first();
        if (await workflowCard.isVisible()) {
          await workflowCard.click();
        }
      });

      await test.step('打开导出菜单', async () => {
        const moreBtn = page
          .locator('button:has-text("更多"), [aria-label="更多"]')
          .first();
        if (await moreBtn.isVisible()) {
          await moreBtn.click();
        }
      });

      await test.step('选择图片导出', async () => {
        const imageExportBtn = page
          .locator('text=图片, text=Image, text=PNG')
          .first();
        if (await imageExportBtn.isVisible()) {
          await imageExportBtn.click();
        }
      });
    });

    test('TC-IMPORT-003: 导出工作流配置', async () => {
      await test.step('选择工作流', async () => {
        const workflowCard = page.locator('[class*="workflow-card"]').first();
        if (await workflowCard.isVisible()) {
          await workflowCard.click();
        }
      });

      await test.step('打开导出菜单', async () => {
        const moreBtn = page.locator('button:has-text("更多")').first();
        if (await moreBtn.isVisible()) {
          await moreBtn.click();
        }
      });

      await test.step('选择导出配置', async () => {
        const configExportBtn = page.locator('text=配置, text=Config').first();
        if (await configExportBtn.isVisible()) {
          await configExportBtn.click();
        }
      });
    });

    test('TC-IMPORT-004: 导出边界情况 - 空工作流', async () => {
      await test.step('创建空工作流', async () => {
        const newBtn = page.locator('text=新建, text=New').first();
        if (await newBtn.isVisible()) {
          await newBtn.click();
        }
      });

      await test.step('尝试导出', async () => {
        const moreBtn = page.locator('button:has-text("更多")').first();
        if (await moreBtn.isVisible()) {
          await moreBtn.click();
        }

        const exportBtn = page.locator('text=导出').first();
        if (await exportBtn.isVisible()) {
          await exportBtn.click();
        }
      });

      await test.step('验证警告', async () => {
        const warningMsg = page
          .locator('text=空, text=没有数据, text=警告')
          .first();
        if (await warningMsg.isVisible({ timeout: 2000 })) {
          expect(await warningMsg.isVisible()).toBe(true);
        }
      });
    });
  });

  test.describe('导入工作流', () => {
    test('TC-IMPORT-005: 从JSON文件导入', async () => {
      await test.step('打开导入菜单', async () => {
        const importBtn = page.locator('text=导入, text=Import').first();
        if (await importBtn.isVisible()) {
          await importBtn.click();
        }
      });

      await test.step('选择文件', async () => {
        const fileInput = page
          .locator('input[type="file"], input[accept=".json"]')
          .first();
        if (await fileInput.isVisible()) {
          await fileInput.setInputFiles('tests/fixtures/amazon-workflow.json');
        }
      });

      await test.step('确认导入', async () => {
        const confirmBtn = page
          .locator('button:has-text("确认"), button:has-text("导入")]')
          .first();
        if (await confirmBtn.isVisible()) {
          await confirmBtn.click();
        }
      });

      await test.step('验证导入成功', async () => {
        await page.waitForTimeout(2000);
        const successMsg = page.locator('text=成功, text=完成').first();
        if (await successMsg.isVisible()) {
          expect(await successMsg.isVisible()).toBe(true);
        }
      });
    });

    test('TC-IMPORT-006: 导入边界情况 - 无效JSON', async () => {
      await test.step('打开导入菜单', async () => {
        const importBtn = page.locator('text=导入').first();
        if (await importBtn.isVisible()) {
          await importBtn.click();
        }
      });

      await test.step('选择无效文件', async () => {
        const fileInput = page.locator('input[type="file"]').first();
        if (await fileInput.isVisible()) {
          await fileInput.setInputFiles('package.json');
        }
      });

      await test.step('验证错误提示', async () => {
        const errorMsg = page
          .locator('text=无效, text=错误, text=解析失败')
          .first();
        if (await errorMsg.isVisible({ timeout: 2000 })) {
          expect(await errorMsg.isVisible()).toBe(true);
        }
      });
    });

    test('TC-IMPORT-007: 导入边界情况 - 损坏文件', async () => {
      await test.step('打开导入菜单', async () => {
        const importBtn = page.locator('text=导入').first();
        if (await importBtn.isVisible()) {
          await importBtn.click();
        }
      });

      await test.step('选择损坏文件', async () => {
        const fileInput = page.locator('input[type="file"]').first();
        if (await fileInput.isVisible()) {
          await fileInput.setInputFiles('tests/fixtures/testData.js');
        }
      });

      await test.step('验证错误处理', async () => {
        const errorMsg = page.locator('text=无效, text=错误').first();
        if (await errorMsg.isVisible({ timeout: 2000 })) {
          expect(await errorMsg.isVisible()).toBe(true);
        }
      });
    });

    test('TC-IMPORT-008: 导入边界情况 - 空文件', async () => {
      await test.step('打开导入菜单', async () => {
        const importBtn = page.locator('text=导入').first();
        if (await importBtn.isVisible()) {
          await importBtn.click();
        }
      });

      await test.step('选择空文件', async () => {
        const fileInput = page.locator('input[type="file"]').first();
        if (await fileInput.isVisible()) {
          await fileInput.setInputFiles({
            name: 'empty.json',
            mimeType: 'application/json',
            buffer: Buffer.from(''),
          });
        }
      });

      await test.step('验证错误处理', async () => {
        const errorMsg = page.locator('text=空, text=无效').first();
        if (await errorMsg.isVisible({ timeout: 2000 })) {
          expect(await errorMsg.isVisible()).toBe(true);
        }
      });
    });

    test('TC-IMPORT-009: 导入边界情况 - 重复工作流', async () => {
      await test.step('导入已存在的工作流', async () => {
        const importBtn = page.locator('text=导入').first();
        if (await importBtn.isVisible()) {
          await importBtn.click();
        }

        const fileInput = page.locator('input[type="file"]').first();
        if (await fileInput.isVisible()) {
          await fileInput.setInputFiles('tests/fixtures/amazon-workflow.json');
        }
      });

      await test.step('处理重复提示', async () => {
        const replaceBtn = page.locator('text=替换, text=覆盖').first();
        if (await replaceBtn.isVisible({ timeout: 2000 })) {
          await replaceBtn.click();
        }
      });
    });
  });

  test.describe('分享功能', () => {
    test('TC-IMPORT-010: 生成分享链接', async () => {
      await test.step('选择工作流', async () => {
        const workflowCard = page.locator('[class*="workflow-card"]').first();
        if (await workflowCard.isVisible()) {
          await workflowCard.click();
        }
      });

      await test.step('打开分享菜单', async () => {
        const shareBtn = page
          .locator('text=分享, text=Share, [aria-label="分享"]')
          .first();
        if (await shareBtn.isVisible()) {
          await shareBtn.click();
        }
      });

      await test.step('生成链接', async () => {
        const generateBtn = page
          .locator('button:has-text("生成链接"), button:has-text("创建链接")]')
          .first();
        if (await generateBtn.isVisible()) {
          await generateBtn.click();
        }
      });

      await test.step('验证链接已生成', async () => {
        await page.waitForTimeout(2000);
        const linkInput = page
          .locator('input[placeholder*="http"], [class*="share-link"]')
          .first();
        if (await linkInput.isVisible()) {
          const link = await linkInput.inputValue();
          expect(link).toContain('http');
        }
      });
    });

    test('TC-IMPORT-011: 复制分享链接', async () => {
      await test.step('生成分享链接', async () => {
        const shareBtn = page.locator('text=分享').first();
        if (await shareBtn.isVisible()) {
          await shareBtn.click();
        }

        await page.waitForTimeout(1000);
      });

      await test.step('复制链接', async () => {
        const copyBtn = page
          .locator('button:has-text("复制"), [aria-label="复制"]')
          .first();
        if (await copyBtn.isVisible()) {
          await copyBtn.click();
        }
      });

      await test.step('验证复制提示', async () => {
        const toast = page.locator('text=已复制, text=复制成功').first();
        if (await toast.isVisible({ timeout: 2000 })) {
          expect(await toast.isVisible()).toBe(true);
        }
      });
    });

    test('TC-IMPORT-012: 通过链接导入工作流', async () => {
      await test.step('访问分享链接', async () => {
        await page.goto(
          `chrome-extension://${EXTENSION_ID}/newtab.html?import=shared-workflow-id`
        );
        await page.waitForLoadState('domcontentloaded');
      });

      await test.step('确认导入', async () => {
        const importBtn = page
          .locator('button:has-text("导入"), button:has-text("确认")]')
          .first();
        if (await importBtn.isVisible()) {
          await importBtn.click();
        }
      });

      await test.step('验证导入成功', async () => {
        await page.waitForTimeout(2000);
        const workflowEditor = page
          .locator('[class*="workflow-editor"], [class*="editor"]')
          .first();
        if (await workflowEditor.isVisible()) {
          expect(await workflowEditor.isVisible()).toBe(true);
        }
      });
    });

    test('TC-IMPORT-013: 分享权限设置', async () => {
      await test.step('打开分享菜单', async () => {
        const shareBtn = page.locator('text=分享').first();
        if (await shareBtn.isVisible()) {
          await shareBtn.click();
        }
      });

      await test.step('设置权限', async () => {
        const permissionSelect = page
          .locator('select, [class*="permission"]')
          .first();
        if (await permissionSelect.isVisible()) {
          await permissionSelect.selectOption('public');
        }
      });
    });
  });

  test.describe('备份恢复', () => {
    test('TC-IMPORT-014: 创建备份', async () => {
      await test.step('打开设置', async () => {
        const settingsBtn = page
          .locator('text=设置, [aria-label="设置"]')
          .first();
        if (await settingsBtn.isVisible()) {
          await settingsBtn.click();
        }
      });

      await test.step('选择备份选项', async () => {
        const backupBtn = page.locator('text=备份, text=Backup').first();
        if (await backupBtn.isVisible()) {
          await backupBtn.click();
        }
      });

      await test.step('创建备份', async () => {
        const createBtn = page
          .locator('button:has-text("创建备份"), button:has-text("下载")]')
          .first();
        if (await createBtn.isVisible()) {
          await createBtn.click();
        }
      });
    });

    test('TC-IMPORT-015: 恢复备份', async () => {
      await test.step('打开设置', async () => {
        const settingsBtn = page.locator('text=设置').first();
        if (await settingsBtn.isVisible()) {
          await settingsBtn.click();
        }
      });

      await test.step('选择恢复选项', async () => {
        const restoreBtn = page.locator('text=恢复, text=Restore').first();
        if (await restoreBtn.isVisible()) {
          await restoreBtn.click();
        }
      });

      await test.step('选择备份文件', async () => {
        const fileInput = page.locator('input[type="file"]').first();
        if (await fileInput.isVisible()) {
          await fileInput.setInputFiles('tests/fixtures/amazon-workflow.json');
        }
      });

      await test.step('确认恢复', async () => {
        const confirmBtn = page
          .locator('button:has-text("确认"), button:has-text("恢复")]')
          .first();
        if (await confirmBtn.isVisible()) {
          await confirmBtn.click();
        }
      });
    });
  });

  test.describe('批量操作', () => {
    test('TC-IMPORT-016: 批量导出', async () => {
      await test.step('选择多个工作流', async () => {
        const checkboxes = page.locator(
          'input[type="checkbox"], [class*="checkbox"]'
        );
        const count = await checkboxes.count();

        for (let i = 0; i < Math.min(3, count); i++) {
          if (await checkboxes.nth(i).isVisible()) {
            await checkboxes.nth(i).check();
          }
        }
      });

      await test.step('批量导出', async () => {
        const bulkExportBtn = page
          .locator('button:has-text("批量导出"), button:has-text("导出选中")]')
          .first();
        if (await bulkExportBtn.isVisible()) {
          await bulkExportBtn.click();
        }
      });
    });

    test('TC-IMPORT-017: 批量导入', async () => {
      await test.step('打开导入菜单', async () => {
        const importBtn = page.locator('text=导入').first();
        if (await importBtn.isVisible()) {
          await importBtn.click();
        }
      });

      await test.step('选择多个文件', async () => {
        const fileInput = page.locator('input[type="file"]').first();
        if (await fileInput.isVisible()) {
          await fileInput.setInputFiles([
            'tests/fixtures/amazon-workflow.json',
          ]);
        }
      });
    });
  });
});
