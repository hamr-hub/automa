# handlerDeleteData.js

**Path**: `workflowEngine/blocksHandler/handlerDeleteData.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [deleteData](#deletedata) | function | ❌ | `{}` |

## Detailed Description

### <a id="deletedata"></a>deleteData

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function deleteData({ data, id }) {
  return new Promise((resolve) => {
    let variableDeleted = false;

    data.deleteList.forEach((item) => {
      if (item.type === 'table') {
        if (item.columnId === '[all]') {
          this.engine.referenceData.table = [];

          Object.keys(this.engine.columns).forEach((key) => {
            this.engine.columns[key].index = 0;
          });
        } else {
          const columnName = this.engine.columns[item.columnId].name;

// ...
```

---

