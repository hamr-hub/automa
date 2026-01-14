# utils.js

**Path**: `content/utils.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [simulateClickElement](#simulateclickelement) | function | ❌ | `element` |
| [generateLoopSelectors](#generateloopselectors) | function | ❌ | `elements, {}` |
| [elementSelectorInstance](#elementselectorinstance) | function | ❌ | `` |
| [getElementRect](#getelementrect) | function | ❌ | `target, withAttributes` |
| [getElementPath](#getelementpath) | function | ❌ | `el, root?` |
| [generateXPath](#generatexpath) | function | ❌ | `element, root?` |
| [automaRefDataStr](#automarefdatastr) | function | ❌ | `varName` |
| [messageTopFrame](#messagetopframe) | function | ❌ | `windowCtx` |
| [messageListener](#messagelistener) | arrow_function | ❌ | `{}` |
| [getElementPosition](#getelementposition) | function | ✅ | `element` |

## Detailed Description

### <a id="simulateclickelement"></a>simulateClickElement

- **Type**: `function`
- **Parameters**: `element`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function simulateClickElement(element) {
  const eventOpts = { bubbles: true, view: window };

  element.dispatchEvent(new MouseEvent('mousedown', eventOpts));
  element.dispatchEvent(new MouseEvent('mouseup', eventOpts));

  if (element.click) {
    element.click();
  } else {
    element.dispatchEvent(new PointerEvent('click', { bubbles: true }));
  }

  element.focus?.();
}
```

---

### <a id="generateloopselectors"></a>generateLoopSelectors

- **Type**: `function`
- **Parameters**: `elements, {}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function generateLoopSelectors(
  elements,
  { max, attrId, frameSelector, reverseLoop, startIndex = 0 }
) {
  const selectors = [];
  let elementsList = elements;

  if (reverseLoop) {
    elementsList = Array.from(elements).reverse();
  }

  elementsList.forEach((el, index) => {
    if (max > 0 && selectors.length - 1 > max) return;

    const attrName = 'automa-loop';
// ...
```

---

### <a id="elementselectorinstance"></a>elementSelectorInstance

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function elementSelectorInstance() {
  const rootElementExist = document.querySelector(
    '#app-container.automa-element-selector'
  );

  if (rootElementExist) {
    rootElementExist.style.display = 'block';

    return true;
  }

  return false;
}
```

---

### <a id="getelementrect"></a>getElementRect

- **Type**: `function`
- **Parameters**: `target, withAttributes`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function getElementRect(target, withAttributes) {
  if (!target) return {};

  const { x, y, height, width } = target.getBoundingClientRect();
  const result = {
    width: width + 4,
    height: height + 4,
    x: x - 2,
    y: y - 2,
  };

  if (withAttributes) {
    const attributes = {};

    Array.from(target.attributes).forEach(({ name, value }) => {
// ...
```

---

### <a id="getelementpath"></a>getElementPath

- **Type**: `function`
- **Parameters**: `el, root?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function getElementPath(el, root = document.documentElement) {
  const path = [el];

  /* eslint-disable-next-line */
  while ((el = el.parentNode) && !el.isEqualNode(root)) {
    path.push(el);
  }

  return path;
}
```

---

### <a id="generatexpath"></a>generateXPath

- **Type**: `function`
- **Parameters**: `element, root?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function generateXPath(element, root = document.body) {
  if (!element) return null;
  if (element.id !== '') return `id("${element.id}")`;
  if (element === root) return `//${element.tagName}`;

  let ix = 0;
  const siblings = element.parentNode.childNodes;

  for (let index = 0; index < siblings.length; index += 1) {
    const sibling = siblings[index];

    if (sibling === element) {
      return `${generateXPath(element.parentNode)}/${element.tagName}[${
        ix + 1
      }]`;
// ...
```

---

### <a id="automarefdatastr"></a>automaRefDataStr

- **Type**: `function`
- **Parameters**: `varName`
- **Description**:

no used

**Implementation**:
```javascript
function automaRefDataStr(varName) {
  return `
function findData(obj, path) {
  const paths = path.split('.');
  const isWhitespace = paths.length === 1 && !/\\\\S/.test(paths[0]);

  if (path.startsWith('$last') && Array.isArray(obj)) {
    paths[0] = obj.length - 1;
  }

  if (paths.length === 0 || isWhitespace) return obj;
  else if (paths.length === 1) return obj[paths[0]];

  let result = obj;

// ...
```

---

### <a id="messagetopframe"></a>messageTopFrame

- **Type**: `function`
- **Parameters**: `windowCtx`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function messageTopFrame(windowCtx) {
  return new Promise((resolve) => {
    let timeout = null;

    const messageListener = ({ data }) => {
      if (data.type !== 'automa:the-frame-rect') return;

      clearTimeout(timeout);
      windowCtx.removeEventListener('message', messageListener);
      resolve(data.frameRect);
    };

    timeout = setTimeout(() => {
      windowCtx.removeEventListener('message', messageListener);
      resolve(null);
// ...
```

---

### <a id="messagelistener"></a>messageListener

- **Type**: `arrow_function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
({ data }) => {
      if (data.type !== 'automa:the-frame-rect') return;

      clearTimeout(timeout);
      windowCtx.removeEventListener('message', messageListener);
      resolve(data.frameRect);
    }
```

---

### <a id="getelementposition"></a>getElementPosition

- **Type**: `function`
- **Parameters**: `element`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function getElementPosition(element) {
  const elWindow = element.ownerDocument.defaultView;
  const isInFrame = elWindow !== window.top;
  const { width, height, x, y } = element.getBoundingClientRect();

  const position = {
    x: x + width / 2,
    y: y + height / 2,
  };

  if (!isInFrame) return position;

  try {
    const frameEl = elWindow.frameElement;
    let frameRect = null;
// ...
```

---

