# workflowData.js

**Path**: `utils/workflowData.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [checkPermission](#checkpermission) | arrow_function | ❌ | `permissions` |
| [hasPermission](#haspermission) | object_method | ❌ | `{}` |
| [hasPermission](#haspermission) | object_method | ❌ | `` |
| [hasPermission](#haspermission) | object_method | ❌ | `` |
| [hasPermission](#haspermission) | object_method | ❌ | `` |
| [hasPermission](#haspermission) | object_method | ❌ | `` |
| [hasPermission](#haspermission) | object_method | ❌ | `` |
| [getWorkflowPermissions](#getworkflowpermissions) | function | ✅ | `drawflow` |
| [importWorkflow](#importworkflow) | function | ❌ | `attrs?` |
| [handleOnLoadReader](#handleonloadreader) | arrow_function | ❌ | `{}` |
| [convertWorkflow](#convertworkflow) | function | ❌ | `workflow, additionalKeys?` |
| [findIncludedWorkflows](#findincludedworkflows) | function | ❌ | `{}, store, maxDepth?, workflows?` |
| [checkWorkflow](#checkworkflow) | arrow_function | ❌ | `type, workflowId` |
| [exportWorkflow](#exportworkflow) | function | ❌ | `workflow` |

## Detailed Description

### <a id="checkpermission"></a>checkPermission

- **Type**: `arrow_function`
- **Parameters**: `permissions`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(permissions) =>
  browser.permissions.contains({ permissions })
```

---

### <a id="haspermission"></a>hasPermission

- **Type**: `object_method`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
hasPermission({ data }) {
      const permissions = [];

      if (data.triggers) {
        data.triggers.forEach((trigger) => {
          if (trigger.type !== 'context-menu') return;

          permissions.push(contextMenuPermission);
        });
      } else if (data.type === 'context-menu') {
        permissions.push(contextMenuPermission);
      }

      return checkPermission(permissions);
    }
```

---

### <a id="haspermission"></a>hasPermission

- **Type**: `object_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
hasPermission() {
      const clipboardPermissions = ['clipboardRead'];
      if (BROWSER_TYPE === 'firefox')
        clipboardPermissions.push('clipboardWrite');

      return checkPermission(clipboardPermissions);
    }
```

---

### <a id="haspermission"></a>hasPermission

- **Type**: `object_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
hasPermission() {
      return checkPermission(['notifications']);
    }
```

---

### <a id="haspermission"></a>hasPermission

- **Type**: `object_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
hasPermission() {
      return checkPermission(['downloads']);
    }
```

---

### <a id="haspermission"></a>hasPermission

- **Type**: `object_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
hasPermission() {
      return checkPermission(['downloads']);
    }
```

---

### <a id="haspermission"></a>hasPermission

- **Type**: `object_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
hasPermission() {
      return checkPermission(['cookies']);
    }
```

---

### <a id="getworkflowpermissions"></a>getWorkflowPermissions

- **Type**: `function`
- **Parameters**: `drawflow`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function getWorkflowPermissions(drawflow) {
  let blocks = [];
  const permissions = [];
  const drawflowData =
    typeof drawflow === 'string' ? parseJSON(drawflow) : drawflow;

  if (drawflowData.nodes) {
    blocks = drawflowData.nodes;
  } else {
    blocks = Object.values(drawflowData.drawflow?.Home?.data || {});
  }

  for (const block of blocks) {
    const name = block.label || block.name;
    const permission = requiredPermissions[name];
// ...
```

---

### <a id="importworkflow"></a>importWorkflow

- **Type**: `function`
- **Parameters**: `attrs?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function importWorkflow(attrs = {}) {
  return new Promise((resolve, reject) => {
    openFilePicker(['application/json'], attrs)
      .then((files) => {
        const handleOnLoadReader = ({ target }) => {
          const workflow = JSON.parse(target.result);
          const workflowStore = useWorkflowStore();

          if (workflow.includedWorkflows) {
            Object.keys(workflow.includedWorkflows).forEach((workflowId) => {
              const isWorkflowExists = Boolean(
                workflowStore.workflows[workflowId]
              );

              if (isWorkflowExists) return;
// ...
```

---

### <a id="handleonloadreader"></a>handleOnLoadReader

- **Type**: `arrow_function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
({ target }) => {
          const workflow = JSON.parse(target.result);
          const workflowStore = useWorkflowStore();

          if (workflow.includedWorkflows) {
            Object.keys(workflow.includedWorkflows).forEach((workflowId) => {
              const isWorkflowExists = Boolean(
                workflowStore.workflows[workflowId]
              );

              if (isWorkflowExists) return;

              const currentWorkflow = workflow.includedWorkflows[workflowId];
              currentWorkflow.table =
                currentWorkflow.table || currentWorkflow.dataColumns;
// ...
```

---

### <a id="convertworkflow"></a>convertWorkflow

- **Type**: `function`
- **Parameters**: `workflow, additionalKeys?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function convertWorkflow(workflow, additionalKeys = []) {
  if (!workflow) return null;

  const keys = [
    'name',
    'icon',
    'table',
    'version',
    'drawflow',
    'settings',
    'globalData',
    'description',
    ...additionalKeys,
  ];
  const content = {
// ...
```

---

### <a id="findincludedworkflows"></a>findIncludedWorkflows

- **Type**: `function`
- **Parameters**: `{}, store, maxDepth?, workflows?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function findIncludedWorkflows(
  { drawflow },
  store,
  maxDepth = 3,
  workflows = {}
) {
  if (maxDepth === 0) return workflows;

  const flow = parseJSON(drawflow, drawflow);
  const blocks = flow?.drawflow?.Home.data ?? flow.nodes ?? null;
  if (!blocks) return workflows;

  const checkWorkflow = (type, workflowId) => {
    if (type !== 'execute-workflow' || workflows[workflowId]) return;

// ...
```

---

### <a id="checkworkflow"></a>checkWorkflow

- **Type**: `arrow_function`
- **Parameters**: `type, workflowId`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(type, workflowId) => {
    if (type !== 'execute-workflow' || workflows[workflowId]) return;

    const workflow = store.getById(workflowId);
    if (workflow) {
      workflows[workflowId] = convertWorkflow(workflow);
      findIncludedWorkflows(workflow, store, maxDepth - 1, workflows);
    }
  }
```

---

### <a id="exportworkflow"></a>exportWorkflow

- **Type**: `function`
- **Parameters**: `workflow`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function exportWorkflow(workflow) {
  if (workflow.isProtected) return;

  const workflowStore = useWorkflowStore();
  const includedWorkflows = findIncludedWorkflows(workflow, workflowStore);
  const content = convertWorkflow(workflow);

  content.includedWorkflows = includedWorkflows;

  const blob = new Blob([JSON.stringify(content)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);

  fileSaver(`${workflow.name}.automa.json`, url);
// ...
```

---

