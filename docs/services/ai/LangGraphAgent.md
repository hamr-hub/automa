# LangGraphAgent.js

**Path**: `services/ai/LangGraphAgent.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [extractJsonFromText](#extractjsonfromtext) | function | ❌ | `text` |
| [constructor](#constructor) | method | ❌ | `config?` |
| [initialize](#initialize) | method | ✅ | `` |
| [chat](#chat) | method | ✅ | `userInput, targetUrl?, onProgress` |
| [reset](#reset) | method | ❌ | `` |
| [getState](#getstate) | method | ❌ | `` |

## Detailed Description

### <a id="extractjsonfromtext"></a>extractJsonFromText

- **Type**: `function`
- **Parameters**: `text`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function extractJsonFromText(text) {
  if (!text) return null;

  // 尝试直接解析
  try {
    return JSON.parse(text);
  } catch (e) {
    // ignore
  }

  // 尝试从代码块中提取
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) {
    try {
      return JSON.parse(fenced[1]);
// ...
```

---

### <a id="constructor"></a>constructor

- **Type**: `method`
- **Parameters**: `config?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
constructor(config = {}) {
    this.ollama = new OllamaClient(config.ollama || aiConfig.ollama);
    this.workflowGenerator = new WorkflowGenerator();

    this.history = [];
    this.state = {
      status: 'idle',
      error: null,
      lastAiOutput: null,
      currentWorkflow: null,
    };
  }
```

---

### <a id="initialize"></a>initialize

- **Type**: `method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async initialize() {
    const isHealthy = await this.ollama.checkHealth();
    if (!isHealthy) {
      this.state.status = 'error';
      this.state.error = 'Ollama 服务不可用,请确保 Ollama 已启动 (运行: ollama serve)';
      return false;
    }

    this.state.status = 'idle';
    this.state.error = null;
    return true;
  }
```

---

### <a id="chat"></a>chat

- **Type**: `method`
- **Parameters**: `userInput, targetUrl?, onProgress`
- **Description**:

发送消息并获取回复（支持多轮对话）

@param {string} userInput 用户输入

@param {string} targetUrl 目标 URL (可选)

@param {(progress: {step: string, message: string}) => void} onProgress 进度回调

**Implementation**:
```javascript
async chat(userInput, targetUrl = '', onProgress) {
    try {
      this.state.status = 'generating';
      this.state.error = null;
      
      onProgress?.({ step: 'ai', message: 'AI 正在思考...' });

      // 构建用户消息
      let content = userInput;
      if (targetUrl && this.history.length === 0) {
        content += `\n目标 URL: ${targetUrl}`;
      }

      // 如果是第一条消息，添加系统提示词
      if (this.history.length === 0) {
// ...
```

---

### <a id="reset"></a>reset

- **Type**: `method`
- **Parameters**: ``
- **Description**:

重置会话

**Implementation**:
```javascript
reset() {
    this.history = [];
    this.state.status = 'idle';
    this.state.error = null;
    this.state.lastAiOutput = null;
    this.state.currentWorkflow = null;
  }
```

---

### <a id="getstate"></a>getState

- **Type**: `method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
getState() {
    return { ...this.state };
  }
```

---

