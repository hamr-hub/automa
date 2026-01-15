# Ollama 集成架构重构

## 架构改进

### 重构前 (问题)
- 多处代码直接 `new OllamaClient()`
- 没有统一的 AI 服务入口
- LangGraph 和 Ollama 调用混乱

### 重构后 (解决方案)
创建了统一的 **AIService** 门面模式:

```
┌─────────────────────────────────────────┐
│           AIService (Facade)            │
├─────────────────────────────────────────┤
│  - generateWorkflow()  → LangGraph      │
│  - chat()              → OllamaClient   │
│  - generate()          → OllamaClient   │
│  - chatStream()        → OllamaClient   │
│  - listModels()        → OllamaClient   │
└─────────────────────────────────────────┘
         ↓                      ↓
┌──────────────────┐   ┌──────────────────┐
│ LangGraphAgent   │   │  OllamaClient    │
│  (工作流生成)    │   │  (直接调用)      │
└──────────────────┘   └──────────────────┘
         ↓
┌──────────────────┐
│ LangGraphService │
│  (状态图管理)    │
└──────────────────┘
         ↓
┌──────────────────┐
│  OllamaClient    │
│  (AI 生成核心)   │
└──────────────────┘
```

## 调用场景

### 1. 工作流生成 (通过 LangGraph)
```javascript
import aiService from '@/services/ai/AIService';

// 复杂工作流生成,支持多轮对话、验证、重试
const result = await aiService.generateWorkflow(
  userInput,
  targetUrl,
  onProgress,
  pageContext
);
```

### 2. AI Block 执行 (直接 Ollama)
```javascript
import aiService from '@/services/ai/AIService';

// 简单 AI 调用,无需状态管理
const response = await aiService.chat(messages, { model, temperature });
```

### 3. 获取模型列表
```javascript
import aiService from '@/services/ai/AIService';

const models = await aiService.listModels();
```

## 重构文件

### ✅ 已完成
1. **`src/services/ai/AIService.js`** (新建)
   - 统一 AI 服务门面
   - 单例模式管理 OllamaClient

2. **`src/workflowEngine/blocksHandler/handlerAiWorkflow.js`**
   ```diff
   - import OllamaClient from '@/services/ai/OllamaClient';
   + import aiService from '@/services/ai/AIService';
   
   - const client = new OllamaClient({ baseUrl: host });
   + const client = aiService.getOllamaClient({ baseUrl: host, model });
   ```

3. **`src/components/newtab/workflow/edit/EditAiWorkflow.vue`**
   ```diff
   - import OllamaClient from '@/services/ai/OllamaClient';
   + import aiService from '@/services/ai/AIService';
   
   - const client = new OllamaClient({ baseUrl: host });
   + const client = aiService.getOllamaClient(
   +   host !== 'http://localhost:11434' ? { baseUrl: host } : null
   + );
   ```

4. **`src/services/ai/LangGraphService.js`**
   - 已经通过构造函数接收 ollamaClient 实例
   - generationNode 正确调用 `this.ollama.chat()`

5. **`src/services/ai/OllamaClient.js`**
   - 修复了 `chat()` 方法的 body 序列化问题
   ```diff
   - body: requestBody,
   + body: JSON.stringify(requestBody),
   ```

## 测试验证

### 1. AI Block 测试
```javascript
// 在工作流中添加 AI Block,配置 Ollama
// 执行工作流,验证 AI 响应正常
```

### 2. 工作流生成测试
```javascript
// 打开 AI 工作流生成器
// 输入需求,验证工作流生成成功
```

### 3. 模型列表测试
```javascript
// 打开 AI Block 配置
// 点击刷新模型列表,验证可以获取 Ollama 模型
```

## API 一致性

所有 Ollama 调用都通过以下路径:

### 工作流生成
```
UIComponent 
  → AIService.generateWorkflow() 
  → LangGraphAgent.chat() 
  → LangGraphService.run() 
  → LangGraphService.generationNode() 
  → OllamaClient.chat()
```

### AI Block
```
WorkflowEngine 
  → handlerAiWorkflow.js 
  → AIService.getOllamaClient() 
  → OllamaClient.chat()
```

### 模型查询
```
EditAiWorkflow.vue 
  → AIService.getOllamaClient() 
  → OllamaClient.listModels()
```

## 优势

1. **统一入口**: 所有 AI 调用都通过 AIService
2. **避免重复实例**: 共享 OllamaClient 实例,减少连接开销
3. **易于测试**: Mock AIService 即可测试所有 AI 功能
4. **配置集中**: 统一管理 Ollama 配置
5. **灵活扩展**: 可轻松添加其他 AI Provider(如 OpenAI、Claude)

## 注意事项

1. **403 错误解决**: 确保 Ollama 服务器配置 `OLLAMA_ORIGINS="*"`
2. **JSON 序列化**: 所有 POST 请求都需要 `JSON.stringify(body)`
3. **URL 规范化**: 使用 `normalizeUrl()` 处理各种 URL 格式
