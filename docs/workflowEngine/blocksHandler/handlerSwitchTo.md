# handlerSwitchTo.js

**Path**: `workflowEngine/blocksHandler/handlerSwitchTo.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [switchTo](#switchto) | function | ✅ | `block` |

## Detailed Description

### <a id="switchto"></a>switchTo

- **Type**: `function`
- **Parameters**: `block`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function switchTo(block) {
  const nextBlockId = this.getBlockConnections(block.id);

  try {
    if (block.data.windowType === 'main-window') {
      this.activeTab.frameId = 0;

      delete this.frameSelector;

      return {
        data: '',
        nextBlockId,
      };
    }

// ...
```

---

