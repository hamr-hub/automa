# WorkflowDataTable.vue

**Path**: `components/newtab/workflow/WorkflowDataTable.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [get](#get) | object_method | ❌ | `` |
| [set](#set) | object_method | ❌ | `value` |
| [getColumnName](#getcolumnname) | function | ❌ | `name` |
| [updateColumnName](#updatecolumnname) | function | ❌ | `index, target` |
| [addColumn](#addcolumn) | function | ❌ | `` |
| [connectTable](#connecttable) | function | ❌ | `table` |
| [disconnectTable](#disconnecttable) | function | ❌ | `` |

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

### <a id="get"></a>get

- **Type**: `object_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
get() {
    if (state.connectedTable) return state.connectedTable.columns;

    return state.columns;
  }
```

---

### <a id="set"></a>set

- **Type**: `object_method`
- **Parameters**: `value`
- **Description**: *No description provided.*

**Implementation**:
```javascript
set(value) {
    state.columns = value;
  }
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

  if (!columnName) {
    target.value = state.columns[index].name;
    return;
  }

  state.columns[index].name = columnName;
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
  const columnName = getColumnName(state.query);

  if (!columnName) return;

  state.columns.push({ id: nanoid(5), name: columnName, type: 'string' });
  state.query = '';
}
```

---

### <a id="connecttable"></a>connectTable

- **Type**: `function`
- **Parameters**: `table`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function connectTable(table) {
  workflowStore
    .update({
      id: props.workflow.id,
      data: { connectedTable: table.id },
    })
    .then(() => {
      emit('connect');
      state.query = '';
      state.connectedTable = table;
    });
}
```

---

### <a id="disconnecttable"></a>disconnectTable

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function disconnectTable() {
  workflowStore
    .update({
      id: props.workflow.id,
      data: { connectedTable: null },
    })
    .then(() => {
      state.columns = props.workflow.table;
      state.connectedTable = null;
      emit('disconnect');
    });
}
```

---

