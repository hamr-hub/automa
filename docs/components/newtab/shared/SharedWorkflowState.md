# SharedWorkflowState.vue

**Path**: `components/newtab/shared/SharedWorkflowState.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [formatDate](#formatdate) | function | ❌ | `date, format` |
| [openTab](#opentab) | function | ❌ | `` |
| [stopWorkflow](#stopworkflow) | function | ❌ | `` |

## Detailed Description

### <a id="default"></a>default

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
default: () => ({})
```

---

### <a id="formatdate"></a>formatDate

- **Type**: `function`
- **Parameters**: `date, format`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function formatDate(date, format) {
  if (format === 'relative') return dayjs(date).fromNow();

  return dayjs(date).format(format);
}
```

---

### <a id="opentab"></a>openTab

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function openTab() {
  browser.tabs.update(props.data.state.tabId, { active: true });
}
```

---

### <a id="stopworkflow"></a>stopWorkflow

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function stopWorkflow() {
  RendererWorkflowService.stopWorkflowExecution(props.data.id);
}
```

---

