# WorkflowGenerator.js

**Path**: `services/ai/WorkflowGenerator.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [constructor](#constructor) | method | ❌ | `` |
| [generateWorkflow](#generateworkflow) | method | ❌ | `aiOutput, userInput, targetUrl` |
| [generateDrawflow](#generatedrawflow) | method | ❌ | `steps, dataSchema, targetUrl` |
| [createTriggerNode](#createtriggernode) | method | ❌ | `` |
| [createNavigateNode](#createnavigatenode) | method | ❌ | `url` |
| [createNodeFromStep](#createnodefromstep) | method | ❌ | `step, index` |
| [createNodeData](#createnodedata) | method | ❌ | `step, blockType` |
| [[computed]](#-computed-) | object_property_method | ❌ | `` |
| [delay](#delay) | object_property_method | ❌ | `` |
| [[computed]](#-computed-) | object_property_method | ❌ | `` |
| [[computed]](#-computed-) | object_property_method | ❌ | `` |
| [[computed]](#-computed-) | object_property_method | ❌ | `` |
| [[computed]](#-computed-) | object_property_method | ❌ | `` |
| [[computed]](#-computed-) | object_property_method | ❌ | `` |
| [[computed]](#-computed-) | object_property_method | ❌ | `` |
| [[computed]](#-computed-) | object_property_method | ❌ | `` |
| [[computed]](#-computed-) | object_property_method | ❌ | `` |
| [forms](#forms) | object_property_method | ❌ | `` |
| [screenshot](#screenshot) | object_property_method | ❌ | `` |
| [conditions](#conditions) | object_property_method | ❌ | `` |
| [createExportNode](#createexportnode) | method | ❌ | `dataSchema` |
| [createEdge](#createedge) | method | ❌ | `sourceId, targetId, sourceOutput?` |
| [generateDataColumns](#generatedatacolumns) | method | ❌ | `dataSchema` |
| [mapDataType](#mapdatatype) | method | ❌ | `type` |
| [getNextNodePosition](#getnextnodeposition) | method | ❌ | `` |
| [resetNodePosition](#resetnodeposition) | method | ❌ | `` |
| [optimizeWorkflow](#optimizeworkflow) | method | ❌ | `workflow` |
| [validateWorkflow](#validateworkflow) | method | ❌ | `workflow` |

## Detailed Description

### <a id="constructor"></a>constructor

- **Type**: `method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
constructor() {
    // Automa Block 类型映射
    this.blockTypeMap = {
      NAVIGATE: 'new-tab',
      WAIT: 'delay',
      CLICK: 'event-click',
      SCROLL: 'element-scroll',
      EXTRACT: 'get-text',
      EXTRACT_ATTRIBUTE: 'attribute-value',
      LOOP: 'loop-data',
      LOOP_ELEMENTS: 'loop-elements',
      PAGINATION: 'while-loop', // Pagination using While Loop (check next button)
      LOOP_END: 'loop-end', // Virtual type for ending loops
      EXPORT: 'export-data',
      INPUT: 'forms',
// ...
```

---

### <a id="generateworkflow"></a>generateWorkflow

- **Type**: `method`
- **Parameters**: `aiOutput, userInput, targetUrl`
- **Description**:

生成完整的 Automa 工作流

@param {Object} aiOutput - AI 生成的步骤和数据模式

@param {string} userInput - 用户原始输入

@param {string} targetUrl - 目标 URL

**Implementation**:
```javascript
generateWorkflow(aiOutput, userInput, targetUrl) {
    const { steps, dataSchema } = aiOutput;

    // 生成工作流基本信息
    const workflowId = nanoid();
    const workflow = {
      id: workflowId,
      name: `AI生成: ${userInput}`,
      description: `由 AI 自动生成的数据抓取工作流\n目标: ${userInput}\nURL: ${targetUrl}`,
      icon: 'riRobotLine',
      category: 'scrape',
      version: '1.0.0',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isDisabled: false,
// ...
```

---

### <a id="generatedrawflow"></a>generateDrawflow

- **Type**: `method`
- **Parameters**: `steps, dataSchema, targetUrl`
- **Description**:

生成 Drawflow 结构(节点和边)

**Implementation**:
```javascript
generateDrawflow(steps, dataSchema, targetUrl) {
    const nodes = [];
    const edges = [];
    
    // Stack to track active loops: { id: string, type: string }
    const loopStack = [];

    // 重置节点位置
    this.resetNodePosition();

    // 1. 添加触发器节点
    const triggerNode = this.createTriggerNode();
    nodes.push(triggerNode);

    let previousNodeId = triggerNode.id;
// ...
```

---

### <a id="createtriggernode"></a>createTriggerNode

- **Type**: `method`
- **Parameters**: ``
- **Description**:

创建触发器节点

**Implementation**:
```javascript
createTriggerNode() {
    const position = this.getNextNodePosition();
    return {
      id: `trigger-${nanoid()}`,
      type: 'BlockBasic',
      label: 'trigger',
      position,
      data: {
        type: 'manual',
        description: '',
        disableBlock: false,
      },
    };
  }
```

---

### <a id="createnavigatenode"></a>createNavigateNode

- **Type**: `method`
- **Parameters**: `url`
- **Description**:

创建导航节点

**Implementation**:
```javascript
createNavigateNode(url) {
    const position = this.getNextNodePosition();
    return {
      id: `new-tab-${nanoid()}`,
      type: 'BlockBasic',
      label: 'new-tab',
      position,
      data: {
        url,
        active: true,
        inGroup: false,
        waitTabLoaded: true,
        description: '导航到目标页面',
        disableBlock: false,
      },
// ...
```

---

### <a id="createnodefromstep"></a>createNodeFromStep

- **Type**: `method`
- **Parameters**: `step, index`
- **Description**:

根据 AI 步骤创建节点

**Implementation**:
```javascript
createNodeFromStep(step, index) {
    const blockType = this.blockTypeMap[step.type];
    if (!blockType) {
      console.warn(`未知的步骤类型: ${step.type}`);
      return null;
    }
    
    if (blockType === 'loop-end') return null; // Should be handled in generateDrawflow

    const position = this.getNextNodePosition();
    const nodeId = `${blockType}-${nanoid()}`;

    // 根据不同类型创建不同的节点数据
    const nodeData = this.createNodeData(step, blockType);

// ...
```

---

### <a id="createnodedata"></a>createNodeData

- **Type**: `method`
- **Parameters**: `step, blockType`
- **Description**:

创建节点数据

**Implementation**:
```javascript
createNodeData(step, blockType) {
    const dataCreators = {
      'new-tab': () => ({
        url: step.data?.url || '',
        active: true,
        waitTabLoaded: true,
      }),

      delay: () => ({
        time: step.data?.time || 2000,
      }),

      'event-click': () => ({
        selector: step.selector || '',
        markEl: true,
// ...
```

---

### <a id="-computed-"></a>[computed]

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
'new-tab': () => ({
        url: step.data?.url || '',
        active: true,
        waitTabLoaded: true,
      })
```

---

### <a id="delay"></a>delay

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
delay: () => ({
        time: step.data?.time || 2000,
      })
```

---

### <a id="-computed-"></a>[computed]

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
'event-click': () => ({
        selector: step.selector || '',
        markEl: true,
        multiple: false,
        waitSelector: 5000,
      })
```

---

### <a id="-computed-"></a>[computed]

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
'element-scroll': () => ({
        selector: step.selector || '',
        scrollY: step.data?.scrollY || 0,
        scrollX: step.data?.scrollX || 0,
        smooth: true,
        incY: step.data?.incY || false,
        incX: step.data?.incX || false,
      })
```

---

### <a id="-computed-"></a>[computed]

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
'get-text': () => ({
        selector: step.selector || '',
        regex: '',
        regexExp: '',
        prefixText: '',
        suffixText: '',
        assignVariable: false,
        variableName: '',
        dataColumn: step.data?.columnName || 'column',
        multiple: step.data?.multiple || false,
        waitSelector: 5000,
        markEl: true,
      })
```

---

### <a id="-computed-"></a>[computed]

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
'attribute-value': () => ({
        selector: step.selector || '',
        attributeName: step.data?.attribute || 'href',
        dataColumn: step.data?.columnName || 'column',
        multiple: step.data?.multiple || false,
        waitSelector: 5000,
        markEl: true,
      })
```

---

### <a id="-computed-"></a>[computed]

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
'loop-data': () => ({
        loopId: nanoid(5),
        loopThrough: 'numbers',
        startIndex: 1,
        endIndex: step.data?.count || 10,
        maxLoop: step.data?.maxLoop || 0,
        reverseLoop: false,
      })
```

---

### <a id="-computed-"></a>[computed]

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
'loop-elements': () => ({
        loopId: nanoid(5),
        elementSelector: step.selector || '',
        max: step.data?.max || 0,
        waitSelector: 5000,
      })
```

---

### <a id="-computed-"></a>[computed]

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
'while-loop': () => {
         // Create conditions for "Next Button Exists"
         const conditions = [
            {
                id: nanoid(),
                conditions: [
                    {
                        id: nanoid(),
                        items: [
                            {
                                id: nanoid(),
                                category: 'value',
                                type: 'element-selector',
                                data: { selector: step.selector || '' }
                            },
// ...
```

---

### <a id="-computed-"></a>[computed]

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
'export-data': () => ({
        type: step.data?.type || 'json',
        dataToExport: 'data-columns',
        refKey: '',
        name: step.data?.filename || 'automa-data',
        description: '',
        onConflict: 'uniquify',
      })
```

---

### <a id="forms"></a>forms

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
forms: () => ({
        selector: step.selector || '',
        value: step.data?.value || '',
        clearValue: false,
        selected: false,
        delay: 0,
        markEl: true,
      })
```

---

### <a id="screenshot"></a>screenshot

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
screenshot: () => ({
        type: 'fullpage',
        selector: '',
        fileName: 'screenshot',
        saveToColumn: false,
        dataColumn: '',
      })
```

---

### <a id="conditions"></a>conditions

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
conditions: () => ({
        conditions: step.data?.conditions || [],
      })
```

---

### <a id="createexportnode"></a>createExportNode

- **Type**: `method`
- **Parameters**: `dataSchema`
- **Description**:

创建导出节点

**Implementation**:
```javascript
createExportNode(dataSchema) {
    const position = this.getNextNodePosition();
    return {
      id: `export-data-${nanoid()}`,
      type: 'BlockBasic',
      label: 'export-data',
      position,
      data: {
        type: 'json',
        dataToExport: 'data-columns',
        name: 'automa-scraped-data',
        description: '导出抓取的数据',
        onConflict: 'uniquify',
        disableBlock: false,
      },
// ...
```

---

### <a id="createedge"></a>createEdge

- **Type**: `method`
- **Parameters**: `sourceId, targetId, sourceOutput?`
- **Description**:

创建边(连接)

**Implementation**:
```javascript
createEdge(sourceId, targetId, sourceOutput = 'output-1') {
    return {
      id: `edge-${nanoid()}`,
      source: sourceId,
      target: targetId,
      sourceHandle: `${sourceId}-${sourceOutput}`,
      targetHandle: `${targetId}-input`,
      type: 'custom',
    };
  }
```

---

### <a id="generatedatacolumns"></a>generateDataColumns

- **Type**: `method`
- **Parameters**: `dataSchema`
- **Description**:

生成数据列配置

**Implementation**:
```javascript
generateDataColumns(dataSchema) {
    if (!dataSchema) return [];

    return Object.entries(dataSchema).map(([name, info]) => ({
      id: nanoid(),
      name,
      type: this.mapDataType(info.type || 'string'),
      description: info.description || '',
    }));
  }
```

---

### <a id="mapdatatype"></a>mapDataType

- **Type**: `method`
- **Parameters**: `type`
- **Description**:

映射数据类型

**Implementation**:
```javascript
mapDataType(type) {
    const typeMap = {
      string: 'string',
      number: 'number',
      boolean: 'boolean',
      date: 'string',
      url: 'string',
      array: 'array',
      object: 'object',
    };

    return typeMap[type] || 'string';
  }
```

---

### <a id="getnextnodeposition"></a>getNextNodePosition

- **Type**: `method`
- **Parameters**: ``
- **Description**:

获取下一个节点位置

**Implementation**:
```javascript
getNextNodePosition() {
    const { x, y, xOffset, yOffset, itemsPerRow } = this.nodePosition;
    const position = { x, y };

    // 计算下一个位置
    this.nodePosition.currentIndex = (this.nodePosition.currentIndex || 0) + 1;
    const index = this.nodePosition.currentIndex;

    if (index % itemsPerRow === 0) {
      // 换行
      this.nodePosition.x = 50;
      this.nodePosition.y += yOffset;
    } else {
      this.nodePosition.x += xOffset;
    }
// ...
```

---

### <a id="resetnodeposition"></a>resetNodePosition

- **Type**: `method`
- **Parameters**: ``
- **Description**:

重置节点位置

**Implementation**:
```javascript
resetNodePosition() {
    this.nodePosition.x = 50;
    this.nodePosition.y = 50;
    this.nodePosition.currentIndex = 0;
  }
```

---

### <a id="optimizeworkflow"></a>optimizeWorkflow

- **Type**: `method`
- **Parameters**: `workflow`
- **Description**:

优化工作流

合并重复步骤、优化选择器等

**Implementation**:
```javascript
optimizeWorkflow(workflow) {
    // TODO: 实现工作流优化逻辑
    // 1. 合并连续的等待步骤
    // 2. 移除不必要的步骤
    // 3. 优化选择器
    return workflow;
  }
```

---

### <a id="validateworkflow"></a>validateWorkflow

- **Type**: `method`
- **Parameters**: `workflow`
- **Description**:

验证工作流

检查工作流是否有效

**Implementation**:
```javascript
validateWorkflow(workflow) {
    const errors = [];

    // 检查是否有触发器
    const hasTrigger = workflow.drawflow.nodes.some(
      (node) => node.label === 'trigger'
    );
    if (!hasTrigger) {
      errors.push('工作流缺少触发器节点');
    }

    // 检查是否有导出节点
    const hasExport = workflow.drawflow.nodes.some(
      (node) => node.label === 'export-data'
    );
// ...
```

---

