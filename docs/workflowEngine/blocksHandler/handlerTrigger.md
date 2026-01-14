# handlerTrigger.js

**Path**: `workflowEngine/blocksHandler/handlerTrigger.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [trigger](#trigger) | function | ✅ | `block` |

## Detailed Description

### <a id="trigger"></a>trigger

- **Type**: `function`
- **Parameters**: `block`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function trigger(block) {
  return new Promise((resolve) => {
    resolve({
      data: '',
      nextBlockId: this.getBlockConnections(block.id),
    });
  });
}
```

---

