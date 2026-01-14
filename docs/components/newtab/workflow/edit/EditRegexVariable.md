# EditRegexVariable.vue

**Path**: `components/newtab/workflow/edit/EditRegexVariable.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [updateData](#updatedata) | function | ❌ | `value` |
| [updateFlag](#updateflag) | function | ❌ | `include, flag` |

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

### <a id="updateflag"></a>updateFlag

- **Type**: `function`
- **Parameters**: `include, flag`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function updateFlag(include, flag) {
  const copyFlag = [...props.data.flag];

  if (include) {
    copyFlag.push(flag);
  } else {
    const index = copyFlag.indexOf(flag);
    copyFlag.splice(index, 1);
  }

  updateData({ flag: copyFlag });
}
```

---

