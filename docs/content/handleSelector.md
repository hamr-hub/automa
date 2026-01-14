# handleSelector.js

**Path**: `content/handleSelector.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [markElement](#markelement) | function | ❌ | `el, {}` |
| [getDocumentCtx](#getdocumentctx) | function | ❌ | `frameSelector` |
| [queryElements](#queryelements) | function | ❌ | `data, documentCtx?` |
| [findSelector](#findselector) | arrow_function | ❌ | `` |
| [anonymous](#anonymous) | function | ✅ | `{}, ?` |

## Detailed Description

### <a id="markelement"></a>markElement

- **Type**: `function`
- **Parameters**: `el, {}`
- **Description**:

eslint-disable consistent-return

**Implementation**:
```javascript
function markElement(el, { id, data }) {
  if (data.markEl) {
    el.setAttribute(`block--${id}`, '');
  }
}
```

---

### <a id="getdocumentctx"></a>getDocumentCtx

- **Type**: `function`
- **Parameters**: `frameSelector`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function getDocumentCtx(frameSelector) {
  if (!frameSelector) return document;

  let documentCtx = document;

  const iframeSelectors = frameSelector.split('|>');
  const type = isXPath(frameSelector) ? 'xpath' : 'cssSelector';
  iframeSelectors.forEach((selector) => {
    if (!documentCtx) return;

    const element = FindElement[type]({ selector }, documentCtx);
    documentCtx = element?.contentDocument;
  });

  return documentCtx;
// ...
```

---

### <a id="queryelements"></a>queryElements

- **Type**: `function`
- **Parameters**: `data, documentCtx?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function queryElements(data, documentCtx = document) {
  return new Promise((resolve) => {
    let timeout = null;
    let isTimeout = false;

    const findSelector = () => {
      if (isTimeout) return;

      const selectorType = data.findBy || 'cssSelector';
      const elements = FindElement[selectorType](data, documentCtx);
      const isElNotFound = !elements || elements.length === 0;

      if (isElNotFound && data.waitForSelector) {
        setTimeout(findSelector, 200);
      } else {
// ...
```

---

### <a id="findselector"></a>findSelector

- **Type**: `arrow_function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
() => {
      if (isTimeout) return;

      const selectorType = data.findBy || 'cssSelector';
      const elements = FindElement[selectorType](data, documentCtx);
      const isElNotFound = !elements || elements.length === 0;

      if (isElNotFound && data.waitForSelector) {
        setTimeout(findSelector, 200);
      } else {
        if (timeout) clearTimeout(timeout);
        resolve(elements);
      }
    }
```

---

### <a id="anonymous"></a>anonymous

- **Type**: `function`
- **Parameters**: `{}, ?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function (
  { data, id, frameSelector, debugMode },
  { onSelected, onError, onSuccess, withDocument } = {}
) {
  if (!data || !data.selector) {
    if (onError) onError(new Error('selector-empty'));
    return null;
  }

  const documentCtx = getDocumentCtx(frameSelector);

  if (!documentCtx) {
    if (onError) onError(new Error('iframe-not-found'));

    return null;
// ...
```

---

