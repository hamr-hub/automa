# WorkflowManager.js

**Path**: `workflowEngine/WorkflowManager.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [get](#get) | object_method | ❌ | `` |
| [set](#set) | object_method | ❌ | `key, value` |
| [instance](#instance) | method | ❌ | `` |
| [constructor](#constructor) | method | ❌ | `` |
| [execute](#execute) | method | ❌ | `workflowData, options` |
| [stopExecution](#stopexecution) | method | ❌ | `stateId` |
| [resumeExecution](#resumeexecution) | method | ❌ | `id, nextBlock` |
| [updateExecution](#updateexecution) | method | ❌ | `id, stateData` |

## Detailed Description

### <a id="get"></a>get

- **Type**: `object_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
get() {
    return BrowserAPIService.storage.local
      .get('workflowStates')
      .then(({ workflowStates }) => workflowStates || []);
  }
```

---

### <a id="set"></a>set

- **Type**: `object_method`
- **Parameters**: `key, value`
- **Description**: *No description provided.*

**Implementation**:
```javascript
set(key, value) {
    const states = Object.values(value);

    return BrowserAPIService.storage.local.set({ workflowStates: states });
  }
```

---

### <a id="instance"></a>instance

- **Type**: `method`
- **Parameters**: ``
- **Description**:

WorkflowManager singleton

@type {WorkflowManager}

**Implementation**:
```javascript
static get instance() {
    if (!this.#_instance) this.#_instance = new WorkflowManager();

    return this.#_instance;
  }
```

---

### <a id="constructor"></a>constructor

- **Type**: `method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
constructor() {
    this.#logger = new WorkflowLogger();
    this.#state = new WorkflowState({ storage: workflowStateStorage });
  }
```

---

### <a id="execute"></a>execute

- **Type**: `method`
- **Parameters**: `workflowData, options`
- **Description**: *No description provided.*

**Implementation**:
```javascript
execute(workflowData, options) {
    if (workflowData.testingMode) {
      for (const value of this.#state.states.values()) {
        if (value.workflowId === workflowData.id) return null;
      }
    }

    const convertedWorkflow = convertWorkflowData(workflowData);
    const engine = new WorkflowEngine(convertedWorkflow, {
      options,
      states: this.#state,
      logger: this.#logger,
      blocksHandler: blocksHandler(),
    });

// ...
```

---

### <a id="stopexecution"></a>stopExecution

- **Type**: `method`
- **Parameters**: `stateId`
- **Description**:

Stop workflow execution

@param {string} stateId

@returns {Promise<void>}

**Implementation**:
```javascript
stopExecution(stateId) {
    return this.#state.stop(stateId);
  }
```

---

### <a id="resumeexecution"></a>resumeExecution

- **Type**: `method`
- **Parameters**: `id, nextBlock`
- **Description**:

Resume workflow execution

@param {string} id

@param {object} nextBlock

@returns {Promise<void>}

**Implementation**:
```javascript
resumeExecution(id, nextBlock) {
    return this.#state.resume(id, nextBlock);
  }
```

---

### <a id="updateexecution"></a>updateExecution

- **Type**: `method`
- **Parameters**: `id, stateData`
- **Description**:

Resume workflow execution

@param {string} id

@param {object} stateData

@returns {Promise<void>}

**Implementation**:
```javascript
updateExecution(id, stateData) {
    return this.#state.update(id, stateData);
  }
```

---

