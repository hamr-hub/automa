# 离线优先同步服务详解

Automa 采用离线优先的同步策略，确保用户在无网络环境下也能正常使用所有功能，并在网络恢复后自动同步数据。

## 同步架构

```
┌────────────────────────────────────────────────────────────────┐
│                      Automa Sync Architecture                   │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌─────────────────┐                                           │
│  │   User Actions  │                                           │
│  │  (Create/Update │                                           │
│  │   /Delete)      │                                           │
│  └────────┬────────┘                                           │
│           │                                                    │
│           ▼                                                    │
│  ┌─────────────────┐    ┌─────────────────────────────────┐   │
│  │   Local Store   │───▶│  WorkflowSyncService.markPending │   │
│  │   (IndexedDB)   │    │  (记录待同步操作)                 │   │
│  └─────────────────┘    └─────────────────────────────────┘   │
│           │                      │                             │
│           │                      ▼                             │
│           │           ┌─────────────────┐                      │
│           │           │  Pending Queue  │                      │
│           │           │  (localStorage) │                      │
│           │           └────────┬────────┘                      │
│           │                    │                               │
│           │                    ▼                               │
│           │    ┌──────────────────────────────────┐           │
│           │    │  Network Available?              │           │
│           │    │  - navigator.onLine              │           │
│           │    │  - Supabase connected            │           │
│           │    └───────────────┬──────────────────┘           │
│           │                    │                               │
│           │          ┌────────┴────────┐                      │
│           │          ▼                 ▼                      │
│           │   ┌─────────────┐   ┌─────────────┐              │
│           │   │   Sync!     │   │   Wait...   │              │
│           │   │             │   │             │              │
│           │   └──────┬──────┘   └─────────────┘              │
│           │          │                                      │
│           │          ▼                                      │
│           │   ┌──────────────────────────────────┐          │
│           │   │  WorkflowSyncService.syncOnce()  │          │
│           │   │  - 获取待同步队列                 │          │
│           │   │  - 推送到 Supabase               │          │
│           │   │  - 拉取远程变更                   │          │
│           │   │  - 解决冲突                       │          │
│           │   │  - 清除已同步标记                 │          │
│           │   └──────────────────────────────────┘          │
│           │                    │                              │
│           └────────────────────┴──────────────────────────────┘
│                                │
│                                ▼
│                      ┌─────────────────┐
│                      │   Supabase      │
│                      │   Backend       │
│                      │   (Remote)      │
│                      └─────────────────┘
│
└────────────────────────────────────────────────────────────────┘
```

## 核心组件

### WorkflowSyncService

**文件**: `src/services/workflowSync/WorkflowSyncService.js`

```javascript
class WorkflowSyncService {
  constructor() {
    this.pendingQueue = new Map();  // 待同步操作队列
    this.isSyncing = false;          // 是否正在同步
    this.syncInterval = null;        // 同步定时器
  }

  /**
   * 初始化同步服务
   */
  async initialize() {
    // 从 localStorage 加载待同步队列
    await this.loadPendingQueue();
    
    // 设置自动同步
    this.startAutoSync();
    
    // 监听网络状态变化
    window.addEventListener('online', () => this.onNetworkOnline());
    window.addEventListener('offline', () => this.onNetworkOffline());
  }

  /**
   * 标记待同步操作
   * @param {string} operation - 操作类型: 'upsert' | 'delete'
   * @param {string} workflowId - 工作流 ID
   * @param {Object} data - 工作流数据（upsert 时需要）
   */
  async markPending(operation, workflowId, data = null) {
    const pendingKey = `sync:pending:${workflowId}`;
    
    const pendingItem = {
      operation,
      workflowId,
      data: operation === 'upsert' ? data : null,
      timestamp: Date.now(),
      retryCount: 0,
    };
    
    // 保存到 localStorage
    await browser.storage.local.set({
      [pendingKey]: pendingItem,
    });
    
    // 更新内存队列
    this.pendingQueue.set(workflowId, pendingItem);
    
    console.log(`[Sync] Marked ${operation} for workflow ${workflowId}`);
  }

  /**
   * 获取待同步数量
   * @returns {Promise<number>}
   */
  async getPendingCount() {
    const { sync: syncData } = await browser.storage.local.get('sync');
    const pending = syncData || {};
    
    return Object.keys(pending).filter(key => 
      key.startsWith('sync:pending:')
    ).length;
  }

  /**
   * 执行一次同步
   * @returns {Promise<Object>} 同步结果
   */
  async syncOnce() {
    // 防止重复同步
    if (this.isSyncing) {
      console.log('[Sync] Sync already in progress, skipping...');
      return { synced: 0, skipped: 0, reason: 'in-progress' };
    }
    
    // 检查网络
    if (!navigator.onLine) {
      console.log('[Sync] Offline, skipping sync...');
      return { synced: 0, skipped: 0, reason: 'offline' };
    }
    
    this.isSyncing = true;
    const result = {
      synced: 0,
      skipped: 0,
      failed: 0,
      errors: [],
    };
    
    try {
      // 获取所有待同步项
      const pendingItems = await this.getPendingItems();
      
      if (pendingItems.length === 0) {
        console.log('[Sync] No pending items to sync');
        this.isSyncing = false;
        return { ...result, skipped: 0, reason: 'no-pending' };
      }
      
      console.log(`[Sync] Processing ${pendingItems.length} pending items...`);
      
      for (const item of pendingItems) {
        try {
          const success = await this.syncItem(item);
          
          if (success) {
            result.synced++;
            // 清除已同步标记
            await this.clearPending(item.workflowId);
          } else {
            result.skipped++;
          }
        } catch (error) {
          result.failed++;
          result.errors.push({
            workflowId: item.workflowId,
            error: error.message,
          });
          
          // 更新重试计数
          await this.updateRetryCount(item);
        }
      }
      
      // 同步完成后，从远端拉取最新数据
      await this.pullFromRemote();
      
    } finally {
      this.isSyncing = false;
    }
    
    console.log(`[Sync] Completed: ${result.synced} synced, ${result.failed} failed`);
    return result;
  }

  /**
   * 同步单个项目
   * @param {Object} item - 待同步项
   * @returns {Promise<boolean>}
   */
  async syncItem(item) {
    const supabase = getSupabaseClient();
    
    switch (item.operation) {
      case 'upsert':
        return await this.syncUpsert(supabase, item);
        
      case 'delete':
        return await this.syncDelete(supabase, item);
        
      default:
        console.warn(`[Sync] Unknown operation: ${item.operation}`);
        return false;
    }
  }

  /**
   * 同步 upsert 操作
   */
  async syncUpsert(supabase, item) {
    const { data, error } = await supabase
      .from('workflows')
      .upsert({
        id: item.workflowId,
        data: item.data,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id',
      });
    
    if (error) {
      console.error(`[Sync] Upsert failed for ${item.workflowId}:`, error);
      throw error;
    }
    
    console.log(`[Sync] Upserted workflow ${item.workflowId}`);
    return true;
  }

  /**
   * 同步 delete 操作
   */
  async syncDelete(supabase, item) {
    const { error } = await supabase
      .from('workflows')
      .delete()
      .eq('id', item.workflowId);
    
    if (error) {
      console.error(`[Sync] Delete failed for ${item.workflowId}:`, error);
      throw error;
    }
    
    console.log(`[Sync] Deleted workflow ${item.workflowId}`);
    return true;
  }

  /**
   * 从远端拉取最新数据
   */
  async pullFromRemote() {
    const supabase = getSupabaseClient();
    const userStore = useUserStore();
    
    if (!userStore.user?.id) {
      console.log('[Sync] No user, skipping pull');
      return;
    }
    
    // 获取用户的所有工作流
    const { data: remoteWorkflows, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('user_id', userStore.user.id)
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('[Sync] Pull failed:', error);
      return;
    }
    
    // 获取本地工作流
    const { workflows: localWorkflows } = await browser.storage.local.get('workflows');
    
    // 合并数据
    for (const remoteWorkflow of remoteWorkflows) {
      const localWorkflow = localWorkflows?.[remoteWorkflow.id];
      
      // 如果本地不存在，或者远程更新，更新本地
      if (!localWorkflow || 
          new Date(remoteWorkflow.updated_at) > new Date(localWorkflow.updatedAt)) {
        
        await browser.storage.local.set({
          [`workflows.${remoteWorkflow.id}`]: {
            ...remoteWorkflow.data,
            updatedAt: new Date(remoteWorkflow.updated_at).getTime(),
          },
        });
        
        console.log(`[Sync] Pulled workflow ${remoteWorkflow.id}`);
      }
    }
  }

  /**
   * 加载待同步队列
   */
  async loadPendingQueue() {
    const { sync: syncData } = await browser.storage.local.get('sync');
    const pending = syncData || {};
    
    this.pendingQueue.clear();
    
    for (const [key, value] of Object.entries(pending)) {
      if (key.startsWith('sync:pending:')) {
        const workflowId = key.replace('sync:pending:', '');
        this.pendingQueue.set(workflowId, value);
      }
    }
    
    console.log(`[Sync] Loaded ${this.pendingQueue.size} pending items`);
  }

  /**
   * 清除待同步标记
   */
  async clearPending(workflowId) {
    const pendingKey = `sync:pending:${workflowId}`;
    
    await browser.storage.local.remove(pendingKey);
    this.pendingQueue.delete(workflowId);
    
    console.log(`[Sync] Cleared pending for ${workflowId}`);
  }

  /**
   * 更新重试计数
   */
  async updateRetryCount(item) {
    const maxRetries = 3;
    
    if (item.retryCount >= maxRetries) {
      console.warn(`[Sync] Max retries reached for ${item.workflowId}, giving up`);
      // 可以在这里将项移到死信队列
      return;
    }
    
    const pendingKey = `sync:pending:${item.workflowId}`;
    const updatedItem = {
      ...item,
      retryCount: item.retryCount + 1,
      lastRetryAt: Date.now(),
    };
    
    await browser.storage.local.set({
      [pendingKey]: updatedItem,
    });
  }

  /**
   * 网络恢复处理
   */
  async onNetworkOnline() {
    console.log('[Sync] Network online, checking for sync...');
    
    const pendingCount = await this.getPendingCount();
    if (pendingCount > 0) {
      await this.syncOnce();
    }
  }

  /**
   * 网络断开处理
   */
  onNetworkOffline() {
    console.log('[Sync] Network offline, will sync when online');
  }

  /**
   * 启动自动同步
   */
  startAutoSync() {
    // 每5分钟检查一次
    this.syncInterval = setInterval(async () => {
      if (navigator.onLine && (await this.getPendingCount()) > 0) {
        await this.syncOnce();
      }
    }, 5 * 60 * 1000);
  }

  /**
   * 停止自动同步
   */
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * 获取所有待同步项
   */
  async getPendingItems() {
    const { sync: syncData } = await browser.storage.local.get('sync');
    const pending = syncData || {};
    
    return Object.entries(pending)
      .filter(([key]) => key.startsWith('sync:pending:'))
      .map(([_, value]) => value);
  }
}

// 导出单例
const workflowSyncService = new WorkflowSyncService();
export default workflowSyncService;
```

---

## 与 Store 集成

### workflow.js

```javascript
// src/stores/workflow.js

export const useWorkflowStore = defineStore('workflow', {
  actions: {
    async insert(data = {}, options = {}) {
      const workflow = defaultWorkflow(data, options);
      this.workflows[workflow.id] = workflow;
      
      await this.saveToStorage('workflows');
      
      // 离线优先：记录待同步
      try {
        const { default: WorkflowSyncService } = 
          await import('@/services/workflowSync/WorkflowSyncService');
        await WorkflowSyncService.markPending('upsert', workflow.id, workflow);
      } catch (error) {
        console.warn('Sync not available:', error);
      }
      
      return workflow;
    },

    async update({ id, data = {} }) {
      const updateData = { ...data, updatedAt: Date.now() };
      Object.assign(this.workflows[id], updateData);
      
      await this.saveToStorage('workflows');
      
      // 离线优先：记录待同步
      try {
        const { default: WorkflowSyncService } = 
          await import('@/services/workflowSync/WorkflowSyncService');
        await WorkflowSyncService.markPending('upsert', id, this.workflows[id]);
      } catch (error) {
        console.warn('Sync not available:', error);
      }
    },

    async delete(id) {
      delete this.workflows[id];
      await cleanWorkflowTriggers(id);
      
      // 离线优先：记录待同步
      try {
        const { default: WorkflowSyncService } = 
          await import('@/services/workflowSync/WorkflowSyncService');
        await WorkflowSyncService.markPending('delete', id);
      } catch (error) {
        console.warn('Sync not available:', error);
      }
      
      await this.saveToStorage('workflows');
    },
  },
});
```

---

## 后台自动同步

```javascript
// src/background/index.js

// 启动时同步
browser.runtime.onStartup.addListener(async () => {
  try {
    const { default: WorkflowSyncService } = 
      await import('@/services/workflowSync/WorkflowSyncService');
    
    if (navigator.onLine && (await WorkflowSyncService.getPendingCount()) > 0) {
      await WorkflowSyncService.syncOnce();
    }
  } catch (error) {
    console.warn('Sync on startup failed:', error);
  }
});

// 安装后同步
browser.runtime.onInstalled.addListener(async (details) => {
  try {
    const { default: WorkflowSyncService } = 
      await import('@/services/workflowSync/WorkflowSyncService');
    await WorkflowSyncService.syncOnce();
  } catch (error) {
    console.warn('Sync on install failed:', error);
  }
});

// 手动触发同步（通过消息）
message.on('workflow:sync', async () => {
  if (!navigator.onLine) return { synced: 0, reason: 'offline' };
  
  const result = await WorkflowSyncService.syncOnce();
  return result;
});
```

---

## 冲突解决策略

### 时间戳比较

```javascript
async function resolveConflict(local, remote) {
  const localTime = new Date(local.updatedAt || local.updated_at);
  const remoteTime = new Date(remote.updatedAt || remote.updated_at);
  
  // 保留最新修改的版本
  if (localTime > remoteTime) {
    return { winner: 'local', data: local };
  } else {
    return { winner: 'remote', data: remote };
  }
}
```

### 合并策略

```javascript
async function mergeWorkflows(local, remote) {
  return {
    // 保留本地的名称和设置
    name: local.name || remote.name,
    settings: { ...remote.settings, ...local.settings },
    // 保留最新的 drawflow
    drawflow: local.updatedAt > remote.updatedAt 
      ? local.drawflow 
      : remote.drawflow,
    // 保留最新的更新时间
    updatedAt: Math.max(local.updatedAt, remote.updatedAt || 0),
  };
}
```

---

## 监控和调试

### 同步状态检查

```javascript
// 检查同步服务状态
const status = {
  pendingCount: await WorkflowSyncService.getPendingCount(),
  isSyncing: WorkflowSyncService.isSyncing,
  lastSyncTime: localStorage.getItem('sync:lastSync'),
};

console.log('Sync status:', status);
```

### 手动触发同步

```javascript
// 从控制台手动触发同步
const { default: WorkflowSyncService } = 
  await import('@/services/workflowSync/WorkflowSyncService');

const result = await WorkflowSyncService.syncOnce();
console.log('Sync result:', result);
```

### 查看待同步队列

```javascript
const pending = await WorkflowSyncService.getPendingItems();
console.table(pending);
```

---

## 性能考虑

### 1. 批量同步

```javascript
async function syncBatch(items, batchSize = 10) {
  const results = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(item => this.syncItem(item))
    );
    results.push(...batchResults);
    
    // 批次间延迟，避免 API 限流
    if (i + batchSize < items.length) {
      await sleep(1000);
    }
  }
  
  return results;
}
```

### 2. 增量同步

```javascript
// 只同步变更的部分
async function syncIncremental(lastSyncTime) {
  const { data: changedWorkflows } = await supabase
    .from('workflows')
    .select('*')
    .eq('user_id', userId)
    .gt('updated_at', lastSyncTime);
  
  return changedWorkflows;
}
```

### 3. 本地压缩

```javascript
// 压缩工作流数据后再上传
import { compress, decompress } from '@/utils/compression';

async function syncItem(item) {
  const compressed = await compress(JSON.stringify(item.data));
  
  const { error } = await supabase
    .from('workflows')
    .upsert({
      id: item.workflowId,
      data_compressed: compressed,
      updated_at: new Date().toISOString(),
    });
}
```

---

## 错误处理

### 重试策略

```javascript
async function syncWithRetry(item, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await this.syncItem(item);
    } catch (error) {
      console.warn(`Sync attempt ${attempt} failed:`, error);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // 指数退避
      const delay = Math.pow(2, attempt) * 1000;
      await sleep(delay);
    }
  }
}
```

### 死信队列

```javascript
// 将无法同步的项目移到死信队列
async function moveToDeadLetterQueue(item, error) {
  const dlqKey = `sync:dlq:${item.workflowId}`;
  
  await browser.storage.local.set({
    [dlqKey]: {
      ...item,
      error: error.message,
      failedAt: Date.now(),
    },
  });
  
  // 清除待同步标记
  await this.clearPending(item.workflowId);
}
```
