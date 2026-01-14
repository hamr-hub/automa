# handlerLoopBreakpoint.js

**Path**: `workflowEngine/blocksHandler/handlerLoopBreakpoint.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [loopBreakpoint](#loopbreakpoint) | function | ✅ | `block, {}` |

## Detailed Description

### <a id="loopbreakpoint"></a>loopBreakpoint

- **Type**: `function`
- **Parameters**: `block, {}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function loopBreakpoint(block, { prevBlockData }) {
  const currentLoop = this.loopList[block.data.loopId];

  let validLoopData = false;

  if (currentLoop) {
    validLoopData =
      currentLoop.type === 'numbers'
        ? true
        : currentLoop.index < currentLoop.data.length - 1;
  } else {
    throw new Error(`Can't find a loop with "${block.data.loopId}" loop id`);
  }

  const notReachMaxLoop =
// ...
```

---

