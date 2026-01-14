# EditorLocalSavedBlocks.vue

**Path**: `components/newtab/workflow/editor/EditorLocalSavedBlocks.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [deleteItem](#deleteitem) | function | ❌ | `{}` |
| [onConfirm](#onconfirm) | object_property_method | ❌ | `` |
| [removeConnections](#removeconnections) | function | ❌ | `{}` |
| [updatePackages](#updatepackages) | function | ❌ | `item` |

## Detailed Description

### <a id="deleteitem"></a>deleteItem

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function deleteItem({ id, name }) {
  dialog.confirm({
    title: 'Delete package',
    body: `Are you sure want to delete "${name}" package?`,
    okText: 'Delete',
    okVariant: 'danger',
    onConfirm: () => {
      packageStore.delete(id);
    },
  });
}
```

---

### <a id="onconfirm"></a>onConfirm

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
onConfirm: () => {
      packageStore.delete(id);
    }
```

---

### <a id="removeconnections"></a>removeConnections

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function removeConnections({ id, type, oldEdges, newEdges }) {
  const removedEdges = [];
  oldEdges.forEach((edge) => {
    const isNotDeleted = newEdges.find((item) => item.id === edge.id);
    if (isNotDeleted) return;

    const handleType = type.slice(0, -1);

    removedEdges.push(`${id}-${handleType}-${edge.id}`);
  });

  const edgesToRemove = editor.value.getEdges.value.filter(
    ({ sourceHandle, targetHandle }) => {
      if (type === 'outputs') {
        return removedEdges.includes(sourceHandle);
// ...
```

---

### <a id="updatepackages"></a>updatePackages

- **Type**: `function`
- **Parameters**: `item`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function updatePackages(item) {
  const packageNodes = editor.value.getNodes.value.filter(
    (node) => node.data.id === item.id
  );
  if (packageNodes.length === 0) return;

  packageNodes.forEach((node) => {
    removeConnections({
      id: node.id,
      type: 'inputs',
      newEdges: item.inputs,
      oldEdges: node.data.inputs,
    });
    removeConnections({
      id: node.id,
// ...
```

---

