# handlerLogData.js

**Path**: `workflowEngine/blocksHandler/handlerLogData.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [logData](#logdata) | function | ✅ | `{}` |

## Detailed Description

### <a id="logdata"></a>logData

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function logData({ id, data }) {
  if (!data.workflowId) {
    throw new Error('No workflow is selected');
  }

  // 工作流状态数组
  // block handler is inside WorkflowWorker scope. See WorkflowWorker.js:343
  const { states } = this.engine.states;
  let logs = [];
  if (states) {
    // 转换为数组
    const stateValues = Object.values(Object.fromEntries(states));
    // 当前工作流状态
    const curWorkflowState = stateValues.find(
      (item) => item.workflowId === data.workflowId
// ...
```

---

