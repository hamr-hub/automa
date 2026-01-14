# SettingsShortcuts.vue

**Path**: `newtab/pages/settings/SettingsShortcuts.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [keydownListener](#keydownlistener) | function | ❌ | `event` |
| [cleanUp](#cleanup) | function | ❌ | `` |
| [startRecording](#startrecording) | function | ❌ | `{}` |
| [removeShortcut](#removeshortcut) | function | ❌ | `shortcutId` |
| [stopRecording](#stoprecording) | function | ❌ | `` |

## Detailed Description

### <a id="keydownlistener"></a>keydownListener

- **Type**: `function`
- **Parameters**: `event`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function keydownListener(event) {
  event.preventDefault();
  event.stopPropagation();

  if (!recording.id) {
    document.removeEventListener('keydown', keydownListener, true);
    return;
  }

  recordShortcut(event, (keys) => {
    recording.keys = keys;
  });
}
```

---

### <a id="cleanup"></a>cleanUp

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function cleanUp() {
  recording.id = '';
  recording.keys = [];

  document.removeEventListener('keydown', keydownListener, true);
}
```

---

### <a id="startrecording"></a>startRecording

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function startRecording({ id }) {
  if (!recording.id) {
    document.addEventListener('keydown', keydownListener, true);
  }

  recording.keys = [];
  recording.id = id;
}
```

---

### <a id="removeshortcut"></a>removeShortcut

- **Type**: `function`
- **Parameters**: `shortcutId`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function removeShortcut(shortcutId) {
  if (shortcutId !== 'automa:shortcut') return;

  browser.storage.local.set({ automaShortcut: [] });
  automaShortcut.value = '';
}
```

---

### <a id="stoprecording"></a>stopRecording

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function stopRecording() {
  if (recording.keys.length === 0) return;

  const newCombo = recording.keys.join('+');

  if (recording.id.startsWith('automa')) {
    browser.storage.local.set({ automaShortcut: newCombo });
    automaShortcut.value = getReadableShortcut(newCombo);
    cleanUp();

    return;
  }

  const isDuplicate = Object.keys(shortcuts.value).find((key) => {
    return shortcuts.value[key].combo === newCombo && key !== recording.id;
// ...
```

---

