# handlerReloadTab.js

**Path**: `workflowEngine/blocksHandler/handlerReloadTab.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [reloadTab](#reloadtab) | function | ✅ | `{}` |

## Detailed Description

### <a id="reloadtab"></a>reloadTab

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function reloadTab({ id }) {
  if (!this.activeTab.id) throw new Error('no-tab');

  await BrowserAPIService.tabs.reload(this.activeTab.id);

  return {
    data: '',
    nextBlockId: this.getBlockConnections(id),
  };
}
```

---

