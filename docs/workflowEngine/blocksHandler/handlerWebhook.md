# handlerWebhook.js

**Path**: `workflowEngine/blocksHandler/handlerWebhook.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [webhook](#webhook) | function | ✅ | `{}, {}` |

## Detailed Description

### <a id="webhook"></a>webhook

- **Type**: `function`
- **Parameters**: `{}, {}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function webhook({ data, id }, { refData }) {
  const nextBlockId = this.getBlockConnections(id);
  const fallbackOutput = this.getBlockConnections(id, 'fallback');

  try {
    if (isWhitespace(data.url)) throw new Error('url-empty');
    if (!data.url.startsWith('http')) {
      const error = new Error('invalid-active-tab');
      error.data = { url: data.url };

      throw error;
    }

    const newHeaders = [];
    for (const { value, name } of data.headers) {
// ...
```

---

