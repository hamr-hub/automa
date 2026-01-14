# Recording.vue

**Path**: `newtab/pages/Recording.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [onTabCreated](#ontabcreated) | object_property_method | ❌ | `event` |
| [onTabsActivated](#ontabsactivated) | object_property_method | ❌ | `event` |
| [onCommitted](#oncommitted) | object_property_method | ❌ | `event` |
| [onWebNavigationCompleted](#onwebnavigationcompleted) | object_property_method | ❌ | `event` |
| [generateDrawflow](#generatedrawflow) | function | ❌ | `startBlock, startBlockData` |
| [addEdge](#addedge) | arrow_function | ❌ | `data?` |
| [stopRecording](#stoprecording) | function | ✅ | `` |
| [removeBlock](#removeblock) | function | ❌ | `index` |
| [onStorageChanged](#onstoragechanged) | function | ❌ | `{}` |

## Detailed Description

### <a id="ontabcreated"></a>onTabCreated

- **Type**: `object_property_method`
- **Parameters**: `event`
- **Description**: *No description provided.*

**Implementation**:
```javascript
onTabCreated: (event) => RecordWorkflowUtils.onTabCreated(event)
```

---

### <a id="ontabsactivated"></a>onTabsActivated

- **Type**: `object_property_method`
- **Parameters**: `event`
- **Description**: *No description provided.*

**Implementation**:
```javascript
onTabsActivated: (event) => RecordWorkflowUtils.onTabsActivated(event)
```

---

### <a id="oncommitted"></a>onCommitted

- **Type**: `object_property_method`
- **Parameters**: `event`
- **Description**: *No description provided.*

**Implementation**:
```javascript
onCommitted: (event) => RecordWorkflowUtils.onWebNavigationCommited(event)
```

---

### <a id="onwebnavigationcompleted"></a>onWebNavigationCompleted

- **Type**: `object_property_method`
- **Parameters**: `event`
- **Description**: *No description provided.*

**Implementation**:
```javascript
onWebNavigationCompleted: (event) =>
    RecordWorkflowUtils.onWebNavigationCompleted(event)
```

---

### <a id="generatedrawflow"></a>generateDrawflow

- **Type**: `function`
- **Parameters**: `startBlock, startBlockData`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function generateDrawflow(startBlock, startBlockData) {
  let nextNodeId = nanoid();
  const triggerId = startBlock?.id || nanoid();
  let prevNodeId = startBlock?.id || triggerId;

  const nodes = [];
  const edges = [];

  const addEdge = (data = {}) => {
    edges.push({
      ...data,
      id: nanoid(),
      class: `source-${data.sourceHandle} targte-${data.targetHandle}`,
    });
  };
// ...
```

---

### <a id="addedge"></a>addEdge

- **Type**: `arrow_function`
- **Parameters**: `data?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(data = {}) => {
    edges.push({
      ...data,
      id: nanoid(),
      class: `source-${data.sourceHandle} targte-${data.targetHandle}`,
    });
  }
```

---

### <a id="stoprecording"></a>stopRecording

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function stopRecording() {
  if (state.isGenerating) return;

  try {
    state.isGenerating = true;

    if (state.flows.length !== 0) {
      if (state.workflowId) {
        const workflow = workflowStore.getById(state.workflowId);
        const startBlock = workflow.drawflow.nodes.find(
          (node) => node.id === state.connectFrom.id
        );
        const updatedDrawflow = generateDrawflow(state.connectFrom, startBlock);

        const drawflow = {
// ...
```

---

### <a id="removeblock"></a>removeBlock

- **Type**: `function`
- **Parameters**: `index`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function removeBlock(index) {
  state.flows.splice(index, 1);

  browser.storage.local.set({ recording: toRaw(state) });
}
```

---

### <a id="onstoragechanged"></a>onStorageChanged

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function onStorageChanged({ recording }) {
  if (!recording) return;

  Object.assign(state, recording.newValue);
}
```

---

