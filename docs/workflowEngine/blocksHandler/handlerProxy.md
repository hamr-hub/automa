# handlerProxy.js

**Path**: `workflowEngine/blocksHandler/handlerProxy.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [setProxy](#setproxy) | function | ❌ | `{}` |

## Detailed Description

### <a id="setproxy"></a>setProxy

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function setProxy({ data, id }) {
  const nextBlockId = this.getBlockConnections(id);

  return new Promise((resolve, reject) => {
    if (data.clearProxy) {
      BrowserAPIService.proxy.settings.clear({});
    }

    const config = {
      mode: 'fixed_servers',
      rules: {
        singleProxy: {
          scheme: data.scheme,
        },
        bypassList: isWhitespace(data.bypassList)
// ...
```

---

