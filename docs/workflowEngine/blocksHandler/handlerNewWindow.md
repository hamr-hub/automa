# handlerNewWindow.js

**Path**: `workflowEngine/blocksHandler/handlerNewWindow.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [newWindow](#newwindow) | function | ✅ | `{}` |

## Detailed Description

### <a id="newwindow"></a>newWindow

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function newWindow({ data, id }) {
  const windowOptions = {
    state: data.windowState,
    incognito: data.incognito,
    type: data.type || 'normal',
  };

  if (data.windowState === 'normal') {
    ['top', 'left', 'height', 'width'].forEach((key) => {
      if (data[key] <= 0) return;

      windowOptions[key] = data[key];
    });
  }
  if (data.url) windowOptions.url = data.url;
// ...
```

---

