# EditorDebugging.vue

**Path**: `components/newtab/workflow/editor/EditorDebugging.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [default](#default) | object_property_method | ❌ | `` |
| [getBlockName](#getblockname) | function | ❌ | `blockId` |
| [toggleExecution](#toggleexecution) | function | ❌ | `` |
| [stopWorkflow](#stopworkflow) | function | ❌ | `` |
| [nextBlock](#nextblock) | function | ❌ | `` |

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

### <a id="default"></a>default

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
default: () => ({})
```

---

### <a id="getblockname"></a>getBlockName

- **Type**: `function`
- **Parameters**: `blockId`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function getBlockName(blockId) {
  const key = `workflow.blocks.${blockId}.name`;

  return te(key) ? t(key) : tasks[blockId].name;
}
```

---

### <a id="toggleexecution"></a>toggleExecution

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function toggleExecution() {
  if (!workflowState.value) return;

  if (workflowState.value.status === 'running') {
    sendMessage('workflow:breakpoint', workflowState.value.id, 'background');
  } else {
    sendMessage(
      'workflow:resume',
      { id: workflowState.value.id },
      'background'
    );
  }
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
  if (!workflowState.value) return;

  sendMessage('workflow:stop', workflowState.value.id, 'background');
}
```

---

### <a id="nextblock"></a>nextBlock

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function nextBlock() {
  sendMessage(
    'workflow:resume',
    { id: workflowState.value.id, nextBlock: true },
    'background'
  );
}
```

---

