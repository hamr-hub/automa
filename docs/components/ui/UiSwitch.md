# UiSwitch.vue

**Path**: `components/ui/UiSwitch.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [setup](#setup) | object_method | ❌ | `props, {}` |
| [emitEvent](#emitevent) | object_property_method | ❌ | `` |

## Detailed Description

### <a id="setup"></a>setup

- **Type**: `object_method`
- **Parameters**: `props, {}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
setup(props, { emit }) {
    return {
      emitEvent: () => {
        const newValue = !props.modelValue;

        emit('change', newValue);
        emit('update:modelValue', newValue);
      },
    };
  }
```

---

### <a id="emitevent"></a>emitEvent

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
emitEvent: () => {
        const newValue = !props.modelValue;

        emit('change', newValue);
        emit('update:modelValue', newValue);
      }
```

---

