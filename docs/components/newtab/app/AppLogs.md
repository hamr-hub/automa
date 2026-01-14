# AppLogs.vue

**Path**: `components/newtab/app/AppLogs.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [clearState](#clearstate) | function | ❌ | `` |
| [closeItemPage](#closeitempage) | function | ❌ | `closeModal?` |
| [onSelectLog](#onselectlog) | function | ❌ | `{}` |

## Detailed Description

### <a id="clearstate"></a>clearState

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function clearState() {
  state.show = false;
  state.logId = '';
  state.source = '';
  state.runningWorkflow = false;
}
```

---

### <a id="closeitempage"></a>closeItemPage

- **Type**: `function`
- **Parameters**: `closeModal?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function closeItemPage(closeModal = false) {
  state.logId = '';

  if (closeModal) clearState();
}
```

---

### <a id="onselectlog"></a>onSelectLog

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function onSelectLog({ id, type }) {
  state.runningWorkflow = type === 'running';
  state.logId = id;
}
```

---

