# dialog.js

**Path**: `composable/dialog.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [useDialog](#usedialog) | function | ❌ | `` |
| [emitDialog](#emitdialog) | arrow_function | ❌ | `type, options?` |
| [confirm](#confirm) | function | ❌ | `options?` |
| [prompt](#prompt) | function | ❌ | `options?` |
| [custom](#custom) | function | ❌ | `type, options?` |

## Detailed Description

### <a id="usedialog"></a>useDialog

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function useDialog() {
  const emitDialog = (type, options = {}) => {
    emitter.emit('show-dialog', { type, options });
  };

  function confirm(options = {}) {
    emitDialog('confirm', options);
  }
  function prompt(options = {}) {
    emitDialog('prompt', options);
  }
  function custom(type, options = {}) {
    emitDialog(type, { ...options, custom: true });
  }

// ...
```

---

### <a id="emitdialog"></a>emitDialog

- **Type**: `arrow_function`
- **Parameters**: `type, options?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(type, options = {}) => {
    emitter.emit('show-dialog', { type, options });
  }
```

---

### <a id="confirm"></a>confirm

- **Type**: `function`
- **Parameters**: `options?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function confirm(options = {}) {
    emitDialog('confirm', options);
  }
```

---

### <a id="prompt"></a>prompt

- **Type**: `function`
- **Parameters**: `options?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function prompt(options = {}) {
    emitDialog('prompt', options);
  }
```

---

### <a id="custom"></a>custom

- **Type**: `function`
- **Parameters**: `type, options?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function custom(type, options = {}) {
    emitDialog(type, { ...options, custom: true });
  }
```

---

