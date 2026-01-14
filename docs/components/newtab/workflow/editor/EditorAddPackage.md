# EditorAddPackage.vue

**Path**: `components/newtab/workflow/editor/EditorAddPackage.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [updatePackageIcon](#updatepackageicon) | function | ❌ | `value` |

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

### <a id="updatepackageicon"></a>updatePackageIcon

- **Type**: `function`
- **Parameters**: `value`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function updatePackageIcon(value) {
  if (!value.startsWith('http')) return;

  state.icon = value.slice(0, 1024);
}
```

---

