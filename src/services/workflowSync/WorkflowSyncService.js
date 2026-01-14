/**
 * 离线优先的工作流同步服务
 *
 * 目标：
 * 1) 未登录/离线时，用户仍可正常使用本地工作流（browser.storage.local -> workflows）。
 * 2) 当网络可达 + Supabase 已登录时，将离线期间的变更增量同步到 Supabase(workflows 表)。
 *
 * 说明：
 * - 当前实现为最小可用版本：记录本地变更队列 + 触发一次同步。
 * - 冲突策略：以本地为准（local wins）。
 */

import browser from 'webextension-polyfill';
import supabaseClient from '@/services/supabase/SupabaseClient';
import apiAdapter from '@/utils/apiAdapter';

const STORAGE_KEYS = {
  pending: 'workflowSync:pending',
  meta: 'workflowSync:meta',
};

/**
 * @typedef {'upsert'|'delete'} PendingOpType
 */

/**
 * @typedef PendingOp
 * @property {PendingOpType} type
 * @property {string} id
 * @property {number} ts
 */

function now() {
  return Date.now();
}

async function readPending() {
  const { [STORAGE_KEYS.pending]: pending } = await browser.storage.local.get(
    STORAGE_KEYS.pending
  );
  if (!pending || typeof pending !== 'object') return {};
  return pending;
}

async function writePending(pending) {
  await browser.storage.local.set({ [STORAGE_KEYS.pending]: pending });
}

async function readMeta() {
  const { [STORAGE_KEYS.meta]: meta } = await browser.storage.local.get(
    STORAGE_KEYS.meta
  );
  return meta || { lastSyncAt: null, lastError: null };
}

async function writeMeta(meta) {
  await browser.storage.local.set({ [STORAGE_KEYS.meta]: meta });
}

async function isSupabaseReady() {
  // 只要 client 初始化成功 + 已登录才认为 ready
  if (!supabaseClient?.client) return false;
  try {
    const user = await supabaseClient.getCurrentUser();
    return Boolean(user);
  } catch (_) {
    return false;
  }
}

class WorkflowSyncService {
  /**
   * 记录本地变更（离线队列）
   * @param {PendingOpType} type
   * @param {string} id
   */
  static async markPending(type, id) {
    if (!id) return;

    const pending = await readPending();

    // 合并规则：
    // - delete 覆盖 upsert
    // - upsert 覆盖旧的 upsert
    pending[id] = { type, id, ts: now() };

    await writePending(pending);
  }

  /**
   * 获取待同步数量
   */
  static async getPendingCount() {
    const pending = await readPending();
    return Object.keys(pending).length;
  }

  /**
   * 执行一次同步（local wins）
   * @param {{ force?: boolean }} options
   */
  static async syncOnce(options = {}) {
    const { force = false } = options;

    const pending = await readPending();
    const ids = Object.keys(pending);
    if (ids.length === 0) return { synced: 0, skipped: 0 };

    // 尝试初始化 Supabase（不抛错，失败则返回）
    try {
      await apiAdapter.__ensureSupabase?.();
    } catch (_) {
      // ignore
    }

    const ready = await isSupabaseReady();
    if (!ready && !force) {
      return { synced: 0, skipped: ids.length };
    }

    // 读取本地 workflows
    const { workflows } = await browser.storage.local.get('workflows');
    const workflowsObj = workflows || {};

    let synced = 0;

    try {
      // 顺序同步（简单可靠，后续可并发/批量）
      for (const id of ids) {
        const op = pending[id];
        if (!op) continue;

        if (op.type === 'delete') {
          // 远端删除：没有登录会在 isSupabaseReady 阶段被挡住
          await apiAdapter.deleteWorkflow(id);
        } else {
          const local = workflowsObj[id];
          if (!local) {
            // 本地已不存在，按 delete 处理
            await apiAdapter.deleteWorkflow(id);
          } else {
            // upsert：优先 update，不存在则 create
            // 这里直接走 apiAdapter，它内部会做 Supabase/旧 API 的选择
            // 对于 Supabase：createWorkflow/updateWorkflow 都会检查 user
            try {
              await apiAdapter.updateWorkflow(id, local);
            } catch (e) {
              // update 失败可能是远端不存在，降级 create
              await apiAdapter.createWorkflow(local);
            }
          }
        }

        delete pending[id];
        synced += 1;
      }

      await writePending(pending);
      await writeMeta({ lastSyncAt: now(), lastError: null });

      return { synced, skipped: 0 };
    } catch (error) {
      await writeMeta({
        lastSyncAt: null,
        lastError: error?.message || String(error),
      });
      throw error;
    }
  }
}

export default WorkflowSyncService;
