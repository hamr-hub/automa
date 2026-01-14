# handlerAttributeValue.js

**Path**: `content/blocksHandler/handlerAttributeValue.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [handleAttributeValue](#handleattributevalue) | function | ❌ | `block` |
| [isCheckboxOrRadio](#ischeckboxorradio) | arrow_function | ❌ | `element` |
| [onSelected](#onselected) | object_method | ❌ | `element` |
| [onError](#onerror) | object_method | ❌ | `error` |
| [onSuccess](#onsuccess) | object_method | ❌ | `` |

## Detailed Description

### <a id="handleattributevalue"></a>handleAttributeValue

- **Type**: `function`
- **Parameters**: `block`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function handleAttributeValue(block) {
  return new Promise((resolve, reject) => {
    let result = [];
    const { attributeName, multiple, attributeValue, action } = block.data;
    const isCheckboxOrRadio = (element) => {
      if (element.tagName !== 'INPUT') return false;

      return ['checkbox', 'radio'].includes(element.getAttribute('type'));
    };

    handleSelector(block, {
      onSelected(element) {
        if (action === 'set') {
          element.setAttribute(attributeName, attributeValue);
          return;
// ...
```

---

### <a id="ischeckboxorradio"></a>isCheckboxOrRadio

- **Type**: `arrow_function`
- **Parameters**: `element`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(element) => {
      if (element.tagName !== 'INPUT') return false;

      return ['checkbox', 'radio'].includes(element.getAttribute('type'));
    }
```

---

### <a id="onselected"></a>onSelected

- **Type**: `object_method`
- **Parameters**: `element`
- **Description**: *No description provided.*

**Implementation**:
```javascript
onSelected(element) {
        if (action === 'set') {
          element.setAttribute(attributeName, attributeValue);
          return;
        }

        let value = element.getAttribute(attributeName);

        if (attributeName === 'checked' && isCheckboxOrRadio(element)) {
          value = element.checked;
        } else if (attributeName === 'href' && element.tagName === 'A') {
          value = element.href;
        }

        if (multiple) result.push(value);
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
        resolve(result);
      }
```

---

