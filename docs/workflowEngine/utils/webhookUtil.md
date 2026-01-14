# webhookUtil.js

**Path**: `workflowEngine/utils/webhookUtil.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [renderContent](#rendercontent) | arrow_function | ✅ | `content, contentType` |
| [filterHeaders](#filterheaders) | arrow_function | ❌ | `headers` |
| [executeWebhook](#executewebhook) | function | ✅ | `{}` |

## Detailed Description

### <a id="rendercontent"></a>renderContent

- **Type**: `arrow_function`
- **Parameters**: `content, contentType`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async (content, contentType) => {
  if (contentType === 'text') return content;

  const renderedJson = parseJSON(content, new Error('invalid-body'));

  if (renderedJson instanceof Error) throw renderedJson;

  if (contentType === 'form') {
    return new URLSearchParams(renderedJson);
  }
  if (contentType === 'form-data') {
    if (!Array.isArray(renderedJson) || !Array.isArray(renderedJson[0])) {
      throw new Error('The body must be 2D Array');
    }

// ...
```

---

### <a id="filterheaders"></a>filterHeaders

- **Type**: `arrow_function`
- **Parameters**: `headers`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(headers) => {
  const filteredHeaders = {};

  if (!headers || !Array.isArray(headers)) return filteredHeaders;

  headers.forEach((item) => {
    if (item.name && item.value) {
      filteredHeaders[item.name] = item.value;
    }
  });
  return filteredHeaders;
}
```

---

### <a id="executewebhook"></a>executeWebhook

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function executeWebhook({
  url,
  contentType,
  headers,
  timeout,
  body,
  method,
}) {
  let timeoutId = null;
  let controller = null;

  if (timeout > 0) {
    controller = new AbortController();
    timeoutId = setTimeout(() => {
      controller.abort();
// ...
```

---

