# EditBlockSettings.vue

**Path**: `components/newtab/workflow/edit/EditBlockSettings.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [onDataChange](#ondatachange) | function | ❌ | `key, data` |

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

### <a id="ondatachange"></a>onDataChange

- **Type**: `function`
- **Parameters**: `key, data`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function onDataChange(key, data) {
  if (!state.retrieved) return;

  state[key] = data;
  emit('change', { [key]: data });
}
```

---

