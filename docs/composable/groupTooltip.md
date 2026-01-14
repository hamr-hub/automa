# groupTooltip.js

**Path**: `composable/groupTooltip.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [useGroupTooltip](#usegrouptooltip) | function | ❌ | `elements, options?` |

## Detailed Description

### <a id="usegrouptooltip"></a>useGroupTooltip

- **Type**: `function`
- **Parameters**: `elements, options?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function useGroupTooltip(elements, options = {}) {
  const singleton = shallowRef(null);
  const instance = getCurrentInstance();
  const context = instance && instance.ctx;

  nextTick(() => {
    let tippyInstances = [];

    if (Array.isArray(elements)) {
      tippyInstances = elements.map((el) => el._tippy || createTippy(el));
    } else {
      tippyInstances = context._tooltipGroup || [];
    }

    singleton.value = createSingleton(tippyInstances, {
// ...
```

---

