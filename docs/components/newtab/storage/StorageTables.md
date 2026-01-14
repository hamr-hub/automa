# StorageTables.vue

**Path**: `components/newtab/storage/StorageTables.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [formatDate](#formatdate) | function | ❌ | `date` |
| [saveTable](#savetable) | function | ✅ | `{}` |
| [deleteTable](#deletetable) | function | ❌ | `table` |
| [onConfirm](#onconfirm) | object_property_method | ✅ | `` |
| [id](#id) | object_property_method | ❌ | `workflow` |

## Detailed Description

### <a id="formatdate"></a>formatDate

- **Type**: `function`
- **Parameters**: `date`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function formatDate(date) {
  return dayjs(date).format('DD MMM YYYY, hh:mm:ss A');
}
```

---

### <a id="savetable"></a>saveTable

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function saveTable({ columns, name }) {
  try {
    const columnsIndex = columns.reduce(
      (acc, column) => {
        acc[column.id] = {
          index: 0,
          type: column.type,
          name: column.name,
        };

        return acc;
      },
      { column: { index: 0, type: 'any', name: 'column' } }
    );

// ...
```

---

### <a id="deletetable"></a>deleteTable

- **Type**: `function`
- **Parameters**: `table`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function deleteTable(table) {
  dialog.confirm({
    title: t('storage.table.delete'),
    okVariant: 'danger',
    body: t('message.delete', { name: table.name }),
    onConfirm: async () => {
      try {
        await dbStorage.tablesItems.where('id').equals(table.id).delete();
        await dbStorage.tablesData.where('tableId').equals(table.id).delete();

        await workflowStore.update({
          id: (workflow) => workflow.connectedTable === table.id,
          data: { connectedTable: null },
        });
      } catch (error) {
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
        await dbStorage.tablesItems.where('id').equals(table.id).delete();
        await dbStorage.tablesData.where('tableId').equals(table.id).delete();

        await workflowStore.update({
          id: (workflow) => workflow.connectedTable === table.id,
          data: { connectedTable: null },
        });
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
id: (workflow) => workflow.connectedTable === table.id
```

---

