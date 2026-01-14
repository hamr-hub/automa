# DroppedNode.js

**Path**: `utils/editor/DroppedNode.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [isNode](#isnode) | method | ❌ | `target` |
| [isHandle](#ishandle) | method | ❌ | `target` |
| [isEdge](#isedge) | method | ❌ | `target` |
| [replaceNode](#replacenode) | method | ❌ | `editor, {}` |
| [appendNode](#appendnode) | method | ❌ | `editor, {}` |
| [insertBetweenNode](#insertbetweennode) | method | ❌ | `editor, {}` |

## Detailed Description

### <a id="isnode"></a>isNode

- **Type**: `method`
- **Parameters**: `target`
- **Description**: *No description provided.*

**Implementation**:
```javascript
static isNode(target) {
    if (target.closest('.vue-flow__handle')) return null;

    return target.closest('.vue-flow__node');
  }
```

---

### <a id="ishandle"></a>isHandle

- **Type**: `method`
- **Parameters**: `target`
- **Description**: *No description provided.*

**Implementation**:
```javascript
static isHandle(target) {
    return target.closest('.vue-flow__handle.source');
  }
```

---

### <a id="isedge"></a>isEdge

- **Type**: `method`
- **Parameters**: `target`
- **Description**: *No description provided.*

**Implementation**:
```javascript
static isEdge(target) {
    return target.closest('.vue-flow__edge');
  }
```

---

### <a id="replacenode"></a>replaceNode

- **Type**: `method`
- **Parameters**: `editor, {}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
static replaceNode(editor, { block, target: targetEl }) {
    const targetNode = editor.getNode.value(targetEl.dataset.id);

    if (targetNode.label === 'blocks-group' || block.fromBlockBasic) return;

    let blockData = block;
    if (block.fromBlockBasic) {
      const blocks = getBlocks();
      blockData = { ...blocks[block.id], id: block.id };
    }

    const onErrorEnabled =
      targetNode.data?.onError?.enable &&
      !excludeOnError.includes(blockData.id);
    const newNodeData = onErrorEnabled
// ...
```

---

### <a id="appendnode"></a>appendNode

- **Type**: `method`
- **Parameters**: `editor, {}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
static appendNode(editor, { target, nodeId }) {
    const { nodeid: source, handleid } = target.dataset;
    if (!source || !handleid) return;

    editor.addEdges([
      {
        source,
        target: nodeId,
        sourceHandle: handleid,
        targetHandle: `${nodeId}-input-1`,
      },
    ]);
  }
```

---

### <a id="insertbetweennode"></a>insertBetweenNode

- **Type**: `method`
- **Parameters**: `editor, {}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
static insertBetweenNode(editor, { target, nodeId, outputs }) {
    if (!target) return;

    const edgesChanges = [];
    const targetEdge = {
      target: '',
      source: '',
      targetHandle: '',
      sourceHandle: '',
    };

    target.classList.forEach((name) => {
      if (name.startsWith('source-')) {
        const sourceHandle = name.replace('source-', '');
        const outputIndex = sourceHandle.indexOf('-output');
// ...
```

---

