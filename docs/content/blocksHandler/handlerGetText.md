# handlerGetText.js

**Path**: `content/blocksHandler/handlerGetText.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [getText](#gettext) | function | ❌ | `block` |
| [onSelected](#onselected) | object_method | ❌ | `element` |
| [onError](#onerror) | object_method | ❌ | `error` |
| [onSuccess](#onsuccess) | object_method | ❌ | `` |

## Detailed Description

### <a id="gettext"></a>getText

- **Type**: `function`
- **Parameters**: `block`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function getText(block) {
  return new Promise((resolve, reject) => {
    let regex;
    let textResult = [];
    const {
      regex: regexData,
      regexExp,
      prefixText,
      suffixText,
      multiple,
      includeTags,
      useTextContent,
    } = block.data;

    if (regexData) {
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
        let text = '';

        if (includeTags) {
          text = element.outerHTML;
        } else if (useTextContent) {
          text = element.textContent;
        } else {
          text = element.innerText;
        }

        if (regex) text = text.match(regex)?.join(' ') ?? text;

        text = (prefixText || '') + text + (suffixText || '');

// ...
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

### <a id="onsuccess"></a>onSuccess

- **Type**: `object_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
onSuccess() {
        resolve(textResult);
      }
```

---

