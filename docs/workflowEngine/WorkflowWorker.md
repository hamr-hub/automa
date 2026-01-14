# WorkflowWorker.js

**Path**: `workflowEngine/WorkflowWorker.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [blockExecutionWrapper](#blockexecutionwrapper) | function | ❌ | `blockHandler, blockData` |
| [constructor](#constructor) | method | ❌ | `id, engine, options?` |
| [init](#init) | method | ❌ | `{}` |
| [addDataToColumn](#adddatatocolumn) | method | ❌ | `key, value` |
| [setVariable](#setvariable) | method | ✅ | `name, value` |
| [getBlockConnections](#getblockconnections) | method | ❌ | `blockId, outputIndex?` |
| [executeNextBlocks](#executenextblocks) | method | ❌ | `connections, prevBlockData, nextBlockBreakpointCount?` |
| [resume](#resume) | method | ❌ | `nextBlock` |
| [executeBlock](#executeblock) | method | ✅ | `block, execParam?, isRetry?` |
| [addBlockLog](#addblocklog) | arrow_function | ❌ | `status, obj?` |
| [executeBlocks](#executeblocks) | arrow_function | ❌ | `blocks, data` |
| [reset](#reset) | method | ❌ | `` |
| [_sendMessageToTab](#-sendmessagetotab) | method | ✅ | `payload, options?, runBeforeLoad?` |

## Detailed Description

### <a id="blockexecutionwrapper"></a>blockExecutionWrapper

- **Type**: `function`
- **Parameters**: `blockHandler, blockData`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function blockExecutionWrapper(blockHandler, blockData) {
  return new Promise((resolve, reject) => {
    let timeout = null;
    const timeoutMs = blockData?.settings?.blockTimeout;
    if (timeoutMs && timeoutMs > 0) {
      timeout = setTimeout(() => {
        reject(new Error('Timeout'));
      }, timeoutMs);
    }

    blockHandler()
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
// ...
```

---

### <a id="constructor"></a>constructor

- **Type**: `method`
- **Parameters**: `id, engine, options?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
constructor(id, engine, options = {}) {
    this.id = id;
    this.engine = engine;
    this.settings = engine.workflow.settings;
    this.blocksDetail = options.blocksDetail || {};

    this.loopEls = [];
    this.loopList = {};
    this.repeatedTasks = {};
    this.preloadScripts = [];
    this.breakpointState = null;

    this.windowId = null;
    this.currentBlock = null;
    this.childWorkflowId = null;
// ...
```

---

### <a id="init"></a>init

- **Type**: `method`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
init({ blockId, execParam, state }) {
    if (state) {
      Object.keys(state).forEach((key) => {
        this[key] = state[key];
      });
    }

    const block = this.engine.blocks[blockId];
    this.executeBlock(block, execParam);
  }
```

---

### <a id="adddatatocolumn"></a>addDataToColumn

- **Type**: `method`
- **Parameters**: `key, value`
- **Description**: *No description provided.*

**Implementation**:
```javascript
addDataToColumn(key, value) {
    if (Array.isArray(key)) {
      key.forEach((item) => {
        if (!isObject(item)) return;

        Object.entries(item).forEach(([itemKey, itemValue]) => {
          this.addDataToColumn(itemKey, itemValue);
        });
      });

      return;
    }

    const insertDefault = this.settings.insertDefaultColumn ?? true;
    const columnId =
// ...
```

---

### <a id="setvariable"></a>setVariable

- **Type**: `method`
- **Parameters**: `name, value`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async setVariable(name, value) {
    let variableName = name;
    const vars = this.engine.referenceData.variables;

    if (name.startsWith('$push:')) {
      const { 1: varName } = name.split('$push:');

      if (!objectHasKey(vars, varName)) vars[varName] = [];
      else if (!Array.isArray(vars[varName])) vars[varName] = [vars[varName]];

      vars[varName].push(value);
      variableName = varName;
    } else {
      vars[name] = value;
    }
// ...
```

---

### <a id="getblockconnections"></a>getBlockConnections

- **Type**: `method`
- **Parameters**: `blockId, outputIndex?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
getBlockConnections(blockId, outputIndex = 1) {
    if (this.engine.isDestroyed) return null;

    const outputId = `${blockId}-output-${outputIndex}`;
    const connections = this.engine.connectionsMap[outputId];

    if (!connections) return null;

    return [...connections.values()];
  }
```

---

### <a id="executenextblocks"></a>executeNextBlocks

- **Type**: `method`
- **Parameters**: `connections, prevBlockData, nextBlockBreakpointCount?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
executeNextBlocks(
    connections,
    prevBlockData,
    nextBlockBreakpointCount = null
  ) {
    // pre check
    for (const connection of connections) {
      const id = typeof connection === 'string' ? connection : connection.id;

      const block = this.engine.blocks[id];

      if (!block) {
        console.error(`Block ${id} doesn't exist`);
        this.engine.destroy('stopped');
        return;
// ...
```

---

### <a id="resume"></a>resume

- **Type**: `method`
- **Parameters**: `nextBlock`
- **Description**: *No description provided.*

**Implementation**:
```javascript
resume(nextBlock) {
    if (!this.breakpointState) return;

    const { block, execParam, isRetry } = this.breakpointState;
    const payload = { ...execParam, resume: true };

    payload.nextBlockBreakpointCount = nextBlock ? 1 : null;

    this.executeBlock(block, payload, isRetry);

    this.breakpointState = null;
  }
```

---

### <a id="executeblock"></a>executeBlock

- **Type**: `method`
- **Parameters**: `block, execParam?, isRetry?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async executeBlock(block, execParam = {}, isRetry = false) {
    const currentState = await this.engine.states.get(this.engine.id);

    if (!currentState || currentState.isDestroyed) {
      if (this.engine.isDestroyed) return;

      await this.engine.destroy('stopped');
      return;
    }

    const startExecuteTime = Date.now();
    const prevBlock = this.currentBlock;
    this.currentBlock = { ...block, startedAt: startExecuteTime };

    const isInBreakpoint =
// ...
```

---

### <a id="addblocklog"></a>addBlockLog

- **Type**: `arrow_function`
- **Parameters**: `status, obj?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(status, obj = {}) => {
      let { description } = block.data;

      if (block.label === 'loop-breakpoint') description = block.data.loopId;
      else if (block.label === 'block-package') description = block.data.name;

      this.engine.addLogHistory({
        description,
        prevBlockData,
        type: status,
        name: block.label,
        blockId: block.id,
        workerId: this.id,
        timestamp: startExecuteTime,
        activeTabUrl: this.activeTab?.url,
// ...
```

---

### <a id="executeblocks"></a>executeBlocks

- **Type**: `arrow_function`
- **Parameters**: `blocks, data`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(blocks, data) => {
      return this.executeNextBlocks(
        blocks,
        data,
        execParam.nextBlockBreakpointCount
      );
    }
```

---

### <a id="reset"></a>reset

- **Type**: `method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
reset() {
    this.loopList = {};
    this.repeatedTasks = {};

    this.windowId = null;
    this.currentBlock = null;
    this.childWorkflowId = null;

    this.engine.history = [];
    this.engine.preloadScripts = [];
    this.engine.columns = {
      column: {
        index: 0,
        type: 'any',
        name: this.settings?.defaultColumnName || 'column',
// ...
```

---

### <a id="-sendmessagetotab"></a>_sendMessageToTab

- **Type**: `method`
- **Parameters**: `payload, options?, runBeforeLoad?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async _sendMessageToTab(payload, options = {}, runBeforeLoad = false) {
    try {
      if (!this.activeTab.id) {
        const error = new Error('no-tab');
        error.workflowId = this.id;

        throw error;
      }

      if (!runBeforeLoad) {
        await waitTabLoaded({
          tabId: this.activeTab.id,
          ms: this.settings?.tabLoadTimeout ?? 30000,
        });
      }
// ...
```

---

