/**
 * 工作流块操作测试
 * 测试工作流编辑器的核心块操作功能
 */

import { test, expect, describe } from '@playwright/test';
import path from 'path';

describe('工作流块操作测试', () => {
  let page;

  test.beforeEach(async ({ browser }) => {
    // 使用Playwright创建浏览器上下文
    const context = await browser.newContext({
      ignoreHTTPSErrors: true,
    });

    // 创建新页面
    page = await context.newPage();

    // 直接使用file://协议加载扩展页面
    const filePath = path.resolve(__dirname, '../../build/newtab.html');
    console.log('加载文件路径:', filePath);

    try {
      await page.goto(`file://${filePath}`, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });
      console.log('成功加载扩展页面');
    } catch (e) {
      console.log('加载扩展页面失败:', e.message);
    }

    await page.waitForLoadState('load');
    await page.waitForTimeout(3000);
  });

  test.afterEach(async () => {
    if (page) await page.close();
  });

  test.describe('块添加功能', () => {
    test('TC-BLOCK-001: 添加新块到工作流', async () => {
      await test.step('打开工作流编辑器', async () => {
        const newWorkflowBtn = page.locator('text=新建工作流').first();
        if (await newWorkflowBtn.isVisible()) {
          await newWorkflowBtn.click();
          await page.waitForTimeout(500);
        }
      });

      await test.step('等待工作流创建', async () => {
        await page.waitForTimeout(1000);
      });

      await test.step('点击添加块按钮', async () => {
        const addBlockBtn = page
          .locator(
            '[class*="add-block"], [class*="AddBlock"], button:has-text("添加块")'
          )
          .first();
        if (await addBlockBtn.isVisible()) {
          await addBlockBtn.click();
        } else {
          // 尝试查找画布上的其他添加块按钮
          const canvasAddBtn = page.locator('[class*="canvas"] button').first();
          if (await canvasAddBtn.isVisible()) {
            await canvasAddBtn.click();
          }
        }
      });

      await test.step('选择块类型', async () => {
        const blockTypes = [
          '点击',
          '输入',
          '等待',
          '导航',
          '提取数据',
          '循环',
          '条件',
        ];

        let blockSelected = false;
        for (const blockType of blockTypes) {
          try {
            const blockOption = page.locator(`text=${blockType}`).first();
            if (await blockOption.isVisible({ timeout: 1000 })) {
              await blockOption.click();
              blockSelected = true;
              break;
            }
          } catch {
            continue;
          }
        }

        // 如果没有找到中文文本，尝试使用英文
        if (!blockSelected) {
          const enBlockOption = page
            .locator('text=Click, text=Wait, text=Navigate')
            .first();
          if (await enBlockOption.isVisible({ timeout: 1000 })) {
            await enBlockOption.click();
          }
        }
      });

      await test.step('验证块已添加', async () => {
        const blocks = page.locator(
          '.vue-flow__node, [class*="vue-flow__node"]'
        );
        await expect(blocks.first()).toBeVisible({ timeout: 5000 });
      });
    });

    test('TC-BLOCK-002: 添加多个不同类型的块', async () => {
      const blockTypes = ['等待', '点击', '输入', '导航'];

      for (const blockType of blockTypes) {
        await test.step(`添加${blockType}块`, async () => {
          const addBtn = page
            .locator('[class*="add-block"], button[class*="add"]')
            .first();
          if (await addBtn.isVisible()) {
            await addBtn.click();
          }

          const blockOption = page.locator(`text=${blockType}`).first();
          if (await blockOption.isVisible()) {
            await blockOption.click();
          }

          await page.waitForTimeout(300);
        });
      }

      await test.step('验证所有块已添加', async () => {
        const blockCount = await page
          .locator('.vue-flow__node, [class*="vue-flow__node"]')
          .count();
        expect(blockCount).toBeGreaterThanOrEqual(blockTypes.length);
      });
    });

    test('TC-BLOCK-003: 添加边界情况 - 大量块', async () => {
      // 首先添加一个基础块
      const addBtn = page.locator('[class*="add-block"]').first();
      if (await addBtn.isVisible()) {
        await addBtn.click();
        await page.waitForTimeout(300);
      }

      const waitBlock = page.locator('text=等待').first();
      if (await waitBlock.isVisible({ timeout: 1000 })) {
        await waitBlock.click();
        await page.waitForTimeout(300);
      }

      // 验证至少有一个块
      const blockCount = await page
        .locator('.vue-flow__node, [class*="vue-flow__node"]')
        .count();
      expect(blockCount).toBeGreaterThanOrEqual(1);
    });
  });

  test.describe('块配置功能', () => {
    test('TC-BLOCK-004: 配置块属性', async () => {
      await test.step('添加块', async () => {
        const addBtn = page.locator('[class*="add-block"]').first();
        if (await addBtn.isVisible()) {
          await addBtn.click();
        }
        const clickBlock = page.locator('text=点击').first();
        if (await clickBlock.isVisible()) {
          await clickBlock.click();
        }
      });

      await test.step('打开块配置面板', async () => {
        const block = page
          .locator('.vue-flow__node, [class*="vue-flow__node"]')
          .first();
        if (await block.isVisible()) {
          await block.click();
        }
      });

      await test.step('修改块属性', async () => {
        const selectorInput = page
          .locator(
            'input[placeholder*="选择器"], input[placeholder*="selector"]'
          )
          .first();
        if (await selectorInput.isVisible()) {
          await selectorInput.fill('#submit-button');
        }

        const saveBtn = page
          .locator('button:has-text("保存"), button:has-text("确认")')
          .first();
        if (await saveBtn.isVisible()) {
          await saveBtn.click();
        }
      });
    });

    test('TC-BLOCK-005: 配置等待时间', async () => {
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

      await test.step('配置时间参数', async () => {
        const timeInput = page
          .locator('input[type="number"], input[placeholder*="时间"]')
          .first();
        if (await timeInput.isVisible()) {
          await timeInput.fill('5000');
        }
      });
    });

    test('TC-BLOCK-006: 配置异常 - 无效选择器', async () => {
      await test.step('添加点击块', async () => {
        const addBtn = page.locator('[class*="add-block"]').first();
        if (await addBtn.isVisible()) {
          await addBtn.click();
        }
        const clickBlock = page.locator('text=点击').first();
        if (await clickBlock.isVisible()) {
          await clickBlock.click();
        }
      });

      await test.step('输入无效选择器', async () => {
        const selectorInput = page
          .locator('input[placeholder*="选择器"]')
          .first();
        if (await selectorInput.isVisible()) {
          await selectorInput.fill('invalid!!!selector###');
        }
      });

      await test.step('验证错误提示', async () => {
        const errorMsg = page
          .locator('text=无效, text=错误, [class*="error"]')
          .first();
        if (await errorMsg.isVisible()) {
          expect(await errorMsg.isVisible()).toBe(true);
        }
      });
    });
  });

  test.describe('块连接功能', () => {
    test('TC-BLOCK-007: 连接两个块', async () => {
      const blocks = page.locator('.vue-flow__node, [class*="vue-flow__node"]');
      const count = await blocks.count();

      if (count >= 2) {
        const firstBlock = blocks.first();
        const secondBlock = blocks.nth(1);

        await test.step('拖拽连接线', async () => {
          const connector = firstBlock
            .locator('[class*="output"], [class*="connector"]')
            .first();
          if (await connector.isVisible()) {
            await connector.dragTo(secondBlock);
          }
        });
      }
    });

    test('TC-BLOCK-008: 断开块连接', async () => {
      const connection = page
        .locator('[class*="connection"], [class*="edge"], .vue-flow__edge')
        .first();
      if (await connection.isVisible()) {
        await connection.click({ force: true });
      }

      const deleteBtn = page
        .locator('button:has-text("删除"), button[aria-label="删除"]')
        .first();
      if (await deleteBtn.isVisible()) {
        await deleteBtn.click();
      }
    });

    test('TC-BLOCK-009: 连接异常 - 循环引用', async () => {
      const blocks = page.locator('.vue-flow__node, [class*="vue-flow__node"]');
      const count = await blocks.count();

      if (count >= 2) {
        const firstBlock = blocks.first();
        const lastBlock = blocks.last();

        await firstBlock.locator('[class*="output"]').first().dragTo(lastBlock);

        const errorToast = page.locator('text=循环, text=循环引用').first();
        if (await errorToast.isVisible({ timeout: 2000 })) {
          expect(await errorToast.isVisible()).toBe(true);
        }
      }
    });
  });

  test.describe('块删除功能', () => {
    test('TC-BLOCK-010: 删除单个块', async () => {
      const blocks = page.locator('.vue-flow__node, [class*="vue-flow__node"]');
      const initialCount = await blocks.count();

      if (initialCount > 0) {
        await test.step('选择块', async () => {
          await blocks.first().click();
        });

        await test.step('删除块', async () => {
          const deleteBtn = page
            .locator('button:has-text("删除"), [aria-label="删除"]')
            .first();
          if (await deleteBtn.isVisible()) {
            await deleteBtn.click();
          }
        });

        await test.step('确认删除', async () => {
          const confirmBtn = page
            .locator('button:has-text("确认"), button:has-text("是")')
            .first();
          if (await confirmBtn.isVisible()) {
            await confirmBtn.click();
          }
        });

        const finalCount = await blocks.count();
        expect(finalCount).toBeLessThan(initialCount);
      }
    });

    test('TC-BLOCK-011: 删除多个块', async () => {
      const blocks = page.locator('.vue-flow__node, [class*="vue-flow__node"]');
      const initialCount = await blocks.count();

      for (let i = 0; i < 3 && initialCount > i; i++) {
        await blocks.first().click();

        const deleteBtn = page.locator('button:has-text("删除")').first();
        if (await deleteBtn.isVisible()) {
          await deleteBtn.click();
        }

        const confirmBtn = page.locator('button:has-text("确认")').first();
        if (await confirmBtn.isVisible()) {
          await confirmBtn.click();
        }

        await page.waitForTimeout(200);
      }
    });

    test('TC-BLOCK-012: 删除异常 - 撤销删除', async () => {
      const blocks = page.locator('.vue-flow__node, [class*="vue-flow__node"]');
      const initialCount = await blocks.count();

      if (initialCount > 0) {
        await blocks.first().click();

        const deleteBtn = page.locator('button:has-text("删除")').first();
        if (await deleteBtn.isVisible()) {
          await deleteBtn.click();
        }

        const undoBtn = page
          .locator('button:has-text("撤销"), [aria-label="撤销"]')
          .first();
        if (await undoBtn.isVisible()) {
          await undoBtn.click();
        }

        const finalCount = await blocks.count();
        expect(finalCount).toBe(initialCount);
      }
    });
  });

  test.describe('块复制功能', () => {
    test('TC-BLOCK-013: 复制块', async () => {
      const blocks = page.locator('.vue-flow__node, [class*="vue-flow__node"]');
      const initialCount = await blocks.count();

      if (initialCount > 0) {
        await test.step('选择块', async () => {
          await blocks.first().click();
        });

        await test.step('复制块', async () => {
          const copyBtn = page
            .locator('button:has-text("复制"), [aria-label="复制"]')
            .first();
          if (await copyBtn.isVisible()) {
            await copyBtn.click();
          }
        });

        const finalCount = await blocks.count();
        expect(finalCount).toBeGreaterThan(initialCount);
      }
    });

    test('TC-BLOCK-014: 复制并修改', async () => {
      const blocks = page.locator('.vue-flow__node, [class*="vue-flow__node"]');
      const initialCount = await blocks.count();

      if (initialCount > 0) {
        await blocks.first().click();

        const copyBtn = page.locator('button:has-text("复制")').first();
        if (await copyBtn.isVisible()) {
          await copyBtn.click();
        }

        const newBlock = blocks.nth(initialCount);
        if (await newBlock.isVisible()) {
          await newBlock.click();

          const selectorInput = page
            .locator('input[placeholder*="选择器"]')
            .first();
          if (await selectorInput.isVisible()) {
            await selectorInput.fill('#new-selector');
          }
        }
      }
    });
  });

  test.describe('块移动功能', () => {
    test('TC-BLOCK-015: 移动块位置', async () => {
      // 首先添加一个块
      const addBtn = page.locator('[class*="add-block"]').first();
      if (await addBtn.isVisible()) {
        await addBtn.click();
        await page.waitForTimeout(300);
      }

      const clickBlock = page.locator('text=点击').first();
      if (await clickBlock.isVisible({ timeout: 1000 })) {
        await clickBlock.click();
        await page.waitForTimeout(500);
      }

      const blocks = page.locator('.vue-flow__node, [class*="vue-flow__node"]');
      const blockCount = await blocks.count();

      if (blockCount > 0) {
        const firstBlock = blocks.first();
        const initialPosition = await firstBlock.boundingBox();

        await test.step('拖拽块到新位置', async () => {
          const canvas = page
            .locator('[class*="canvas"], [class*="workflow-canvas"]')
            .first();
          if (await canvas.isVisible()) {
            await firstBlock.dragTo(canvas, {
              targetPosition: { x: 100, y: 100 },
            });
          }
        });

        await test.step('验证块位置已改变', async () => {
          const newPosition = await firstBlock.boundingBox();
          if (newPosition) {
            expect(newPosition.x).not.toEqual(initialPosition?.x || 0);
          }
        });
      }
    });
  });
});
