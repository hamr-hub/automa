# tippy.js

**Path**: `lib/tippy.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [anonymous](#anonymous) | function | ❌ | `el, options?` |

## Detailed Description

### <a id="anonymous"></a>anonymous

- **Type**: `function`
- **Parameters**: `el, options?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function (el, options = {}) {
  el?.setAttribute('vtooltip', '');

  const instance = tippy(el, {
    ...defaultOptions,
    ...options,
  });

  return instance;
}
```

---

