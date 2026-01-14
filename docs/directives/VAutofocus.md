# VAutofocus.js

**Path**: `directives/VAutofocus.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [mounted](#mounted) | object_method | ❌ | `el, {}` |

## Detailed Description

### <a id="mounted"></a>mounted

- **Type**: `object_method`
- **Parameters**: `el, {}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
mounted(el, { value = true }) {
    if (value) el.focus();
  }
```

---

