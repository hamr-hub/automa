# handlerClipboard.js

**Path**: `workflowEngine/blocksHandler/handlerClipboard.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [doCommand](#docommand) | function | ❌ | `command, value` |
| [anonymous](#anonymous) | function | ✅ | `{}` |

## Detailed Description

### <a id="docommand"></a>doCommand

- **Type**: `function`
- **Parameters**: `command, value`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function doCommand(command, value) {
  const textarea = document.createElement('textarea');
  document.body.appendChild(textarea);

  if (command === 'paste') {
    textarea.focus();
    document.execCommand('paste');
    value = textarea.value;
  } else if (command === 'copy') {
    textarea.value = value;
    textarea.select();
    document.execCommand('copy');
    textarea.blur();
  }

// ...
```

---

### <a id="anonymous"></a>anonymous

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function ({ data, id, label }) {
  if (!IS_FIREFOX && !this.engine?.isPopup && !this.engine?.isMV2)
    throw new Error('Clipboard block is not supported in background execution');

  const permissions = ['clipboardRead'];
  if (IS_FIREFOX) {
    permissions.push('clipboardWrite');
  }

  const hasPermission = await BrowserAPIService.permissions.contains({
    permissions,
  });

  if (!hasPermission) {
    throw new Error('no-clipboard-acces');
// ...
```

---

