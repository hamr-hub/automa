# SharedPermissionsModal.vue

**Path**: `components/newtab/shared/SharedPermissionsModal.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [requestPermission](#requestpermission) | function | ❌ | `` |

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

### <a id="requestpermission"></a>requestPermission

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function requestPermission() {
  browser.permissions
    .request({ permissions: toRaw(props.permissions) })
    .then(() => {
      emit('update:modelValue', false);
      emit('granted', true);
    });
}
```

---

