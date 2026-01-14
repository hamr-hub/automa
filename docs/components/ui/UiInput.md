# UiInput.vue

**Path**: `components/ui/UiInput.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
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

### <a id="emitvalue"></a>emitValue

- **Type**: `function`
- **Parameters**: `event`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function emitValue(event) {
  let { value } = event.target;

  if (props.mask && props.unmaskValue) {
    const { maskRef } = event.target;
    if (maskRef && maskRef.unmaskedValue) value = maskRef.unmaskedValue;
  }

  if (props.modelModifiers.lowercase) {
    value = value.toLocaleLowerCase();
  } else if (props.modelModifiers.number) {
    value = +value;
  }

  emit('update:modelValue', value);
// ...
```

---

