# handleBlockExpression.js

**Path**: `sandbox/utils/handleBlockExpression.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [anonymous](#anonymous) | function | ❌ | `{}, sendResponse` |

## Detailed Description

### <a id="anonymous"></a>anonymous

- **Type**: `function`
- **Parameters**: `{}, sendResponse`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function ({ str, data }, sendResponse) {
  const value = tmpl.tmpl(str, { ...data, ...templatingFunctions });

  sendResponse({
    list: {},
    value: value.slice(2),
  });
}
```

---

