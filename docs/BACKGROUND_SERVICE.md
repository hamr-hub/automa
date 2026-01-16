# 后台服务 (Background Service) 详解

后台服务脚本是浏览器扩展的核心枢纽，负责全局事件监听、工作流调度和跨上下文通信。

## 概述

后台服务在独立的 Service Worker 上下文中运行，是唯一可以访问所有浏览器 API 的组件。

```json
// manifest.chrome.json
{
  "background": {
    "service_worker": "background.bundle.js",
    "type": "module"
  }
}
```

---

## 核心职责

1. **全局事件监听** - 标签页、导航、下载、快捷键等
2. **工作流调度** - 执行、暂停、恢复、停止工作流
3. **触发器管理** - 定时任务、右键菜单、快捷键注册
4. **跨上下文通信** - 协调 Popup、New Tab、Content Script
5. **资源管理** - CSP 处理、脚本注入、下载管理

---

## 目录结构

```
src/background/
├── index.js                      # 主入口
├── BackgroundEventsListeners.js  # 事件监听处理器
├── BackgroundOffscreen.js        # Offscreen 文档管理
├── BackgroundUtils.js            # 工具函数
├── BackgroundWorkflowTriggers.js # 工作流触发器
├── BackgroundWorkflowUtils.js    # 工作流工具函数
```

---

## 主入口 (index.js)

### 初始化流程

```javascript
// src/background/index.js

import BackgroundEventsListeners from './BackgroundEventsListeners.js';
import BackgroundOffscreen from './BackgroundOffscreen.js';
import BackgroundUtils from './BackgroundUtils.js';
import BackgroundWorkflowUtils from './BackgroundWorkflowUtils.js';
import WorkflowSyncService from '@/services/workflowSync/WorkflowSyncService.js';

// 初始化 Offscreen
try {
  BackgroundOffscreen.instance.sendMessage('halo').catch(() => {});
} catch (e) {}

// 注册系统事件监听
if (browser.alarms?.onAlarm) {
  browser.alarms.onAlarm.addListener(BackgroundEventsListeners.onAlarms);
}

if (browser.commands?.onCommand) {
  browser.commands.onCommand.addListener(BackgroundEventsListeners.onCommand);
}

// 浏览器操作点击
const browserAction = browser?.action || browser?.browserAction;
if (browserAction?.onClicked) {
  browserAction.onClicked.addListener(
    BackgroundEventsListeners.onActionClicked
  );
}

// 启动事件
if (browser.runtime?.onStartup) {
  browser.runtime.onStartup.addListener(async () => {
    BackgroundEventsListeners.onRuntimeStartup();
    
    // 尝试同步
    if (navigator.onLine && (await WorkflowSyncService.getPendingCount()) > 0) {
      await WorkflowSyncService.syncOnce();
    }
  });
}

// 安装事件
if (browser.runtime?.onInstalled) {
  browser.runtime.onInstalled.addListener(async (details) => {
    await BackgroundEventsListeners.onRuntimeInstalled(details);
    await WorkflowSyncService.syncOnce();
  });
}
```

### 消息路由

```javascript
const message = new MessageListener('background');

// 浏览器 API 代理
message.on('browser-api', (payload) => {
  return BrowserAPIService.runtimeMessageHandler(payload);
});

// 获取文件
message.on('get:file', (path) => getFile(path));

// 截图
message.on('get:tab-screenshot', (options, sender) =>
  browser.tabs.captureVisibleTab(sender.tab.windowId, options)
);

// 工作流执行
message.on('workflow:execute', async (workflowData, sender) => {
  if (workflowData.includeTabId) {
    workflowData.options.tabId = sender.tab.id;
  }
  
  BackgroundWorkflowUtils.instance.executeWorkflow(
    workflowData,
    workflowData.options || {}
  );
});

// 工作流停止
message.on('workflow:stop', (stateId) =>
  BackgroundWorkflowUtils.instance.stopExecution(stateId)
);

// 工作流恢复
message.on('workflow:resume', ({ id, nextBlock }) => {
  BackgroundWorkflowUtils.instance.resumeExecution(id, nextBlock);
});

// 工作流同步
message.on('workflow:sync', async () => {
  if (!navigator.onLine) return { synced: 0, reason: 'offline' };
  
  const result = await WorkflowSyncService.syncOnce();
  return result;
});

// 脚本执行
message.on('script:execute', async ({ target, blockData, varName, preloadScripts }) => {
  return executeScript(target, blockData, varName, preloadScripts);
});

// CSP 检查和注入
message.on('check-csp-and-inject', async ({ target, debugMode, callback, options }) => {
  return checkAndInjectCSP(target, debugMode, callback, options);
});
```

---

## 事件监听 (BackgroundEventsListeners.js)

### 定时器事件

```javascript
// src/background/BackgroundEventsListeners.js

export const onAlarms = async (alarm) => {
  // 解析工作流 ID
  const workflowId = alarm.name.replace('trigger:', '');
  
  // 获取工作流数据
  const { workflows } = await browser.storage.local.get('workflows');
  const workflow = workflows?.[workflowId];
  
  if (workflow && !workflow.isDisabled) {
    // 执行工作流
    BackgroundWorkflowUtils.instance.executeWorkflow(workflow);
  }
};
```

### 快捷键事件

```javascript
export const onCommand = async (command) => {
  if (command === 'open-dashboard') {
    BackgroundUtils.openDashboard();
    return;
  }
  
  if (command === 'element-picker') {
    // 打开元素选择器
    const [activeTab] = await browser.tabs.query({ active: true, currentWindow: true });
    
    await browser.tabs.sendMessage(activeTab.id, {
      type: 'open-element-picker',
    });
    return;
  }
  
  // 工作流快捷键 (格式: workflow-{workflowId})
  if (command.startsWith('workflow-')) {
    const workflowId = command.replace('workflow-', '');
    const { workflows } = await browser.storage.local.get('workflows');
    const workflow = workflows?.[workflowId];
    
    if (workflow && !workflow.isDisabled) {
      BackgroundWorkflowUtils.instance.executeWorkflow(workflow);
    }
  }
};
```

### 扩展图标点击

```javascript
export const onActionClicked = async (tab) => {
  // 打开仪表板
  await BackgroundUtils.openDashboard('', false);
};
```

### 导航完成事件

```javascript
export const onWebNavigationCompleted = async (details) => {
  if (details.frameId !== 0) return; // 只处理主框架
  
  // 检查访问网页触发器
  const { visitWebTriggers } = await browser.storage.local.get('visitWebTriggers');
  
  if (!visitWebTriggers || visitWebTriggers.length === 0) return;
  
  for (const trigger of visitWebTriggers) {
    const match = trigger.isRegex
      ? new RegExp(trigger.url).test(details.url)
      : details.url.includes(trigger.url);
    
    if (match) {
      const { workflows } = await browser.storage.local.get('workflows');
      const workflow = workflows?.[trigger.id];
      
      if (workflow && !workflow.isDisabled) {
        BackgroundWorkflowUtils.instance.executeWorkflow(workflow, {
          tabId: details.tabId,
        });
      }
    }
  }
};
```

### 右键菜单点击

```javascript
export const onContextMenuClicked = async (info, tab) => {
  if (!info.menuItemId.startsWith('trigger:')) return;
  
  const [, , workflowId] = info.menuItemId.split(':');
  const { workflows } = await browser.storage.local.get('workflows');
  const workflow = workflows?.[workflowId];
  
  if (workflow && !workflow.isDisabled) {
    BackgroundWorkflowUtils.instance.executeWorkflow(workflow, {
      tabId: tab?.id,
    });
  }
};
```

### 通知点击

```javascript
export const onNotificationClicked = async (notificationId) => {
  // 获取通知关联的工作流
  const { workflowStates } = await browser.storage.local.get('workflowStates');
  const state = Object.values(workflowStates || {}).find(
    s => s.notificationId === notificationId
  );
  
  if (state) {
    // 打开日志页面
    await BackgroundUtils.openDashboard(`/logs/${state.id}`);
  }
  
  // 关闭通知
  if (browser.notifications) {
    browser.notifications.clear(notificationId);
  }
};
```

---

## 工作流工具 (BackgroundWorkflowUtils.js)

### 执行工作流

```javascript
class BackgroundWorkflowUtils {
  constructor() {
    this.engines = new Map();  // 工作流引擎映射
  }

  /**
   * 执行工作流
   * @param {Object} workflowData - 工作流数据
   * @param {Object} options - 选项
   */
  async executeWorkflow(workflowData, options = {}) {
    const engine = new WorkflowEngine(workflowData, {
      states: new WorkflowState(),
      logger: new WorkflowLogger(),
      blocksHandler: blocksHandler(),
      isPopup: options.isPopup ?? true,
      options: {
        data: options.data,
        tabId: options.tabId,
        blockId: options.blockId,
        checkParams: options.checkParams ?? true,
      },
    });
    
    // 保存引擎引用
    this.engines.set(engine.id, engine);
    
    // 监听工作流事件
    engine.on('finish', () => {
      this.engines.delete(engine.id);
    });
    
    // 初始化执行
    await engine.init();
    
    return engine.id;
  }

  /**
   * 停止执行
   * @param {string} stateId - 状态 ID
   */
  async stopExecution(stateId) {
    const state = await new WorkflowState().get(stateId);
    if (state) {
      state.stop();
    }
  }

  /**
   * 恢复执行
   * @param {string} id - 工作流 ID
   * @param {string} nextBlock - 下一个块
   */
  async resumeExecution(id, nextBlock) {
    const state = await new WorkflowState().get(id);
    if (state) {
      state.resume({ nextBlock });
    }
  }

  /**
   * 更新执行状态
   * @param {string} id - 工作流 ID
   * @param {Object} data - 状态数据
   */
  async updateExecutionState(id, data) {
    const state = await new WorkflowState().get(id);
    if (state) {
      state.update(data);
    }
  }
}

BackgroundWorkflowUtils.instance = new BackgroundWorkflowUtils();
```

---

## 触发器管理 (BackgroundWorkflowTriggers.js)

### 注册定时触发器

```javascript
export function registerInterval(workflowId, data) {
  const alarmInfo = {
    periodInMinutes: data.interval,
  };
  
  if (data.delay > 0 && !data.fixedDelay) {
    alarmInfo.delayInMinutes = data.delay;
  }
  
  browser.alarms.create(workflowId, alarmInfo);
}
```

### 注册日期触发器

```javascript
export async function registerSpecificDate(workflowId, data) {
  let date = Date.now() + 60000;
  
  if (data.date) {
    const [hour, minute, second] = data.time.split(':');
    date = dayjs(data.date)
      .hour(hour)
      .minute(minute)
      .second(second || 0)
      .valueOf();
  }
  
  if (Date.now() > date) return;
  
  await browser.alarms.create(workflowId, {
    when: date,
  });
}
```

### 注册 Cron 触发器

```javascript
export async function registerCronJob(workflowId, data) {
  try {
    const cronExpression = cronParser.parseExpression(data.expression);
    const nextSchedule = cronExpression.next();
    
    await browser.alarms.create(workflowId, {
      when: nextSchedule.getTime(),
    });
  } catch (error) {
    console.error('Invalid cron expression:', error);
  }
}
```

### 注册右键菜单触发器

```javascript
export function registerContextMenu(triggerId, data) {
  const documentUrlPatterns = ['https://*/*', 'http://*/*'];
  const contextTypes = data.contextTypes?.length > 0
    ? data.contextTypes
    : ['all'];
  
  browser.contextMenus.create(
    {
      id: triggerId,
      documentUrlPatterns,
      contexts: contextTypes,
      title: data.contextMenuName,
      parentId: 'automaContextMenu',
    },
    () => {
      if (browser.runtime.lastError) {
        // 处理错误...
      }
    }
  );
}
```

### 注册键盘快捷键

```javascript
export async function registerKeyboardShortcut(workflowId, data) {
  const { shortcuts } = await browser.storage.local.get('shortcuts');
  const keyboardShortcuts = shortcuts || {};
  
  keyboardShortcuts[workflowId] = data.shortcut;
  
  await browser.storage.local.set({ shortcuts: keyboardShortcuts });
}
```

---

## 脚本注入

### 普通注入

```javascript
async function executeScript(target, blockData, varName, preloadScripts) {
  const automaScript = getAutomaScript({
    varName,
    refData: blockData.refData,
    everyNewTab: blockData.data.everyNewTab,
  });
  
  const result = await browser.scripting.executeScript({
    target,
    func: ($blockData, $preloadScripts, $automaScript) => {
      // 在页面上下文中执行
      const script = document.createElement('script');
      script.classList.add('automa-custom-js');
      script.textContent = `
        (() => {
          ${$automaScript}
          
          try {
            ${$blockData.data.code}
            automaNextBlock();
          } catch (error) {
            automaNextBlock({ $error: true, message: error.message });
          }
        })();
      `;
      
      document.head.appendChild(script);
    },
    world: 'MAIN',
    args: [blockData, preloadScripts, automaScript],
  });
  
  return result;
}
```

### CSP 绕过注入

```javascript
async function checkAndInjectCSP({ target, debugMode, callback, options }) {
  // 1. 检查页面是否被 CSP 阻止
  const [isBlockedByCSP] = await browser.scripting.executeScript({
    target,
    func: () => {
      const eventListener = ({ srcElement }) => {
        if (!srcElement || srcElement.id !== 'automa-csp') return;
        srcElement.remove();
        resolve(true);
      };
      
      document.addEventListener('securitypolicyviolation', eventListener);
      
      const script = document.createElement('script');
      script.id = 'automa-csp';
      script.innerText = 'console.log("...")';
      
      setTimeout(() => {
        document.removeEventListener('securitypolicyviolation', eventListener);
        resolve(false);
      }, 500);
      
      document.body.appendChild(script);
    },
    world: 'MAIN',
  });
  
  // 2. 如果被 CSP 阻止，使用 Debugger API
  if (isBlockedByCSP.result) {
    await new Promise(resolve => {
      chrome.debugger.attach({ tabId: target.tabId }, '1.3', resolve);
    });
    
    // 使用 Debugger API 执行脚本
    const execResult = await chrome.debugger.sendCommand(
      { tabId: target.tabId },
      'Runtime.evaluate',
      {
        expression: callback.toString() + '()',
        userGesture: true,
        awaitPromise: true,
      }
    );
    
    if (!debugMode) {
      await chrome.debugger.detach({ tabId: target.tabId });
    }
    
    return { isBlocked: true, value: execResult.result.value };
  }
  
  return { isBlocked: false };
}
```

---

## 下载管理

### 监听下载

```javascript
const downloadListeners = {
  registered: false,
  changedCallbacks: new Map(),
  pendingRequests: [],
  downloadDataCache: new Map(),
};

async function registerBackgroundDownloadListeners() {
  if (!browser.downloads) return;
  
  // 下载创建监听
  browser.downloads.onCreated.addListener(handleDownloadCreated);
  
  // 下载完成监听
  browser.downloads.onChanged.addListener(handleDownloadChanged);
  
  // 文件名确定监听
  if (browser.downloads.onDeterminingFilename) {
    browser.downloads.onDeterminingFilename.addListener(determineFilenameListener);
  }
}

async function handleDownloadCreated(downloadItem) {
  const pendingRequest = downloadListeners.pendingRequests.shift();
  
  if (pendingRequest) {
    const { downloadData, callback } = pendingRequest;
    
    // 缓存下载数据
    downloadListeners.downloadDataCache.set(downloadItem.id, downloadData);
    
    if (downloadData.waitForDownload && callback) {
      downloadListeners.changedCallbacks.set(downloadItem.id, callback);
    }
  }
}

function determineFilenameListener(item, suggest) {
  const downloadKey = `download-${item.id}`;
  
  if (downloadListeners.suggestCalled.has(downloadKey)) {
    return true;
  }
  
  downloadListeners.suggestCalled.add(downloadKey);
  
  setTimeout(async () => {
    const suggestion = downloadListeners.downloadDataCache.get(item.id);
    
    if (suggestion?.filename) {
      suggest({ filename: suggestion.filename });
    }
  }, 0);
  
  return true;
}
```

---

## 通信工具 (BackgroundUtils.js)

### 打开仪表板

```javascript
export function openDashboard(path = '', focus = true) {
  const url = browser.runtime.getURL(`/newtab.html${path}`);
  
  browser.tabs.query({ url: browser.runtime.getURL('/newtab.html') })
    .then((tabs) => {
      if (tabs.length > 0) {
        const lastTab = tabs.at(-1);
        
        if (focus) {
          browser.tabs.update(lastTab.id, { active: true });
          browser.windows.update(lastTab.windowId, { focused: true });
        }
      } else {
        browser.tabs.create({ url, active: focus });
      }
    });
}
```

### 发送消息到仪表板

```javascript
export async function sendMessageToDashboard(type, data) {
  const tabs = await browser.tabs.query({
    url: browser.runtime.getURL('/newtab.html'),
  });
  
  for (const tab of tabs) {
    browser.tabs.sendMessage(tab.id, { type, data });
  }
}
```

---

## 资源清理

### 内存管理

```javascript
// 定期清理无效的引擎引用
setInterval(() => {
  BackgroundWorkflowUtils.instance.engines.forEach((engine, id) => {
    if (engine.isDestroyed) {
      BackgroundWorkflowUtils.instance.engines.delete(id);
    }
  });
}, 60000);  // 每分钟检查一次
```

### 监听器清理

```javascript
// 在服务 worker 激活时清理
browser.runtime.onStartup.addListener(() => {
  browser.alarms.getAll().then((alarms) => {
    // 重新注册必要的定时器...
  });
});
```

---

## 性能优化

### 1. 延迟初始化

```javascript
// 延迟加载非关键模块
let workflowSyncService = null;

async function getSyncService() {
  if (!workflowSyncService) {
    const module = await import('@/services/workflowSync/WorkflowSyncService');
    workflowSyncService = module.default;
  }
  return workflowSyncService;
}
```

### 2. 消息批处理

```javascript
// 批量处理消息
const messageQueue = [];
let processing = false;

function queueMessage(payload) {
  messageQueue.push(payload);
  
  if (!processing) {
    processQueue();
  }
}

async function processQueue() {
  processing = true;
  
  while (messageQueue.length > 0) {
    const payload = messageQueue.shift();
    await handleMessage(payload);
  }
  
  processing = false;
}
```

### 3. 缓存查询结果

```javascript
const cache = new Map();
const CACHE_TTL = 5000;  // 5秒

async function getCachedTabInfo(tabId) {
  const cacheKey = `tab:${tabId}`;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  const tab = await browser.tabs.get(tabId);
  cache.set(cacheKey, { data: tab, timestamp: Date.now() });
  
  return tab;
}
```

---

## 调试技巧

### 1. 查看活跃的工作流

```javascript
// 在控制台执行
console.log('Active engines:', BackgroundWorkflowUtils.instance.engines.size);
BackgroundWorkflowUtils.instance.engines.forEach((engine, id) => {
  console.log(`Engine ${id}:`, engine.workflow.name, 'Status:', engine.state);
});
```

### 2. 测试触发器

```javascript
// 手动触发工作流
const workflowId = 'your-workflow-id';
const { workflows } = await browser.storage.local.get('workflows');
BackgroundWorkflowUtils.instance.executeWorkflow(workflows[workflowId]);
```

### 3. 检查权限

```javascript
// 检查扩展权限
console.log('Permissions:', browser.runtime.getManifest().permissions);
```
