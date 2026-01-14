# WorkflowEditBlock.vue

**Path**: `components/newtab/workflow/WorkflowEditBlock.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [default](#default) | object_property_method | ❌ | `` |
| [default](#default) | object_property_method | ❌ | `` |
| [default](#default) | object_property_method | ❌ | `` |
| [get](#get) | object_method | ❌ | `` |
| [set](#set) | object_method | ❌ | `data` |
| [isGoogleSheetsBlock](#isgooglesheetsblock) | function | ❌ | `` |
| [validateBeforeClose](#validatebeforeclose) | function | ❌ | `` |
| [handleClose](#handleclose) | function | ❌ | `` |
| [getEditComponent](#geteditcomponent) | function | ❌ | `` |
| [getBlockName](#getblockname) | function | ❌ | `` |

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

### <a id="get"></a>get

- **Type**: `object_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
get() {
    return props.data.data;
  }
```

---

### <a id="set"></a>set

- **Type**: `object_method`
- **Parameters**: `data`
- **Description**: *No description provided.*

**Implementation**:
```javascript
set(data) {
    emit('update', data);
  }
```

---

### <a id="isgooglesheetsblock"></a>isGoogleSheetsBlock

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function isGoogleSheetsBlock() {
  return ['google-sheets'].includes(props.data.id);
}
```

---

### <a id="validatebeforeclose"></a>validateBeforeClose

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function validateBeforeClose() {
  // 检查是否为Google Sheets相关区块
  if (isGoogleSheetsBlock()) {
    // 检查spreadsheetId是否为空，且不是create或add-sheet操作
    const { spreadsheetId, type, range } = blockData.value;
    const isNotCreateAction = !['create', 'add-sheet'].includes(type);

    if (isNotCreateAction) {
      const errors = [];

      if (!spreadsheetId) {
        errors.push(
          t(
            'workflow.blocks.google-sheets.spreadsheetId.required',
            'Spreadsheet ID is required'
// ...
```

---

### <a id="handleclose"></a>handleClose

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function handleClose() {
  if (validateBeforeClose()) {
    emit('close');
  }
}
```

---

### <a id="geteditcomponent"></a>getEditComponent

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function getEditComponent() {
  const editComp = props.data.editComponent;
  if (typeof editComp === 'object') return editComp;

  return components[editComp];
}
```

---

### <a id="getblockname"></a>getBlockName

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function getBlockName() {
  const key = `workflow.blocks.${props.data.id}.name`;

  return te(key) ? t(key) : props.data.name;
}
```

---

