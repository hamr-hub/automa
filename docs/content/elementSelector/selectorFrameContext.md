# selectorFrameContext.js

**Path**: `content/elementSelector/selectorFrameContext.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [getElementRectWithOffset](#getelementrectwithoffset) | function | ❌ | `element, data` |
| [getElementsRect](#getelementsrect) | function | ❌ | `data` |
| [resetElementSelector](#resetelementselector) | function | ❌ | `data` |
| [findElement](#findelement) | function | ❌ | `{}` |
| [onMessage](#onmessage) | function | ❌ | `{}` |
| [anonymous](#anonymous) | function | ❌ | `` |

## Detailed Description

### <a id="getelementrectwithoffset"></a>getElementRectWithOffset

- **Type**: `function`
- **Parameters**: `element, data`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function getElementRectWithOffset(element, data) {
  const withAttributes = data.withAttributes && data.click;
  const elementRect = getElementRect(element, withAttributes);

  elementRect.y += data.top;
  elementRect.x += data.left;

  return elementRect;
}
```

---

### <a id="getelementsrect"></a>getElementsRect

- **Type**: `function`
- **Parameters**: `data`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function getElementsRect(data) {
  const [element] = document.elementsFromPoint(
    data.clientX - data.left,
    data.clientY - data.top
  );
  if ((!element || element === prevSelectedElement) && !data.click) return;

  const payload = {
    elements: [],
    type: 'automa:iframe-element-rect',
  };

  if (data.click) {
    if (hoveredElements.length === 0) return;

// ...
```

---

### <a id="resetelementselector"></a>resetElementSelector

- **Type**: `function`
- **Parameters**: `data`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function resetElementSelector(data) {
  const prevSelectedList = document.querySelectorAll('[automa-el-list]');
  prevSelectedList.forEach((el) => {
    el.removeAttribute('automa-el-list');
  });

  if (data.clearCache) {
    hoveredElements = [];
    prevSelectedElement = null;
  }
}
```

---

### <a id="findelement"></a>findElement

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function findElement({ selector, selectorType, frameRect }) {
  const payload = {
    elements: [],
    type: 'automa:selected-elements',
  };

  try {
    const elements = FindElement[selectorType]({ multiple: true, selector });

    payload.elements = Array.from(elements || []).map((el) =>
      getElementRectWithOffset(el, {
        withAttributes: true,
        click: true,
        ...frameRect,
      })
// ...
```

---

### <a id="onmessage"></a>onMessage

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function onMessage({ data }) {
  switch (data.type) {
    case 'automa:get-element-rect':
      getElementsRect(data);
      break;
    case 'automa:reset-element-selector':
      resetElementSelector(data);
      break;
    case 'automa:find-element':
      findElement(data);
      break;
    default:
  }
}
```

---

### <a id="anonymous"></a>anonymous

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function () {
  window.addEventListener('message', onMessage);
}
```

---

