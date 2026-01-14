# handlerForwardPage.js

**Path**: `workflowEngine/blocksHandler/handlerForwardPage.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [goBack](#goback) | function | ✅ | `{}` |

## Detailed Description

### <a id="goback"></a>goBack

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function goBack({ id }) {
  if (!this.activeTab.id) throw new Error('no-tab');

  await BrowserAPIService.tabs.goForward(this.activeTab.id);

  return {
    data: '',
    nextBlockId: this.getBlockConnections(id),
  };
}
```

---

