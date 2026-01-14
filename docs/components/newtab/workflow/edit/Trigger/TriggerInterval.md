# TriggerInterval.vue

**Path**: `components/newtab/workflow/edit/Trigger/TriggerInterval.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [updateIntervalInput](#updateintervalinput) | function | ❌ | `value, {}` |

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

### <a id="updateintervalinput"></a>updateIntervalInput

- **Type**: `function`
- **Parameters**: `value, {}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function updateIntervalInput(value, { key, min, max }) {
  let num = +value;

  if (num < min) num = min;
  else if (num > max) num = max;

  emit('update', { [key]: num });
}
```

---

