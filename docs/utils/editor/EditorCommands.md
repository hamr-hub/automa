# EditorCommands.js

**Path**: `utils/editor/EditorCommands.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [constructor](#constructor) | method | ❌ | `editor, initialStates?` |
| [nodeAdded](#nodeadded) | method | ❌ | `addedNodes` |
| [execute](#execute) | object_property_method | ❌ | `` |
| [undo](#undo) | object_property_method | ❌ | `` |
| [nodeRemoved](#noderemoved) | method | ❌ | `ids` |
| [execute](#execute) | object_property_method | ❌ | `` |
| [undo](#undo) | object_property_method | ❌ | `` |
| [edgeAdded](#edgeadded) | method | ❌ | `addedEdges` |
| [execute](#execute) | object_property_method | ❌ | `` |
| [undo](#undo) | object_property_method | ❌ | `` |
| [edgeRemoved](#edgeremoved) | method | ❌ | `ids` |
| [execute](#execute) | object_property_method | ❌ | `` |
| [undo](#undo) | object_property_method | ❌ | `` |

## Detailed Description

### <a id="constructor"></a>constructor

- **Type**: `method`
- **Parameters**: `editor, initialStates?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
constructor(editor, initialStates = {}) {
    this.editor = editor;
    this.state = initialStates;
  }
```

---

### <a id="nodeadded"></a>nodeAdded

- **Type**: `method`
- **Parameters**: `addedNodes`
- **Description**: *No description provided.*

**Implementation**:
```javascript
nodeAdded(addedNodes) {
    const ids = [];
    addedNodes.forEach((node) => {
      ids.push(node.id);
      this.state.nodes[node.id] = node;
    });

    return {
      name: 'node-added',
      execute: () => {
        this.editor.addNodes(addedNodes);
      },
      undo: () => {
        this.editor.removeNodes(ids);
      },
// ...
```

---

### <a id="execute"></a>execute

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
execute: () => {
        this.editor.addNodes(addedNodes);
      }
```

---

### <a id="undo"></a>undo

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
undo: () => {
        this.editor.removeNodes(ids);
      }
```

---

### <a id="noderemoved"></a>nodeRemoved

- **Type**: `method`
- **Parameters**: `ids`
- **Description**: *No description provided.*

**Implementation**:
```javascript
nodeRemoved(ids) {
    return {
      name: 'node-removed',
      execute: () => {
        this.editor.removeNodes(ids);
      },
      undo: () => {
        const nodes = ids.map((id) => this.state.nodes[id]);
        this.editor.addNodes(nodes);
      },
    };
  }
```

---

### <a id="execute"></a>execute

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
execute: () => {
        this.editor.removeNodes(ids);
      }
```

---

### <a id="undo"></a>undo

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
undo: () => {
        const nodes = ids.map((id) => this.state.nodes[id]);
        this.editor.addNodes(nodes);
      }
```

---

### <a id="edgeadded"></a>edgeAdded

- **Type**: `method`
- **Parameters**: `addedEdges`
- **Description**: *No description provided.*

**Implementation**:
```javascript
edgeAdded(addedEdges) {
    const ids = [];
    addedEdges.forEach((edge) => {
      ids.push(edge.id);
      this.state.edges[edge.id] = edge;
    });

    return {
      name: 'edge-added',
      execute: () => {
        this.editor.addEdges(addedEdges);
      },
      undo: () => {
        this.editor.removeEdges(ids);
      },
// ...
```

---

### <a id="execute"></a>execute

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
execute: () => {
        this.editor.addEdges(addedEdges);
      }
```

---

### <a id="undo"></a>undo

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
undo: () => {
        this.editor.removeEdges(ids);
      }
```

---

### <a id="edgeremoved"></a>edgeRemoved

- **Type**: `method`
- **Parameters**: `ids`
- **Description**: *No description provided.*

**Implementation**:
```javascript
edgeRemoved(ids) {
    return {
      name: 'edge-removed',
      execute: () => {
        this.editor.removeEdges(ids);
      },
      undo: () => {
        const edges = ids.map((id) => this.state.edges[id]);
        this.editor.addEdges(edges);
      },
    };
  }
```

---

### <a id="execute"></a>execute

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
execute: () => {
        this.editor.removeEdges(ids);
      }
```

---

### <a id="undo"></a>undo

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
undo: () => {
        const edges = ids.map((id) => this.state.edges[id]);
        this.editor.addEdges(edges);
      }
```

---

