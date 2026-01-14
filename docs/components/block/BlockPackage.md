# BlockPackage.vue

**Path**: `components/block/BlockPackage.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [installPackage](#installpackage) | function | ❌ | `` |
| [removeConnections](#removeconnections) | function | ❌ | `type, old, newEdges` |
| [updatePackage](#updatepackage) | function | ❌ | `` |

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

### <a id="installpackage"></a>installPackage

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function installPackage() {
  packageStore
    .insert({ ...props.data, isExternal: Boolean(props.data.author) }, false)
    .then(() => {
      state.isInstalled = true;
    });
}
```

---

### <a id="removeconnections"></a>removeConnections

- **Type**: `function`
- **Parameters**: `type, old, newEdges`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function removeConnections(type, old, newEdges) {
  const removedEdges = [];
  old.forEach((edge) => {
    const isNotDeleted = newEdges.find((item) => item.id === edge.id);
    if (isNotDeleted) return;

    const handleType = type.slice(0, -1);

    removedEdges.push(`${props.id}-${handleType}-${edge.id}`);
  });

  const edgesToRemove = props.editor.getEdges.value.filter(
    ({ sourceHandle, targetHandle }) => {
      if (type === 'outputs') {
        return removedEdges.includes(sourceHandle);
// ...
```

---

### <a id="updatepackage"></a>updatePackage

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function updatePackage() {
  const pkg = packageStore.getById(props.data.id);
  if (!pkg) return;

  const currentInputs = [...props.data.inputs];
  const currentOutputs = [...props.data.outputs];

  removeConnections('inputs', currentInputs, pkg.inputs);
  removeConnections('outputs', currentOutputs, pkg.outputs);

  emit('update', cloneDeep(pkg));
}
```

---

