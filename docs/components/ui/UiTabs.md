# UiTabs.vue

**Path**: `components/ui/UiTabs.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [validator](#validator) | object_property_method | ❌ | `value` |
| [updateActive](#updateactive) | function | ❌ | `id` |
| [hoverHandler](#hoverhandler) | function | ❌ | `{}` |

## Detailed Description

### <a id="validator"></a>validator

- **Type**: `object_property_method`
- **Parameters**: `value`
- **Description**: *No description provided.*

**Implementation**:
```javascript
validator: (value) => ['default', 'fill'].includes(value)
```

---

### <a id="updateactive"></a>updateActive

- **Type**: `function`
- **Parameters**: `id`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function updateActive(id) {
  emit('change', id);
  emit('update:modelValue', id);
}
```

---

### <a id="hoverhandler"></a>hoverHandler

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function hoverHandler({ target }) {
  const isFill = props.type === 'fill';

  if (target.classList.contains('is-active') && isFill) {
    hoverIndicator.value.style.display = 'none';

    return;
  }

  const { height, width } = target.getBoundingClientRect();
  const elHeight = isFill ? height + 3 : height - 11;

  showHoverIndicator.value = true;
  hoverIndicator.value.style.width = `${width}px`;
  hoverIndicator.value.style.height = `${elHeight}px`;
// ...
```

---

