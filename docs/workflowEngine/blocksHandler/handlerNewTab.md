# handlerNewTab.js

**Path**: `workflowEngine/blocksHandler/handlerNewTab.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [isValidURL](#isvalidurl) | function | ❌ | `url` |
| [newTab](#newtab) | function | ✅ | `{}` |

## Detailed Description

### <a id="isvalidurl"></a>isValidURL

- **Type**: `function`
- **Parameters**: `url`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function isValidURL(url) {
  try {
    // eslint-disable-next-line
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}
```

---

### <a id="newtab"></a>newTab

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function newTab({ id, data }) {
  if (this.windowId) {
    try {
      // FIXME: ??? query info but do not use it
      await BrowserAPIService.windows.get(this.windowId);
    } catch (error) {
      this.windowId = null;
    }
  } else {
    await Browser.runtime
      .sendMessage({
        name: 'background--browser-api',
        data: {
          name: 'windows.getCurrent',
        },
// ...
```

---

