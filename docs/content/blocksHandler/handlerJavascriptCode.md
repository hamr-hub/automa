# handlerJavascriptCode.js

**Path**: `content/blocksHandler/handlerJavascriptCode.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [javascriptCode](#javascriptcode) | function | ❌ | `{}` |

## Detailed Description

### <a id="javascriptcode"></a>javascriptCode

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function javascriptCode({ data, isPreloadScripts, frameSelector }) {
  if (!isPreloadScripts && Array.isArray(data))
    return jsContentHandler(...data);
  if (!data.scripts) return Promise.resolve({ success: true });

  let $documentCtx = document;

  if (frameSelector) {
    const iframeCtx = getDocumentCtx(frameSelector);
    if (!iframeCtx) return Promise.resolve({ success: false });

    $documentCtx = iframeCtx;
  }

  data.scripts.forEach((script) => {
// ...
```

---

