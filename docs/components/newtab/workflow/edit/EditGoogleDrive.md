# EditGoogleDrive.vue

**Path**: `components/newtab/workflow/edit/EditGoogleDrive.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [updateData](#updatedata) | function | ❌ | `value` |
| [addFile](#addfile) | function | ❌ | `` |
| [getPathPlaceholder](#getpathplaceholder) | function | ❌ | `type, action` |
| [getPathTitle](#getpathtitle) | function | ❌ | `action` |
| [getNamePlaceholder](#getnameplaceholder) | function | ❌ | `action` |

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

### <a id="updatedata"></a>updateData

- **Type**: `function`
- **Parameters**: `value`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function updateData(value) {
  emit('update:data', { ...props.data, ...value });
}
```

---

### <a id="addfile"></a>addFile

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function addFile() {
  filePaths.value.push({ path: '', type: 'url', name: '', id: nanoid(5) });
}
```

---

### <a id="getpathplaceholder"></a>getPathPlaceholder

- **Type**: `function`
- **Parameters**: `type, action`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function getPathPlaceholder(type, action) {
  if (action === 'upload') {
    const placeholders = {
      downloadId: 'Download ID',
      local: 'C:\\file.zip',
      url: 'https://example.com/file.zip',
    };
    return placeholders[type];
  }
  if (action === 'list') return 'Folder path (e.g. /my-folder)';
  return 'File path (e.g. /folder/file.txt)';
}
```

---

### <a id="getpathtitle"></a>getPathTitle

- **Type**: `function`
- **Parameters**: `action`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function getPathTitle(action) {
  if (action === 'upload') return 'Source File';
  if (action === 'move' || action === 'copy') return 'Source Path';
  if (action === 'download' || action === 'delete') return 'Remote Path';
  if (action === 'list') return 'Folder Path';
  return 'Path';
}
```

---

### <a id="getnameplaceholder"></a>getNamePlaceholder

- **Type**: `function`
- **Parameters**: `action`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function getNamePlaceholder(action) {
  if (action === 'upload') return 'Destination Filename (optional)';
  if (action === 'download') return 'Local Filename (optional)';
  if (action === 'move' || action === 'copy') return 'Destination Path';
  return 'Name';
}
```

---

