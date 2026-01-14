# EditorLogs.vue

**Path**: `components/newtab/workflow/editor/EditorLogs.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [deleteLog](#deletelog) | function | ❌ | `logId` |

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

### <a id="deletelog"></a>deleteLog

- **Type**: `function`
- **Parameters**: `logId`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function deleteLog(logId) {
  dbLogs.items.delete(logId).then(() => {
    dbLogs.ctxData.where('logId').equals(logId).delete();
    dbLogs.histories.where('logId').equals(logId).delete();
    dbLogs.logsData.where('logId').equals(logId).delete();
  });
}
```

---

