# editorAutocomplete.js

**Path**: `utils/editor/editorAutocomplete.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [getData](#getdata) | function | ❌ | `blockName, blockData` |
| [trigger](#trigger) | object_method | ❌ | `blockId, data` |
| [[computed]](#-computed-) | object_property_method | ❌ | `blockId, data` |
| [[computed]](#-computed-) | object_property_method | ❌ | `blockId, data` |
| [anonymous](#anonymous) | function | ❌ | `label, {}` |

## Detailed Description

### <a id="getdata"></a>getData

- **Type**: `function`
- **Parameters**: `blockName, blockData`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function getData(blockName, blockData) {
  const keys = blocks[blockName]?.autocomplete;
  const dataList = {};
  if (!keys) return dataList;

  keys.forEach((key) => {
    const value = blockData[key];
    if (!value) return;

    const autocompleteKey = autocompleteKeys[key];
    if (!dataList[autocompleteKey]) dataList[autocompleteKey] = {};

    dataList[autocompleteKey][value] = '';
  });

// ...
```

---

### <a id="trigger"></a>trigger

- **Type**: `object_method`
- **Parameters**: `blockId, data`
- **Description**: *No description provided.*

**Implementation**:
```javascript
trigger(blockId, data) {
    if (!this[blockId].variables) this[blockId].variables = {};

    data.parameters?.forEach((param) => {
      this[blockId].variables[param.name] = '';
    });

    if (data.type === 'context-menu') {
      Object.assign(this[blockId].variables, {
        $ctxElSelector: '',
        $ctxTextSelection: '',
        $ctxLink: '',
        $ctxMediaUrl: '',
      });
    }
// ...
```

---

### <a id="-computed-"></a>[computed]

- **Type**: `object_property_method`
- **Parameters**: `blockId, data`
- **Description**: *No description provided.*

**Implementation**:
```javascript
'blocks-group': function (blockId, data) {
    data.blocks.forEach((block) => {
      this[block.itemId] = getData(block.id, block.data);
    });
  }
```

---

### <a id="-computed-"></a>[computed]

- **Type**: `object_property_method`
- **Parameters**: `blockId, data`
- **Description**: *No description provided.*

**Implementation**:
```javascript
'insert-data': function (blockId, data) {
    if (!this[blockId].variables) this[blockId].variables = {};

    data.dataList.forEach((item) => {
      if (item.type !== 'variable' || !item.name.trim()) return;

      this[blockId].variables[item.name] = '';
    });
  }
```

---

### <a id="anonymous"></a>anonymous

- **Type**: `function`
- **Parameters**: `label, {}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function (label, { data, id }) {
  const autocompleteData = { [id]: {} };

  if (extractBlocksAutocomplete[label]) {
    extractBlocksAutocomplete[label].call(autocompleteData, id, data);
  } else {
    autocompleteData[id] = getData(label, data);
  }

  return autocompleteData;
}
```

---

