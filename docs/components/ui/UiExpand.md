# UiExpand.vue

**Path**: `components/ui/UiExpand.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [toggleExpand](#toggleexpand) | function | ❌ | `` |

## Detailed Description

### <a id="toggleexpand"></a>toggleExpand

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function toggleExpand() {
  if (props.disabled) return;

  show.value = !show.value;

  emit('update:modelValue', show.value);
}
```

---

