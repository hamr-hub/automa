# HomeStartRecording.vue

**Path**: `components/popup/home/HomeStartRecording.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [updateWorkflow](#updateworkflow) | function | ❌ | `data` |

## Detailed Description

### <a id="updateworkflow"></a>updateWorkflow

- **Type**: `function`
- **Parameters**: `data`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function updateWorkflow(data) {
  workflowStore.update({
    data,
    id: state.activeWorkflow,
  });
}
```

---

