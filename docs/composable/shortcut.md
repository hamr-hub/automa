# shortcut.js

**Path**: `composable/shortcut.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [getReadableShortcut](#getreadableshortcut) | function | ❌ | `str` |
| [getShortcut](#getshortcut) | function | ❌ | `id, data` |
| [useShortcut](#useshortcut) | function | ❌ | `shortcuts, handler` |
| [handleShortcut](#handleshortcut) | arrow_function | ❌ | `event, combo` |
| [addShortcutData](#addshortcutdata) | arrow_function | ❌ | `{}` |

## Detailed Description

### <a id="getreadableshortcut"></a>getReadableShortcut

- **Type**: `function`
- **Parameters**: `str`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function getReadableShortcut(str) {
  const list = {
    option: {
      win: 'alt',
      mac: 'option',
    },
    mod: {
      win: 'ctrl',
      mac: '⌘',
    },
  };
  const regex = /option|mod/g;
  const replacedStr = str.replace(regex, (match) => {
    return list[match][os];
  });
// ...
```

---

### <a id="getshortcut"></a>getShortcut

- **Type**: `function`
- **Parameters**: `id, data`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function getShortcut(id, data) {
  const shortcut = mapShortcuts[id] || {};

  if (data) shortcut.data = data;
  if (!shortcut.readable) {
    shortcut.readable = getReadableShortcut(shortcut.combo);
  }

  return shortcut;
}
```

---

### <a id="useshortcut"></a>useShortcut

- **Type**: `function`
- **Parameters**: `shortcuts, handler`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function useShortcut(shortcuts, handler) {
  Mousetrap.prototype.stopCallback = () => false;

  const extractedShortcuts = {
    ids: {},
    keys: [],
    data: {},
  };
  const handleShortcut = (event, combo) => {
    const shortcutId = extractedShortcuts.ids[combo];
    const params = {
      event,
      ...extractedShortcuts.data[shortcutId],
    };

// ...
```

---

### <a id="handleshortcut"></a>handleShortcut

- **Type**: `arrow_function`
- **Parameters**: `event, combo`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(event, combo) => {
    const shortcutId = extractedShortcuts.ids[combo];
    const params = {
      event,
      ...extractedShortcuts.data[shortcutId],
    };

    if (shortcutId) event.preventDefault();

    if (typeof params.data === 'function') {
      params.data(params, event);
    } else if (handler) {
      handler(params, event);
    }
  }
```

---

### <a id="addshortcutdata"></a>addShortcutData

- **Type**: `arrow_function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
({ combo, id, readable, ...rest }) => {
    extractedShortcuts.ids[combo] = id;
    extractedShortcuts.keys.push(combo);
    extractedShortcuts.data[id] = { combo, id, readable, ...rest };
  }
```

---

