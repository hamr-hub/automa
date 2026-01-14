# handlerExecuteWorkflow.js

**Path**: `workflowEngine/blocksHandler/handlerExecuteWorkflow.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [workflowListener](#workflowlistener) | function | ❌ | `workflow, options` |
| [findWorkflow](#findworkflow) | function | ❌ | `workflows, workflowId` |
| [executeWorkflow](#executeworkflow) | function | ✅ | `{}, {}` |
| [onInit](#oninit) | object_property_method | ❌ | `engine` |
| [onDestroyed](#ondestroyed) | object_property_method | ❌ | `engine` |

## Detailed Description

### <a id="workflowlistener"></a>workflowListener

- **Type**: `function`
- **Parameters**: `workflow, options`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function workflowListener(workflow, options) {
  return new Promise((resolve, reject) => {
    if (workflow.isProtected) {
      const flow = parseJSON(workflow.drawflow, null);

      if (!flow) {
        const pass = getWorkflowPass(workflow.pass);

        workflow.drawflow = decryptFlow(workflow, pass);
      }
    }

    const engine = new WorkflowEngine(workflow, options);
    engine.init();
    engine.on('destroyed', ({ id, status, message }) => {
// ...
```

---

### <a id="findworkflow"></a>findWorkflow

- **Type**: `function`
- **Parameters**: `workflows, workflowId`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function findWorkflow(workflows, workflowId) {
  const workflow = Array.isArray(workflows)
    ? workflows.find(({ id }) => id === workflowId)
    : workflows[workflowId];

  return workflow;
}
```

---

### <a id="executeworkflow"></a>executeWorkflow

- **Type**: `function`
- **Parameters**: `{}, {}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function executeWorkflow({ id: blockId, data }, { refData }) {
  if (data.workflowId === '') throw new Error('empty-workflow');

  const { workflows, teamWorkflows } =
    await BrowserAPIService.storage.local.get(['workflows', 'teamWorkflows']);
  let workflow = null;

  if (data.workflowId.startsWith('team')) {
    const teamWorkflowsArr = Object.values(
      Object.values(teamWorkflows || {})[0] ?? {}
    );
    workflow = findWorkflow(teamWorkflowsArr, data.workflowId);
  } else {
    workflow = findWorkflow(workflows, data.workflowId);
  }
// ...
```

---

### <a id="oninit"></a>onInit

- **Type**: `object_property_method`
- **Parameters**: `engine`
- **Description**: *No description provided.*

**Implementation**:
```javascript
onInit: (engine) => {
        this.childWorkflowId = engine.id;
      }
```

---

### <a id="ondestroyed"></a>onDestroyed

- **Type**: `object_property_method`
- **Parameters**: `engine`
- **Description**: *No description provided.*

**Implementation**:
```javascript
onDestroyed: (engine) => {
        const { variables, table } = engine.referenceData;

        this.engine.referenceData.workflow[
          data.executeId || `${engine.id}-${nanoid(8)}`
        ] = {
          table,
          variables,
        };
      }
```

---

