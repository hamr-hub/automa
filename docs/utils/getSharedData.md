# getSharedData.js

**Path**: `utils/getSharedData.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [getBlocks](#getblocks) | function | ❌ | `` |

## Detailed Description

### <a id="getblocks"></a>getBlocks

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function getBlocks() {
  const custom = typeof customBlocks === 'function' ? customBlocks() : {};
  return { ...tasks, ...custom };
}
```

---

