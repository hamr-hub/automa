# handlerBlockPackage.js

**Path**: `workflowEngine/blocksHandler/handlerBlockPackage.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [anonymous](#anonymous) | function | ✅ | `{}, {}` |
| [addBlockPrefix](#addblockprefix) | arrow_function | ❌ | `itemId` |

## Detailed Description

### <a id="anonymous"></a>anonymous

- **Type**: `function`
- **Parameters**: `{}, {}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function (
  { data, id },
  { targetHandle: prevTarget, prevBlockData }
) {
  if (!this.engine.packagesCache[id]) {
    this.engine.packagesCache[id] = { extracted: false, nodes: {} };
  }

  const pkgCache = this.engine.packagesCache[id];

  const { 1: targetId } = prevTarget.split('input-');
  const addBlockPrefix = (itemId) => `${id}__${itemId}`;
  const hasCache = pkgCache.nodes[targetId];
  if (hasCache)
    return {
// ...
```

---

### <a id="addblockprefix"></a>addBlockPrefix

- **Type**: `arrow_function`
- **Parameters**: `itemId`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(itemId) => `${id}__${itemId}`
```

---

