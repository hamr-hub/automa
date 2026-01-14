# EditJavascriptCode.vue

**Path**: `components/newtab/workflow/edit/EditJavascriptCode.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [modifyWhiteSpace](#modifywhitespace) | function | ❌ | `` |
| [default](#default) | object_property_method | ❌ | `` |
| [updateData](#updatedata) | function | ❌ | `value` |
| [addScript](#addscript) | function | ❌ | `` |

## Detailed Description

### <a id="modifywhitespace"></a>modifyWhiteSpace

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function modifyWhiteSpace() {
  if (store.whiteSpace === 'pre') {
    store.whiteSpace = 'pre-wrap';
  } else {
    store.whiteSpace = 'pre';
  }
}
```

---

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

### <a id="addscript"></a>addScript

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function addScript() {
  state.preloadScripts.push({ src: '', removeAfterExec: true });
}
```

---

