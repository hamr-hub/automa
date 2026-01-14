# SharedLogsTable.vue

**Path**: `components/newtab/shared/SharedLogsTable.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [default](#default) | object_property_method | ❌ | `` |
| [getTranslation](#gettranslation) | function | ❌ | `key, defText?` |
| [stopWorkflow](#stopworkflow) | function | ❌ | `stateId` |
| [toggleSelectedLog](#toggleselectedlog) | function | ❌ | `selected, id` |
| [formatDate](#formatdate) | function | ❌ | `date, format` |
| [getErrorMessage](#geterrormessage) | function | ❌ | `{}` |
| [stopSelectedWorkflow](#stopselectedworkflow) | function | ❌ | `` |

## Detailed Description

### <a id="default"></a>default

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
default: () => []
```

---

### <a id="default"></a>default

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
default: () => []
```

---

### <a id="gettranslation"></a>getTranslation

- **Type**: `function`
- **Parameters**: `key, defText?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function getTranslation(key, defText = '') {
  return te(key) ? t(key) : defText;
}
```

---

### <a id="stopworkflow"></a>stopWorkflow

- **Type**: `function`
- **Parameters**: `stateId`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function stopWorkflow(stateId) {
  RendererWorkflowService.stopWorkflowExecution(stateId);
}
```

---

### <a id="toggleselectedlog"></a>toggleSelectedLog

- **Type**: `function`
- **Parameters**: `selected, id`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function toggleSelectedLog(selected, id) {
  if (selected) {
    state.selected.push(id);
    return;
  }

  const index = state.selected.indexOf(id);

  if (index !== -1) state.selected.splice(index, 1);
}
```

---

### <a id="formatdate"></a>formatDate

- **Type**: `function`
- **Parameters**: `date, format`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function formatDate(date, format) {
  if (format === 'relative') return dayjs(date).fromNow();

  return dayjs(date).format(format);
}
```

---

### <a id="geterrormessage"></a>getErrorMessage

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function getErrorMessage({ message }) {
  const messagePath = `log.messages.${message}`;

  if (message && te(messagePath)) {
    return t(messagePath);
  }

  return '';
}
```

---

### <a id="stopselectedworkflow"></a>stopSelectedWorkflow

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function stopSelectedWorkflow() {
  state.selected.forEach((id) => {
    stopWorkflow(id);
  });
  state.selected = [];
}
```

---

