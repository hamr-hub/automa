# handlerSortData.js

**Path**: `workflowEngine/blocksHandler/handlerSortData.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [sliceData](#slicedata) | function | ✅ | `{}` |
| [getComparisonValue](#getcomparisonvalue) | arrow_function | ❌ | `{}` |

## Detailed Description

### <a id="slicedata"></a>sliceData

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function sliceData({ id, data }) {
  let dataToSort = null;

  if (data.dataSource === 'table') {
    dataToSort = this.engine.referenceData.table;
  } else if (data.dataSource === 'variable') {
    const { variables } = this.engine.referenceData;

    if (!objectHasKey(variables, data.varSourceName)) {
      throw new Error(`Cant find "${data.varSourceName}" variable`);
    }

    dataToSort = variables[data.varSourceName];
  }

// ...
```

---

### <a id="getcomparisonvalue"></a>getComparisonValue

- **Type**: `arrow_function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
({ itemA, itemB, order = 'asc' }) => {
    let comparison = 0;

    if (itemA > itemB) {
      comparison = 1;
    } else if (itemA < itemB) {
      comparison = -1;
    }

    return order === 'desc' ? comparison * -1 : comparison;
  }
```

---

