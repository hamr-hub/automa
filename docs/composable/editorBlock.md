# editorBlock.js

**Path**: `composable/editorBlock.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [useEditorBlock](#useeditorblock) | function | ❌ | `label` |

## Detailed Description

### <a id="useeditorblock"></a>useEditorBlock

- **Type**: `function`
- **Parameters**: `label`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function useEditorBlock(label) {
  const blocks = getBlocks();
  const block = reactive({
    details: {},
    category: {},
  });

  onMounted(() => {
    if (!label) return;

    const details = blocks[label];

    block.details = { id: label, ...details };
    block.category = categories[details.category];
  });
// ...
```

---

