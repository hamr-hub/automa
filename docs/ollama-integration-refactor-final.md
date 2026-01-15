# Ollama 集成架构重构 (最终版)

## 核心原则

**所有 Ollama 调用必须通过 LangGraphService,不允许直接使用 OllamaClient**

## 架构设计

```
┌─────────────────────────────────────────┐
│           AIService (单例)              │
│         统一 AI 调用入口                │
└─────────────────┬───────────────────────┘
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
┌──────────────┐    ┌──────────────────┐
│ LangGraph    │    │  简单调用         │
│ Agent        │    │  (chat/generate) │
└──────┬───────┘    └──────┬───────────┘
       │                   │
       └────────┬──────────┘
                ▼
     ┌──────────────────────┐
     │  LangGraphService    │
     ├──────────────────────┤
     │ • run()              │ 工作流生成(复杂状态图)
     │ • simpleChat()       │ 简单聊天调用
     │ • simpleGenerate()   │ 简单生成调用
     │ • simpleChatStream() │ 流式聊天
     └──────────┬───────────┘
                ▼
     ┌──────────────────────┐
     │    OllamaClient      │
     │  (底层 API 封装)      │
     └──────────────────────┘
```

## 调用路径

### 1. 工作流生成 (复杂流程)
```
UI Component
  → aiService.generateWorkflow()
  → LangGraphAgent.chat()
  → LangGraphService.run()
  → LangGraphService.generationNode()
  → OllamaClient.chat()
```

### 2. AI Block 执行 (简单调用)
```
WorkflowEngine
  → handlerAiWorkflow.js
  → aiService.chat()
  → LangGraphService.simpleChat()
  → OllamaClient.chat()
```

### 3. 模型列表查询
```
EditAiWorkflow.vue
  → aiService.listModels()
  → LangGraphService.ollama.listModels()
  → OllamaClient.listModels()
```

## 代码变更

### 1. LangGraphService 扩展 (src/services/ai/LangGraphService.js)

**新增方法:**
```javascript
// 简单聊天调用 (不经过状态图)
async simpleChat(messages, options = {}) {
  return await this.ollama.chat(messages, options);
}

// 简单生成调用
async simpleGenerate(prompt, options = {}) {
  return await this.ollama.generate(prompt, options);
}

// 流式聊天
async simpleChatStream(messages, onChunk, options = {}) {
  return await this.ollama.chatStream(messages, onChunk, options);
}

// 流式生成
async simpleGenerateStream(prompt, onChunk, options = {}) {
  return await this.ollama.generateStream(prompt, onChunk, options);
}
```

### 2. AIService 重构 (src/services/ai/AIService.js)

**移除:**
- ❌ `this.ollamaClient` 实例
- ❌ `getOllamaClient()` 方法
- ❌ 直接调用 `OllamaClient`

**保留并改为调用 LangGraphService:**
```javascript
async chat(messages, options = {}) {
  const langGraphService = this.getLangGraphService();
  return await langGraphService.simpleChat(messages, options);
}

async generate(prompt, options = {}) {
  const langGraphService = this.getLangGraphService();
  return await langGraphService.simpleGenerate(prompt, options);
}

async listModels() {
  const langGraphService = this.getLangGraphService();
  return await langGraphService.ollama.listModels();
}
```

### 3. handlerAiWorkflow.js 重构

**修改前:**
```javascript
const client = aiService.getOllamaClient({ baseUrl: host, model });
const response = await client.chat(messages, { model, temperature });
```

**修改后:**
```javascript
// 通过 AIService.chat 调用,统一经过 LangGraphService
const response = await aiService.chat(messages, {
  model: model || 'mistral',
  temperature: parseFloat(temperature) || 0.7,
});
```

### 4. EditAiWorkflow.vue 重构

**修改前:**
```javascript
const client = aiService.getOllamaClient({ baseUrl: host });
const models = await client.listModels();
```

**修改后:**
```javascript
// 通过 AIService.listModels() 调用,统一经过 LangGraphService
const models = await aiService.listModels();
```

## 优势

### 1. 统一调用路径
- 所有 Ollama 调用都经过 LangGraphService
- 便于监控、日志、错误处理

### 2. 单一职责
- **OllamaClient**: 底层 API 封装
- **LangGraphService**: 业务逻辑层 (状态图 + 简单调用)
- **AIService**: 门面层 (统一入口)

### 3. 易于扩展
- 需要添加重试机制? 在 `LangGraphService.simpleChat()` 中实现
- 需要添加缓存? 在 `LangGraphService` 中统一管理
- 需要替换 AI Provider? 只需修改 `LangGraphService`

### 4. 配置灵活性
- 自定义配置通过 `LangGraphAgent` 传递到 `LangGraphService`
- 共享 `OllamaClient` 实例,避免重复连接

## 重要提醒

### ⚠️ 严禁直接使用 OllamaClient
```javascript
// ❌ 错误示例
import OllamaClient from '@/services/ai/OllamaClient';
const client = new OllamaClient();

// ✅ 正确示例
import aiService from '@/services/ai/AIService';
const response = await aiService.chat(messages);
```

### ⚠️ 配置传递
如果需要使用自定义 Ollama 配置 (如不同的 host):
```javascript
// ✅ 在初始化时传递配置
await aiService.initialize({
  ollama: {
    baseUrl: 'http://custom-host:11434',
    model: 'llama2'
  }
});
```

## 测试验证

### 1. AI Block 测试
- 打开工作流编辑器
- 添加 AI Block,配置提示词
- 执行工作流,验证 AI 响应正常

### 2. 模型列表测试
- 打开 AI Block 配置
- 点击刷新模型列表
- 验证可以正常获取 Ollama 模型列表

### 3. 工作流生成测试
- 打开 AI 工作流生成器
- 输入需求描述
- 验证工作流生成成功

## 故障排查

### 问题: 403 Forbidden
**原因:** Ollama 服务器 CORS 配置不正确

**解决:** 
```bash
export OLLAMA_ORIGINS="*"
ollama serve
```

### 问题: 找不到模型
**原因:** Ollama 服务未启动或模型未下载

**解决:**
```bash
# 启动 Ollama
ollama serve

# 下载模型
ollama pull mistral
```

### 问题: TypeError: Cannot read property 'simpleChat' of undefined
**原因:** AIService 未初始化

**解决:**
```javascript
await aiService.initialize();
```

## 文件清单

### 核心文件
- ✅ `src/services/ai/OllamaClient.js` - 底层 API 封装
- ✅ `src/services/ai/LangGraphService.js` - 业务逻辑层
- ✅ `src/services/ai/LangGraphAgent.js` - 工作流生成代理
- ✅ `src/services/ai/AIService.js` - 统一服务门面

### 调用文件
- ✅ `src/workflowEngine/blocksHandler/handlerAiWorkflow.js`
- ✅ `src/components/newtab/workflow/edit/EditAiWorkflow.vue`

### 文档
- ✅ `docs/ollama-cors-setup.md` - CORS 配置指南
- ✅ `docs/ollama-integration-refactor.md` - 本文档
