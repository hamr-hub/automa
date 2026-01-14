# listSelector.js

**Path**: `content/elementSelector/listSelector.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [getAllSiblings](#getallsiblings) | function | ❌ | `el, selector` |
| [validateElement](#validateelement) | arrow_function | ❌ | `element` |
| [getCssPath](#getcsspath) | function | ❌ | `el, root?` |
| [getElementList](#getelementlist) | function | ❌ | `el, maxDepth?, paths?` |
| [anonymous](#anonymous) | function | ❌ | `target, ?` |
| [idName](#idname) | object_property_method | ❌ | `` |

## Detailed Description

### <a id="getallsiblings"></a>getAllSiblings

- **Type**: `function`
- **Parameters**: `el, selector`
- **Description**:

eslint-disable  no-cond-assign

**Implementation**:
```javascript
function getAllSiblings(el, selector) {
  const siblings = [el];

  const validateElement = (element) => {
    const isValidSelector = selector ? element.querySelector(selector) : true;
    const isSameTag = el.tagName === element.tagName;

    return isValidSelector && isSameTag;
  };

  let nextSibling = el;
  let prevSibling = el;
  let elementIndex = 1;

  while ((prevSibling = prevSibling?.previousElementSibling)) {
// ...
```

---

### <a id="validateelement"></a>validateElement

- **Type**: `arrow_function`
- **Parameters**: `element`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(element) => {
    const isValidSelector = selector ? element.querySelector(selector) : true;
    const isSameTag = el.tagName === element.tagName;

    return isValidSelector && isSameTag;
  }
```

---

### <a id="getcsspath"></a>getCssPath

- **Type**: `function`
- **Parameters**: `el, root?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function getCssPath(el, root = document.body) {
  if (!el) return null;

  const path = [];

  while (el.nodeType === Node.ELEMENT_NODE && !el.isSameNode(root)) {
    let selector = el.nodeName.toLowerCase();

    if (el.id) {
      selector += `#${el.id}`;

      path.unshift(selector);
    } else {
      let nth = 1;
      let sib = el;
// ...
```

---

### <a id="getelementlist"></a>getElementList

- **Type**: `function`
- **Parameters**: `el, maxDepth?, paths?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function getElementList(el, maxDepth = 50, paths = []) {
  if (maxDepth === 0 || !el || el.tagName === 'BODY') return null;

  let selector = el.tagName.toLowerCase();
  const { elements, index } = getAllSiblings(el, paths.join(' > '));
  let siblings = elements;

  if (index !== 1) selector += `:nth-of-type(${index})`;

  paths.unshift(selector);

  if (siblings.length === 1) {
    siblings = getElementList(el.parentElement, maxDepth - 1, paths);
  }

// ...
```

---

### <a id="anonymous"></a>anonymous

- **Type**: `function`
- **Parameters**: `target, ?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function (
  target,
  { frameElement, onlyInList, selectorSettings } = {}
) {
  if (!target) return [];

  const automaListEl = target.closest('[automa-el-list]');
  let documentCtx = document;

  if (frameElement) {
    documentCtx = frameElement.contentDocument;
  }

  if (automaListEl) {
    if (target.hasAttribute('automa-el-list')) return [];
// ...
```

---

### <a id="idname"></a>idName

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
idName: () => false
```

---

