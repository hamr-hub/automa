# workflow.js

**Path**: `stores/workflow.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [defaultWorkflow](#defaultworkflow) | arrow_function | ❌ | `data?, options?` |
| [convertWorkflowsToObject](#convertworkflowstoobject) | function | ❌ | `workflows` |
| [state](#state) | object_property_method | ❌ | `` |
| [getAllStates](#getallstates) | object_property_method | ❌ | `state` |
| [getById](#getbyid) | object_property_method | ❌ | `state` |
| [getWorkflows](#getworkflows) | object_property_method | ❌ | `state` |
| [getWorkflowStates](#getworkflowstates) | object_property_method | ❌ | `state` |
| [loadData](#loaddata) | object_method | ✅ | `` |
| [updateStates](#updatestates) | object_method | ❌ | `newStates` |
| [insert](#insert) | object_method | ✅ | `data?, options?` |
| [update](#update) | object_method | ✅ | `{}` |
| [workflowUpdater](#workflowupdater) | arrow_function | ❌ | `workflowId` |
| [insertOrUpdate](#insertorupdate) | object_method | ✅ | `data?, ?` |
| [delete](#delete) | object_method | ✅ | `id` |

## Detailed Description

### <a id="defaultworkflow"></a>defaultWorkflow

- **Type**: `arrow_function`
- **Parameters**: `data?, options?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(data = null, options = {}) => {
  let workflowData = {
    id: nanoid(),
    name: '',
    icon: 'riGlobalLine',
    folderId: null,
    content: null,
    connectedTable: null,
    drawflow: {
      edges: [],
      zoom: 1.3,
      nodes: [
        {
          position: {
            x: 100,
// ...
```

---

### <a id="convertworkflowstoobject"></a>convertWorkflowsToObject

- **Type**: `function`
- **Parameters**: `workflows`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function convertWorkflowsToObject(workflows) {
  if (Array.isArray(workflows)) {
    return workflows.reduce((acc, workflow) => {
      acc[workflow.id] = workflow;

      return acc;
    }, {});
  }

  return workflows;
}
```

---

### <a id="state"></a>state

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
state: () => ({
    states: [],
    workflows: {},
    popupStates: [],
    retrieved: false,
    isFirstTime: false,
  })
```

---

### <a id="getallstates"></a>getAllStates

- **Type**: `object_property_method`
- **Parameters**: `state`
- **Description**: *No description provided.*

**Implementation**:
```javascript
getAllStates: (state) => [...state.popupStates, ...state.states]
```

---

### <a id="getbyid"></a>getById

- **Type**: `object_property_method`
- **Parameters**: `state`
- **Description**: *No description provided.*

**Implementation**:
```javascript
getById: (state) => (id) => state.workflows[id]
```

---

### <a id="getworkflows"></a>getWorkflows

- **Type**: `object_property_method`
- **Parameters**: `state`
- **Description**: *No description provided.*

**Implementation**:
```javascript
getWorkflows: (state) => Object.values(state.workflows)
```

---

### <a id="getworkflowstates"></a>getWorkflowStates

- **Type**: `object_property_method`
- **Parameters**: `state`
- **Description**: *No description provided.*

**Implementation**:
```javascript
getWorkflowStates: (state) => (id) =>
      [...state.states, ...state.popupStates].filter(
        ({ workflowId }) => workflowId === id
      )
```

---

### <a id="loaddata"></a>loadData

- **Type**: `object_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async loadData() {
      if (!browser?.storage?.local) return;

      const { workflows, isFirstTime } = await browser.storage.local.get([
        'workflows',
        'isFirstTime',
      ]);

      let localWorkflows = workflows || {};

      if (isFirstTime) {
        localWorkflows = firstWorkflows.map((workflow) =>
          defaultWorkflow(workflow)
        );
        await browser.storage.local.set({
// ...
```

---

### <a id="updatestates"></a>updateStates

- **Type**: `object_method`
- **Parameters**: `newStates`
- **Description**: *No description provided.*

**Implementation**:
```javascript
updateStates(newStates) {
      this.states = newStates;
    }
```

---

### <a id="insert"></a>insert

- **Type**: `object_method`
- **Parameters**: `data?, options?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async insert(data = {}, options = {}) {
      const insertedWorkflows = {};

      if (Array.isArray(data)) {
        data.forEach((item) => {
          if (!options.duplicateId) {
            delete item.id;
          }

          const workflow = defaultWorkflow(item, options);
          this.workflows[workflow.id] = workflow;
          insertedWorkflows[workflow.id] = workflow;
        });
      } else {
        if (!options.duplicateId) {
// ...
```

---

### <a id="update"></a>update

- **Type**: `object_method`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async update({ id, data = {}, deep = false }) {
      const isFunction = typeof id === 'function';
      if (!isFunction && !this.workflows[id]) return null;

      const updatedWorkflows = {};
      const updateData = { ...data, updatedAt: Date.now() };

      const workflowUpdater = (workflowId) => {
        if (deep) {
          this.workflows[workflowId] = deepmerge(
            this.workflows[workflowId],
            updateData
          );
        } else {
          Object.assign(this.workflows[workflowId], updateData);
// ...
```

---

### <a id="workflowupdater"></a>workflowUpdater

- **Type**: `arrow_function`
- **Parameters**: `workflowId`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(workflowId) => {
        if (deep) {
          this.workflows[workflowId] = deepmerge(
            this.workflows[workflowId],
            updateData
          );
        } else {
          Object.assign(this.workflows[workflowId], updateData);
        }

        this.workflows[workflowId].updatedAt = Date.now();
        updatedWorkflows[workflowId] = this.workflows[workflowId];

        if (!('isDisabled' in data)) return;

// ...
```

---

### <a id="insertorupdate"></a>insertOrUpdate

- **Type**: `object_method`
- **Parameters**: `data?, ?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async insertOrUpdate(
      data = [],
      { checkUpdateDate = false, duplicateId = false } = {}
    ) {
      const insertedData = {};

      data.forEach((item) => {
        const currentWorkflow = this.workflows[item.id];

        if (currentWorkflow) {
          let insert = true;
          if (checkUpdateDate && currentWorkflow.createdAt && item.updatedAt) {
            insert = dayjs(currentWorkflow.updatedAt).isBefore(item.updatedAt);
          }

// ...
```

---

### <a id="delete"></a>delete

- **Type**: `object_method`
- **Parameters**: `id`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async delete(id) {
      const ids = Array.isArray(id) ? id : [id];

      ids.forEach((workflowId) => {
        delete this.workflows[workflowId];
      });

      await cleanWorkflowTriggers(id);

      // 离线优先：先记录待同步 delete（不依赖登录/网络）
      try {
        const { default: WorkflowSyncService } = await import(
          '@/services/workflowSync/WorkflowSyncService'
        );
        await Promise.all(
// ...
```

---

