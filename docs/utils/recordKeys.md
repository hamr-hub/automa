# recordKeys.js

**Path**: `utils/recordKeys.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [recordPressedKey](#recordpressedkey) | function | ❌ | `{}, callback` |
| [recordShortcut](#recordshortcut) | function | ❌ | `{}, callback` |

## Detailed Description

### <a id="recordpressedkey"></a>recordPressedKey

- **Type**: `function`
- **Parameters**: `{}, callback`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function recordPressedKey(
  { repeat, shiftKey, metaKey, altKey, ctrlKey, key },
  callback
) {
  if (repeat || modifierKeys.includes(key)) return;

  let pressedKey = key.length > 1 || shiftKey ? toCamelCase(key, true) : key;

  if (pressedKey === ' ') pressedKey = 'Space';
  else if (pressedKey === '+') pressedKey = 'NumpadAdd';

  const keys = [pressedKey];

  if (shiftKey) keys.unshift('Shift');
  if (metaKey) keys.unshift('Meta');
// ...
```

---

### <a id="recordshortcut"></a>recordShortcut

- **Type**: `function`
- **Parameters**: `{}, callback`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function recordShortcut(
  { ctrlKey, altKey, metaKey, shiftKey, key, repeat },
  callback
) {
  if (repeat) return;

  const keys = [];

  if (ctrlKey || metaKey) keys.push('mod');
  if (altKey) keys.push('option');
  if (shiftKey) keys.push('shift');

  const isValidKey = !!allowedKeys[key] || /^[a-z0-9,./;'[\]\-=`]$/i.test(key);

  if (isValidKey) {
// ...
```

---

