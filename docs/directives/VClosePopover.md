# VClosePopover.js

**Path**: `directives/VClosePopover.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [mounted](#mounted) | object_method | ❌ | `el` |
| [beforeUnmount](#beforeunmount) | object_method | ❌ | `el` |

## Detailed Description

### <a id="mounted"></a>mounted

- **Type**: `object_method`
- **Parameters**: `el`
- **Description**: *No description provided.*

**Implementation**:
```javascript
mounted(el) {
    el.addEventListener('click', hideAll);
  }
```

---

### <a id="beforeunmount"></a>beforeUnmount

- **Type**: `object_method`
- **Parameters**: `el`
- **Description**: *No description provided.*

**Implementation**:
```javascript
beforeUnmount(el) {
    el.removeEventListener('click', hideAll);
  }
```

---

