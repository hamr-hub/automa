# EditLoopData.vue

**Path**: `components/newtab/workflow/edit/EditLoopData.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [updateData](#updatedata) | function | ❌ | `value` |
| [updateLoopData](#updateloopdata) | function | ❌ | `value` |
| [updateLoopID](#updateloopid) | function | ❌ | `id` |
| [importFile](#importfile) | function | ❌ | `` |

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

### <a id="updateloopdata"></a>updateLoopData

- **Type**: `function`
- **Parameters**: `value`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function updateLoopData(value) {
  if (value.length > maxFileSize) {
    toast.error(t('message.maxSizeExceeded'));
  }

  updateData({ loopData: value.slice(0, maxFileSize) });
}
```

---

### <a id="updateloopid"></a>updateLoopID

- **Type**: `function`
- **Parameters**: `id`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function updateLoopID(id) {
  let loopId = id.replace(/\s/g, '');

  if (!loopId) {
    loopId = nanoid(6);
  }

  updateData({ loopId });
}
```

---

### <a id="importfile"></a>importFile

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function importFile() {
  openFilePicker(['application/json', 'text/csv', 'application/vnd.ms-excel'])
    .then(async ([fileObj]) => {
      if (fileObj.size > maxFileSize) {
        toast.error(t('message.maxSizeExceeded'));
        return;
      }

      file.name = fileObj.name;
      file.type = fileObj.type;

      const csvTypes = ['text/csv', 'application/vnd.ms-excel'];

      const reader = new FileReader();

// ...
```

---

