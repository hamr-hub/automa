# handlerLink.js

**Path**: `workflowEngine/blocksHandler/handlerLink.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [anonymous](#anonymous) | function | ✅ | `{}` |

## Detailed Description

### <a id="anonymous"></a>anonymous

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function ({ data, id, label }) {
  const url = await this._sendMessageToTab({
    id,
    data,
    label,
  });

  if (data.openInNewTab) {
    const tab = await BrowserAPIService.tabs.create({
      url,
      windowId: this.activeTab.windowId,
    });

    this.activeTab.url = url;
    this.activeTab.frameId = 0;
// ...
```

---

