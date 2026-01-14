# index.js

**Path**: `content/commandPalette/index.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [pageLoaded](#pageloaded) | function | ❌ | `` |
| [checkDocState](#checkdocstate) | arrow_function | ❌ | `` |
| [anonymous](#anonymous) | function | ✅ | `` |

## Detailed Description

### <a id="pageloaded"></a>pageLoaded

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function pageLoaded() {
  return new Promise((resolve) => {
    const checkDocState = () => {
      if (document.readyState === 'loading') {
        setTimeout(checkDocState, 1000);
        return;
      }

      resolve();
    };

    checkDocState();
  });
}
```

---

### <a id="checkdocstate"></a>checkDocState

- **Type**: `arrow_function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
() => {
      if (document.readyState === 'loading') {
        setTimeout(checkDocState, 1000);
        return;
      }

      resolve();
    }
```

---

### <a id="anonymous"></a>anonymous

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function () {
  try {
    const isMainFrame = window.self === window.top;
    if (!isMainFrame) return;

    const isInvalidURL = /.(json|xml)$/.test(window.location.pathname);
    if (isInvalidURL) return;

    const { automaShortcut } = await browser.storage.local.get(
      'automaShortcut'
    );
    if (Array.isArray(automaShortcut) && automaShortcut.length === 0) return;

    await pageLoaded();

// ...
```

---

