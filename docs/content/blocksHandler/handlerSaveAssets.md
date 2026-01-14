# handlerSaveAssets.js

**Path**: `content/blocksHandler/handlerSaveAssets.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [saveAssets](#saveassets) | function | ✅ | `block` |

## Detailed Description

### <a id="saveassets"></a>saveAssets

- **Type**: `function`
- **Parameters**: `block`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function saveAssets(block) {
  let elements = await handleSelector(block, { returnElement: true });

  if (!elements) {
    throw new Error('element-not-found');
  }

  elements = block.data.multiple ? Array.from(elements) : [elements];

  const srcList = elements.reduce((acc, element) => {
    const tag = element.tagName;

    if ((tag === 'AUDIO' || tag === 'VIDEO') && !tag.src) {
      const sourceEl = element.querySelector('source');

// ...
```

---

