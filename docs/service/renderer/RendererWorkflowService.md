# RendererWorkflowService.js

**Path**: `service/renderer/RendererWorkflowService.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [executeWorkflow](#executeworkflow) | method | ❌ | `workflowData, options` |
| [stopWorkflowExecution](#stopworkflowexecution) | method | ❌ | `executionId` |

## Detailed Description

### <a id="executeworkflow"></a>executeWorkflow

- **Type**: `method`
- **Parameters**: `workflowData, options`
- **Description**: *No description provided.*

**Implementation**:
```javascript
static executeWorkflow(workflowData, options) {
    /**
     * Convert Vue-created proxy into plain object.
     * It will throw error if there a proxy inside the object.
     */
    const clonedWorkflowData = {};
    Object.keys(workflowData).forEach((key) => {
      clonedWorkflowData[key] = toRaw(workflowData[key]);
    });

    return MessageListener.sendMessage(
      'workflow:execute',
      { ...workflowData, options },
      'background'
    );
// ...
```

---

### <a id="stopworkflowexecution"></a>stopWorkflowExecution

- **Type**: `method`
- **Parameters**: `executionId`
- **Description**: *No description provided.*

**Implementation**:
```javascript
static stopWorkflowExecution(executionId) {
    return MessageListener.sendMessage(
      'workflow:stop',
      executionId,
      'background'
    );
  }
```

---

