# Tables.vue

**Path**: `newtab/pages/storage/Tables.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [editTable](#edittable) | function | ❌ | `` |
| [additionalHeaders](#additionalheaders) | function | ❌ | `headers` |
| [exportData](#exportdata) | function | ❌ | `type` |
| [saveEditedTable](#saveeditedtable) | function | ✅ | `{}` |
| [deleteRow](#deleterow) | function | ❌ | `item` |
| [clearData](#cleardata) | function | ❌ | `` |
| [onConfirm](#onconfirm) | object_property_method | ✅ | `` |
| [deleteTable](#deletetable) | function | ❌ | `` |
| [onConfirm](#onconfirm) | object_property_method | ✅ | `` |
| [id](#id) | object_property_method | ❌ | `workflow` |

## Detailed Description

### <a id="edittable"></a>editTable

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function editTable() {
  editState.name = tableDetail.value.name;
  editState.columns = tableDetail.value.columns;
  editState.show = true;
}
```

---

### <a id="additionalheaders"></a>additionalHeaders

- **Type**: `function`
- **Parameters**: `headers`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function additionalHeaders(headers) {
  headers.unshift({ value: '$$id', text: '', sortable: false });
  headers.push({
    value: 'action',
    text: '',
    sortable: false,
    align: 'right',
    attrs: {
      width: '100px',
    },
  });

  return headers;
}
```

---

### <a id="exportdata"></a>exportData

- **Type**: `function`
- **Parameters**: `type`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function exportData(type) {
  dataExporter(
    tableData.value.items,
    { name: tableDetail.value.name, type },
    true
  );
}
```

---

### <a id="saveeditedtable"></a>saveEditedTable

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function saveEditedTable({ columns, name, changes }) {
  const columnsChanges = Object.values(changes);

  try {
    await dbStorage.tablesItems.update(tableId, {
      name,
      columns,
    });

    const headers = [];
    const newTableData = [];
    const newColumnsIndex = {};
    const { columnsIndex } = tableData.value;

    columns.forEach(({ name: columnName, id, type }) => {
// ...
```

---

### <a id="deleterow"></a>deleteRow

- **Type**: `function`
- **Parameters**: `item`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function deleteRow(item) {
  const rowIndex = table.value.body.findIndex(({ $$id }) => $$id === item.$$id);
  if (rowIndex === -1) return;

  const cache = {};
  const { columnsIndex } = tableData.value;
  const columns = Object.values(tableDetail.value.columns);

  Object.keys(item).forEach((key) => {
    if (key === '$$id') return;

    const column =
      cache[key] || columns.find((currColumn) => currColumn.name === key);
    if (!column) return;

// ...
```

---

### <a id="cleardata"></a>clearData

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function clearData() {
  dialog.confirm({
    title: 'Clear data',
    okVariant: 'danger',
    body: 'Are you sure want to clear the table data?',
    onConfirm: async () => {
      await dbStorage.tablesItems.update(tableId, {
        rowsCount: 0,
        modifiedAt: Date.now(),
      });

      const columnsIndex = tableDetail.value.columns.reduce(
        (acc, column) => {
          acc[column.id] = {
            index: 0,
// ...
```

---

### <a id="onconfirm"></a>onConfirm

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
onConfirm: async () => {
      await dbStorage.tablesItems.update(tableId, {
        rowsCount: 0,
        modifiedAt: Date.now(),
      });

      const columnsIndex = tableDetail.value.columns.reduce(
        (acc, column) => {
          acc[column.id] = {
            index: 0,
            type: column.type,
            name: column.name,
          };

          return acc;
// ...
```

---

### <a id="deletetable"></a>deleteTable

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function deleteTable() {
  dialog.confirm({
    title: t('storage.table.delete'),
    okVariant: 'danger',
    body: t('message.delete', { name: tableDetail.value.name }),
    onConfirm: async () => {
      try {
        await dbStorage.tablesItems.where('id').equals(tableId).delete();
        await dbStorage.tablesData.where('tableId').equals(tableId).delete();

        await workflowStore.update({
          id: (workflow) => workflow.connectedTable === tableId,
          data: { connectedTable: null },
        });

// ...
```

---

### <a id="onconfirm"></a>onConfirm

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
onConfirm: async () => {
      try {
        await dbStorage.tablesItems.where('id').equals(tableId).delete();
        await dbStorage.tablesData.where('tableId').equals(tableId).delete();

        await workflowStore.update({
          id: (workflow) => workflow.connectedTable === tableId,
          data: { connectedTable: null },
        });

        router.replace('/storage');
      } catch (error) {
        console.error(error);
      }
    }
```

---

### <a id="id"></a>id

- **Type**: `object_property_method`
- **Parameters**: `workflow`
- **Description**: *No description provided.*

**Implementation**:
```javascript
id: (workflow) => workflow.connectedTable === tableId
```

---

