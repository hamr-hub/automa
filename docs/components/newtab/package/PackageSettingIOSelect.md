# PackageSettingIOSelect.vue

**Path**: `components/newtab/package/PackageSettingIOSelect.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [default](#default) | object_property_method | ❌ | `` |
| [includeQuery](#includequery) | arrow_function | ❌ | `str` |
| [updateData](#updatedata) | function | ❌ | `data` |
| [selectItem](#selectitem) | function | ❌ | `item` |
| [getBlockName](#getblockname) | function | ❌ | `item, type` |
| [isActive](#isactive) | function | ❌ | `item` |

## Detailed Description

### <a id="default"></a>default

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
default: () => []
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

### <a id="includequery"></a>includeQuery

- **Type**: `arrow_function`
- **Parameters**: `str`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(str) =>
  str.toLocaleLowerCase().includes(state.query.toLocaleLowerCase())
```

---

### <a id="updatedata"></a>updateData

- **Type**: `function`
- **Parameters**: `data`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function updateData(data) {
  emit('update', data);
}
```

---

### <a id="selectitem"></a>selectItem

- **Type**: `function`
- **Parameters**: `item`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function selectItem(item) {
  if (state.selectType === 'nodes') {
    const payload = { blockId: item.id };

    if (props.data.blockId && props.data.blockId !== item.id) {
      payload.handleId = '';
    }

    updateData(payload);
    state.selectType = 'handle';
  } else {
    updateData({ handleId: item.id });
  }
}
```

---

### <a id="getblockname"></a>getBlockName

- **Type**: `function`
- **Parameters**: `item, type`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function getBlockName(item, type) {
  const { label, data } = item;
  let name = blocks[label]?.name || '';

  if (data.name) name += ` (${data.name})`;
  else if (data.description) name += ` (${data.description})`;

  return name;
}
```

---

### <a id="isactive"></a>isActive

- **Type**: `function`
- **Parameters**: `item`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function isActive(item) {
  if (state.selectType === 'nodes') {
    return item.id === props.data.blockId;
  }

  return item.id === props.data.handleId;
}
```

---

