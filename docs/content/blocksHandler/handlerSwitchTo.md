# handlerSwitchTo.js

**Path**: `content/blocksHandler/handlerSwitchTo.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [switchTo](#switchto) | function | ❌ | `block` |
| [onSelected](#onselected) | object_method | ❌ | `element` |
| [onError](#onerror) | object_method | ❌ | `error` |

## Detailed Description

### <a id="switchto"></a>switchTo

- **Type**: `function`
- **Parameters**: `block`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function switchTo(block) {
  return new Promise((resolve, reject) => {
    block.data.findBy = isXPath(block.data.selector) ? 'xpath' : 'cssSelector';

    handleSelector(block, {
      onSelected(element) {
        if (!framesEl.includes(element.tagName)) {
          reject(new Error('not-iframe'));
          return;
        }

        const isSameOrigin = element.contentDocument !== null;

        resolve({ url: element.src, isSameOrigin });
      },
// ...
```

---

### <a id="onselected"></a>onSelected

- **Type**: `object_method`
- **Parameters**: `element`
- **Description**: *No description provided.*

**Implementation**:
```javascript
onSelected(element) {
        if (!framesEl.includes(element.tagName)) {
          reject(new Error('not-iframe'));
          return;
        }

        const isSameOrigin = element.contentDocument !== null;

        resolve({ url: element.src, isSameOrigin });
      }
```

---

### <a id="onerror"></a>onError

- **Type**: `object_method`
- **Parameters**: `error`
- **Description**: *No description provided.*

**Implementation**:
```javascript
onError(error) {
        reject(error);
      }
```

---

