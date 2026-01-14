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
- **Description**:

Creates a new WorkflowWorker instance.

@param {string} id - Unique worker ID.

@param {WorkflowEngine} engine - The parent workflow engine.

@param {Object} [options] - Additional options.

@param {Object} [options.blocksDetail] - Details about block definitions.

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
- **Description**:

Initializes the worker and starts executing the first block.

@param {Object} params - Initialization parameters.

@param {string} params.blockId - The ID of the block to execute.

@param {Object} [params.execParam] - Execution parameters (prevBlockData, etc.).

@param {Object} [params.state] - Initial state (if restoring).

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
- **Description**:

Adds data to the workflow's table (data columns).

@param {string|Array} key - The column name or an array of objects to add.

@param {*} value - The value to add (if key is a string).

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
- **Description**:

Sets a variable in the workflow's reference data.

Supports normal variables and pushing to array variables (via '$push:' prefix).

Also updates persistent variables (prefixed with '$$') in storage.

@param {string} name - The variable name.

@param {*} value - The value to set.

@returns {Promise<void>}

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
- **Description**:

Retrieves the connections (next blocks) for a specific block output.

@param {string} blockId - The current block ID.

@param {number} [outputIndex=1] - The output index to check.

@returns {Array|null} Array of connections or null if none.

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
- **Description**:

Executes the next blocks in the workflow.

If there are multiple connections, it spawns new workers for parallel execution.

@param {Array} connections - List of connections to next blocks.

@param {*} prevBlockData - Data passed from the previous block.

@param {number|null} [nextBlockBreakpointCount=null] - Breakpoint counter.

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
- **Description**:

Resumes execution from a breakpoint.

@param {boolean} nextBlock - Whether to proceed to the next block or retry/stay.

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
- **Description**:

Executes a single block.

Handles state updates, breakpoints, templating, logging, error handling,

and finding the next block(s) to execute.

@param {Object} block - The block object to execute.

@param {Object} [execParam={}] - Execution parameters.

@param {boolean} [isRetry=false] - Whether this is a retry attempt.

@returns {Promise<void>}

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
- **Description**:

Sends a message to the active tab's content script.

Handles script injection if connection fails.

@param {Object} payload - The message payload.

@param {Object} [options={}] - Options for sendMessage.

@param {boolean} [runBeforeLoad=false] - Whether to run before tab load completes.

@returns {Promise<Object>} Response from the content script.

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

