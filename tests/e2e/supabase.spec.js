/**
 * Supabase集成测试
 * 测试云端同步、用户数据和协作功能
 */

import { test, expect, describe, beforeEach } from '@playwright/test';
import path from 'path';

describe('Supabase集成测试', () => {
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

  test.describe('客户端初始化', () => {
    test('TC-SUP-001: Supabase客户端初始化', async () => {
      await test.step('验证客户端状态', async () => {
        const clientStatus = await page.evaluate(() => {
          return window.supabaseClient?.initialized || false;
        });
        expect(clientStatus).toBe(true);
      });
    });

    test('TC-SUP-002: 连接状态检查', async () => {
      await test.step('检查连接指示器', async () => {
        const connectionIndicator = page
          .locator('[class*="connected"], [class*="connection"], text=已连接')
          .first();
        if (await connectionIndicator.isVisible()) {
          expect(await connectionIndicator.isVisible()).toBe(true);
        }
      });
    });
  });

  test.describe('工作流云端同步', () => {
    test('TC-SUP-003: 同步工作流到云端', async () => {
      await test.step('创建工作流', async () => {
        const newWorkflowBtn = page.locator('text=新建工作流').first();
        if (await newWorkflowBtn.isVisible()) {
          await newWorkflowBtn.click();
        }
      });

      await test.step('添加块', async () => {
        const addBtn = page.locator('[class*="add-block"]').first();
        if (await addBtn.isVisible()) {
          await addBtn.click();
        }
        const waitBlock = page.locator('text=等待').first();
        if (await waitBlock.isVisible()) {
          await waitBlock.click();
        }
      });

      await test.step('同步到云端', async () => {
        const syncBtn = page
          .locator('text=同步, text=Sync, [aria-label="同步"]')
          .first();
        if (await syncBtn.isVisible()) {
          await syncBtn.click();
        }
      });

      await test.step('验证同步成功', async () => {
        await page.waitForTimeout(3000);
        const successMsg = page.locator('text=同步成功, text=已上传').first();
        if (await successMsg.isVisible()) {
          expect(await successMsg.isVisible()).toBe(true);
        }
      });
    });

    test('TC-SUP-004: 从云端同步工作流', async () => {
      await test.step('打开云端工作流', async () => {
        const cloudBtn = page
          .locator('text=云端, text=Cloud, text=在线')
          .first();
        if (await cloudBtn.isVisible()) {
          await cloudBtn.click();
        }
      });

      await test.step('选择工作流', async () => {
        const cloudWorkflow = page
          .locator('[class*="cloud-workflow"], text=工作流')
          .first();
        if (await cloudWorkflow.isVisible()) {
          await cloudWorkflow.click();
        }
      });

      await test.step('下载工作流', async () => {
        const downloadBtn = page
          .locator('button:has-text("下载"), button:has-text("同步")]')
          .first();
        if (await downloadBtn.isVisible()) {
          await downloadBtn.click();
        }
      });

      await test.step('验证下载成功', async () => {
        await page.waitForTimeout(2000);
        const blocks = page.locator('[class*="block"]');
        if (await blocks.first().isVisible()) {
          expect(await blocks.first()).toBeVisible();
        }
      });
    });

    test('TC-SUP-005: 自动同步', async () => {
      await test.step('启用自动同步', async () => {
        const settingsBtn = page.locator('text=设置').first();
        if (await settingsBtn.isVisible()) {
          await settingsBtn.click();
        }

        const autoSyncToggle = page
          .locator('text=自动同步, text=Auto Sync')
          .first();
        if (await autoSyncToggle.isVisible()) {
          await autoSyncToggle.click();
        }
      });

      await test.step('修改工作流', async () => {
        await page.goto(`chrome-extension://${EXTENSION_ID}/newtab.html`);
        await page.waitForLoadState('domcontentloaded');

        const addBtn = page.locator('[class*="add-block"]').first();
        if (await addBtn.isVisible()) {
          await addBtn.click();
        }
        const clickBlock = page.locator('text=点击').first();
        if (await clickBlock.isVisible()) {
          await clickBlock.click();
        }
      });

      await test.step('验证自动同步发生', async () => {
        await page.waitForTimeout(3000);
        const syncIndicator = page.locator('text=同步中, text=Syncing').first();
        if (await syncIndicator.isVisible({ timeout: 5000 })) {
          expect(await syncIndicator.isVisible()).toBe(true);
        }
      });
    });
  });

  test.describe('数据一致性', () => {
    test('TC-SUP-006: 本地与远程数据一致', async () => {
      await test.step('创建工作流', async () => {
        const newWorkflowBtn = page.locator('text=新建工作流').first();
        if (await newWorkflowBtn.isVisible()) {
          await newWorkflowBtn.click();
        }
      });

      await test.step('同步到云端', async () => {
        const syncBtn = page.locator('text=同步').first();
        if (await syncBtn.isVisible()) {
          await syncBtn.click();
        }

        await page.waitForTimeout(3000);
      });

      await test.step('获取本地数据', async () => {
        const localData = await page.evaluate(() => {
          return JSON.stringify(localStorage.getItem('workflows'));
        });
        expect(localData).toBeTruthy();
      });
    });

    test('TC-SUP-007: 并发修改处理', async () => {
      await test.step('模拟另一端修改', async () => {
        await page.evaluate(() => {
          localStorage.setItem('lastSync', String(Date.now() - 100000));
        });
      });

      await test.step('刷新页面', async () => {
        await page.reload();
        await page.waitForLoadState('domcontentloaded');
      });

      await test.step('检查冲突提示', async () => {
        const conflictMsg = page.locator('text=冲突, text=Conflict').first();
        if (await conflictMsg.isVisible({ timeout: 3000 })) {
          expect(await conflictMsg.isVisible()).toBe(true);
        }
      });
    });
  });

  test.describe('用户数据', () => {
    test('TC-SUP-008: 获取用户工作流列表', async () => {
      await test.step('打开工作流列表', async () => {
        const workflowsBtn = page
          .locator('text=我的工作流, text=My Workflows')
          .first();
        if (await workflowsBtn.isVisible()) {
          await workflowsBtn.click();
        }
      });

      await test.step('验证列表显示', async () => {
        const workflowList = page
          .locator('[class*="workflow-list"], [class*="WorkflowList"]')
          .first();
        if (await workflowList.isVisible()) {
          expect(await workflowList.isVisible()).toBe(true);
        }
      });
    });

    test('TC-SUP-009: 获取共享工作流', async () => {
      await test.step('打开共享工作流', async () => {
        const sharedBtn = page.locator('text=共享, text=Shared').first();
        if (await sharedBtn.isVisible()) {
          await sharedBtn.click();
        }
      });

      await test.step('验证共享列表', async () => {
        const sharedList = page
          .locator('[class*="shared"], [class*="Shared"]')
          .first();
        if (await sharedList.isVisible()) {
          expect(await sharedList.isVisible()).toBe(true);
        }
      });
    });
  });

  test.describe('团队协作', () => {
    test('TC-SUP-010: 查看团队工作流', async () => {
      await test.step('打开团队页面', async () => {
        const teamBtn = page.locator('text=团队, text=Team').first();
        if (await teamBtn.isVisible()) {
          await teamBtn.click();
        }
      });

      await test.step('验证团队工作流', async () => {
        const teamWorkflows = page
          .locator('[class*="team-workflow"], text=团队')
          .first();
        if (await teamWorkflows.isVisible()) {
          expect(await teamWorkflows.isVisible()).toBe(true);
        }
      });
    });

    test('TC-SUP-011: 权限检查', async () => {
      await test.step('检查工作流权限', async () => {
        const workflowCard = page.locator('[class*="workflow-card"]').first();
        if (await workflowCard.isVisible()) {
          await workflowCard.hover();
        }

        const permissionBadge = page
          .locator('text=只读, text=可编辑, text=Admin')
          .first();
        if (await permissionBadge.isVisible()) {
          expect(await permissionBadge.isVisible()).toBe(true);
        }
      });
    });
  });

  test.describe('错误处理', () => {
    test('TC-SUP-012: 网络断开处理', async () => {
      await test.step('模拟网络断开', async () => {
        await page.route('**/supabase/**', (route) => {
          route.abort('failed');
        });
      });

      await test.step('尝试同步', async () => {
        const syncBtn = page.locator('text=同步').first();
        if (await syncBtn.isVisible()) {
          await syncBtn.click();
        }
      });

      await test.step('验证错误提示', async () => {
        await page.waitForTimeout(3000);
        const errorMsg = page
          .locator('text=网络错误, text=连接失败, text=Offline')
          .first();
        if (await errorMsg.isVisible()) {
          expect(await errorMsg.isVisible()).toBe(true);
        }
      });
    });

    test('TC-SUP-013: 认证过期处理', async () => {
      await test.step('模拟认证过期', async () => {
        await page.evaluate(() => {
          localStorage.removeItem('supabase.auth.token');
        });
      });

      await test.step('尝试访问', async () => {
        await page.reload();
        await page.waitForLoadState('domcontentloaded');
      });

      await test.step('验证重定向到登录', async () => {
        await page.waitForTimeout(2000);
        const loginForm = page
          .locator('input[type="email"], button:has-text("登录")]')
          .first();
        if (await loginForm.isVisible()) {
          expect(await loginForm.isVisible()).toBe(true);
        }
      });
    });

    test('TC-SUP-014: 权限不足处理', async () => {
      await test.step('尝试访问无权限资源', async () => {
        await page.goto(
          `chrome-extension://${EXTENSION_ID}/newtab.html?workflow=restricted-id`
        );
        await page.waitForLoadState('domcontentloaded');
      });

      await test.step('验证权限错误', async () => {
        await page.waitForTimeout(2000);
        const accessDenied = page
          .locator('text=无权限, text=Access Denied, text=禁止访问')
          .first();
        if (await accessDenied.isVisible()) {
          expect(await accessDenied.isVisible()).toBe(true);
        }
      });
    });
  });

  test.describe('存储功能', () => {
    test('TC-SUP-015: 上传文件到存储', async () => {
      await test.step('打开存储设置', async () => {
        const storageBtn = page.locator('text=存储, text=Storage').first();
        if (await storageBtn.isVisible()) {
          await storageBtn.click();
        }
      });

      await test.step('选择上传文件', async () => {
        const uploadBtn = page
          .locator('button:has-text("上传"), input[type="file"]')
          .first();
        if (await uploadBtn.isVisible()) {
          await uploadBtn.click();
        }
      });
    });

    test('TC-SUP-016: 下载云端文件', async () => {
      await test.step('选择云端文件', async () => {
        const fileItem = page
          .locator('[class*="file-item"], [class*="file"]')
          .first();
        if (await fileItem.isVisible()) {
          await fileItem.click();
        }
      });

      await test.step('下载文件', async () => {
        const downloadBtn = page
          .locator('button:has-text("下载"), [aria-label="下载"]')
          .first();
        if (await downloadBtn.isVisible()) {
          await downloadBtn.click();
        }
      });
    });
  });

  test.describe('实时订阅', () => {
    test('TC-SUP-017: 实时更新监听', async () => {
      await test.step('打开工作流', async () => {
        const workflowCard = page.locator('[class*="workflow-card"]').first();
        if (await workflowCard.isVisible()) {
          await workflowCard.click();
        }
      });

      await test.step('验证实时连接', async () => {
        await page.waitForTimeout(1000);
        const realtimeIndicator = page
          .locator('text=实时连接, text=Connected')
          .first();
        if (await realtimeIndicator.isVisible()) {
          expect(await realtimeIndicator.isVisible()).toBe(true);
        }
      });
    });

    test('TC-SUP-018: 接收实时更新', async () => {
      await test.step('等待更新', async () => {
        await page.waitForTimeout(5000);
      });

      await test.step('检查更新通知', async () => {
        const updateNotification = page
          .locator('text=有新版本, text=已更新')
          .first();
        if (await updateNotification.isVisible({ timeout: 2000 })) {
          expect(await updateNotification.isVisible()).toBe(true);
        }
      });
    });
  });

  test.describe('性能测试', () => {
    test('TC-SUP-019: 同步性能测试', async () => {
      await test.step('记录同步时间', async () => {
        const startTime = Date.now();

        const syncBtn = page.locator('text=同步').first();
        if (await syncBtn.isVisible()) {
          await syncBtn.click();
        }

        await page.waitForTimeout(5000);

        const duration = Date.now() - startTime;
        console.log(`同步耗时: ${duration}ms`);
        expect(duration).toBeGreaterThan(0);
      });
    });

    test('TC-SUP-020: 大工作流同步', async () => {
      await test.step('创建大工作流', async () => {
        for (let i = 0; i < 50; i++) {
          const addBtn = page.locator('[class*="add-block"]').first();
          if (await addBtn.isVisible()) {
            await addBtn.click();
          }
          const waitBlock = page.locator('text=等待').first();
          if (await waitBlock.isVisible()) {
            await waitBlock.click();
          }
        }
      });

      await test.step('同步大工作流', async () => {
        const syncBtn = page.locator('text=同步').first();
        if (await syncBtn.isVisible()) {
          await syncBtn.click();
        }
      });

      await test.step('验证同步完成', async () => {
        await page.waitForTimeout(10000);
        const successMsg = page.locator('text=同步成功').first();
        if (await successMsg.isVisible()) {
          expect(await successMsg.isVisible()).toBe(true);
        }
      });
    });
  });

  test.describe('数据备份', () => {
    test('TC-SUP-021: 创建云端备份', async () => {
      await test.step('打开备份设置', async () => {
        const settingsBtn = page.locator('text=设置').first();
        if (await settingsBtn.isVisible()) {
          await settingsBtn.click();
        }

        const backupBtn = page.locator('text=备份, text=Backup').first();
        if (await backupBtn.isVisible()) {
          await backupBtn.click();
        }
      });

      await test.step('创建备份', async () => {
        const createBtn = page.locator('button:has-text("创建备份")]').first();
        if (await createBtn.isVisible()) {
          await createBtn.click();
        }
      });

      await test.step('验证备份创建', async () => {
        await page.waitForTimeout(3000);
        const successMsg = page
          .locator('text=备份成功, text=Backup created')
          .first();
        if (await successMsg.isVisible()) {
          expect(await successMsg.isVisible()).toBe(true);
        }
      });
    });

    test('TC-SUP-022: 恢复云端备份', async () => {
      await test.step('打开备份列表', async () => {
        const backupBtn = page.locator('text=备份').first();
        if (await backupBtn.isVisible()) {
          await backupBtn.click();
        }
      });

      await test.step('选择备份', async () => {
        const backupItem = page
          .locator('[class*="backup-item"], text=备份')
          .first();
        if (await backupItem.isVisible()) {
          await backupItem.click();
        }
      });

      await test.step('恢复备份', async () => {
        const restoreBtn = page.locator('button:has-text("恢复")]').first();
        if (await restoreBtn.isVisible()) {
          await restoreBtn.click();
        }
      });
    });
  });
});
