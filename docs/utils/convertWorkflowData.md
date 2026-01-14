# convertWorkflowData.js

**Path**: `utils/convertWorkflowData.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [getFlowData](#getflowdata) | arrow_function | ❌ | `workflow` |
| [anonymous](#anonymous) | function | ❌ | `workflow` |
| [extractBlock](#extractblock) | function | ❌ | `blockId` |

## Detailed Description

### <a id="getflowdata"></a>getFlowData

- **Type**: `arrow_function`
- **Parameters**: `workflow`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(workflow) =>
  typeof workflow.drawflow === 'string'
    ? parseJSON(workflow.drawflow, {})
    : workflow.drawflow
```

---

### <a id="anonymous"></a>anonymous

- **Type**: `function`
- **Parameters**: `workflow`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function (workflow) {
  const data = getFlowData(workflow);
  if (!data?.drawflow) return workflow;

  const triggerBlock = findTriggerBlock(data);
  if (!triggerBlock) return workflow;

  const blocks = data.drawflow.Home.data;
  const tracedBlocks = new Set();

  const nodes = [];
  const edges = [];

  function extractBlock(blockId) {
    if (tracedBlocks.has(blockId)) return;
// ...
```

---

### <a id="extractblock"></a>extractBlock

- **Type**: `function`
- **Parameters**: `blockId`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function extractBlock(blockId) {
    if (tracedBlocks.has(blockId)) return;

    const block = blocks[blockId];

    nodes.push({
      id: block.id,
      type: block.html,
      label: block.name,
      position: {
        x: block.pos_x,
        y: block.pos_y,
      },
      data: block.data,
    });
// ...
```

---

