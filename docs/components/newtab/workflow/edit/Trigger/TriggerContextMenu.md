# TriggerContextMenu.vue

**Path**: `components/newtab/workflow/edit/Trigger/TriggerContextMenu.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [onSelectContextType](#onselectcontexttype) | function | ❌ | `selected, type` |

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

### <a id="onselectcontexttype"></a>onSelectContextType

- **Type**: `function`
- **Parameters**: `selected, type`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function onSelectContextType(selected, type) {
  const contextTypes = [...props.data.contextTypes];

  if (selected) {
    contextTypes.push(type);
  } else {
    const index = contextTypes.indexOf(type);
    contextTypes.splice(index, 1);
  }

  emit('update', { contextTypes });
}
```

---

