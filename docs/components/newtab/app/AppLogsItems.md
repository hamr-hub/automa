# AppLogsItems.vue

**Path**: `components/newtab/app/AppLogsItems.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [deleteLog](#deletelog) | function | ❌ | `id` |
| [toggleSelectedLog](#toggleselectedlog) | function | ❌ | `selected, logId` |
| [deleteSelectedLogs](#deleteselectedlogs) | function | ❌ | `` |
| [onConfirm](#onconfirm) | object_property_method | ❌ | `` |
| [clearLogs](#clearlogs) | function | ❌ | `` |
| [onConfirm](#onconfirm) | object_property_method | ❌ | `` |
| [selectAllLogs](#selectalllogs) | function | ❌ | `` |

## Detailed Description

### <a id="deletelog"></a>deleteLog

- **Type**: `function`
- **Parameters**: `id`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function deleteLog(id) {
  dbLogs.items.delete(id).then(() => {
    dbLogs.ctxData.where('logId').equals(id).delete();
    dbLogs.histories.where('logId').equals(id).delete();
    dbLogs.logsData.where('logId').equals(id).delete();
  });
}
```

---

### <a id="toggleselectedlog"></a>toggleSelectedLog

- **Type**: `function`
- **Parameters**: `selected, logId`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function toggleSelectedLog(selected, logId) {
  if (selected) {
    selectedLogs.value.push(logId);
    return;
  }

  const index = selectedLogs.value.indexOf(logId);

  if (index !== -1) selectedLogs.value.splice(index, 1);
}
```

---

### <a id="deleteselectedlogs"></a>deleteSelectedLogs

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function deleteSelectedLogs() {
  dialog.confirm({
    title: t('log.delete.title'),
    okVariant: 'danger',
    body: t('log.delete.description'),
    onConfirm: () => {
      dbLogs.items.bulkDelete(selectedLogs.value).then(() => {
        selectedLogs.value = [];
      });
    },
  });
}
```

---

### <a id="onconfirm"></a>onConfirm

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
onConfirm: () => {
      dbLogs.items.bulkDelete(selectedLogs.value).then(() => {
        selectedLogs.value = [];
      });
    }
```

---

### <a id="clearlogs"></a>clearLogs

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function clearLogs() {
  dialog.confirm({
    title: t('log.clearLogs.title'),
    okVariant: 'danger',
    body: t('log.clearLogs.description'),
    onConfirm: () => {
      dbLogs.items.clear();
      dbLogs.ctxData.clear();
      dbLogs.logsData.clear();
      dbLogs.histories.clear();
    },
  });
}
```

---

### <a id="onconfirm"></a>onConfirm

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
onConfirm: () => {
      dbLogs.items.clear();
      dbLogs.ctxData.clear();
      dbLogs.logsData.clear();
      dbLogs.histories.clear();
    }
```

---

### <a id="selectalllogs"></a>selectAllLogs

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function selectAllLogs() {
  if (selectedLogs.value.length >= logs.value?.length) {
    selectedLogs.value = [];
    return;
  }

  const logIds = logs?.value.map(({ id }) => id);

  selectedLogs.value = logIds;
}
```

---

