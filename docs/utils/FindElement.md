# FindElement.js

**Path**: `utils/FindElement.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [cssSelector](#cssselector) | method | ❌ | `data, documentCtx?` |
| [xpath](#xpath) | method | ❌ | `data, documentCtx?` |

## Detailed Description

### <a id="cssselector"></a>cssSelector

- **Type**: `method`
- **Parameters**: `data, documentCtx?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
static cssSelector(data, documentCtx = document) {
    const selector = data.markEl
      ? `${data.selector.trim()}:not([${data.blockIdAttr}])`
      : data.selector;

    if (specialSelectorsRegex.test(selector)) {
      // Fix Sizzle incorrect context in iframe, passed as context of iframe
      const elements = Sizzle(selector, documentCtx);
      if (!elements) return null;

      return data.multiple ? elements : elements[0];
    }

    if (selector.includes('>>')) {
      const newSelector = selector.replaceAll('>>', '');
// ...
```

---

### <a id="xpath"></a>xpath

- **Type**: `method`
- **Parameters**: `data, documentCtx?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
static xpath(data, documentCtx = document) {
    const resultType = data.multiple
      ? XPathResult.ORDERED_NODE_ITERATOR_TYPE
      : XPathResult.FIRST_ORDERED_NODE_TYPE;

    let result = null;
    const elements = documentCtx.evaluate(
      data.selector,
      documentCtx,
      null,
      resultType,
      null
    );

    if (data.multiple) {
// ...
```

---

