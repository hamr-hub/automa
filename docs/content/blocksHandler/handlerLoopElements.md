# handlerLoopElements.js

**Path**: `content/blocksHandler/handlerLoopElements.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [getScrollParent](#getscrollparent) | function | ❌ | `node` |
| [excludeSelector](#excludeselector) | function | ❌ | `{}` |
| [anonymous](#anonymous) | function | ✅ | `{}` |
| [generateItemsSelector](#generateitemsselector) | arrow_function | ❌ | `elements` |

## Detailed Description

### <a id="getscrollparent"></a>getScrollParent

- **Type**: `function`
- **Parameters**: `node`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function getScrollParent(node) {
  const isElement = node instanceof HTMLElement;
  const overflowY = isElement && window.getComputedStyle(node).overflowY;
  const isScrollable = overflowY !== 'visible' && overflowY !== 'hidden';

  if (!node) {
    return null;
  }
  if (isScrollable && node.scrollHeight >= node.clientHeight) {
    return node;
  }

  return (
    getScrollParent(node.parentNode) ||
    document.scrollingElement ||
// ...
```

---

### <a id="excludeselector"></a>excludeSelector

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function excludeSelector({ type, selector, loopAttr }) {
  if (type === 'cssSelector') {
    return `${selector}:not([automa-loop*="${loopAttr}"])`;
  }

  return `${selector}[not(contains(@automa-loop, 'gku9rbk-qje-F'))]`;
}
```

---

### <a id="anonymous"></a>anonymous

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function ({ data, id }) {
  try {
    let frameSelector = '';
    if (data.$frameSelector) {
      frameSelector = `${data.$frameSelector} |> `;
    }

    const generateItemsSelector = (elements) => {
      const selectors = generateLoopSelectors(elements, {
        frameSelector,
        attrId: data.loopAttrId,
        startIndex: data.index + 1,
      });

      return selectors;
// ...
```

---

### <a id="generateitemsselector"></a>generateItemsSelector

- **Type**: `arrow_function`
- **Parameters**: `elements`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(elements) => {
      const selectors = generateLoopSelectors(elements, {
        frameSelector,
        attrId: data.loopAttrId,
        startIndex: data.index + 1,
      });

      return selectors;
    }
```

---

