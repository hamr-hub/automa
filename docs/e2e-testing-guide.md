# Ollama 集成端到端测试指南

## 测试前准备

### 1. 确保 Ollama 服务运行
```bash
# 设置 CORS
export OLLAMA_ORIGINS="*"

# 启动 Ollama
ollama serve

# 下载测试模型 (如果没有)
ollama pull mistral
```

### 2. 构建并加载扩展
```bash
# 构建扩展
pnpm build

# 在 Chrome 中:
# 1. 访问 chrome://extensions/
# 2. 开启"开发者模式"
# 3. 点击"加载已解压的扩展程序"
# 4. 选择 dist/ 目录
```

## 测试方法

### 方法 1: 浏览器控制台测试 (推荐)

1. 打开扩展的 newtab 页面
2. 按 F12 打开开发者工具
3. 在控制台中运行以下代码:

```javascript
// 导入测试脚本
const script = document.createElement('script');
script.type = 'module';
script.textContent = `
  import aiService from './services/ai/AIService.js';

  async function quickTest() {
    console.log('=== 快速测试开始 ===');
    
    // 1. 初始化
    console.log('1. 初始化 AIService...');
    await aiService.initialize();
    console.log('✅ 初始化成功');
    
    // 2. 健康检查
    console.log('2. 健康检查...');
    const isHealthy = await aiService.checkHealth();
    console.log(isHealthy ? '✅ Ollama 服务正常' : '❌ Ollama 服务异常');
    
    // 3. 获取模型列表
    console.log('3. 获取模型列表...');
    const models = await aiService.listModels();
    console.log(\`✅ 可用模型: \${models.map(m => m.name).join(', ')}\`);
    
    // 4. 简单聊天测试
    console.log('4. 测试简单聊天...');
    const response = await aiService.chat([
      { role: 'user', content: '请说"测试成功"' }
    ], { model: 'mistral', temperature: 0.1 });
    console.log(\`✅ AI 响应: \${response.message.content}\`);
    
    console.log('=== 所有测试通过! ===');
  }
  
  quickTest().catch(console.error);
`;
document.head.appendChild(script);
```

### 方法 2: AI Block 手动测试

#### 测试步骤:
1. 打开 Automa 扩展
2. 创建新工作流
3. 添加 "AI Workflow" Block
4. 配置:
   - **Provider**: Ollama
   - **Ollama Host**: `http://localhost:11434`
   - **Model**: `mistral`
   - **Prompt**: `请说"AI Block 测试成功"`
   - **System Prompt**: (可选)
5. 点击"运行工作流"
6. 查看执行结果

#### 预期结果:
- ✅ 工作流执行成功
- ✅ AI Block 返回包含"测试成功"的文本
- ✅ 控制台显示 `[LangGraphService] Simple Chat ...`

### 方法 3: AI 工作流生成测试

#### 测试步骤:
1. 打开 Automa 扩展
2. 点击 "AI 工作流生成" (或相应功能)
3. 输入需求: `帮我抓取当前页面的标题`
4. 点击"生成工作流"
5. 等待 AI 生成完成

#### 预期结果:
- ✅ 显示生成进度
- ✅ 成功生成包含 "Get Text" 等 Block 的工作流
- ✅ 控制台显示 LangGraph 状态图执行日志

## 调试检查点

### 1. 验证调用路径
在浏览器控制台运行:
```javascript
// 检查是否通过 LangGraphService
const langGraphService = aiService.getLangGraphService();
console.log('LangGraphService:', langGraphService);
console.log('simpleChat 方法:', typeof langGraphService.simpleChat);
console.log('OllamaClient:', langGraphService.ollama);
```

**预期输出:**
```
LangGraphService: LangGraphService {ollama: OllamaClient, ...}
simpleChat 方法: function
OllamaClient: OllamaClient {baseUrl: "http://...", ...}
```

### 2. 检查网络请求
1. 打开开发者工具 → Network 标签
2. 执行 AI 调用
3. 查找 `http://localhost:11434/api/chat` 请求

**预期:**
- ✅ 请求方法: POST
- ✅ Content-Type: application/json
- ✅ Request Body: 包含 `model`, `messages`, `stream: false`
- ✅ Response: 200 OK

### 3. 检查控制台日志
执行 AI 调用时,应该看到:
```
[LangGraph] Simple Chat ...
[AIService] ...
```

**不应该看到:**
```
Direct OllamaClient call  # ❌ 不应该有直接调用
```

## 常见问题排查

### 问题 1: 403 Forbidden
**原因:** Ollama CORS 未配置

**解决:**
```bash
export OLLAMA_ORIGINS="*"
ollama serve
```

### 问题 2: TypeError: Cannot read property 'simpleChat' of undefined
**原因:** AIService 未初始化

**解决:**
```javascript
await aiService.initialize();
```

### 问题 3: Connection refused
**原因:** Ollama 服务未启动

**解决:**
```bash
ollama serve
```

### 问题 4: No models found
**原因:** 未下载模型

**解决:**
```bash
ollama pull mistral
```

## 测试检查清单

### 基础功能
- [ ] AIService.initialize() 成功
- [ ] AIService.checkHealth() 返回 true
- [ ] AIService.listModels() 返回模型列表

### 简单调用 (通过 LangGraphService)
- [ ] AIService.chat() 成功返回
- [ ] AIService.generate() 成功返回
- [ ] 控制台显示 LangGraphService 日志

### AI Block 集成
- [ ] AI Block 配置界面正常
- [ ] 能获取并选择 Ollama 模型
- [ ] AI Block 执行成功
- [ ] 响应内容正确

### 工作流生成
- [ ] AI 工作流生成器界面正常
- [ ] 能输入需求并提交
- [ ] LangGraph 状态图执行
- [ ] 生成有效的 Automa 工作流

### 错误处理
- [ ] CORS 错误提示清晰
- [ ] 超时错误处理正常
- [ ] 无效响应有友好提示

## 性能验证

运行以下代码检查调用指标:

```javascript
const metrics = aiService.getMetrics();
console.log('调用统计:', {
  总请求数: metrics.requests,
  错误数: metrics.errors,
  平均延迟: metrics.avgLatency + 'ms',
  缓存命中: metrics.cacheHits
});
```

## 测试报告模板

```markdown
# Ollama 集成测试报告

**测试日期:** 2026-01-XX
**测试人员:** XXX
**Ollama 版本:** X.X.X
**扩展版本:** X.X.X

## 测试结果

### 基础功能
- [x] 初始化
- [x] 健康检查
- [x] 模型列表

### AI 调用
- [x] 简单聊天
- [x] 简单生成
- [x] 流式调用

### 集成功能
- [x] AI Block
- [x] 工作流生成

## 发现的问题
1. (如有)

## 性能数据
- 平均响应时间: XXms
- 错误率: X%

## 结论
✅ 所有测试通过 / ⚠️ 部分功能需优化
```
