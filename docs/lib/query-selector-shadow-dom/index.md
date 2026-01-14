# index.js

**Path**: `lib/query-selector-shadow-dom/index.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [querySelectorAllDeep](#queryselectoralldeep) | function | ❌ | `selector, root?, allElements?` |
| [querySelectorDeep](#queryselectordeep) | function | ❌ | `selector, root?, allElements?` |
| [_querySelectorDeep](#-queryselectordeep) | function | ❌ | `selector, findMany, root, allElements?` |
| [findMatchingElement](#findmatchingelement) | function | ❌ | `splitSelector, possibleElementsIndex, root` |
| [splitByCharacterUnlessQuoted](#splitbycharacterunlessquoted) | function | ❌ | `selector, character` |
| [isDocumentNode](#isdocumentnode) | function | ❌ | `node` |
| [findParentOrHost](#findparentorhost) | function | ❌ | `element, root` |
| [getShadowRoot](#getshadowroot) | arrow_function | ❌ | `element` |
| [collectAllElementsDeep](#collectallelementsdeep) | function | ❌ | `selector?, root, cachedElements?` |
| [findAllElements](#findallelements) | function_expression | ❌ | `nodes` |

## Detailed Description

### <a id="queryselectoralldeep"></a>querySelectorAllDeep

- **Type**: `function`
- **Parameters**: `selector, root?, allElements?`
- **Description**:

Finds first matching elements on the page that may be in a shadow root using a complex selector of n-depth

Don't have to specify all shadow roots to button, tree is travered to find the correct element

Example querySelectorAllDeep('downloads-item:nth-child(4) #remove');

Example should work on chrome://downloads outputting the remove button inside of a download card component

Example find first active download link element querySelectorDeep('#downloads-list .is-active a[href^="https://"]');

Another example querySelectorAllDeep('#downloads-list div#title-area + a');

e.g.

**Implementation**:
```javascript
function querySelectorAllDeep(
  selector,
  root = document,
  allElements = null
) {
  return _querySelectorDeep(selector, true, root, allElements);
}
```

---

### <a id="queryselectordeep"></a>querySelectorDeep

- **Type**: `function`
- **Parameters**: `selector, root?, allElements?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function querySelectorDeep(
  selector,
  root = document,
  allElements = null
) {
  return _querySelectorDeep(selector, false, root, allElements);
}
```

---

### <a id="-queryselectordeep"></a>_querySelectorDeep

- **Type**: `function`
- **Parameters**: `selector, findMany, root, allElements?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function _querySelectorDeep(selector, findMany, root, allElements = null) {
  selector = normalizeSelector(selector);
  const lightElement = root.querySelector(selector);

  if (document.head.createShadowRoot || document.head.attachShadow) {
    // no need to do any special if selector matches something specific in light-dom
    if (!findMany && lightElement) {
      return lightElement;
    }

    // split on commas because those are a logical divide in the operation
    const selectionsToMake = splitByCharacterUnlessQuoted(selector, ',');

    return selectionsToMake.reduce(
      (acc, minimalSelector) => {
// ...
```

---

### <a id="findmatchingelement"></a>findMatchingElement

- **Type**: `function`
- **Parameters**: `splitSelector, possibleElementsIndex, root`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function findMatchingElement(splitSelector, possibleElementsIndex, root) {
  return (element) => {
    let position = possibleElementsIndex;
    let parent = element;
    let foundElement = false;
    while (parent && !isDocumentNode(parent)) {
      let foundMatch = true;
      if (splitSelector[position].length === 1) {
        foundMatch = parent.matches(splitSelector[position]);
      } else {
        // selector is in the format "a > b"
        // make sure a few parents match in order
        const reversedParts = [].concat(splitSelector[position]).reverse();
        let newParent = parent;
        for (const part of reversedParts) {
// ...
```

---

### <a id="splitbycharacterunlessquoted"></a>splitByCharacterUnlessQuoted

- **Type**: `function`
- **Parameters**: `selector, character`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function splitByCharacterUnlessQuoted(selector, character) {
  return selector.match(/\\?.|^$/g).reduce(
    (p, c) => {
      if (c === '"' && !p.sQuote) {
        p.quote ^= 1;
        p.a[p.a.length - 1] += c;
      } else if (c === "'" && !p.quote) {
        p.sQuote ^= 1;
        p.a[p.a.length - 1] += c;
      } else if (!p.quote && !p.sQuote && c === character) {
        p.a.push('');
      } else {
        p.a[p.a.length - 1] += c;
      }
      return p;
// ...
```

---

### <a id="isdocumentnode"></a>isDocumentNode

- **Type**: `function`
- **Parameters**: `node`
- **Description**:

Checks if the node is a document node or not.

@param {Node} node

@returns {node is Document | DocumentFragment}

**Implementation**:
```javascript
function isDocumentNode(node) {
  return (
    node.nodeType === Node.DOCUMENT_FRAGMENT_NODE ||
    node.nodeType === Node.DOCUMENT_NODE
  );
}
```

---

### <a id="findparentorhost"></a>findParentOrHost

- **Type**: `function`
- **Parameters**: `element, root`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function findParentOrHost(element, root) {
  const { parentNode } = element;
  return parentNode && parentNode.host && parentNode.nodeType === 11
    ? parentNode.host
    : parentNode === root
    ? null
    : parentNode;
}
```

---

### <a id="getshadowroot"></a>getShadowRoot

- **Type**: `arrow_function`
- **Parameters**: `element`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(element) => {
  if (element === document) return element;

  return BROWSER_TYPE === 'firefox'
    ? element.openOrClosedShadowRoot
    : chrome.dom.openOrClosedShadowRoot(element);
}
```

---

### <a id="collectallelementsdeep"></a>collectAllElementsDeep

- **Type**: `function`
- **Parameters**: `selector?, root, cachedElements?`
- **Description**:

Finds all elements on the page, inclusive of those within shadow roots.

@param {string=} selector Simple selector to filter the elements by. e.g. 'a', 'div.main'

@return {!Array<string>} List of anchor hrefs.

@author ebidel@ (Eric Bidelman)

License Apache-2.0

**Implementation**:
```javascript
function collectAllElementsDeep(
  selector = null,
  root,
  cachedElements = null
) {
  let allElements = [];

  if (cachedElements) {
    allElements = cachedElements;
  } else {
    const findAllElements = function (nodes) {
      for (let i = 0; i < nodes.length; i++) {
        const el = nodes[i];
        allElements.push(el);

// ...
```

---

### <a id="findallelements"></a>findAllElements

- **Type**: `function_expression`
- **Parameters**: `nodes`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function (nodes) {
      for (let i = 0; i < nodes.length; i++) {
        const el = nodes[i];
        allElements.push(el);

        const shadowRoot = getShadowRoot(el);
        // If the element has a shadow root, dig deeper.
        if (shadowRoot) {
          findAllElements(shadowRoot.querySelectorAll('*'));
        }
      }
    }
```

---

