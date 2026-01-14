# handlerElementExists.js

**Path**: `workflowEngine/blocksHandler/handlerElementExists.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [elementExists](#elementexists) | function | ❌ | `block` |

## Detailed Description

### <a id="elementexists"></a>elementExists

- **Type**: `function`
- **Parameters**: `block`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function elementExists(block) {
  return new Promise((resolve, reject) => {
    this._sendMessageToTab(block)
      .then((data) => {
        if (!data && block.data.throwError) {
          const error = new Error('element-not-found');
          error.data = { selector: block.data.selector };

          reject(error);
          return;
        }

        resolve({
          data,
          nextBlockId: this.getBlockConnections(block.id, data ? 1 : 2),
// ...
```

---

