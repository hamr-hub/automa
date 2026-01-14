# handlerActiveTab.js

**Path**: `workflowEngine/blocksHandler/handlerActiveTab.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [activeTab](#activetab) | function | ✅ | `block` |

## Detailed Description

### <a id="activetab"></a>activeTab

- **Type**: `function`
- **Parameters**: `block`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function activeTab(block) {
  try {
    const data = {
      data: '',
      nextBlockId: this.getBlockConnections(block.id),
    };

    if (this.activeTab.id) {
      await BrowserAPIService.tabs.update(this.activeTab.id, { active: true });
      return data;
    }

    const tabsQuery = {
      active: true,
      url: '*://*/*',
// ...
```

---

