# HomeSelectBlock.vue

**Path**: `components/popup/home/HomeSelectBlock.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [onEditorInit](#oneditorinit) | function | ❌ | `editor` |
| [clearSelectedHandle](#clearselectedhandle) | function | ❌ | `` |
| [onClick](#onclick) | function | ❌ | `{}` |
| [startRecording](#startrecording) | function | ❌ | `` |

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

### <a id="oneditorinit"></a>onEditorInit

- **Type**: `function`
- **Parameters**: `editor`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function onEditorInit(editor) {
  const convertedData = convertWorkflowData(props.workflow);
  emit('update', { drawflow: convertedData.drawflow });

  editor.setNodes(convertedData.drawflow.nodes);
  editor.setEdges(convertedData.drawflow.edges);
}
```

---

### <a id="clearselectedhandle"></a>clearSelectedHandle

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function clearSelectedHandle() {
  document.querySelectorAll('.selected-handle').forEach((el) => {
    el.classList.remove('selected-handle');
  });
}
```

---

### <a id="onclick"></a>onClick

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function onClick({ target }) {
  let selectedHandle = null;

  const handleEl = target.closest('.vue-flow__handle.source');
  if (handleEl) {
    clearSelectedHandle();
    handleEl.classList.add('selected-handle');
    selectedHandle = handleEl;
  }

  if (!handleEl) {
    const nodeEl = target.closest('.vue-flow__node');
    if (nodeEl) {
      clearSelectedHandle();
      const handle = nodeEl.querySelector('.vue-flow__handle.source');
// ...
```

---

### <a id="startrecording"></a>startRecording

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function startRecording() {
  const options = {
    name: props.workflow.name,
    workflowId: props.workflow.id,
    connectFrom: {
      id: state.activeBlock,
      output: state.blockOutput,
    },
  };

  emit('record', options);
}
```

---

