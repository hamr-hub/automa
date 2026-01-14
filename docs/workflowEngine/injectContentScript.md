# injectContentScript.js

**Path**: `workflowEngine/injectContentScript.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [contentScriptExist](#contentscriptexist) | function | ✅ | `tabId, frameId?` |
| [anonymous](#anonymous) | function | ❌ | `tabId, frameId?` |

## Detailed Description

### <a id="contentscriptexist"></a>contentScriptExist

- **Type**: `function`
- **Parameters**: `tabId, frameId?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function contentScriptExist(tabId, frameId = 0) {
  try {
    await browser.tabs.sendMessage(
      tabId,
      { type: 'content-script-exists' },
      { frameId }
    );

    return true;
  } catch (error) {
    return false;
  }
}
```

---

### <a id="anonymous"></a>anonymous

- **Type**: `function`
- **Parameters**: `tabId, frameId?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function (tabId, frameId = 0) {
  return new Promise((resolve) => {
    const currentFrameId = typeof frameId !== 'number' ? 0 : frameId;
    let tryCount = 0;

    (async function tryExecute() {
      try {
        if (tryCount > 3) {
          resolve(false);
          return;
        }

        tryCount += 1;

        if (isMV2) {
// ...
```

---

