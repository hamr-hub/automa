# UiSelect.vue

**Path**: `components/ui/UiSelect.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [setup](#setup) | object_method | ❌ | `props, {}` |
| [emitValue](#emitvalue) | function | ❌ | `event` |

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

### <a id="setup"></a>setup

- **Type**: `object_method`
- **Parameters**: `props, {}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
setup(props, { emit }) {
    const selectId = useComponentId('select');

    function emitValue(event) {
      let { value } = event.target;

      if (props.modelModifiers.number) {
        value = +value;
      }

      emit('update:modelValue', value);
      emit('change', value);
    }

    return {
// ...
```

---

### <a id="emitvalue"></a>emitValue

- **Type**: `function`
- **Parameters**: `event`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function emitValue(event) {
      let { value } = event.target;

      if (props.modelModifiers.number) {
        value = +value;
      }

      emit('update:modelValue', value);
      emit('change', value);
    }
```

---

