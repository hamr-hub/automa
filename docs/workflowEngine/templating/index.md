# index.js

**Path**: `workflowEngine/templating/index.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [anonymous](#anonymous) | function | ✅ | `{}` |
| [addReplacedValue](#addreplacedvalue) | arrow_function | ❌ | `value` |

## Detailed Description

### <a id="anonymous"></a>anonymous

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function ({ block, refKeys, data, isPopup }) {
  if (!refKeys || refKeys.length === 0) return block;

  const copyBlock = cloneDeep(block);
  const addReplacedValue = (value) => {
    if (!copyBlock.replacedValue) copyBlock.replacedValue = {};
    copyBlock.replacedValue = { ...copyBlock.replacedValue, ...value };
  };

  for (const blockDataKey of refKeys) {
    const currentData = objectPath.get(copyBlock.data, blockDataKey);
    /* eslint-disable-next-line */
    if (!currentData) continue;

    if (Array.isArray(currentData)) {
// ...
```

---

### <a id="addreplacedvalue"></a>addReplacedValue

- **Type**: `arrow_function`
- **Parameters**: `value`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(value) => {
    if (!copyBlock.replacedValue) copyBlock.replacedValue = {};
    copyBlock.replacedValue = { ...copyBlock.replacedValue, ...value };
  }
```

---

