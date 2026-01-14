# EditBrowserEvent.vue

**Path**: `components/newtab/workflow/edit/EditBrowserEvent.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [updateData](#updatedata) | function | ❌ | `value` |

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

