# javascriptBlockUtil.js

**Path**: `workflowEngine/utils/javascriptBlockUtil.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [automaFetchClient](#automafetchclient) | function | ❌ | `id, {}` |
| [eventListener](#eventlistener) | arrow_function | ❌ | `{}` |
| [jsContentHandlerEval](#jscontenthandlereval) | function | ❌ | `{}` |
| [jsContentHandler](#jscontenthandler) | function | ❌ | `$blockData, $preloadScripts, $automaScript` |
| [cleanUp](#cleanup) | function | ❌ | `` |

## Detailed Description

### <a id="automafetchclient"></a>automaFetchClient

- **Type**: `function`
- **Parameters**: `id, {}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function automaFetchClient(id, { type, resource }) {
  return new Promise((resolve, reject) => {
    const validType = ['text', 'json', 'base64'];
    if (!type || !validType.includes(type)) {
      reject(new Error('The "type" must be "text" or "json"'));
      return;
    }

    const eventName = `__automa-fetch-response-${id}__`;
    const eventListener = ({ detail }) => {
      if (detail.id !== id) return;

      window.removeEventListener(eventName, eventListener);

      if (detail.isError) {
// ...
```

---

### <a id="eventlistener"></a>eventListener

- **Type**: `arrow_function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
({ detail }) => {
      if (detail.id !== id) return;

      window.removeEventListener(eventName, eventListener);

      if (detail.isError) {
        reject(new Error(detail.result));
      } else {
        resolve(detail.result);
      }
    }
```

---

### <a id="jscontenthandlereval"></a>jsContentHandlerEval

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function jsContentHandlerEval({
  blockData,
  automaScript,
  preloadScripts,
}) {
  const preloadScriptsStr = preloadScripts
    .map(({ script }) => script)
    .join('\n');

  return `(() => {
    ${preloadScriptsStr}

    return new Promise(($automaResolve) => {
      const $automaTimeoutMs = ${blockData.data.timeout};
      let $automaTimeout = setTimeout(() => {
// ...
```

---

### <a id="jscontenthandler"></a>jsContentHandler

- **Type**: `function`
- **Parameters**: `$blockData, $preloadScripts, $automaScript`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function jsContentHandler($blockData, $preloadScripts, $automaScript) {
  return new Promise((resolve, reject) => {
    try {
      let $documentCtx = document;

      if ($blockData.frameSelector) {
        const iframeCtx = getDocumentCtx($blockData.frameSelector);
        if (!iframeCtx) {
          reject(new Error('iframe-not-found'));
          return;
        }

        $documentCtx = iframeCtx;
      }

// ...
```

---

### <a id="cleanup"></a>cleanUp

- **Type**: `function`
- **Parameters**: ``
- **Description**:

eslint-disable-next-line

**Implementation**:
```javascript
function cleanUp() {
          script.remove();
          preloadScriptsEl.forEach((item) => {
            if (item.removeAfterExec) item.element.remove();
          });

          clearTimeout(timeout);

          $documentCtx.body.removeEventListener(
            '__automa-reset-timeout__',
            onResetTimeout
          );
          $documentCtx.body.removeEventListener(
            '__automa-next-block__',
            onNextBlock
// ...
```

---

