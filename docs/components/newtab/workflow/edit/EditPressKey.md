# EditPressKey.vue

**Path**: `components/newtab/workflow/edit/EditPressKey.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [updateData](#updatedata) | function | ❌ | `value` |
| [updateKeys](#updatekeys) | function | ❌ | `value` |
| [onKeydown](#onkeydown) | function | ❌ | `event` |
| [onKeyup](#onkeyup) | function | ❌ | `` |
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

### <a id="updatedata"></a>updateData

- **Type**: `function`
- **Parameters**: `value`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function updateData(value) {
  emit('update:data', { ...props.data, ...value });
}
```

---

### <a id="updatekeys"></a>updateKeys

- **Type**: `function`
- **Parameters**: `value`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function updateKeys(value) {
  dataKeys.value = value;
  updateData({ keys: value });
}
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

  recordPressedKey(event, (keys) => {
    updateKeys(keys.join('+'));
  });
}
```

---

### <a id="onkeyup"></a>onKeyup

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function onKeyup() {
  isRecordingKey.value = false;

  /* eslint-disable-next-line */
  detachKeyEvents();
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
  window.addEventListener('keyup', onKeyup);
  window.addEventListener('keydown', onKeydown);
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
  window.removeEventListener('keyup', onKeyup);
  window.removeEventListener('keydown', onKeydown);
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
  isRecordingKey.value = !isRecordingKey.value;

  if (isRecordingKey.value) {
    attachKeyEvents();
  } else {
    detachKeyEvents();
  }
}
```

---

