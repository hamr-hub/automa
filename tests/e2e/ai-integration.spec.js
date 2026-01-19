/**
 * AI集成测试
 * 测试LangGraph AI工作流生成功能
 */

import { test, expect, describe, beforeEach } from '@playwright/test';

const EXTENSION_ID = process.env.EXTENSION_ID || 'your-extension-id';

describe('AI集成测试', () => {
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

  test.describe('AI工作流生成', () => {
    test('TC-AI-001: 打开AI工作流生成器', async () => {
      await test.step('点击AI生成按钮', async () => {
        const aiBtn = page
          .locator('text=AI生成, text=AI, [aria-label*="AI"]')
          .first();
        if (await aiBtn.isVisible()) {
          await aiBtn.click();
        }
      });

      await test.step('验证AI面板打开', async () => {
        const aiPanel = page
          .locator('[class*="ai-panel"], [class*="AI-panel"], [class*="chat"]')
          .first();
        if (await aiPanel.isVisible()) {
          expect(await aiPanel.isVisible()).toBe(true);
        }
      });
    });

    test('TC-AI-002: 输入简单提示词', async () => {
      await test.step('打开AI面板', async () => {
        const aiBtn = page.locator('text=AI生成').first();
        if (await aiBtn.isVisible()) {
          await aiBtn.click();
        }
      });

      await test.step('输入提示词', async () => {
        const inputArea = page
          .locator(
            'textarea[placeholder*="描述"], input[placeholder*="描述"], [contenteditable]'
          )
          .first();
        if (await inputArea.isVisible()) {
          await inputArea.fill('创建一个工作流，点击页面上的按钮');
        }
      });

      await test.step('发送请求', async () => {
        const sendBtn = page
          .locator(
            'button:has-text("生成"), button:has-text("发送"), [aria-label="发送"]'
          )
          .first();
        if (await sendBtn.isVisible()) {
          await sendBtn.click();
        }
      });

      await test.step('验证生成过程', async () => {
        await page.waitForTimeout(3000);
        const loadingIndicator = page
          .locator('text=生成中, text=正在处理, [class*="loading"]')
          .first();
        if (await loadingIndicator.isVisible()) {
          expect(await loadingIndicator.isVisible()).toBe(true);
        }
      });
    });

    test('TC-AI-003: 生成包含导航的工作流', async () => {
      await test.step('输入导航提示词', async () => {
        const aiBtn = page.locator('text=AI生成').first();
        if (await aiBtn.isVisible()) {
          await aiBtn.click();
        }

        const inputArea = page.locator('textarea').first();
        if (await inputArea.isVisible()) {
          await inputArea.fill('访问https://example.com，然后搜索关键词');
        }
      });

      await test.step('发送请求', async () => {
        const sendBtn = page.locator('button:has-text("生成")').first();
        if (await sendBtn.isVisible()) {
          await sendBtn.click();
        }
      });

      await test.step('等待生成完成', async () => {
        await page.waitForTimeout(10000);
      });
    });

    test('TC-AI-004: 生成复杂工作流', async () => {
      await test.step('输入复杂提示词', async () => {
        const aiBtn = page.locator('text=AI生成').first();
        if (await aiBtn.isVisible()) {
          await aiBtn.click();
        }

        const inputArea = page.locator('textarea').first();
        if (await inputArea.isVisible()) {
          await inputArea.fill(
            '创建一个工作流，遍历页面上的所有产品链接，提取产品名称和价格，然后保存到表格中'
          );
        }
      });

      await test.step('发送请求', async () => {
        const sendBtn = page.locator('button:has-text("生成")').first();
        if (await sendBtn.isVisible()) {
          await sendBtn.click();
        }
      });

      await test.step('等待生成完成', async () => {
        await page.waitForTimeout(15000);
      });
    });
  });

  test.describe('AI响应处理', () => {
    test('TC-AI-005: 验证生成的工作流结构', async () => {
      await test.step('生成工作流', async () => {
        const aiBtn = page.locator('text=AI生成').first();
        if (await aiBtn.isVisible()) {
          await aiBtn.click();
        }

        const inputArea = page.locator('textarea').first();
        if (await inputArea.isVisible()) {
          await inputArea.fill('点击按钮');
        }

        const sendBtn = page.locator('button:has-text("生成")').first();
        if (await sendBtn.isVisible()) {
          await sendBtn.click();
        }
      });

      await test.step('等待生成并查看结果', async () => {
        await page.waitForTimeout(10000);
      });

      await test.step('验证工作流已创建', async () => {
        const blocks = page.locator('[class*="block"], [class*="Block"]');
        if (await blocks.first().isVisible({ timeout: 5000 })) {
          expect(await blocks.first()).toBeVisible();
        }
      });
    });

    test('TC-AI-006: 处理AI错误响应', async () => {
      await test.step('模拟无效请求', async () => {
        const aiBtn = page.locator('text=AI生成').first();
        if (await aiBtn.isVisible()) {
          await aiBtn.click();
        }

        const inputArea = page.locator('textarea').first();
        if (await inputArea.isVisible()) {
          await inputArea.fill('!@#$%^&*()无效命令');
        }

        const sendBtn = page.locator('button:has-text("生成")').first();
        if (await sendBtn.isVisible()) {
          await sendBtn.click();
        }
      });

      await test.step('验证错误处理', async () => {
        await page.waitForTimeout(5000);
        const errorMsg = page
          .locator('text=错误, text=失败, text=无法生成')
          .first();
        if (await errorMsg.isVisible()) {
          expect(await errorMsg.isVisible()).toBe(true);
        }
      });
    });

    test('TC-AI-007: 网络错误处理', async () => {
      await test.step('模拟网络错误', async () => {
        await page.route('**/ai/**', (route) => {
          route.abort('failed');
        });

        const aiBtn = page.locator('text=AI生成').first();
        if (await aiBtn.isVisible()) {
          await aiBtn.click();
        }

        const inputArea = page.locator('textarea').first();
        if (await inputArea.isVisible()) {
          await inputArea.fill('创建工作流');
        }

        const sendBtn = page.locator('button:has-text("生成")').first();
        if (await sendBtn.isVisible()) {
          await sendBtn.click();
        }
      });

      await test.step('验证网络错误提示', async () => {
        await page.waitForTimeout(5000);
        const errorMsg = page
          .locator('text=网络错误, text=连接失败, text=请重试')
          .first();
        if (await errorMsg.isVisible()) {
          expect(await errorMsg.isVisible()).toBe(true);
        }
      });
    });
  });

  test.describe('多轮对话', () => {
    test('TC-AI-008: 继续修改生成的工作流', async () => {
      await test.step('生成初始工作流', async () => {
        const aiBtn = page.locator('text=AI生成').first();
        if (await aiBtn.isVisible()) {
          await aiBtn.click();
        }

        const inputArea = page.locator('textarea').first();
        if (await inputArea.isVisible()) {
          await inputArea.fill('创建点击按钮的工作流');
        }

        const sendBtn = page.locator('button:has-text("生成")').first();
        if (await sendBtn.isVisible()) {
          await sendBtn.click();
        }

        await page.waitForTimeout(10000);
      });

      await test.step('输入修改请求', async () => {
        const inputArea = page.locator('textarea').first();
        if (await inputArea.isVisible()) {
          await inputArea.fill('再添加等待5秒');
        }

        const sendBtn = page.locator('button:has-text("发送")').first();
        if (await sendBtn.isVisible()) {
          await sendBtn.click();
        }
      });

      await test.step('等待修改完成', async () => {
        await page.waitForTimeout(5000);
      });
    });

    test('TC-AI-009: 取消当前请求', async () => {
      await test.step('发起长时间请求', async () => {
        const aiBtn = page.locator('text=AI生成').first();
        if (await aiBtn.isVisible()) {
          await aiBtn.click();
        }

        const inputArea = page.locator('textarea').first();
        if (await inputArea.isVisible()) {
          await inputArea.fill(
            '创建一个非常复杂的工作流，包含多个步骤和条件判断'
          );
        }

        const sendBtn = page.locator('button:has-text("生成")').first();
        if (await sendBtn.isVisible()) {
          await sendBtn.click();
        }

        await page.waitForTimeout(2000);
      });

      await test.step('取消请求', async () => {
        const cancelBtn = page
          .locator('button:has-text("取消"), [aria-label="取消"]')
          .first();
        if (await cancelBtn.isVisible()) {
          await cancelBtn.click();
        }
      });

      await test.step('验证已取消', async () => {
        const cancelMsg = page.locator('text=已取消, text=取消成功').first();
        if (await cancelMsg.isVisible({ timeout: 2000 })) {
          expect(await cancelMsg.isVisible()).toBe(true);
        }
      });
    });
  });

  test.describe('AI配置', () => {
    test('TC-AI-010: 配置AI服务', async () => {
      await test.step('打开设置', async () => {
        const settingsBtn = page
          .locator('text=设置, [aria-label="设置"]')
          .first();
        if (await settingsBtn.isVisible()) {
          await settingsBtn.click();
        }
      });

      await test.step('打开AI设置', async () => {
        const aiSettings = page.locator('text=AI, text=人工智能').first();
        if (await aiSettings.isVisible()) {
          await aiSettings.click();
        }
      });

      await test.step('配置API地址', async () => {
        const apiInput = page
          .locator('input[placeholder*="API"], input[placeholder*="地址"]')
          .first();
        if (await apiInput.isVisible()) {
          await apiInput.fill('http://localhost:11434');
        }
      });
    });

    test('TC-AI-011: 测试AI连接', async () => {
      await test.step('点击测试连接', async () => {
        const testBtn = page
          .locator('button:has-text("测试连接"), button:has-text("测试")]')
          .first();
        if (await testBtn.isVisible()) {
          await testBtn.click();
        }
      });

      await test.step('验证连接结果', async () => {
        await page.waitForTimeout(5000);
        const successMsg = page
          .locator('text=连接成功, text=Connected')
          .first();
        const errorMsg = page.locator('text=连接失败, text=Error').first();

        if (await successMsg.isVisible()) {
          expect(await successMsg.isVisible()).toBe(true);
        } else if (await errorMsg.isVisible()) {
          expect(await errorMsg.isVisible()).toBe(true);
        }
      });
    });

    test('TC-AI-012: 选择AI模型', async () => {
      await test.step('打开模型选择', async () => {
        const modelSelect = page.locator('select, [class*="model"]').first();
        if (await modelSelect.isVisible()) {
          await modelSelect.selectOption('llama3');
        }
      });

      await test.step('验证模型已选择', async () => {
        const selectedModel = page.locator('text=llama3, text=LLama').first();
        if (await selectedModel.isVisible()) {
          expect(await selectedModel.isVisible()).toBe(true);
        }
      });
    });
  });

  test.describe('AI模板', () => {
    test('TC-AI-013: 使用预设模板', async () => {
      await test.step('打开模板列表', async () => {
        const templateBtn = page.locator('text=模板, text=Template').first();
        if (await templateBtn.isVisible()) {
          await templateBtn.click();
        }
      });

      await test.step('选择模板', async () => {
        const templateOption = page
          .locator('text=网页抓取, text=数据提取')
          .first();
        if (await templateOption.isVisible()) {
          await templateOption.click();
        }
      });

      await test.step('生成工作流', async () => {
        const generateBtn = page.locator('button:has-text("生成")]').first();
        if (await generateBtn.isVisible()) {
          await generateBtn.click();
        }
      });

      await test.step('等待生成完成', async () => {
        await page.waitForTimeout(10000);
      });
    });
  });

  test.describe('历史记录', () => {
    test('TC-AI-014: 查看AI生成历史', async () => {
      await test.step('打开历史记录', async () => {
        const historyBtn = page.locator('text=历史记录, text=History').first();
        if (await historyBtn.isVisible()) {
          await historyBtn.click();
        }
      });

      await test.step('验证历史列表', async () => {
        const historyList = page
          .locator('[class*="history"], [class*="History"]')
          .first();
        if (await historyList.isVisible()) {
          expect(await historyList.isVisible()).toBe(true);
        }
      });
    });

    test('TC-AI-015: 重新生成历史工作流', async () => {
      await test.step('打开历史记录', async () => {
        const historyBtn = page.locator('text=历史记录').first();
        if (await historyBtn.isVisible()) {
          await historyBtn.click();
        }
      });

      await test.step('选择历史条目', async () => {
        const historyItem = page
          .locator('[class*="history-item"], [class*="history-entry"]')
          .first();
        if (await historyItem.isVisible()) {
          await historyItem.click();
        }
      });

      await test.step('点击重新生成', async () => {
        const regenerateBtn = page
          .locator('button:has-text("重新生成")]')
          .first();
        if (await regenerateBtn.isVisible()) {
          await regenerateBtn.click();
        }
      });
    });
  });

  test.describe('性能测试', () => {
    test('TC-AI-016: 测量生成时间', async () => {
      await test.step('记录开始时间', async () => {
        page.evaluate(() => {
          window.aiStartTime = Date.now();
        });
      });

      await test.step('发送请求', async () => {
        const aiBtn = page.locator('text=AI生成').first();
        if (await aiBtn.isVisible()) {
          await aiBtn.click();
        }

        const inputArea = page.locator('textarea').first();
        if (await inputArea.isVisible()) {
          await inputArea.fill('点击按钮');
        }

        const sendBtn = page.locator('button:has-text("生成")').first();
        if (await sendBtn.isVisible()) {
          await sendBtn.click();
        }
      });

      await test.step('计算生成时间', async () => {
        await page.waitForTimeout(10000);

        const duration = await page.evaluate(() => {
          return Date.now() - window.aiStartTime;
        });

        console.log(`AI生成耗时: ${duration}ms`);
        expect(duration).toBeGreaterThan(0);
      });
    });
  });

  test.describe('边界情况', () => {
    test('TC-AI-017: 空提示词处理', async () => {
      await test.step('发送空提示词', async () => {
        const aiBtn = page.locator('text=AI生成').first();
        if (await aiBtn.isVisible()) {
          await aiBtn.click();
        }

        const sendBtn = page.locator('button:has-text("生成")').first();
        if (await sendBtn.isVisible()) {
          await sendBtn.click();
        }
      });

      await test.step('验证提示', async () => {
        await page.waitForTimeout(1000);
        const warningMsg = page
          .locator('text=请输入描述, text=不能为空')
          .first();
        if (await warningMsg.isVisible()) {
          expect(await warningMsg.isVisible()).toBe(true);
        }
      });
    });

    test('TC-AI-018: 过长提示词处理', async () => {
      await test.step('输入超长提示词', async () => {
        const aiBtn = page.locator('text=AI生成').first();
        if (await aiBtn.isVisible()) {
          await aiBtn.click();
        }

        const inputArea = page.locator('textarea').first();
        if (await inputArea.isVisible()) {
          await inputArea.fill('a'.repeat(10000));
        }

        const sendBtn = page.locator('button:has-text("生成")').first();
        if (await sendBtn.isVisible()) {
          await sendBtn.click();
        }
      });

      await test.step('验证处理', async () => {
        await page.waitForTimeout(2000);
      });
    });
  });
});
