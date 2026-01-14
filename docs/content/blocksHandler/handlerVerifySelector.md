# handlerVerifySelector.js

**Path**: `content/blocksHandler/handlerVerifySelector.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [verifySelector](#verifyselector) | function | ✅ | `block` |

## Detailed Description

### <a id="verifyselector"></a>verifySelector

- **Type**: `function`
- **Parameters**: `block`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function verifySelector(block) {
  let elements = await handleSelector(block);
  if (!elements) {
    await sleep(SLEEP_TIME);
    return { notFound: true };
  }

  if (!block.data.multiple) elements = [elements];

  elements[0].scrollIntoView({
    block: 'center',
    inline: 'center',
    behavior: 'smooth',
  });

// ...
```

---

