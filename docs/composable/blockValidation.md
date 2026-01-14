# blockValidation.js

**Path**: `composable/blockValidation.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [useBlockValidation](#useblockvalidation) | function | ❌ | `blockId, data` |

## Detailed Description

### <a id="useblockvalidation"></a>useBlockValidation

- **Type**: `function`
- **Parameters**: `blockId, data`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function useBlockValidation(blockId, data) {
  const errors = shallowRef('');

  onMounted(() => {
    const blockValidation = blocksValidation[blockId];
    if (!blockValidation) return;

    const unwatch = watch(
      data,
      (newData) => {
        blockValidation
          .func(newData)
          .then((blockErrors) => {
            let errorsStr = '';
            blockErrors.forEach((error) => {
// ...
```

---

