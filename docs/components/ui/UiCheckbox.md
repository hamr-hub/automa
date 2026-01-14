# UiCheckbox.vue

**Path**: `components/ui/UiCheckbox.vue`

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
    function changeHandler({ target: { checked } }) {
      emit('update:modelValue', checked);
      emit('change', checked);
    }

    return {
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
function changeHandler({ target: { checked } }) {
      emit('update:modelValue', checked);
      emit('change', checked);
    }
```

---

