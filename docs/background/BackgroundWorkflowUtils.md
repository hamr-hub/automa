# BackgroundWorkflowUtils.js

**Path**: `background/BackgroundWorkflowUtils.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [instance](#instance) | method | ❌ | `` |
| [constructor](#constructor) | method | ❌ | `` |
| [flattenTeamWorkflows](#flattenteamworkflows) | method | ❌ | `workflows` |
| [getWorkflow](#getworkflow) | method | ✅ | `workflowId` |
| [stopExecution](#stopexecution) | method | ✅ | `stateId` |
| [resumeExecution](#resumeexecution) | method | ✅ | `stateId, nextBlock` |
| [updateExecutionState](#updateexecutionstate) | method | ✅ | `stateId, data` |
| [executeWorkflow](#executeworkflow) | method | ✅ | `workflowData, options` |

## Detailed Description

### <a id="instance"></a>instance

- **Type**: `method`
- **Parameters**: ``
- **Description**:

BackgroundWorkflowUtils singleton

@type {BackgroundWorkflowUtils}

**Implementation**:
```javascript
static get instance() {
    if (!this.#_instance) this.#_instance = new BackgroundWorkflowUtils();

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
    this.#workflowManager = null;
  }
```

---

### <a id="flattenteamworkflows"></a>flattenTeamWorkflows

- **Type**: `method`
- **Parameters**: `workflows`
- **Description**: *No description provided.*

**Implementation**:
```javascript
static flattenTeamWorkflows(workflows) {
    return Object.values(Object.values(workflows || {})[0] || {});
  }
```

---

### <a id="getworkflow"></a>getWorkflow

- **Type**: `method`
- **Parameters**: `workflowId`
- **Description**: *No description provided.*

**Implementation**:
```javascript
static async getWorkflow(workflowId) {
    if (!workflowId) return null;

    if (workflowId.startsWith('team')) {
      const { teamWorkflows } = await browser.storage.local.get(
        'teamWorkflows'
      );
      if (!teamWorkflows) return null;

      const workflows = this.flattenTeamWorkflows(teamWorkflows);

      return workflows.find((item) => item.id === workflowId);
    }

    const { workflows, workflowHosts } = await browser.storage.local.get([
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
async stopExecution(stateId) {
    if (IS_FIREFOX) {
      await this.#ensureWorkflowManager();
      this.#workflowManager.stopExecution(stateId);
      return;
    }

    await BackgroundOffscreen.instance.sendMessage('workflow:stop', stateId);
  }
```

---

### <a id="resumeexecution"></a>resumeExecution

- **Type**: `method`
- **Parameters**: `stateId, nextBlock`
- **Description**:

Resume workflow execution

@param {string} stateId

@param {object} nextBlock

@returns {Promise<void>}

**Implementation**:
```javascript
async resumeExecution(stateId, nextBlock) {
    if (IS_FIREFOX) {
      await this.#ensureWorkflowManager();
      this.#workflowManager.resumeExecution(stateId, nextBlock);
      return;
    }

    await BackgroundOffscreen.instance.sendMessage('workflow:resume', {
      id: stateId,
      nextBlock,
    });
  }
```

---

### <a id="updateexecutionstate"></a>updateExecutionState

- **Type**: `method`
- **Parameters**: `stateId, data`
- **Description**:

Update workflow execution state

@param {string} stateId

@param {object} data

@returns {Promise<void>}

**Implementation**:
```javascript
async updateExecutionState(stateId, data) {
    if (IS_FIREFOX) {
      await this.#ensureWorkflowManager();
      this.#workflowManager.updateExecution(stateId, data);
      return;
    }

    await BackgroundOffscreen.instance.sendMessage('workflow:update', {
      data,
      id: stateId,
    });
  }
```

---

### <a id="executeworkflow"></a>executeWorkflow

- **Type**: `method`
- **Parameters**: `workflowData, options`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async executeWorkflow(workflowData, options) {
    if (workflowData.isDisabled) return;

    if (IS_FIREFOX) {
      await this.#ensureWorkflowManager();
      this.#workflowManager.execute(workflowData, options);
      return;
    }

    await BackgroundOffscreen.instance.sendMessage('workflow:execute', {
      workflow: workflowData,
      options,
    });
  }
```

---

