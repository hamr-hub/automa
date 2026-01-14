# index.js

**Path**: `sandbox/index.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [fetchResponse](#fetchresponse) | function | ❌ | `{}` |
| [sendResponse](#sendresponse) | function | ❌ | `payload` |

## Detailed Description

### <a id="fetchresponse"></a>fetchResponse

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function fetchResponse({ id, data }) {
  window.dispatchEvent(
    new CustomEvent(`automa-fetch-response-${id}`, {
      detail: data,
    })
  );
}
```

---

### <a id="sendresponse"></a>sendResponse

- **Type**: `function`
- **Parameters**: `payload`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function sendResponse(payload) {
    window.top.postMessage(
      {
        id: data.id,
        type: 'sandbox',
        result: payload,
      },
      '*'
    );
  }
```

---

