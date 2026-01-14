# handlerTakeScreenshot.js

**Path**: `content/blocksHandler/handlerTakeScreenshot.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [findScrollableElement](#findscrollableelement) | function | ❌ | `element?, maxDepth?` |
| [injectStyle](#injectstyle) | function | ❌ | `` |
| [canvasToBase64](#canvastobase64) | function | ❌ | `canvas, {}` |
| [loadAsyncImg](#loadasyncimg) | function | ❌ | `src` |
| [takeScreenshot](#takescreenshot) | function | ✅ | `tabId, options` |
| [captureElement](#captureelement) | function | ✅ | `{}` |
| [anonymous](#anonymous) | function | ✅ | `{}` |

## Detailed Description

### <a id="findscrollableelement"></a>findScrollableElement

- **Type**: `function`
- **Parameters**: `element?, maxDepth?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function findScrollableElement(
  element = document.documentElement,
  maxDepth = 5
) {
  if (maxDepth === 0) return null;

  const excludeTags = ['SCRIPT', 'STYLE', 'SVG', 'HEAD'];
  const isScrollable = element.scrollHeight > window.innerHeight;

  if (isScrollable) return element;

  for (let index = 0; index < element.childElementCount; index += 1) {
    const currentChild = element.children.item(index);
    const isExcluded =
      currentChild.tagName.includes('-') ||
// ...
```

---

### <a id="injectstyle"></a>injectStyle

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function injectStyle() {
  const style = document.createElement('style');
  style.innerText =
    'html::-webkit-scrollbar, body::-webkit-scrollbar, .automa-scrollable-el::-webkit-scrollbar{ width: 0 !important; height: 0 !important } body.is-screenshotting [is-sticky] { position: relative !important; } .hide-fixed [is-fixed] {visibility: hidden !important; opacity: 0 !important;}';
  style.id = 'automa-css-scroll';
  document.body.appendChild(style);

  return style;
}
```

---

### <a id="canvastobase64"></a>canvasToBase64

- **Type**: `function`
- **Parameters**: `canvas, {}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function canvasToBase64(canvas, { format, quality }) {
  return canvas.toDataURL(`image/${format}`, quality / 100);
}
```

---

### <a id="loadasyncimg"></a>loadAsyncImg

- **Type**: `function`
- **Parameters**: `src`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function loadAsyncImg(src) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      resolve(image);
    };
    image.src = src;
  });
}
```

---

### <a id="takescreenshot"></a>takeScreenshot

- **Type**: `function`
- **Parameters**: `tabId, options`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function takeScreenshot(tabId, options) {
  await sendMessage('set:active-tab', tabId, 'background');
  const imageUrl = await sendMessage(
    'get:tab-screenshot',
    options,
    'background'
  );

  return imageUrl;
}
```

---

### <a id="captureelement"></a>captureElement

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function captureElement({ selector, tabId, options, $frameRect }) {
  const element = await handleSelector(
    // ? not support frameSelector ?
    { data: { selector }, tabId },
    { returnElement: true }
  );

  if (!element) {
    const error = new Error('element-not-found');

    throw error;
  }

  element.scrollIntoView({
    block: 'center',
// ...
```

---

### <a id="anonymous"></a>anonymous

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function ({
  tabId,
  options,
  data: { type, selector, $frameRect },
}) {
  if (type === 'element') {
    const imageUrl = await captureElement({
      tabId,
      options,
      selector,
      $frameRect,
    });

    return imageUrl;
  }
// ...
```

---

