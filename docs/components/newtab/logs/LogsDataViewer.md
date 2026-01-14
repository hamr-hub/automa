# LogsDataViewer.vue

**Path**: `components/newtab/logs/LogsDataViewer.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [exportData](#exportdata) | function | ❌ | `type` |

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

### <a id="exportdata"></a>exportData

- **Type**: `function`
- **Parameters**: `type`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function exportData(type) {
  dataExporter(
    logsData?.table || logsData,
    { name: state.fileName, type },
    true
  );
}
```

---

