# EditorPkgActions.vue

**Path**: `components/newtab/workflow/editor/EditorPkgActions.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [default](#default) | object_property_method | ❌ | `` |
| [deletePackage](#deletepackage) | function | ❌ | `` |
| [onConfirm](#onconfirm) | object_property_method | ❌ | `` |
| [updatePackage](#updatepackage) | function | ❌ | `data?, changedIndicator?` |
| [savePackage](#savepackage) | function | ❌ | `` |
| [toggleSharePackage](#togglesharepackage) | function | ✅ | `` |
| [updateSharedPackage](#updatesharedpackage) | function | ✅ | `` |

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

### <a id="default"></a>default

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
default: () => ({})
```

---

### <a id="deletepackage"></a>deletePackage

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function deletePackage() {
  dialog.confirm({
    okVariant: 'danger',
    okText: 'Delete',
    title: 'Delete package',
    body: `Are you sure want to delete the "${props.data.name}" package?`,
    onConfirm: () => {
      packageStore.delete(props.data.id);
      router.replace('/packages');
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
      packageStore.delete(props.data.id);
      router.replace('/packages');
    }
```

---

### <a id="updatepackage"></a>updatePackage

- **Type**: `function`
- **Parameters**: `data?, changedIndicator?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function updatePackage(data = {}, changedIndicator = false) {
  return packageStore
    .update({
      data,
      id: props.data.id,
    })
    .then((result) => {
      emit('update', { data, changedIndicator });

      return result;
    });
}
```

---

### <a id="savepackage"></a>savePackage

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function savePackage() {
  const flow = props.editor.toObject();
  flow.edges = flow.edges.map((edge) => {
    delete edge.sourceNode;
    delete edge.targetNode;

    return edge;
  });

  updatePackage({ data: flow }, false);
}
```

---

### <a id="togglesharepackage"></a>toggleSharePackage

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function toggleSharePackage() {
  state.isSharing = true;

  try {
    if (!isPkgShared.value) {
      const keys = [
        'data',
        'description',
        'icon',
        'id',
        'content',
        'inputs',
        'outputs',
        'name',
        'settings',
// ...
```

---

### <a id="updatesharedpackage"></a>updateSharedPackage

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function updateSharedPackage() {
  try {
    state.isUpdating = true;

    const keys = [
      'data',
      'description',
      'icon',
      'content',
      'inputs',
      'outputs',
      'name',
      'settings',
    ];
    const payload = { extVersion: browser.runtime.getManifest().version };
// ...
```

---

