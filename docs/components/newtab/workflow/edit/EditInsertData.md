# EditInsertData.vue

**Path**: `components/newtab/workflow/edit/EditInsertData.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [clearPreview](#clearpreview) | function | ❌ | `` |
| [removeItem](#removeitem) | function | ❌ | `index` |
| [updateData](#updatedata) | function | ❌ | `value` |
| [addItem](#additem) | function | ❌ | `` |
| [changeItemType](#changeitemtype) | function | ❌ | `index, type` |
| [setAsFile](#setasfile) | function | ❌ | `item` |
| [previewData](#previewdata) | function | ✅ | `index, item` |

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

### <a id="clearpreview"></a>clearPreview

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function clearPreview() {
  previewState.itemId = '';
  previewState.data = '';
}
```

---

### <a id="removeitem"></a>removeItem

- **Type**: `function`
- **Parameters**: `index`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function removeItem(index) {
  dataList.value.splice(index, 1);
  clearPreview();
}
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

### <a id="additem"></a>addItem

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function addItem() {
  dataList.value.push({
    type: 'table',
    name: '',
    value: '',
    filePath: '',
    isFile: false,
    action: 'default',
  });
}
```

---

### <a id="changeitemtype"></a>changeItemType

- **Type**: `function`
- **Parameters**: `index, type`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function changeItemType(index, type) {
  dataList.value[index] = {
    ...dataList.value[index],
    type,
    name: '',
  };
}
```

---

### <a id="setasfile"></a>setAsFile

- **Type**: `function`
- **Parameters**: `item`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function setAsFile(item) {
  if (!hasFileAccess.value) {
    window.open(
      'https://docs.extension.automa.site/blocks/insert-data.html#import-file'
    );
    return;
  }

  item.isFile = !item.isFile;
}
```

---

### <a id="previewdata"></a>previewData

- **Type**: `function`
- **Parameters**: `index, item`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function previewData(index, item) {
  try {
    const path = item.filePath || '';
    const isExcel = /.xlsx?$/.test(path);
    const isJSON = path.endsWith('.json');

    const action = item.action || item.csvAction || 'default';
    let responseType = 'text';

    if (isJSON) responseType = 'json';
    else if (action === 'base64' || (isExcel && action !== 'default'))
      responseType = 'blob';

    let result = await getFile(path, {
      responseType,
// ...
```

---

