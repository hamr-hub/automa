# Packages.vue

**Path**: `newtab/pages/Packages.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [duplicatePackage](#duplicatepackage) | function | ❌ | `pkg` |
| [importPackage](#importpackage) | function | ❌ | `` |
| [exportPackage](#exportpackage) | function | ❌ | `pkg` |
| [deletePackage](#deletepackage) | function | ❌ | `{}` |
| [onConfirm](#onconfirm) | object_property_method | ❌ | `` |
| [clearNewPackage](#clearnewpackage) | function | ❌ | `` |
| [addPackage](#addpackage) | function | ✅ | `` |

## Detailed Description

### <a id="duplicatepackage"></a>duplicatePackage

- **Type**: `function`
- **Parameters**: `pkg`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function duplicatePackage(pkg) {
  const copyPkg = JSON.parse(JSON.stringify(pkg));
  delete copyPkg.id;

  copyPkg.name += ' - copy';

  packageStore.insert(copyPkg);
}
```

---

### <a id="importpackage"></a>importPackage

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function importPackage() {
  openFilePicker(['application/json']).then(([file]) => {
    if (file.type !== 'application/json') return;

    const fileReader = new FileReader();
    fileReader.onload = () => {
      const pkgJson = parseJSON(fileReader.result, null);
      if (!pkgJson) return;
      if (!pkgJson.name || !pkgJson.data) return;

      packageStore.insert(pkgJson);
    };
    fileReader.readAsText(file);
  });
}
```

---

### <a id="exportpackage"></a>exportPackage

- **Type**: `function`
- **Parameters**: `pkg`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function exportPackage(pkg) {
  const copyPkg = JSON.parse(JSON.stringify(pkg));
  delete copyPkg.id;

  const blobUrl = dataExporter(
    copyPkg,
    { type: 'json', name: `${pkg.name}.automa-pkg` },
    true
  );
  URL.revokeObjectURL(blobUrl);
}
```

---

### <a id="deletepackage"></a>deletePackage

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function deletePackage({ id, name }) {
  dialog.confirm({
    title: 'Delete package',
    body: `Are you sure want to delete "${name}" package?`,
    okVariant: 'danger',
    okText: 'Delete',
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

### <a id="clearnewpackage"></a>clearNewPackage

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function clearNewPackage() {
  Object.assign(addState, {
    name: '',
    show: false,
    description: '',
  });
}
```

---

### <a id="addpackage"></a>addPackage

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function addPackage() {
  try {
    await packageStore.insert({
      name: addState.name.trim() || 'Unnamed',
      description: addState.description,
    });

    clearNewPackage();
  } catch (error) {
    console.error(error);
  }
}
```

---

