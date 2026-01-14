# AppLogsItem.vue

**Path**: `components/newtab/app/AppLogsItem.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [deleteLog](#deletelog) | function | ❌ | `` |
| [goToWorkflow](#gotoworkflow) | function | ❌ | `` |
| [convertToTableData](#converttotabledata) | function | ❌ | `` |
| [onTabChange](#ontabchange) | function | ❌ | `value` |
| [fetchLog](#fetchlog) | function | ✅ | `` |

## Detailed Description

### <a id="deletelog"></a>deleteLog

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function deleteLog() {
  dbLogs.items
    .where('id')
    .equals(props.logId)
    .delete()
    .then(() => {
      emit('close');
    });
}
```

---

### <a id="gotoworkflow"></a>goToWorkflow

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function goToWorkflow() {
  const path = `/workflows/${currentLog.value.workflowId}`;

  router.push(path);
  emit('close', true);
}
```

---

### <a id="converttotabledata"></a>convertToTableData

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function convertToTableData() {
  const data = currentLog.value.data?.table;
  if (!data) return;

  const [header] = convertArrObjTo2DArr(data);

  tableData.converted = true;
  tableData.body = data.map((item, index) => ({ ...item, id: index + 1 }));
  tableData.header = header.map((name) => ({
    text: name,
    value: name,
    filterable: true,
  }));
  tableData.header.unshift({ value: 'id', text: '', sortable: false });
}
```

---

### <a id="ontabchange"></a>onTabChange

- **Type**: `function`
- **Parameters**: `value`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function onTabChange(value) {
  if (value === 'table' && !tableData.converted) {
    convertToTableData();
  }
}
```

---

### <a id="fetchlog"></a>fetchLog

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function fetchLog() {
  if (!props.logId) return;

  const logDetail = await dbLogs.items.where('id').equals(props.logId).last();
  if (!logDetail) return;

  tableData.body = [];
  tableData.header = [];
  parentLog.value = null;
  tableData.converted = false;

  const [logCtxData, logHistory, logsData] = await Promise.all(
    ['ctxData', 'histories', 'logsData'].map((key) =>
      dbLogs[key].where('logId').equals(props.logId).last()
    )
// ...
```

---

