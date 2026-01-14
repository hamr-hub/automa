# handlerHandleDialog.js

**Path**: `workflowEngine/blocksHandler/handlerHandleDialog.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [overwriteDialog](#overwritedialog) | arrow_function | ❌ | `accept, promptText` |
| [handleDialog](#handledialog) | function | ✅ | `{}` |

## Detailed Description

### <a id="overwritedialog"></a>overwriteDialog

- **Type**: `arrow_function`
- **Parameters**: `accept, promptText`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(accept, promptText) => `
  const realConfirm = window.confirm;
  window.confirm = function() {
    return ${accept};
  };

  const realAlert = window.alert;
  window.alert = function() {
    return ${accept};
  };

  const realPrompt = window.prompt;
  window.prompt = function() {
    return ${accept} ? "${promptText}" : null;
  }
// ...
```

---

### <a id="handledialog"></a>handleDialog

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function handleDialog({ data, id: blockId }) {
  if (!this.settings.debugMode || BROWSER_TYPE !== 'chrome') {
    const isScriptExist = this.preloadScripts.some(({ id }) => id === blockId);

    if (!isScriptExist) {
      const jsCode = overwriteDialog(data.accept, data.promptText);
      const payload = {
        id: blockId,
        isBlock: true,
        name: 'javascript-code',
        isPreloadScripts: true,
        data: {
          everyNewTab: true,
          scripts: [{ data: { code: jsCode }, id: blockId }],
        },
// ...
```

---

