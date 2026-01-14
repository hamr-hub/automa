# handlerLink.js

**Path**: `content/blocksHandler/handlerLink.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [link](#link) | function | ✅ | `block` |

## Detailed Description

### <a id="link"></a>link

- **Type**: `function`
- **Parameters**: `block`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function link(block) {
  const element = await handleSelector(block, { returnElement: true });

  if (!element) {
    throw new Error('element-not-found');
  }
  if (element.tagName !== 'A') {
    throw new Error('Element is not a link');
  }

  markElement(element, block);

  const url = element.href;
  if (url && !block.data.openInNewTab) window.open(url, '_self');

// ...
```

---

