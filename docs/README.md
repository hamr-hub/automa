# Automa 浏览器扩展 - 文档索引

欢迎使用 Automa 文档！本文档旨在帮助开发者理解 Automa 的架构设计、核心模块和实现细节。

## 文档结构

```
docs/
├── README.md                    # 文档索引（本文档）
├── ARCHITECTURE.md              # 整体架构设计
├── WORKFLOW_ENGINE.md           # 工作流引擎详解
├── CONTENT_SCRIPT.md            # 内容脚本详解
├── BACKGROUND_SERVICE.md        # 后台服务详解
├── AI_SERVICES.md               # AI 服务架构详解
├── SYNC_SERVICE.md              # 离线优先同步服务
├── USER_SYSTEM.md               # 用户系统详解
└── assets/                      # 文档资源
```

## 快速开始

### 核心概念

1. **工作流 (Workflow)** - 由多个块组成的自动化任务
2. **块 (Block)** - 工作流的基本执行单元
3. **触发器 (Trigger)** - 启动工作流的条件
4. **引用数据 (Reference Data)** - 工作流执行时的数据上下文

### 工作流结构

```javascript
const workflow = {
  id: 'workflow-123',
  name: '自动化任务',
  drawflow: {
    nodes: [...],  // 块列表
    edges: [...],  // 连接线
  },
  settings: {
    saveLog: true,
    onError: 'stop-workflow',
    // 更多设置...
  },
  table: [],        // 数据表格
  dataColumns: [],  // 数据列
};
```

## 主要模块

### 1. 工作流引擎 (Workflow Engine)

负责解析和执行工作流。

- **核心类**: `WorkflowEngine`, `WorkflowWorker`
- **功能**: 块调度、状态管理、日志记录、错误处理
- **文档**: [WORKFLOW_ENGINE.md](./WORKFLOW_ENGINE.md)

### 2. 内容脚本 (Content Script)

在网页上下文中运行，负责页面交互。

- **功能**: 元素选择、事件录制、DOM 操作
- **文档**: [CONTENT_SCRIPT.md](./CONTENT_SCRIPT.md)

### 3. 后台服务 (Background Service)

Service Worker，处理全局事件。

- **功能**: 触发器管理、脚本注入、通信协调
- **文档**: [BACKGROUND_SERVICE.md](./BACKGROUND_SERVICE.md)

### 4. AI 服务 (AI Services)

集成 Ollama，支持 AI 驱动的工作流生成。

- **组件**: `AIService`, `LangGraphAgent`, `OllamaClient`
- **功能**: 工作流生成、智能对话
- **文档**: [AI_SERVICES.md](./AI_SERVICES.md)

### 5. 同步服务 (Sync Service)

离线优先的数据同步机制。

- **策略**: 本地优先 + Supabase 云同步
- **功能**: 自动同步、冲突解决
- **文档**: [SYNC_SERVICE.md](./SYNC_SERVICE.md)

### 6. 用户系统 (User System)

基于 Supabase 的身份认证。

- **功能**: OAuth、MFA、Passkey、团队协作
- **文档**: [USER_SYSTEM.md](./USER_SYSTEM.md)

## 块类型参考

| 类别 | 块 | 说明 |
|------|-----|------|
| **Trigger** | workflow-start | 手动启动 |
| | interval | 定时触发 |
| | keyboard-shortcut | 快捷键触发 |
| | visit-web | 访问网页触发 |
| **Interaction** | click | 点击元素 |
| | fill-input | 填写输入 |
| | scroll | 滚动页面 |
| | hover | 悬停元素 |
| **Browser** | new-tab | 打开新标签页 |
| | close-tab | 关闭标签页 |
| | switch-tab | 切换标签页 |
| **Data** | loop-data | 循环数据 |
| | insert-data | 插入数据 |
| | data-mapping | 数据映射 |
| **Advanced** | javascript-code | JavaScript 代码 |
| | webhook | Webhook 调用 |
| | ai-workflow | AI 工作流 |

## 开发指南

### 环境配置

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# 运行测试
pnpm test
```

### 项目结构

```
src/
├── background/       # 后台脚本
├── content/          # 内容脚本
├── newtab/           # 新标签页（仪表板）
├── popup/            # 弹出窗口
├── workflowEngine/   # 工作流引擎
├── services/         # 业务服务
│   ├── ai/           # AI 服务
│   ├── supabase/     # Supabase 服务
│   └── workflowSync/ # 同步服务
├── stores/           # Pinia 状态管理
├── components/       # Vue 组件
├── db/               # Dexie.js 数据库
└── utils/            # 工具函数
```

### 添加新块

1. 在 `src/workflowEngine/blocksHandler/` 创建处理器
2. 在块配置中注册新块类型
3. 添加对应的编辑组件（如果需要）

### 添加触发器

1. 在 `src/utils/workflowTrigger.js` 添加注册函数
2. 在 `workflowTriggersMap` 中注册
3. 添加对应的 UI 配置

## API 参考

### 消息格式

```javascript
// 工作流执行
browser.runtime.sendMessage({
  type: 'workflow:execute',
  data: workflowData,
});

// 获取上下文元素
browser.runtime.sendMessage({
  type: 'context-element',
});

// 执行块
browser.runtime.sendMessage({
  isBlock: true,
  data: blockData,
});
```

### 存储结构

```javascript
// localStorage
{
  workflows: {},           // 工作流数据
  workflowStates: {},      // 运行状态
  settings: {},            // 用户设置
  shortcuts: {},           // 快捷键
  visitWebTriggers: [],    // 访问触发器
}

// IndexedDB (Dexie)
{
  tablesData: [...],       // 表格数据
  tablesItems: [...],      // 表格项
  variables: [...],        // 变量
  credentials: [...],      // 敏感信息
}
```

## 常见问题

### Q: 如何调试工作流？

A: 使用 Chrome DevTools 的 "Sources" 面板，找到内容脚本源码设置断点。也可以在后台脚本中使用 `console.log`。

### Q: 如何处理 CSP 限制？

A: Automa 使用 Debugger API 绕过严格 CSP。确保在 `manifest.json` 中启用了 `debugger` 权限。

### Q: 工作流执行失败怎么办？

A:
1. 检查工作流的错误处理设置
2. 查看日志了解详细错误信息
3. 使用断点调试逐步执行
4. 检查页面选择器是否正确

### Q: 如何导出/导入工作流？

A: 工作流数据是 JSON 格式，可以通过以下方式导出：
1. 在仪表板中选择工作流 → 分享 → 导出
2. 直接复制工作流 JSON 数据

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交代码
4. 创建 Pull Request

## 参考资源

- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [Vue.js 3 Documentation](https://vuejs.org/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Supabase Documentation](https://supabase.com/docs)
- [Ollama Documentation](https://ollama.com/)
