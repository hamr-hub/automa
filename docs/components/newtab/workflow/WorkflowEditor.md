# WorkflowEditor.vue

**Path**: `components/newtab/workflow/WorkflowEditor.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [default](#default) | object_property_method | ❌ | `` |
| [getPosition](#getposition) | arrow_function | ❌ | `position` |
| [setMinValue](#setminvalue) | arrow_function | ❌ | `num, min` |
| [initEditBlockSettings](#initeditblocksettings) | function | ❌ | `{}` |
| [clearBlockSettings](#clearblocksettings) | function | ❌ | `` |
| [minimapNodeClassName](#minimapnodeclassname) | function | ❌ | `{}` |
| [updateBlockData](#updateblockdata) | function | ❌ | `nodeId, data?` |
| [updateBlockSettingsData](#updateblocksettingsdata) | function | ❌ | `newSettings` |
| [editBlock](#editblock) | function | ❌ | `{}, additionalData?` |
| [deleteBlock](#deleteblock) | function | ❌ | `nodeId` |
| [onMousedown](#onmousedown) | function | ❌ | `event` |
| [applyFlowData](#applyflowdata) | function | ❌ | `` |

## Detailed Description

### <a id="default"></a>default

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
default: () => ({
      x: 0,
      y: 0,
      zoom: 0,
      nodes: [],
      edges: [],
    })
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

### <a id="getposition"></a>getPosition

- **Type**: `arrow_function`
- **Parameters**: `position`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(position) => (Array.isArray(position) ? position : [0, 0])
```

---

### <a id="setminvalue"></a>setMinValue

- **Type**: `arrow_function`
- **Parameters**: `num, min`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(num, min) => (num < min ? min : num)
```

---

### <a id="initeditblocksettings"></a>initEditBlockSettings

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function initEditBlockSettings({ blockId, details, data, itemId }) {
  blockSettingsState.data = {
    itemId,
    blockId,
    id: details.id,
    data: cloneDeep(data),
  };
  blockSettingsState.show = true;
}
```

---

### <a id="clearblocksettings"></a>clearBlockSettings

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function clearBlockSettings() {
  Object.assign(blockSettingsState, {
    data: null,
    show: false,
  });
}
```

---

### <a id="minimapnodeclassname"></a>minimapNodeClassName

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function minimapNodeClassName({ label }) {
  const { category } = blocks[label];
  const { color } = categories[category];

  return color;
}
```

---

### <a id="updateblockdata"></a>updateBlockData

- **Type**: `function`
- **Parameters**: `nodeId, data?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function updateBlockData(nodeId, data = {}) {
  if (isDisabled.value) return;

  const node = editor.findNode(nodeId);
  node.data = { ...node.data, ...data };

  emit('update:node', node);
}
```

---

### <a id="updateblocksettingsdata"></a>updateBlockSettingsData

- **Type**: `function`
- **Parameters**: `newSettings`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function updateBlockSettingsData(newSettings) {
  if (isDisabled.value) return;

  const nodeId = blockSettingsState.data.blockId;
  const node = editor.findNode(nodeId);

  if (blockSettingsState.data.itemId) {
    const index = node.data.blocks.findIndex(
      (item) => item.itemId === blockSettingsState.data.itemId
    );
    if (index === -1) return;

    node.data.blocks[index].data = {
      ...node.data.blocks[index].data,
      ...newSettings,
// ...
```

---

### <a id="editblock"></a>editBlock

- **Type**: `function`
- **Parameters**: `{}, additionalData?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function editBlock({ id, label, data }, additionalData = {}) {
  if (isDisabled.value) return;

  emit('edit', {
    id: label,
    blockId: id,
    data: cloneDeep(data),
    ...additionalData,
  });
}
```

---

### <a id="deleteblock"></a>deleteBlock

- **Type**: `function`
- **Parameters**: `nodeId`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function deleteBlock(nodeId) {
  if (isDisabled.value) return;

  editor.removeNodes([nodeId]);
  emit('delete:node', nodeId);
}
```

---

### <a id="onmousedown"></a>onMousedown

- **Type**: `function`
- **Parameters**: `event`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function onMousedown(event) {
  if (isDisabled.value && event.shiftKey) {
    event.stopPropagation();
    event.preventDefault();
  }
}
```

---

### <a id="applyflowdata"></a>applyFlowData

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function applyFlowData() {
  if (settings.snapToGrid) {
    editor.snapToGrid.value = true;
    editor.snapGrid.value = Object.values(settings.snapGrid);
  }

  editor.setNodes(
    props.data?.nodes?.map((node) => ({ ...node, events: {} })) || []
  );
  editor.setEdges(props.data?.edges || []);
  editor.setViewport({
    x: props.data?.x || 0,
    y: props.data?.y || 0,
    zoom: props.data?.zoom || 1,
  });
// ...
```

---

