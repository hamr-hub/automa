# AIWorkflowGenerator.vue

**Path**: `newtab/pages/AIWorkflowGenerator.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [sendMessage](#sendmessage) | function | ✅ | `` |
| [scrollToBottom](#scrolltobottom) | function | ❌ | `` |
| [runWorkflow](#runworkflow) | function | ✅ | `` |
| [saveWorkflow](#saveworkflow) | function | ✅ | `` |
| [recordWorkflow](#recordworkflow) | function | ❌ | `` |
| [startEditNode](#starteditnode) | function | ❌ | `node` |
| [cancelEdit](#canceledit) | function | ❌ | `` |
| [saveEditNode](#saveeditnode) | function | ❌ | `` |
| [deleteNode](#deletenode) | function | ❌ | `index` |
| [moveNode](#movenode) | function | ❌ | `index, direction` |
| [updateWorkflowFromList](#updateworkflowfromlist) | function | ❌ | `nodesList` |
| [exportJSON](#exportjson) | function | ❌ | `` |
| [importJSON](#importjson) | function | ✅ | `` |
| [copyJSON](#copyjson) | function | ✅ | `` |
| [getBlockLabel](#getblocklabel) | function | ❌ | `label` |
| [getBlockDescription](#getblockdescription) | function | ❌ | `node` |
| [checkOllamaStatus](#checkollamastatus) | function | ✅ | `` |

## Detailed Description

### <a id="sendmessage"></a>sendMessage

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function sendMessage() {
  if (!state.userInput.trim() || state.isGenerating) return;

  const content = state.userInput;
  state.userInput = '';
  state.isGenerating = true;

  chatHistory.value.push({ role: 'user', content });
  
  scrollToBottom();

  try {
    const result = await agent.chat(content, '', (progress) => {
    });

// ...
```

---

### <a id="scrolltobottom"></a>scrollToBottom

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function scrollToBottom() {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
  });
}
```

---

### <a id="runworkflow"></a>runWorkflow

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function runWorkflow() {
    if (!state.generatedWorkflow) return;
    
    try {
        await RendererWorkflowService.executeWorkflow(state.generatedWorkflow, {
            checkParams: false 
        });
        toast.success('工作流已开始运行');
    } catch (e) {
        toast.error(`运行失败: ${e.message}`);
    }
}
```

---

### <a id="saveworkflow"></a>saveWorkflow

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function saveWorkflow() {
    try {
        await workflowStore.insert(state.generatedWorkflow);
        toast.success('保存成功');
        router.push(`/workflows/${state.generatedWorkflow.id}`);
    } catch (e) {
        toast.error(`保存失败: ${e.message}`);
    }
}
```

---

### <a id="recordworkflow"></a>recordWorkflow

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function recordWorkflow() {
    // 使用 Automa 现有的录制页面
    // 可以在新标签页打开
    const url = browser.runtime.getURL('/newtab.html#/recording');
    browser.tabs.create({ url });
}
```

---

### <a id="starteditnode"></a>startEditNode

- **Type**: `function`
- **Parameters**: `node`
- **Description**:

--- 编辑功能 ---

**Implementation**:
```javascript
function startEditNode(node) {
    state.editingNodeId = node.id;
    // 复制需要编辑的数据
    state.editData = {
        description: node.data.description,
        url: node.data.url,
        selector: node.data.selector,
        value: node.data.value
    };
    // 清理 undefined
    Object.keys(state.editData).forEach(key => state.editData[key] === undefined && delete state.editData[key]);
}
```

---

### <a id="canceledit"></a>cancelEdit

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function cancelEdit() {
    state.editingNodeId = null;
    state.editData = {};
}
```

---

### <a id="saveeditnode"></a>saveEditNode

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function saveEditNode() {
    const node = state.generatedWorkflow.drawflow.nodes.find(n => n.id === state.editingNodeId);
    if (node) {
        Object.assign(node.data, state.editData);
        // 如果是 URL 节点，更新描述
        if (node.label === 'new-tab' && state.editData.url) {
            node.data.url = state.editData.url;
        }
    }
    state.editingNodeId = null;
    state.editData = {};
}
```

---

### <a id="deletenode"></a>deleteNode

- **Type**: `function`
- **Parameters**: `index`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function deleteNode(index) {
    // index 是在 sortedNodes 中的索引
    const nodes = [...sortedNodes.value];
    nodes.splice(index, 1);
    
    updateWorkflowFromList(nodes);
}
```

---

### <a id="movenode"></a>moveNode

- **Type**: `function`
- **Parameters**: `index, direction`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function moveNode(index, direction) {
    const nodes = [...sortedNodes.value];
    const newIndex = index + direction;
    
    if (newIndex < 0 || newIndex >= nodes.length) return;
    
    // 交换
    [nodes[index], nodes[newIndex]] = [nodes[newIndex], nodes[index]];
    
    updateWorkflowFromList(nodes);
}
```

---

### <a id="updateworkflowfromlist"></a>updateWorkflowFromList

- **Type**: `function`
- **Parameters**: `nodesList`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function updateWorkflowFromList(nodesList) {
    // 重建边
    const edges = [];
    for (let i = 0; i < nodesList.length - 1; i++) {
        const source = nodesList[i];
        const target = nodesList[i+1];
        edges.push({
            id: `edge-${nanoid()}`,
            source: source.id,
            target: target.id,
            sourceHandle: `${source.id}-output-1`,
            targetHandle: `${target.id}-input`,
            type: 'default',
        });
    }
// ...
```

---

### <a id="exportjson"></a>exportJSON

- **Type**: `function`
- **Parameters**: ``
- **Description**:

--- 导入导出 ---

**Implementation**:
```javascript
function exportJSON() {
    if (!state.generatedWorkflow) return;
    exportWorkflow(state.generatedWorkflow);
}
```

---

### <a id="importjson"></a>importJSON

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function importJSON() {
    try {
        const result = await importWorkflow();
        // importWorkflow 返回的是插入数据库后的对象
        // 我们取第一个导入的工作流
        const imported = Array.isArray(result) ? result[0] : Object.values(result)[0];
        
        if (imported) {
            state.generatedWorkflow = imported;
            toast.success('工作流导入成功');
            // 将导入的消息添加到聊天记录，作为上下文
            chatHistory.value.push({ 
                role: 'system', 
                content: `已加载外部工作流: ${imported.name}` 
            });
// ...
```

---

### <a id="copyjson"></a>copyJSON

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function copyJSON() {
    if (!state.generatedWorkflow) return;
    try {
        await navigator.clipboard.writeText(JSON.stringify(state.generatedWorkflow, null, 2));
        toast.success('已复制到剪贴板');
    } catch (e) {
        toast.error('复制失败');
    }
}
```

---

### <a id="getblocklabel"></a>getBlockLabel

- **Type**: `function`
- **Parameters**: `label`
- **Description**:

辅助函数

**Implementation**:
```javascript
function getBlockLabel(label) {
    const map = {
        'trigger': '开始',
        'new-tab': '打开网页',
        'event-click': '点击',
        'get-text': '获取文本',
        'delay': '等待',
        'loop-data': '循环',
        'export-data': '导出',
        'forms': '输入/选择'
    };
    return map[label] || label;
}
```

---

### <a id="getblockdescription"></a>getBlockDescription

- **Type**: `function`
- **Parameters**: `node`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function getBlockDescription(node) {
    if (node.label === 'new-tab') return node.data.url;
    if (node.label === 'delay') return `${node.data.time}ms`;
    return '';
}
```

---

### <a id="checkollamastatus"></a>checkOllamaStatus

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function checkOllamaStatus() {
    agent.ollama.baseUrl = state.ollamaConfig.baseUrl;
    const isHealthy = await agent.ollama.checkHealth();
    state.ollamaStatus = isHealthy ? 'connected' : 'disconnected';
    
    if (isHealthy) {
        const models = await agent.ollama.listModels();
        state.availableModels = models;
        if (!state.ollamaConfig.model && models.length) {
            state.ollamaConfig.model = models[0].name;
        }
        await browser.storage.local.set({ ollamaConfig: state.ollamaConfig });
    }
}
```

---

