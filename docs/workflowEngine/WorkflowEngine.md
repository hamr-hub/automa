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
- **Description**: *No description provided.*

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
- **Description**: *No description provided.*

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
- **Description**: *No description provided.*

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
- **Description**: *No description provided.*

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
- **Description**: *No description provided.*

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
- **Description**: *No description provided.*

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
- **Description**: *No description provided.*

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
- **Description**: *No description provided.*

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
- **Description**: *No description provided.*

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
- **Description**: *No description provided.*

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
- **Description**: *No description provided.*

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
- **Description**: *No description provided.*

**Implementation**:
```javascript
on(name, listener) {
    (this.eventListeners[name] = this.eventListeners[name] || []).push(
      listener
    );
  }
```

---

