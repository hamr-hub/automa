# handlerClipboard.js

**Path**: `content/blocksHandler/handlerClipboard.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [clipboard](#clipboard) | function | ❌ | `` |

## Detailed Description

### <a id="clipboard"></a>clipboard

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function clipboard() {
  return new Promise((resolve) => {
    const text = window.getSelection().toString();
    resolve(text);
  });
}
```

---

