# handlerSwitchTab.js

**Path**: `workflowEngine/blocksHandler/handlerSwitchTab.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [anonymous](#anonymous) | function | ✅ | `{}` |
| [generateError](#generateerror) | arrow_function | ❌ | `message, errorData` |

## Detailed Description

### <a id="anonymous"></a>anonymous

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function ({ data, id }) {
  const nextBlockId = this.getBlockConnections(id);
  const generateError = (message, errorData) => {
    const error = new Error(message);
    error.nextBlockId = nextBlockId;

    if (errorData) error.data = errorData;

    return error;
  };
  this.windowId = null;

  let tab = null;
  const activeTab = data.activeTab ?? true;
  const findTabBy = data.findTabBy || 'match-patterns';
// ...
```

---

### <a id="generateerror"></a>generateError

- **Type**: `arrow_function`
- **Parameters**: `message, errorData`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(message, errorData) => {
    const error = new Error(message);
    error.nextBlockId = nextBlockId;

    if (errorData) error.data = errorData;

    return error;
  }
```

---

