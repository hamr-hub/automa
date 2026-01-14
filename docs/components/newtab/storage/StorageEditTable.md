# StorageEditTable.vue

**Path**: `components/newtab/storage/StorageEditTable.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [getColumnName](#getcolumnname) | function | ❌ | `name` |
| [updateColumnName](#updatecolumnname) | function | ❌ | `index, target` |
| [saveTable](#savetable) | function | ❌ | `` |
| [addColumn](#addcolumn) | function | ❌ | `` |
| [clearTempTables](#cleartemptables) | function | ❌ | `close?` |
| [deleteColumn](#deletecolumn) | function | ❌ | `index` |

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

### <a id="getcolumnname"></a>getColumnName

- **Type**: `function`
- **Parameters**: `name`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function getColumnName(name) {
  const columnName = name.replace(/[\s@[\]]/g, '');
  const isColumnExists = state.columns.some(
    (column) => column.name === columnName
  );

  if (isColumnExists || columnName.trim() === '') return '';

  return columnName;
}
```

---

### <a id="updatecolumnname"></a>updateColumnName

- **Type**: `function`
- **Parameters**: `index, target`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function updateColumnName(index, target) {
  const columnName = getColumnName(target.value);
  const { id, name } = state.columns[index];
  if (!columnName) {
    target.value = name;
    return;
  }

  changes[id] = { type: 'rename', id, oldValue: name, newValue: columnName };
  state.columns[index].name = columnName;
}
```

---

### <a id="savetable"></a>saveTable

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function saveTable() {
  const rawState = {
    ...toRaw(state),
    columns: state.columns.map(toRaw),
  };

  emit('save', { ...rawState, changes });
}
```

---

### <a id="addcolumn"></a>addColumn

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function addColumn() {
  const columnId = nanoid(5);
  const columnName = `column_${columnId}`;

  changes[columnId] = {
    type: 'add',
    id: columnId,
    name: columnName,
  };

  state.columns.push({
    id: columnId,
    type: 'string',
    name: columnName,
  });
// ...
```

---

### <a id="cleartemptables"></a>clearTempTables

- **Type**: `function`
- **Parameters**: `close?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function clearTempTables(close = false) {
  state.name = '';
  state.columns = [];
  changes = {};

  if (close) {
    emit('update:modelValue', false);
  }
}
```

---

### <a id="deletecolumn"></a>deleteColumn

- **Type**: `function`
- **Parameters**: `index`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function deleteColumn(index) {
  const column = state.columns[index];
  changes[column.id] = { type: 'delete', id: column.id, name: column.name };

  state.columns.splice(index, 1);
}
```

---

