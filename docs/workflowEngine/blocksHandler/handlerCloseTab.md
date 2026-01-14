# handlerCloseTab.js

**Path**: `workflowEngine/blocksHandler/handlerCloseTab.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [closeWindow](#closewindow) | function | ✅ | `data, windowId` |
| [closeTab](#closetab) | function | ✅ | `data, tabId` |
| [anonymous](#anonymous) | function | ✅ | `{}` |

## Detailed Description

### <a id="closewindow"></a>closeWindow

- **Type**: `function`
- **Parameters**: `data, windowId`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function closeWindow(data, windowId) {
  const windowIds = [];

  if (data.allWindows) {
    const windows = await BrowserAPIService.windows.getAll();

    windows.forEach(({ id }) => {
      windowIds.push(id);
    });
  } else {
    let currentWindowId;

    if (windowId && typeof windowId === 'number') {
      currentWindowId = windowId;
    } else {
// ...
```

---

### <a id="closetab"></a>closeTab

- **Type**: `function`
- **Parameters**: `data, tabId`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function closeTab(data, tabId) {
  let tabIds;

  if (data.activeTab && tabId) {
    tabIds = tabId;
  } else if (data.url) {
    tabIds = (await BrowserAPIService.tabs.query({ url: data.url })).map(
      (tab) => tab.id
    );
  }

  if (tabIds) await BrowserAPIService.tabs.remove(tabIds);
}
```

---

### <a id="anonymous"></a>anonymous

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function ({ data, id }) {
  if (data.closeType === 'window') {
    await closeWindow(data, this.windowId);

    this.windowId = null;
  } else {
    await closeTab(data, this.activeTab.id);

    if (data.activeTab) {
      this.activeTab.id = null;
    }
  }

  return {
    data: '',
// ...
```

---

