# WorkflowLogger.js

**Path**: `workflowEngine/WorkflowLogger.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [add](#add) | method | ✅ | `{}` |

## Detailed Description

### <a id="add"></a>add

- **Type**: `method`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async add({ detail, history, ctxData, data }) {
    const logDetail = { ...defaultLogItem, ...detail };

    await Promise.all([
      dbLogs.logsData.add(data),
      dbLogs.ctxData.add(ctxData),
      dbLogs.items.add(logDetail),
      dbLogs.histories.add(history),
    ]);
  }
```

---

