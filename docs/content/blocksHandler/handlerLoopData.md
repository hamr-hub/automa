# handlerLoopData.js

**Path**: `content/blocksHandler/handlerLoopData.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [loopElements](#loopelements) | function | ✅ | `block` |

## Detailed Description

### <a id="loopelements"></a>loopElements

- **Type**: `function`
- **Parameters**: `block`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function loopElements(block) {
  const elements = await handleSelector(block);
  if (!elements) throw new Error('element-not-found');

  let frameSelector = '';
  if (block.data.$frameSelector) {
    frameSelector = `${block.data.$frameSelector} |> `;
  }

  if (block.onlyGenerate) {
    generateLoopSelectors(elements, {
      ...block.data,
      frameSelector,
      attrId: block.data.loopId,
    });
// ...
```

---

