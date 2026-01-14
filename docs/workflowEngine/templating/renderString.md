# renderString.js

**Path**: `workflowEngine/templating/renderString.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [anonymous](#anonymous) | function | ✅ | `str, data, options?` |

## Detailed Description

### <a id="anonymous"></a>anonymous

- **Type**: `function`
- **Parameters**: `str, data, options?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function (str, data, options = {}) {
  if (!str || typeof str !== 'string') return '';

  const hasMustacheTag = /\{\{(.*?)\}\}/.test(str);
  if (!hasMustacheTag) {
    return {
      list: {},
      value: str,
    };
  }

  let renderedValue = {};
  const evaluateJS = str.startsWith('!!');

  if (evaluateJS && !isFirefox) {
// ...
```

---

