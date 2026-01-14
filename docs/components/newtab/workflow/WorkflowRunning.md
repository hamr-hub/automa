# WorkflowRunning.vue

**Path**: `components/newtab/workflow/WorkflowRunning.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [getBlock](#getblock) | function | ❌ | `item` |
| [formatDate](#formatdate) | function | ❌ | `date, format` |
| [openTab](#opentab) | function | ❌ | `tabId` |
| [stopWorkflow](#stopworkflow) | function | ❌ | `item` |

## Detailed Description

### <a id="default"></a>default

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
default: () => []
```

---

### <a id="getblock"></a>getBlock

- **Type**: `function`
- **Parameters**: `item`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function getBlock(item) {
  if (!item.state.currentBlock) return {};

  return blocks[item.state.currentBlock.name];
}
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
- **Parameters**: `tabId`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function openTab(tabId) {
  browser.tabs.update(tabId, { active: true });
}
```

---

### <a id="stopworkflow"></a>stopWorkflow

- **Type**: `function`
- **Parameters**: `item`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function stopWorkflow(item) {
  RendererWorkflowService.stopWorkflowExecution(item);
}
```

---

