# TriggerKeyboardShortcut.vue

**Path**: `components/newtab/workflow/edit/Trigger/TriggerKeyboardShortcut.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [onKeydown](#onkeydown) | function | ❌ | `event` |
| [attachKeyEvents](#attachkeyevents) | function | ❌ | `` |
| [detachKeyEvents](#detachkeyevents) | function | ❌ | `` |
| [toggleRecordKeys](#togglerecordkeys) | function | ❌ | `` |

## Detailed Description

### <a id="default"></a>default

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
default: () => ({})
```

---

### <a id="onkeydown"></a>onKeydown

- **Type**: `function`
- **Parameters**: `event`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function onKeydown(event) {
  event.preventDefault();
  event.stopPropagation();

  recordShortcut(event, (keys) => {
    recordKeys.keys = keys.join('+');
    emit('update', { shortcut: recordKeys.keys });
  });
}
```

---

### <a id="attachkeyevents"></a>attachKeyEvents

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function attachKeyEvents() {
  window.addEventListener('keydown', onKeydown);
  /* eslint-disable-next-line */
  window.addEventListener('keyup', detachKeyEvents);
}
```

---

### <a id="detachkeyevents"></a>detachKeyEvents

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function detachKeyEvents() {
  recordKeys.isRecording = false;

  window.removeEventListener('keydown', onKeydown);
  window.removeEventListener('keyup', detachKeyEvents);
}
```

---

### <a id="togglerecordkeys"></a>toggleRecordKeys

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function toggleRecordKeys() {
  recordKeys.isRecording = !recordKeys.isRecording;

  if (recordKeys.isRecording) {
    attachKeyEvents();
  } else {
    detachKeyEvents();
  }
}
```

---

