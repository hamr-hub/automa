# handlerSliceVariable.js

**Path**: `workflowEngine/blocksHandler/handlerSliceVariable.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [sliceData](#slicedata) | function | ✅ | `{}` |

## Detailed Description

### <a id="slicedata"></a>sliceData

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function sliceData({ id, data }) {
  const variable = objectPath.get(
    this.engine.referenceData.variables,
    data.variableName
  );
  const payload = {
    data: variable,
    nextBlockId: this.getBlockConnections(id),
  };

  if (!variable || !variable?.slice) return payload;

  let startIndex = 0;
  let endIndex = variable.length;

// ...
```

---

