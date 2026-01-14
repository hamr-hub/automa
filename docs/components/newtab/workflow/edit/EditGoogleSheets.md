# EditGoogleSheets.vue

**Path**: `components/newtab/workflow/edit/EditGoogleSheets.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [default](#default) | object_property_method | ❌ | `` |
| [updateData](#updatedata) | function | ❌ | `value` |
| [previewData](#previewdata) | function | ✅ | `` |
| [onActionChange](#onactionchange) | function | ❌ | `value` |

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
default: () => []
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

### <a id="previewdata"></a>previewData

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function previewData() {
  try {
    previewDataState.status = 'loading';

    const isGetValues = props.data.type === 'get';
    const params = {
      range: props.data.range,
      spreadsheetId: props.data.spreadsheetId,
    };

    if (!props.data.spreadsheetId.trim()) {
      toast.error(
        props.googleDrive
          ? 'No spreadsheet is selected'
          : 'Spreadsheet id is empty'
// ...
```

---

### <a id="onactionchange"></a>onActionChange

- **Type**: `function`
- **Parameters**: `value`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function onActionChange(value) {
  updateData({ type: value });

  previewDataState.data = '';
  previewDataState.status = '';
  previewDataState.errorMessage = '';
}
```

---

