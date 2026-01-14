# UiTextarea.vue

**Path**: `components/ui/UiTextarea.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [setup](#setup) | object_method | ❌ | `props, {}` |
| [calcHeight](#calcheight) | function | ❌ | `` |
| [emitValue](#emitvalue) | function | ❌ | `event` |

## Detailed Description

### <a id="setup"></a>setup

- **Type**: `object_method`
- **Parameters**: `props, {}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
setup(props, { emit }) {
    const textareaId = useComponentId('textarea');
    const textarea = ref(null);

    function calcHeight() {
      if (!props.autoresize) return;

      textarea.value.style.height = 'auto';
      textarea.value.style.height = `${textarea.value.scrollHeight}px`;
    }
    function emitValue(event) {
      let { value } = event.target;
      const maxLength = Math.abs(props.max) || Infinity;

      if (value.length > maxLength) {
// ...
```

---

### <a id="calcheight"></a>calcHeight

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function calcHeight() {
      if (!props.autoresize) return;

      textarea.value.style.height = 'auto';
      textarea.value.style.height = `${textarea.value.scrollHeight}px`;
    }
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
      const maxLength = Math.abs(props.max) || Infinity;

      if (value.length > maxLength) {
        value = value.slice(0, maxLength);
      }

      emit('update:modelValue', value);
      emit('change', value);
      // calcHeight();
    }
```

---

