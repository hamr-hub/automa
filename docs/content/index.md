# index.js

**Path**: `content/index.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [messageToFrame](#messagetoframe) | function | ❌ | `frameElement, blockData` |
| [onMessage](#onmessage) | function | ❌ | `{}` |
| [executeBlock](#executeblock) | function | ✅ | `data` |
| [frameError](#frameerror) | arrow_function | ❌ | `message` |
| [messageListener](#messagelistener) | function | ✅ | `{}` |
| [getMediaSrc](#getmediasrc) | arrow_function | ❌ | `element` |
| [asyncExecuteBlock](#asyncexecuteblock) | arrow_function | ✅ | `block` |
| [sendResponse](#sendresponse) | arrow_function | ❌ | `payload` |

## Detailed Description

### <a id="messagetoframe"></a>messageToFrame

- **Type**: `function`
- **Parameters**: `frameElement, blockData`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function messageToFrame(frameElement, blockData) {
  return new Promise((resolve, reject) => {
    function onMessage({ data }) {
      if (data.type !== 'automa:block-execute-result') return;

      if (data.result?.$isError) {
        const error = new Error(data.result.message);
        error.data = data.result.data;

        reject(error);
      } else {
        resolve(data.result);
      }

      window.removeEventListener('message', onMessage);
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
      if (data.type !== 'automa:block-execute-result') return;

      if (data.result?.$isError) {
        const error = new Error(data.result.message);
        error.data = data.result.data;

        reject(error);
      } else {
        resolve(data.result);
      }

      window.removeEventListener('message', onMessage);
    }
```

---

### <a id="executeblock"></a>executeBlock

- **Type**: `function`
- **Parameters**: `data`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function executeBlock(data) {
  const removeExecutedBlock = showExecutedBlock(data, data.executedBlockOnWeb);
  if (data.data?.selector?.includes('|>')) {
    const selectorsArr = data.data.selector.split('|>');
    const selector = selectorsArr.pop();
    const frameSelector = selectorsArr.join('|>');

    const frameElSelector = selectorsArr.pop();

    let findBy = data?.data?.findBy;
    if (!findBy) {
      findBy = isXPath(frameSelector) ? 'xpath' : 'cssSelector';
    }

    const documentCtx = getDocumentCtx(selectorsArr.join('|>'));
// ...
```

---

### <a id="frameerror"></a>frameError

- **Type**: `arrow_function`
- **Parameters**: `message`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(message) => {
      const error = new Error(message);
      error.data = { selector: frameSelector };

      return error;
    }
```

---

### <a id="messagelistener"></a>messageListener

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function messageListener({ data, source }) {
  try {
    if (data.type === 'automa:get-frame' && isMainFrame) {
      let frameRect = { x: 0, y: 0 };

      document.querySelectorAll('iframe').forEach((iframe) => {
        if (iframe.contentWindow !== source) return;

        frameRect = iframe.getBoundingClientRect();
      });

      source.postMessage(
        {
          frameRect,
          type: 'automa:the-frame-rect',
// ...
```

---

### <a id="getmediasrc"></a>getMediaSrc

- **Type**: `arrow_function`
- **Parameters**: `element`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(element) => {
        let mediaSrc = element.src || '';

        if (!mediaSrc.src) {
          const sourceEl = element.querySelector('source');
          if (sourceEl) mediaSrc = sourceEl.src;
        }

        return mediaSrc;
      }
```

---

### <a id="asyncexecuteblock"></a>asyncExecuteBlock

- **Type**: `arrow_function`
- **Parameters**: `block`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async (block) => {
      try {
        const res = await executeBlock(block);
        return res;
      } catch (error) {
        console.error(error);
        const elNotFound = error.message === 'element-not-found';
        const isLoopItem = data.data?.selector?.includes('automa-loop');

        if (!elNotFound || !isLoopItem) return Promise.reject(error);

        const findLoopEl = data.loopEls.find(({ url }) =>
          window.location.href.includes(url)
        );

// ...
```

---

### <a id="sendresponse"></a>sendResponse

- **Type**: `arrow_function`
- **Parameters**: `payload`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(payload) => {
    window.dispatchEvent(
      new CustomEvent(`__automa-fetch-response-${id}__`, {
        detail: { id, ...payload },
      })
    );
  }
```

---

