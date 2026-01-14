# WorkflowEngine.js

**Path**: `workflowEngine/WorkflowEngine.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [constructor](#constructor) | method | ❌ | `workflow, {}` |
| [init](#init) | method | ✅ | `` |
| [addRefDataSnapshot](#addrefdatasnapshot) | method | ❌ | `key` |
| [addWorker](#addworker) | method | ❌ | `detail` |
| [addLogHistory](#addloghistory) | method | ❌ | `detail` |
| [stop](#stop) | method | ✅ | `` |
| [executeQueue](#executequeue) | method | ✅ | `` |
| [destroyWorker](#destroyworker) | method | ✅ | `workerId` |
| [destroy](#destroy) | method | ✅ | `status, message, blockDetail` |
| [cleanUp](#cleanup) | arrow_function | ❌ | `` |
| [updateState](#updatestate) | method | ✅ | `data` |
| [dispatchEvent](#dispatchevent) | method | ❌ | `name, params` |
| [on](#on) | method | ❌ | `name, listener` |

## Detailed Description

### <a id="constructor"></a>constructor

- **Type**: `method`
- **Parameters**: `workflow, {}`
- **Description**:

Creates a new WorkflowEngine instance.

@param {Object} workflow - The workflow data object.

@param {Object} options - Configuration options.

@param {Object} options.states - State manager instance.

@param {Object} options.logger - Logger instance.

@param {Object} options.blocksHandler - Handlers for different block types.

@param {boolean} [options.isPopup=true] - Whether running in a popup context.

@param {Object} [options.options] - Additional options (parentWorkflow, data, etc.).

**Implementation**:
```javascript
constructor(workflow, { states, logger, blocksHandler, isPopup, options }) {
    this.id = nanoid();
    this.states = states;
    this.logger = logger;
    this.workflow = workflow;
    this.isPopup = isPopup ?? true;
    // this.isMV2 = IS_MV2;
    this.blocksHandler = blocksHandler;
    this.isTestingMode = workflow.testingMode;
    this.parentWorkflow = options?.parentWorkflow;
    this.saveLog = workflow.settings?.saveLog ?? true;

    this.workerId = 0;
    this.workers = new Map();

// ...
```

---

### <a id="init"></a>init

- **Type**: `method`
- **Parameters**: ``
- **Description**:

Initializes the workflow engine.

Validates the workflow structure, sets up listeners, prepares data,

and starts the execution by creating the first worker.

@returns {Promise<void>}

**Implementation**:
```javascript
async init() {
    try {
      if (this.workflow.isDisabled) return;

      if (!this.states) {
        console.error(`"${this.workflow.name}" workflow doesn't have states`);
        this.destroy('error');
        return;
      }

      console.log('before execute', this.state, '\n', this.workflow);

      const { nodes, edges } = this.workflow.drawflow;
      if (!nodes || nodes.length === 0) {
        console.error(`${this.workflow.name} doesn't have blocks`);
// ...
```

---

### <a id="addrefdatasnapshot"></a>addRefDataSnapshot

- **Type**: `method`
- **Parameters**: `key`
- **Description**:

Creates a snapshot of reference data (variables or loop data) for history logging.

@param {string} key - The key of the data to snapshot ('variables' or 'loopData').

**Implementation**:
```javascript
addRefDataSnapshot(key) {
    this.refDataSnapshotsKeys[key].index += 1;
    this.refDataSnapshotsKeys[key].key = key;

    const keyName = this.refDataSnapshotsKeys[key].key;
    this.refDataSnapshots[keyName] = cloneDeep(this.referenceData[key]);
  }
```

---

### <a id="addworker"></a>addWorker

- **Type**: `method`
- **Parameters**: `detail`
- **Description**:

Adds a new worker to execute a block.

@param {Object} detail - Details for initializing the worker (blockId, execParam, state).

**Implementation**:
```javascript
addWorker(detail) {
    this.workerId += 1;

    const workerId = `worker-${this.workerId}`;
    const worker = new WorkflowWorker(workerId, this, { blocksDetail: blocks });
    worker.init(detail);

    this.workers.set(worker.id, worker);
  }
```

---

### <a id="addloghistory"></a>addLogHistory

- **Type**: `method`
- **Parameters**: `detail`
- **Description**:

Adds an entry to the execution log history.

@param {Object} detail - The log detail object.

**Implementation**:
```javascript
addLogHistory(detail) {
    if (detail.name === 'blocks-group') return;

    const isLimit = this.history?.length >= this.logsLimit;
    const notErrorLog = detail.type !== 'error';

    if ((isLimit || !this.saveLog) && notErrorLog) return;

    this.logHistoryId += 1;
    detail.id = this.logHistoryId;

    if (
      detail.name !== 'delay' ||
      detail.replacedValue ||
      detail.name === 'javascript-code' ||
// ...
```

---

### <a id="stop"></a>stop

- **Type**: `method`
- **Parameters**: ``
- **Description**:

Stops the workflow execution.

Terminates child workflows and destroys the engine instance.

@returns {Promise<void>}

**Implementation**:
```javascript
async stop() {
    try {
      if (this.childWorkflowId) {
        await this.states.stop(this.childWorkflowId);
      }

      await this.destroy('stopped');
    } catch (error) {
      console.error(error);
    }
  }
```

---

### <a id="executequeue"></a>executeQueue

- **Type**: `method`
- **Parameters**: ``
- **Description**:

Checks the workflow queue and executes the next workflow if available.

@returns {Promise<void>}

**Implementation**:
```javascript
async executeQueue() {
    const { workflowQueue } = (await BrowserAPIService.storage.local.get(
      'workflowQueue'
    )) || { workflowQueue: [] };
    const queueIndex = (workflowQueue || []).indexOf(this.workflow?.id);

    if (!workflowQueue || queueIndex === -1) return;

    const engine = new WorkflowEngine(this.workflow, {
      logger: this.logger,
      states: this.states,
      blocksHandler: this.blocksHandler,
    });
    engine.init();

// ...
```

---

### <a id="destroyworker"></a>destroyWorker

- **Type**: `method`
- **Parameters**: `workerId`
- **Description**:

Destroys a specific worker.

If it's the last worker, it triggers the workflow completion.

@param {string} workerId - The ID of the worker to destroy.

@returns {Promise<void>}

**Implementation**:
```javascript
async destroyWorker(workerId) {
    // is last worker
    if (this.workers.size === 1 && this.workers.has(workerId)) {
      this.addLogHistory({
        type: 'finish',
        name: 'finish',
      });
      this.dispatchEvent('finish');
      await this.destroy('success');
    }
    // wait detach debugger
    this.workers.delete(workerId);

    // No active workers, destroying workflow
    if (this.workers.size === 0) {
// ...
```

---

### <a id="destroy"></a>destroy

- **Type**: `method`
- **Parameters**: `status, message, blockDetail`
- **Description**:

Destroys the workflow engine instance and cleans up resources.

Reports the execution status and saves logs/state.

@param {string} status - The final status ('success', 'error', 'stopped').

@param {string} [message] - Optional message or error description.

@param {Object} [blockDetail] - Optional detail about the block where it ended.

@returns {Promise<void>}

**Implementation**:
```javascript
async destroy(status, message, blockDetail) {
    const cleanUp = () => {
      this.id = null;
      this.states = null;
      this.logger = null;
      this.saveLog = null;
      this.workflow = null;
      this.blocksHandler = null;
      this.parentWorkflow = null;

      this.isDestroyed = true;
      this.referenceData = null;
      this.eventListeners = null;
      this.packagesCache = null;
      this.extractedGroup = null;
// ...
```

---

### <a id="cleanup"></a>cleanUp

- **Type**: `arrow_function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
() => {
      this.id = null;
      this.states = null;
      this.logger = null;
      this.saveLog = null;
      this.workflow = null;
      this.blocksHandler = null;
      this.parentWorkflow = null;

      this.isDestroyed = true;
      this.referenceData = null;
      this.eventListeners = null;
      this.packagesCache = null;
      this.extractedGroup = null;
      this.connectionsMap = null;
// ...
```

---

### <a id="updatestate"></a>updateState

- **Type**: `method`
- **Parameters**: `data`
- **Description**:

Updates the workflow state in the state manager.

@param {Object} data - The state data to update.

@returns {Promise<void>}

**Implementation**:
```javascript
async updateState(data) {
    const state = {
      ...data,
      tabIds: [],
      currentBlock: [],
      name: this.workflow.name,
      logs: this.history,
      ctxData: {
        ctxData: this.historyCtxData,
        dataSnapshot: this.refDataSnapshots,
      },
      startedTimestamp: this.startedTimestamp,
    };

    this.workers.forEach((worker) => {
// ...
```

---

### <a id="dispatchevent"></a>dispatchEvent

- **Type**: `method`
- **Parameters**: `name, params`
- **Description**:

Dispatches an event to registered listeners.

@param {string} name - The event name.

@param {*} params - Parameters to pass to the listener.

**Implementation**:
```javascript
dispatchEvent(name, params) {
    const listeners = this.eventListeners[name];

    if (!listeners) return;

    listeners.forEach((callback) => {
      callback(params);
    });
  }
```

---

### <a id="on"></a>on

- **Type**: `method`
- **Parameters**: `name, listener`
- **Description**:

Registers an event listener.

@param {string} name - The event name to listen for.

@param {Function} listener - The callback function.

**Implementation**:
```javascript
on(name, listener) {
    (this.eventListeners[name] = this.eventListeners[name] || []).push(
      listener
    );
  }
```

---

