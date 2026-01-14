# componentId.js

**Path**: `composable/componentId.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [useComponentId](#usecomponentid) | function | ❌ | `prefix` |

## Detailed Description

### <a id="usecomponentid"></a>useComponentId

- **Type**: `function`
- **Parameters**: `prefix`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function useComponentId(prefix) {
  id += 1;

  if (!prefix) return id;

  return `${prefix}--${id}`;
}
```

---

