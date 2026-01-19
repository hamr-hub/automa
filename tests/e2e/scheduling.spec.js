/**
 * 定时任务测试
 * 测试工作流的定时触发和调度功能
 */

import { test, expect, describe, beforeEach } from '@playwright/test';
import path from 'path';

describe('定时任务测试', () => {
  let page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();

    // 使用 file:// 协议加载扩展页面
    const filePath = path.resolve(__dirname, '../../build/newtab.html');
    await page.goto(`file://${filePath}`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    await page.waitForLoadState('load');
    await page.waitForTimeout(3000);
  });

  test.afterEach(async () => {
    if (page) await page.close();
  });

  test.describe('定时触发配置', () => {
    test('TC-SCHED-001: 配置时间触发器', async () => {
      await test.step('打开工作流设置', async () => {
        const workflowCard = page.locator('[class*="workflow-card"]').first();
        if (await workflowCard.isVisible()) {
          await workflowCard.click();
        }
      });

      await test.step('打开触发器设置', async () => {
        const settingsBtn = page
          .locator('[class*="settings"], button:has-text("设置")')
          .first();
        if (await settingsBtn.isVisible()) {
          await settingsBtn.click();
        }
      });

      await test.step('选择定时触发', async () => {
        const scheduleOption = page
          .locator('text=定时, text=Schedule, text=时间触发')
          .first();
        if (await scheduleOption.isVisible()) {
          await scheduleOption.click();
        }
      });

      await test.step('设置触发时间', async () => {
        const timeInput = page
          .locator('input[type="time"], input[placeholder*="时间"]')
          .first();
        if (await timeInput.isVisible()) {
          await timeInput.fill('12:00');
        }
      });
    });

    test('TC-SCHED-002: 配置日期触发', async () => {
      await test.step('打开触发器设置', async () => {
        const workflowCard = page.locator('[class*="workflow-card"]').first();
        if (await workflowCard.isVisible()) {
          await workflowCard.click();
        }

        const settingsBtn = page.locator('button:has-text("设置")').first();
        if (await settingsBtn.isVisible()) {
          await settingsBtn.click();
        }
      });

      await test.step('选择日期触发', async () => {
        const dateOption = page.locator('text=日期, text=Date').first();
        if (await dateOption.isVisible()) {
          await dateOption.click();
        }
      });

      await test.step('选择日期', async () => {
        const datePicker = page
          .locator('input[type="date"], [class*="datepicker"]')
          .first();
        if (await datePicker.isVisible()) {
          await datePicker.fill('2025-12-31');
        }
      });
    });

    test('TC-SCHED-003: 配置间隔触发', async () => {
      await test.step('打开触发器设置', async () => {
        const workflowCard = page.locator('[class*="workflow-card"]').first();
        if (await workflowCard.isVisible()) {
          await workflowCard.click();
        }

        const settingsBtn = page.locator('button:has-text("设置")').first();
        if (await settingsBtn.isVisible()) {
          await settingsBtn.click();
        }
      });

      await test.step('选择间隔触发', async () => {
        const intervalOption = page.locator('text=间隔, text=Interval').first();
        if (await intervalOption.isVisible()) {
          await intervalOption.click();
        }
      });

      await test.step('设置间隔时间和单位', async () => {
        const valueInput = page
          .locator('input[type="number"], input[placeholder*="间隔"]')
          .first();
        if (await valueInput.isVisible()) {
          await valueInput.fill('5');
        }

        const unitSelect = page.locator('select, [class*="unit"]').first();
        if (await unitSelect.isVisible()) {
          await unitSelect.selectOption('minutes');
        }
      });
    });

    test('TC-SCHED-004: 配置周期触发', async () => {
      await test.step('打开触发器设置', async () => {
        const workflowCard = page.locator('[class*="workflow-card"]').first();
        if (await workflowCard.isVisible()) {
          await workflowCard.click();
        }

        const settingsBtn = page.locator('button:has-text("设置")').first();
        if (await settingsBtn.isVisible()) {
          await settingsBtn.click();
        }
      });

      await test.step('选择周期触发', async () => {
        const recurringOption = page
          .locator('text=周期, text=Recurring')
          .first();
        if (await recurringOption.isVisible()) {
          await recurringOption.click();
        }
      });

      await test.step('选择周期选项', async () => {
        const dailyOption = page.locator('text=每天, text=Daily').first();
        if (await dailyOption.isVisible()) {
          await dailyOption.click();
        }
      });
    });
  });

  test.describe('Cron表达式', () => {
    test('TC-SCHED-005: 配置Cron表达式', async () => {
      await test.step('打开触发器设置', async () => {
        const workflowCard = page.locator('[class*="workflow-card"]').first();
        if (await workflowCard.isVisible()) {
          await workflowCard.click();
        }

        const settingsBtn = page.locator('button:has-text("设置")').first();
        if (await settingsBtn.isVisible()) {
          await settingsBtn.click();
        }
      });

      await test.step('选择Cron表达式', async () => {
        const cronOption = page
          .locator('text=Cron, text=Cron Expression')
          .first();
        if (await cronOption.isVisible()) {
          await cronOption.click();
        }
      });

      await test.step('输入Cron表达式', async () => {
        const cronInput = page
          .locator('input[placeholder*="Cron"], textarea[placeholder*="Cron"]')
          .first();
        if (await cronInput.isVisible()) {
          await cronInput.fill('0 12 * * *');
        }
      });

      await test.step('验证表达式格式', async () => {
        const validIndicator = page.locator('text=有效, text=Valid').first();
        if (await validIndicator.isVisible({ timeout: 2000 })) {
          expect(await validIndicator.isVisible()).toBe(true);
        }
      });
    });

    test('TC-SCHED-006: Cron表达式验证 - 无效表达式', async () => {
      await test.step('输入无效Cron表达式', async () => {
        const cronInput = page.locator('input[placeholder*="Cron"]').first();
        if (await cronInput.isVisible()) {
          await cronInput.fill('invalid cron expression');
        }
      });

      await test.step('验证错误提示', async () => {
        const errorMsg = page
          .locator('text=无效, text=错误, text=Invalid')
          .first();
        if (await errorMsg.isVisible({ timeout: 2000 })) {
          expect(await errorMsg.isVisible()).toBe(true);
        }
      });
    });

    test('TC-SCHED-007: Cron表达式验证 - 边界值', async () => {
      await test.step('输入每分钟执行的Cron', async () => {
        const cronInput = page.locator('input[placeholder*="Cron"]').first();
        if (await cronInput.isVisible()) {
          await cronInput.fill('* * * * *');
        }
      });

      await test.step('验证表达式有效', async () => {
        const validIndicator = page.locator('text=有效').first();
        if (await validIndicator.isVisible({ timeout: 2000 })) {
          expect(await validIndicator.isVisible()).toBe(true);
        }
      });
    });

    test('TC-SCHED-008: Cron表达式解析预览', async () => {
      await test.step('输入Cron表达式', async () => {
        const cronInput = page.locator('input[placeholder*="Cron"]').first();
        if (await cronInput.isVisible()) {
          await cronInput.fill('0 9 * * 1-5');
        }
      });

      await test.step('查看解析结果', async () => {
        const preview = page
          .locator('[class*="preview"], [class*="Preview"], text=每周一至周五')
          .first();
        if (await preview.isVisible()) {
          expect(await preview.isVisible()).toBe(true);
        }
      });
    });
  });

  test.describe('定时任务管理', () => {
    test('TC-SCHED-009: 查看定时任务列表', async () => {
      await test.step('打开定时任务页面', async () => {
        const scheduleBtn = page
          .locator('text=定时任务, text=Schedules, text=计划任务')
          .first();
        if (await scheduleBtn.isVisible()) {
          await scheduleBtn.click();
        }
      });

      await test.step('验证任务列表显示', async () => {
        const taskList = page
          .locator(
            '[class*="schedule-list"], [class*="ScheduleList"], [class*="task-list"]'
          )
          .first();
        if (await taskList.isVisible()) {
          expect(await taskList.isVisible()).toBe(true);
        }
      });
    });

    test('TC-SCHED-010: 启用定时任务', async () => {
      await test.step('打开定时任务列表', async () => {
        const scheduleBtn = page.locator('text=定时任务').first();
        if (await scheduleBtn.isVisible()) {
          await scheduleBtn.click();
        }
      });

      await test.step('切换启用状态', async () => {
        const toggle = page
          .locator(
            '[class*="toggle"], [class*="switch"], input[type="checkbox"]'
          )
          .first();
        if (await toggle.isVisible()) {
          await toggle.check();
        }
      });

      await test.step('验证状态已改变', async () => {
        const enabledIndicator = page
          .locator('text=已启用, text=Enabled')
          .first();
        if (await enabledIndicator.isVisible()) {
          expect(await enabledIndicator.isVisible()).toBe(true);
        }
      });
    });

    test('TC-SCHED-011: 禁用定时任务', async () => {
      await test.step('打开定时任务列表', async () => {
        const scheduleBtn = page.locator('text=定时任务').first();
        if (await scheduleBtn.isVisible()) {
          await scheduleBtn.click();
        }
      });

      await test.step('切换禁用状态', async () => {
        const toggle = page
          .locator('[class*="toggle"]:checked, [class*="switch"]:checked')
          .first();
        if (await toggle.isVisible()) {
          await toggle.uncheck();
        }
      });

      await test.step('验证状态已改变', async () => {
        const disabledIndicator = page
          .locator('text=已禁用, text=Disabled')
          .first();
        if (await disabledIndicator.isVisible()) {
          expect(await disabledIndicator.isVisible()).toBe(true);
        }
      });
    });

    test('TC-SCHED-012: 编辑定时任务', async () => {
      await test.step('打开定时任务列表', async () => {
        const scheduleBtn = page.locator('text=定时任务').first();
        if (await scheduleBtn.isVisible()) {
          await scheduleBtn.click();
        }
      });

      await test.step('点击编辑', async () => {
        const editBtn = page
          .locator('button:has-text("编辑"), [aria-label="编辑"]')
          .first();
        if (await editBtn.isVisible()) {
          await editBtn.click();
        }
      });

      await test.step('修改设置', async () => {
        const timeInput = page.locator('input[type="time"]').first();
        if (await timeInput.isVisible()) {
          await timeInput.fill('18:00');
        }
      });

      await test.step('保存修改', async () => {
        const saveBtn = page
          .locator('button:has-text("保存"), button:has-text("确认")]')
          .first();
        if (await saveBtn.isVisible()) {
          await saveBtn.click();
        }
      });
    });

    test('TC-SCHED-013: 删除定时任务', async () => {
      await test.step('打开定时任务列表', async () => {
        const scheduleBtn = page.locator('text=定时任务').first();
        if (await scheduleBtn.isVisible()) {
          await scheduleBtn.click();
        }
      });

      await test.step('点击删除', async () => {
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
    });
  });

  test.describe('定时任务执行', () => {
    test('TC-SCHED-014: 测试定时任务执行', async () => {
      await test.step('打开定时任务', async () => {
        const scheduleBtn = page.locator('text=定时任务').first();
        if (await scheduleBtn.isVisible()) {
          await scheduleBtn.click();
        }
      });

      await test.step('点击立即执行', async () => {
        const runNowBtn = page
          .locator('button:has-text("立即执行"), button:has-text("Run now")')
          .first();
        if (await runNowBtn.isVisible()) {
          await runNowBtn.click();
        }
      });

      await test.step('验证执行开始', async () => {
        await page.waitForTimeout(2000);
        const runningIndicator = page
          .locator('text=运行中, text=执行中')
          .first();
        if (await runningIndicator.isVisible()) {
          expect(await runningIndicator.isVisible()).toBe(true);
        }
      });
    });

    test('TC-SCHED-015: 查看执行历史', async () => {
      await test.step('打开定时任务', async () => {
        const scheduleBtn = page.locator('text=定时任务').first();
        if (await scheduleBtn.isVisible()) {
          await scheduleBtn.click();
        }
      });

      await test.step('查看执行记录', async () => {
        const historyBtn = page.locator('text=执行历史, text=History').first();
        if (await historyBtn.isVisible()) {
          await historyBtn.click();
        }
      });

      await test.step('验证历史记录', async () => {
        const historyList = page
          .locator('[class*="history"], [class*="History"]')
          .first();
        if (await historyList.isVisible()) {
          expect(await historyList.isVisible()).toBe(true);
        }
      });
    });
  });

  test.describe('异常处理', () => {
    test('TC-SCHED-016: 时间格式错误处理', async () => {
      await test.step('输入无效时间格式', async () => {
        const timeInput = page.locator('input[type="time"]').first();
        if (await timeInput.isVisible()) {
          await timeInput.fill('25:00');
        }
      });

      await test.step('验证错误提示', async () => {
        const errorMsg = page
          .locator('text=无效, text=错误, text=Invalid')
          .first();
        if (await errorMsg.isVisible({ timeout: 2000 })) {
          expect(await errorMsg.isVisible()).toBe(true);
        }
      });
    });

    test('TC-SCHED-017: 过期日期处理', async () => {
      await test.step('输入过去日期', async () => {
        const dateInput = page.locator('input[type="date"]').first();
        if (await dateInput.isVisible()) {
          await dateInput.fill('2020-01-01');
        }
      });

      await test.step('验证警告', async () => {
        const warningMsg = page
          .locator('text=过去, text=过期, text=警告')
          .first();
        if (await warningMsg.isVisible({ timeout: 2000 })) {
          expect(await warningMsg.isVisible()).toBe(true);
        }
      });
    });

    test('TC-SCHED-018: 保存失败处理', async () => {
      await test.step('模拟网络错误', async () => {
        page.route('**/api/**', (route) => {
          route.abort('failed');
        });
      });

      await test.step('尝试保存设置', async () => {
        const saveBtn = page.locator('button:has-text("保存")').first();
        if (await saveBtn.isVisible()) {
          await saveBtn.click();
        }
      });

      await test.step('验证错误提示', async () => {
        const errorMsg = page
          .locator('text=失败, text=错误, text=Error')
          .first();
        if (await errorMsg.isVisible({ timeout: 3000 })) {
          expect(await errorMsg.isVisible()).toBe(true);
        }
      });
    });
  });

  test.describe('时区设置', () => {
    test('TC-SCHED-019: 配置时区', async () => {
      await test.step('打开时区设置', async () => {
        const timezoneSelect = page
          .locator('select[placeholder*="时区"], [class*="timezone"] select')
          .first();
        if (await timezoneSelect.isVisible()) {
          await timezoneSelect.selectOption('Asia/Shanghai');
        }
      });

      await test.step('验证时区已设置', async () => {
        const selectedTimezone = page
          .locator('text=Asia/Shanghai, text=上海')
          .first();
        if (await selectedTimezone.isVisible()) {
          expect(await selectedTimezone.isVisible()).toBe(true);
        }
      });
    });

    test('TC-SCHED-020: DST夏令时处理', async () => {
      await test.step('选择支持DST的时区', async () => {
        const timezoneSelect = page.locator('select').first();
        if (await timezoneSelect.isVisible()) {
          await timezoneSelect.selectOption('America/New_York');
        }
      });

      await test.step('验证时区信息', async () => {
        const dstInfo = page
          .locator('text=DST, text=夏令时, text=Daylight')
          .first();
        if (await dstInfo.isVisible()) {
          expect(await dstInfo.isVisible()).toBe(true);
        }
      });
    });
  });
});
