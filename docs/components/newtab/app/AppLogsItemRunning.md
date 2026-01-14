# AppLogsItemRunning.vue

**Path**: `components/newtab/app/AppLogsItemRunning.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [stopWorkflow](#stopworkflow) | function | ❌ | `` |

## Detailed Description

### <a id="stopworkflow"></a>stopWorkflow

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function stopWorkflow() {
  RendererWorkflowService.stopWorkflowExecution(running.value.id);
  emit('close');
}
```

---

