# handlerElementExists.js

**Path**: `content/blocksHandler/handlerElementExists.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [elementExists](#elementexists) | function | ❌ | `block` |
| [isExists](#isexists) | arrow_function | ✅ | `` |
| [checkElement](#checkelement) | function | ✅ | `` |

## Detailed Description

### <a id="elementexists"></a>elementExists

- **Type**: `function`
- **Parameters**: `block`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function elementExists(block) {
  return new Promise((resolve) => {
    let trying = 0;

    const isExists = async () => {
      try {
        const element = await handleSelector(block, { returnElement: true });

        if (!element) throw new Error('element-not-found');

        return true;
      } catch (error) {
        return false;
      }
    };
// ...
```

---

### <a id="isexists"></a>isExists

- **Type**: `arrow_function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async () => {
      try {
        const element = await handleSelector(block, { returnElement: true });

        if (!element) throw new Error('element-not-found');

        return true;
      } catch (error) {
        return false;
      }
    }
```

---

### <a id="checkelement"></a>checkElement

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function checkElement() {
      if (trying > (block.data.tryCount || 1)) {
        resolve(false);
        return;
      }

      const isElementExist = await isExists();

      if (isElementExist) {
        resolve(true);
      } else {
        trying += 1;

        setTimeout(checkElement, block.data.timeout || 500);
      }
// ...
```

---

