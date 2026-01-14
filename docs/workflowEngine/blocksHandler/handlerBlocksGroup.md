# handlerBlocksGroup.js

**Path**: `workflowEngine/blocksHandler/handlerBlocksGroup.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [blocksGroup](#blocksgroup) | function | ❌ | `{}, {}` |

## Detailed Description

### <a id="blocksgroup"></a>blocksGroup

- **Type**: `function`
- **Parameters**: `{}, {}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function blocksGroup({ data, id }, { prevBlockData }) {
  return new Promise((resolve) => {
    const nextBlockId = this.getBlockConnections(id);

    if (data.blocks.length === 0) {
      resolve({
        nextBlockId,
        data: prevBlockData,
      });

      return;
    }

    const { blocks, connections } = data.blocks.reduce(
      (acc, block, index) => {
// ...
```

---

