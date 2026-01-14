# handlerHoverElement.js

**Path**: `workflowEngine/blocksHandler/handlerHoverElement.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [hoverElement](#hoverelement) | function | ✅ | `block` |

## Detailed Description

### <a id="hoverelement"></a>hoverElement

- **Type**: `function`
- **Parameters**: `block`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function hoverElement(block) {
  if (!this.activeTab.id) throw new Error('no-tab');
  if (BROWSER_TYPE !== 'chrome') {
    const error = new Error('browser-not-supported');
    error.data = { browser: BROWSER_TYPE };

    throw error;
  }

  const { debugMode, executedBlockOnWeb } = this.settings;

  if (!debugMode) {
    await attachDebugger(this.activeTab.id);
  }

// ...
```

---

