# handlerDelay.js

**Path**: `workflowEngine/blocksHandler/handlerDelay.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [delay](#delay) | function | ❌ | `block` |

## Detailed Description

### <a id="delay"></a>delay

- **Type**: `function`
- **Parameters**: `block`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function delay(block) {
  return new Promise((resolve) => {
    const delayTime = +block.data.time || 500;
    setTimeout(() => {
      resolve({
        data: '',
        nextBlockId: this.getBlockConnections(block.id),
      });
    }, delayTime);
  });
}
```

---

