# UiTabPanel.vue

**Path**: `components/ui/UiTabPanel.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [render](#render) | arrow_function | ❌ | `` |

## Detailed Description

### <a id="render"></a>render

- **Type**: `arrow_function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
() => {
  const isActive = props.value === uiTabPanels.modelValue.value;
  const cache = props.cache || uiTabPanels.cache.value;
  const component = h(
    'div',
    {
      class: [props.activeClass, 'ui-tab-panel'],
      style: {
        display: cache && !isActive ? 'none' : null,
      },
    },
    slots
  );

  if (props.cache || isActive) return component;
// ...
```

---

