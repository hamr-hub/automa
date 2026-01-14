# OllamaClient.js

**Path**: `services/ai/OllamaClient.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [constructor](#constructor) | method | ❌ | `config?` |
| [checkHealth](#checkhealth) | method | ✅ | `` |
| [listModels](#listmodels) | method | ✅ | `` |
| [generate](#generate) | method | ✅ | `prompt, options?` |
| [chat](#chat) | method | ✅ | `messages, options?` |
| [generateStream](#generatestream) | method | ✅ | `prompt, onChunk, options?` |
| [chatStream](#chatstream) | method | ✅ | `messages, onChunk, options?` |
| [pullModel](#pullmodel) | method | ✅ | `modelName, onProgress` |
| [listModels](#listmodels) | method | ✅ | `` |

## Detailed Description

### <a id="constructor"></a>constructor

- **Type**: `method`
- **Parameters**: `config?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
constructor(config = {}) {
    this.baseUrl = config.baseUrl || aiConfig.ollama.baseUrl;
    this.model = config.model || aiConfig.ollama.model;
    this.temperature = config.temperature || aiConfig.ollama.temperature;
    this.maxTokens = config.maxTokens || aiConfig.ollama.maxTokens;
    this.timeout = config.timeout || aiConfig.ollama.timeout;
  }
```

---

### <a id="checkhealth"></a>checkHealth

- **Type**: `method`
- **Parameters**: ``
- **Description**:

检查 Ollama 服务是否可用

**Implementation**:
```javascript
async checkHealth() {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch (error) {
      console.warn('Ollama 服务不可用，启用 Mock 模式:', error);
      return true; // Return true to enable Mock mode
    }
  }
```

---

### <a id="listmodels"></a>listModels

- **Type**: `method`
- **Parameters**: ``
- **Description**:

获取可用模型列表

**Implementation**:
```javascript
async listModels() {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      const data = await response.json();
      return data.models || [];
    } catch (error) {
      console.warn('获取模型列表失败，使用 Mock 模型:', error);
      return [{ name: 'mock-model' }];
    }
  }
```

---

### <a id="generate"></a>generate

- **Type**: `method`
- **Parameters**: `prompt, options?`
- **Description**:

生成文本(非流式)

@param {string} prompt - 提示词

@param {Object} options - 可选配置

**Implementation**:
```javascript
async generate(prompt, options = {}) {
    const requestBody = {
      model: options.model || this.model,
      prompt,
      stream: false,
      options: {
        temperature: options.temperature || this.temperature,
        num_predict: options.maxTokens || this.maxTokens,
      },
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

// ...
```

---

### <a id="chat"></a>chat

- **Type**: `method`
- **Parameters**: `messages, options?`
- **Description**:

聊天对话(支持多轮对话)

@param {Array} messages - 消息数组 [{role: 'user'|'assistant'|'system', content: '...'}]

@param {Object} options - 可选配置

**Implementation**:
```javascript
async chat(messages, options = {}) {
    const requestBody = {
      model: options.model || this.model,
      messages,
      stream: false,
      options: {
        temperature: options.temperature || this.temperature,
        num_predict: options.maxTokens || this.maxTokens,
      },
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

// ...
```

---

### <a id="generatestream"></a>generateStream

- **Type**: `method`
- **Parameters**: `prompt, onChunk, options?`
- **Description**:

流式生成文本

@param {string} prompt - 提示词

@param {Function} onChunk - 接收文本块的回调函数

@param {Object} options - 可选配置

**Implementation**:
```javascript
async generateStream(prompt, onChunk, options = {}) {
    const requestBody = {
      model: options.model || this.model,
      prompt,
      stream: true,
      options: {
        temperature: options.temperature || this.temperature,
        num_predict: options.maxTokens || this.maxTokens,
      },
    };

    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
// ...
```

---

### <a id="chatstream"></a>chatStream

- **Type**: `method`
- **Parameters**: `messages, onChunk, options?`
- **Description**:

流式聊天对话

@param {Array} messages - 消息数组

@param {Function} onChunk - 接收文本块的回调函数

@param {Object} options - 可选配置

**Implementation**:
```javascript
async chatStream(messages, onChunk, options = {}) {
    const requestBody = {
      model: options.model || this.model,
      messages,
      stream: true,
      options: {
        temperature: options.temperature || this.temperature,
        num_predict: options.maxTokens || this.maxTokens,
      },
    };

    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
// ...
```

---

### <a id="pullmodel"></a>pullModel

- **Type**: `method`
- **Parameters**: `modelName, onProgress`
- **Description**:

拉取模型

@param {string} modelName - 模型名称

@param {Function} onProgress - 进度回调

**Implementation**:
```javascript
async pullModel(modelName, onProgress) {
    try {
      const response = await fetch(`${this.baseUrl}/api/pull`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: modelName,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`拉取模型失败: ${response.status}`);
// ...
```

---

### <a id="listmodels"></a>listModels

- **Type**: `method`
- **Parameters**: ``
- **Description**:

列出所有已安装的模型

@returns {Promise<Array>} 模型列表

**Implementation**:
```javascript
async listModels() {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`获取模型列表失败: ${response.status}`);
      }

      const data = await response.json();
      return data.models || [];
// ...
```

---

