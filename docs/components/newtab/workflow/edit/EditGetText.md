# EditGetText.vue

**Path**: `components/newtab/workflow/edit/EditGetText.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [updateData](#updatedata) | function | ❌ | `value` |
| [handleExpCheckbox](#handleexpcheckbox) | function | ❌ | `id, value` |

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

### <a id="handleexpcheckbox"></a>handleExpCheckbox

- **Type**: `function`
- **Parameters**: `id, value`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function handleExpCheckbox(id, value) {
  if (value) {
    regexExp.value.push(id);
  } else {
    regexExp.value.splice(regexExp.value.indexOf(id), 1);
  }

  updateData({ regexExp: regexExp.value });
}
```

---

