# index.js

**Path**: `execute/index.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [getWorkflowDetail](#getworkflowdetail) | function | ❌ | `` |
| [writeResult](#writeresult) | function | ❌ | `text` |

## Detailed Description

### <a id="getworkflowdetail"></a>getWorkflowDetail

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function getWorkflowDetail() {
  let hash = window.location.hash.slice(1);
  if (!hash.startsWith('/')) hash = `/${hash}`;

  const { pathname, searchParams } = new URL(window.location.origin + hash);

  const variables = {};
  const { 1: workflowId } = pathname.split('/');

  searchParams.forEach((key, value) => {
    const varValue = parseJSON(decodeURIComponent(value), '##_empty');
    if (varValue === '##_empty') return;

    variables[key] = varValue;
  });
// ...
```

---

### <a id="writeresult"></a>writeResult

- **Type**: `function`
- **Parameters**: `text`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function writeResult(text) {
  document.body.innerText = text;
}
```

---

