# UiRadio.vue

**Path**: `components/ui/UiRadio.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [setup](#setup) | object_method | ❌ | `props, {}` |
| [changeHandler](#changehandler) | function | ❌ | `{}` |

## Detailed Description

### <a id="setup"></a>setup

- **Type**: `object_method`
- **Parameters**: `props, {}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
setup(props, { emit }) {
    const isChecked = computed(() => props.value === props.modelValue);

    function changeHandler({ target: { value } }) {
      emit('update:modelValue', value);
      emit('change', value);
    }

    return {
      isChecked,
      changeHandler,
    };
  }
```

---

### <a id="changehandler"></a>changeHandler

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function changeHandler({ target: { value } }) {
      emit('update:modelValue', value);
      emit('change', value);
    }
```

---

