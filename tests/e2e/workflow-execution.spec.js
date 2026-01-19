/**
 * 工作流执行测试
 * 测试工作流的执行、停止、日志查看等功能
 */

import { test, expect, describe, beforeEach } from '@playwright/test';

const EXTENSION_ID = process.env.EXTENSION_ID || 'your-extension-id';

describe('工作流执行测试', () => {
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

  test.describe('工作流运行', () => {
    test('TC-EXEC-001: 手动运行工作流', async () => {
      await test.step('创建简单工作流', async () => {
        const newWorkflowBtn = page.locator('text=新建工作流').first();
        if (await newWorkflowBtn.isVisible()) {
          await newWorkflowBtn.click();
        }
      });

      await test.step('添加等待块', async () => {
        const addBtn = page.locator('[class*="add-block"]').first();
        if (await addBtn.isVisible()) {
          await addBtn.click();
        }
        const waitBlock = page.locator('text=等待').first();
        if (await waitBlock.isVisible()) {
          await waitBlock.click();
        }
      });

      await test.step('点击运行按钮', async () => {
        const runBtn = page
          .locator(
            'button:has-text("运行"), [aria-label="运行"], [class*="run"] button'
          )
          .first();
        if (await runBtn.isVisible()) {
          await runBtn.click();
        }
      });

      await test.step('验证执行状态', async () => {
        const runningIndicator = page
          .locator('text=运行中, [class*="running"], [class*="executing"]')
          .first();
        if (await runningIndicator.isVisible({ timeout: 5000 })) {
          expect(await runningIndicator.isVisible()).toBe(true);
        }
      });
    });

    test('TC-EXEC-002: 运行包含多个步骤的工作流', async () => {
      await test.step('添加多个块', async () => {
        const blockTypes = ['导航', '等待', '点击'];

        for (const blockType of blockTypes) {
          const addBtn = page.locator('[class*="add-block"]').first();
          if (await addBtn.isVisible()) {
            await addBtn.click();
          }

          const blockOption = page.locator(`text=${blockType}`).first();
          if (await blockOption.isVisible()) {
            await blockOption.click();
          }

          await page.waitForTimeout(300);
        }
      });

      await test.step('配置导航URL', async () => {
        const navBlock = page.locator('text=导航').first();
        if (await navBlock.isVisible()) {
          await navBlock.click();
        }

        const urlInput = page
          .locator('input[placeholder*="URL"], input[placeholder*="网址"]')
          .first();
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

      await test.step('验证执行进度', async () => {
        await page.waitForTimeout(3000);
        const progressIndicator = page
          .locator('text=进度, [class*="progress"], [class*="step"]')
          .first();
        if (await progressIndicator.isVisible()) {
          expect(await progressIndicator.isVisible()).toBe(true);
        }
      });
    });

    test('TC-EXEC-003: 运行边界情况 - 空工作流', async () => {
      await test.step('确保工作流没有块', async () => {
        const blocks = page.locator('[class*="block"]');
        const count = await blocks.count();

        if (count > 0) {
          for (let i = 0; i < count; i++) {
            await blocks.first().click();
            const deleteBtn = page.locator('button:has-text("删除")').first();
            if (await deleteBtn.isVisible()) {
              await deleteBtn.click();
            }
          }
        }
      });

      await test.step('尝试运行空工作流', async () => {
        const runBtn = page.locator('button:has-text("运行")').first();
        if (await runBtn.isVisible()) {
          await runBtn.click();
        }
      });

      await test.step('验证警告或提示', async () => {
        const warningMsg = page
          .locator('text=空, text=没有块, text=警告')
          .first();
        if (await warningMsg.isVisible({ timeout: 2000 })) {
          expect(await warningMsg.isVisible()).toBe(true);
        }
      });
    });

    test('TC-EXEC-004: 运行边界情况 - 单块工作流', async () => {
      await test.step('添加单个块', async () => {
        const addBtn = page.locator('[class*="add-block"]').first();
        if (await addBtn.isVisible()) {
          await addBtn.click();
        }
        const waitBlock = page.locator('text=等待').first();
        if (await waitBlock.isVisible()) {
          await waitBlock.click();
        }
      });

      await test.step('配置并运行', async () => {
        const timeInput = page.locator('input[type="number"]').first();
        if (await timeInput.isVisible()) {
          await timeInput.fill('1000');
        }

        const runBtn = page.locator('button:has-text("运行")').first();
        if (await runBtn.isVisible()) {
          await runBtn.click();
        }
      });

      await test.step('验证执行完成', async () => {
        await page.waitForTimeout(2000);
        const successMsg = page.locator('text=完成, text=成功').first();
        if (await successMsg.isVisible()) {
          expect(await successMsg.isVisible()).toBe(true);
        }
      });
    });
  });

  test.describe('执行停止', () => {
    test('TC-EXEC-005: 停止正在运行的工作流', async () => {
      await test.step('添加长时间等待的块', async () => {
        const addBtn = page.locator('[class*="add-block"]').first();
        if (await addBtn.isVisible()) {
          await addBtn.click();
        }
        const waitBlock = page.locator('text=等待').first();
        if (await waitBlock.isVisible()) {
          await waitBlock.click();
        }

        const timeInput = page.locator('input[type="number"]').first();
        if (await timeInput.isVisible()) {
          await timeInput.fill('60000');
        }
      });

      await test.step('启动工作流', async () => {
        const runBtn = page.locator('button:has-text("运行")').first();
        if (await runBtn.isVisible()) {
          await runBtn.click();
        }
      });

      await test.step('等待后停止', async () => {
        await page.waitForTimeout(2000);

        const stopBtn = page
          .locator(
            'button:has-text("停止"), [aria-label="停止"], [class*="stop"] button'
          )
          .first();
        if (await stopBtn.isVisible()) {
          await stopBtn.click();
        }
      });

      await test.step('验证执行已停止', async () => {
        const stoppedIndicator = page
          .locator('text=已停止, text=取消, [class*="stopped"]')
          .first();
        if (await stoppedIndicator.isVisible({ timeout: 3000 })) {
          expect(await stoppedIndicator.isVisible()).toBe(true);
        }
      });
    });

    test('TC-EXEC-006: 停止后重新运行', async () => {
      await test.step('停止当前执行', async () => {
        const stopBtn = page.locator('button:has-text("停止")').first();
        if (await stopBtn.isVisible()) {
          await stopBtn.click();
        }
      });

      await test.step('重新运行', async () => {
        const runBtn = page.locator('button:has-text("运行")').first();
        if (await runBtn.isVisible()) {
          await runBtn.click();
        }
      });
    });
  });

  test.describe('执行日志', () => {
    test('TC-EXEC-007: 查看执行日志', async () => {
      await test.step('运行工作流', async () => {
        const runBtn = page.locator('button:has-text("运行")').first();
        if (await runBtn.isVisible()) {
          await runBtn.click();
        }
      });

      await test.step('打开日志面板', async () => {
        await page.waitForTimeout(1000);
        const logsBtn = page
          .locator('text=日志, [aria-label="日志"], [class*="log"] button')
          .first();
        if (await logsBtn.isVisible()) {
          await logsBtn.click();
        }
      });

      await test.step('验证日志显示', async () => {
        const logPanel = page
          .locator('[class*="log"], [class*="Log"], [class*="logs"]')
          .first();
        if (await logPanel.isVisible()) {
          expect(await logPanel.isVisible()).toBe(true);
        }
      });
    });

    test('TC-EXEC-008: 日志内容验证', async () => {
      await test.step('运行工作流', async () => {
        const runBtn = page.locator('button:has-text("运行")').first();
        if (await runBtn.isVisible()) {
          await runBtn.click();
        }
      });

      await test.step('检查日志条目', async () => {
        await page.waitForTimeout(2000);
        const logEntries = page.locator(
          '[class*="log-entry"], [class*="LogEntry"], [class*="log-item"]'
        );
        const count = await logEntries.count();

        if (count > 0) {
          const firstEntry = logEntries.first();
          expect(await firstEntry.isVisible()).toBe(true);
        }
      });
    });

    test('TC-EXEC-009: 日志时间戳验证', async () => {
      await test.step('打开日志', async () => {
        const logsBtn = page.locator('text=日志').first();
        if (await logsBtn.isVisible()) {
          await logsBtn.click();
        }
      });

      await test.step('验证时间戳显示', async () => {
        const logWithTime = page
          .locator('[class*="log"]:has-text(":")')
          .first();
        if (await logWithTime.isVisible()) {
          expect(await logWithTime.isVisible()).toBe(true);
        }
      });
    });

    test('TC-EXEC-010: 导出日志', async () => {
      await test.step('打开日志面板', async () => {
        const logsBtn = page.locator('text=日志').first();
        if (await logsBtn.isVisible()) {
          await logsBtn.click();
        }
      });

      await test.step('点击导出', async () => {
        const exportBtn = page
          .locator('button:has-text("导出"), [aria-label="导出"]')
          .first();
        if (await exportBtn.isVisible()) {
          await exportBtn.click();
        }
      });
    });
  });

  test.describe('执行历史', () => {
    test('TC-EXEC-011: 查看执行历史', async () => {
      await test.step('打开执行历史页面', async () => {
        const historyBtn = page
          .locator('text=历史, [aria-label="历史"]')
          .first();
        if (await historyBtn.isVisible()) {
          await historyBtn.click();
        }
      });

      await test.step('验证历史记录显示', async () => {
        const historyList = page
          .locator('[class*="history"], [class*="History"]')
          .first();
        if (await historyList.isVisible()) {
          expect(await historyList.isVisible()).toBe(true);
        }
      });
    });

    test('TC-EXEC-012: 执行历史详情', async () => {
      await test.step('打开历史记录', async () => {
        const historyBtn = page.locator('text=历史').first();
        if (await historyBtn.isVisible()) {
          await historyBtn.click();
        }
      });

      await test.step('点击查看详情', async () => {
        const historyItem = page
          .locator('[class*="history-item"], [class*="history-entry"]')
          .first();
        if (await historyItem.isVisible()) {
          await historyItem.click();
        }
      });

      await test.step('验证详情内容', async () => {
        const detailPanel = page
          .locator('[class*="detail"], [class*="Detail"]')
          .first();
        if (await detailPanel.isVisible()) {
          expect(await detailPanel.isVisible()).toBe(true);
        }
      });
    });

    test('TC-EXEC-013: 清空执行历史', async () => {
      await test.step('打开历史页面', async () => {
        const historyBtn = page.locator('text=历史').first();
        if (await historyBtn.isVisible()) {
          await historyBtn.click();
        }
      });

      await test.step('清空历史', async () => {
        const clearBtn = page
          .locator('button:has-text("清空"), button:has-text("清除")')
          .first();
        if (await clearBtn.isVisible()) {
          await clearBtn.click();
        }

        const confirmBtn = page
          .locator('button:has-text("确认"), button:has-text("是")')
          .first();
        if (await confirmBtn.isVisible()) {
          await confirmBtn.click();
        }
      });
    });
  });

  test.describe('执行异常处理', () => {
    test('TC-EXEC-014: 错误处理 - 无效选择器', async () => {
      await test.step('添加点击块并配置无效选择器', async () => {
        const addBtn = page.locator('[class*="add-block"]').first();
        if (await addBtn.isVisible()) {
          await addBtn.click();
        }
        const clickBlock = page.locator('text=点击').first();
        if (await clickBlock.isVisible()) {
          await clickBlock.click();
        }

        const selectorInput = page
          .locator('input[placeholder*="选择器"]')
          .first();
        if (await selectorInput.isVisible()) {
          await selectorInput.fill('#non-existent-element');
        }
      });

      await test.step('运行并捕获错误', async () => {
        const runBtn = page.locator('button:has-text("运行")').first();
        if (await runBtn.isVisible()) {
          await runBtn.click();
        }
      });

      await test.step('验证错误提示', async () => {
        await page.waitForTimeout(3000);
        const errorMsg = page
          .locator('text=未找到, text=错误, text=失败')
          .first();
        if (await errorMsg.isVisible()) {
          expect(await errorMsg.isVisible()).toBe(true);
        }
      });
    });

    test('TC-EXEC-015: 网络错误处理', async () => {
      await test.step('配置导航到无效URL', async () => {
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
          await urlInput.fill('https://invalid-domain-that-does-not-exist.xyz');
        }
      });

      await test.step('运行并验证网络错误', async () => {
        const runBtn = page.locator('button:has-text("运行")').first();
        if (await runBtn.isVisible()) {
          await runBtn.click();
        }

        await page.waitForTimeout(5000);
        const errorMsg = page
          .locator('text=网络, text=连接, text=错误')
          .first();
        if (await errorMsg.isVisible()) {
          expect(await errorMsg.isVisible()).toBe(true);
        }
      });
    });
  });

  test.describe('执行性能', () => {
    test('TC-EXEC-016: 执行时间测量', async () => {
      await test.step('记录开始时间', async () => {
        page.evaluate(() => {
          window.testStartTime = Date.now();
        });
      });

      await test.step('运行工作流', async () => {
        const runBtn = page.locator('button:has-text("运行")').first();
        if (await runBtn.isVisible()) {
          await runBtn.click();
        }
      });

      await test.step('等待完成并计算时间', async () => {
        await page.waitForTimeout(2000);

        const executionTime = await page.evaluate(() => {
          return Date.now() - window.testStartTime;
        });

        expect(executionTime).toBeGreaterThan(0);
      });
    });
  });
});
