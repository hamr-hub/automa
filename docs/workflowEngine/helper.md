# helper.js

**Path**: `workflowEngine/helper.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [escapeElementPolicy](#escapeelementpolicy) | function | ❌ | `script` |
| [createHTML](#createhtml) | object_property_method | ❌ | `to_escape` |
| [createScript](#createscript) | object_property_method | ❌ | `to_escape` |
| [messageSandbox](#messagesandbox) | function | ❌ | `type, data?` |
| [messageListener](#messagelistener) | arrow_function | ❌ | `{}` |
| [getFrames](#getframes) | function | ✅ | `tabId` |
| [sendDebugCommand](#senddebugcommand) | function | ❌ | `tabId, method, params?` |
| [attachDebugger](#attachdebugger) | function | ✅ | `tabId, prevTab` |
| [waitTabLoaded](#waittabloaded) | function | ❌ | `{}` |
| [onErrorOccurred](#onerroroccurred) | arrow_function | ❌ | `details` |
| [activeTabStatus](#activetabstatus) | arrow_function | ❌ | `` |
| [convertData](#convertdata) | function | ❌ | `data, type` |
| [automaRefDataStr](#automarefdatastr) | function | ❌ | `varName` |
| [injectPreloadScript](#injectpreloadscript) | function | ❌ | `{}` |
| [func](#func) | object_property_method | ❌ | `preloadScripts, frame` |
| [checkCSPAndInject](#checkcspandinject) | function | ✅ | `{}, callback` |
| [fallbackCopyTextToClipboard](#fallbackcopytexttoclipboard) | function | ❌ | `text` |
| [copyTextToClipboard](#copytexttoclipboard) | function | ❌ | `text` |

## Detailed Description

### <a id="escapeelementpolicy"></a>escapeElementPolicy

- **Type**: `function`
- **Parameters**: `script`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function escapeElementPolicy(script) {
  if (window?.trustedTypes?.createPolicy) {
    try {
      // 尝试使用可能在CSP白名单中的名称
      const policyNames = ['default', 'dompurify', 'jSecure', 'forceInner'];
      let escapePolicy = null;

      // 尝试创建策略，如果一个名称失败，尝试下一个
      for (const policyName of policyNames) {
        try {
          escapePolicy = window.trustedTypes.createPolicy(policyName, {
            createHTML: (to_escape) => to_escape,
            createScript: (to_escape) => to_escape,
          });
          // 如果成功创建，跳出循环
// ...
```

---

### <a id="createhtml"></a>createHTML

- **Type**: `object_property_method`
- **Parameters**: `to_escape`
- **Description**: *No description provided.*

**Implementation**:
```javascript
createHTML: (to_escape) => to_escape
```

---

### <a id="createscript"></a>createScript

- **Type**: `object_property_method`
- **Parameters**: `to_escape`
- **Description**: *No description provided.*

**Implementation**:
```javascript
createScript: (to_escape) => to_escape
```

---

### <a id="messagesandbox"></a>messageSandbox

- **Type**: `function`
- **Parameters**: `type, data?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function messageSandbox(type, data = {}) {
  const nanoid = customAlphabet('1234567890abcdef', 5);

  return new Promise((resolve) => {
    const messageId = nanoid();

    const iframeEl = document.getElementById('sandbox');
    iframeEl.contentWindow.postMessage({ id: messageId, type, ...data }, '*');

    const messageListener = ({ data: messageData }) => {
      if (messageData?.type !== 'sandbox' || messageData?.id !== messageId)
        return;

      window.removeEventListener('message', messageListener);

// ...
```

---

### <a id="messagelistener"></a>messageListener

- **Type**: `arrow_function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
({ data: messageData }) => {
      if (messageData?.type !== 'sandbox' || messageData?.id !== messageId)
        return;

      window.removeEventListener('message', messageListener);

      resolve(messageData.result);
    }
```

---

### <a id="getframes"></a>getFrames

- **Type**: `function`
- **Parameters**: `tabId`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function getFrames(tabId) {
  try {
    const frames = await BrowserAPIService.webNavigation.getAllFrames({
      tabId,
    });
    const framesObj = frames.reduce((acc, { frameId, url }) => {
      const key = url === 'about:blank' ? '' : url;

      acc[key] = frameId;

      return acc;
    }, {});

    return framesObj;
  } catch (error) {
// ...
```

---

### <a id="senddebugcommand"></a>sendDebugCommand

- **Type**: `function`
- **Parameters**: `tabId, method, params?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function sendDebugCommand(tabId, method, params = {}) {
  return new Promise((resolve) => {
    BrowserAPIService.debugger.sendCommand({ tabId }, method, params, resolve);
  });
}
```

---

### <a id="attachdebugger"></a>attachDebugger

- **Type**: `function`
- **Parameters**: `tabId, prevTab`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function attachDebugger(tabId, prevTab) {
  try {
    if (prevTab && tabId !== prevTab) {
      await BrowserAPIService.debugger.detach({ tabId: prevTab });
    }

    // first attach
    await BrowserAPIService.debugger.attach({ tabId }, '1.3');

    // and then Page.enable
    await BrowserAPIService.debugger.sendCommand({ tabId }, 'Page.enable');

    return true;
  } catch (error) {
    console.error('Failed to attach debugger:', error);
// ...
```

---

### <a id="waittabloaded"></a>waitTabLoaded

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function waitTabLoaded({ tabId, listenError = false, ms = 10000 }) {
  return new Promise((resolve, reject) => {
    let timeout = null;
    const excludeErrors = ['net::ERR_BLOCKED_BY_CLIENT', 'net::ERR_ABORTED'];

    const onErrorOccurred = (details) => {
      if (
        details.tabId !== tabId ||
        details.frameId !== 0 ||
        excludeErrors.includes(details.error)
      )
        return;

      clearTimeout(timeout);
      BrowserAPIService.webNavigation.onErrorOccurred.removeListener(
// ...
```

---

### <a id="onerroroccurred"></a>onErrorOccurred

- **Type**: `arrow_function`
- **Parameters**: `details`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(details) => {
      if (
        details.tabId !== tabId ||
        details.frameId !== 0 ||
        excludeErrors.includes(details.error)
      )
        return;

      clearTimeout(timeout);
      BrowserAPIService.webNavigation.onErrorOccurred.removeListener(
        onErrorOccurred
      );
      reject(new Error(details.error));
    }
```

---

### <a id="activetabstatus"></a>activeTabStatus

- **Type**: `arrow_function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
() => {
      BrowserAPIService.tabs.get(tabId).then((tab) => {
        if (!tab) {
          reject(new Error('no-tab'));
          return;
        }

        if (tab.status === 'loading') {
          setTimeout(() => {
            activeTabStatus();
          }, 1000);
          return;
        }

        clearTimeout(timeout);
// ...
```

---

### <a id="convertdata"></a>convertData

- **Type**: `function`
- **Parameters**: `data, type`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function convertData(data, type) {
  if (type === 'any') return data;

  let result = data;

  switch (type) {
    case 'integer':
      /* eslint-disable-next-line */
      result = typeof data !== 'number' ? +data?.replace(/\D+/g, '') : data;
      break;
    case 'boolean':
      result = Boolean(data);
      break;
    case 'array':
      result = Array.from(data);
// ...
```

---

### <a id="automarefdatastr"></a>automaRefDataStr

- **Type**: `function`
- **Parameters**: `varName`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function automaRefDataStr(varName) {
  return `
function findData(obj, path) {
  const paths = path.split('.');
  const isWhitespace = paths.length === 1 && !/\\S/.test(paths[0]);

  if (path.startsWith('$last') && Array.isArray(obj)) {
    paths[0] = obj.length - 1;
  }

  if (paths.length === 0 || isWhitespace) return obj;
  else if (paths.length === 1) return obj[paths[0]];

  let result = obj;

// ...
```

---

### <a id="injectpreloadscript"></a>injectPreloadScript

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function injectPreloadScript({ target, scripts, frameSelector }) {
  return browser.scripting.executeScript({
    target,
    world: 'MAIN',
    args: [scripts, frameSelector || null],
    func: (preloadScripts, frame) => {
      let $documentCtx = document;

      if (frame) {
        const iframeCtx = document.querySelector(frame)?.contentDocument;
        if (!iframeCtx) return;

        $documentCtx = iframeCtx;
      }

// ...
```

---

### <a id="func"></a>func

- **Type**: `object_property_method`
- **Parameters**: `preloadScripts, frame`
- **Description**: *No description provided.*

**Implementation**:
```javascript
func: (preloadScripts, frame) => {
      let $documentCtx = document;

      if (frame) {
        const iframeCtx = document.querySelector(frame)?.contentDocument;
        if (!iframeCtx) return;

        $documentCtx = iframeCtx;
      }

      preloadScripts.forEach((script) => {
        const scriptAttr = `block--${script.id}`;

        const isScriptExists = $documentCtx.querySelector(
          `.automa-custom-js[${scriptAttr}]`
// ...
```

---

### <a id="checkcspandinject"></a>checkCSPAndInject

- **Type**: `function`
- **Parameters**: `{}, callback`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function checkCSPAndInject(
  { target, debugMode, options = {}, injectOptions = {} },
  callback
) {
  let _callback = '';
  if (typeof callback === 'function') {
    _callback = callback.toString();
  } else if (typeof callback === 'string') {
    _callback = callback;
  }

  try {
    const result = await MessageListener.sendMessage(
      'check-csp-and-inject',
      {
// ...
```

---

### <a id="fallbackcopytexttoclipboard"></a>fallbackCopyTextToClipboard

- **Type**: `function`
- **Parameters**: `text`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function fallbackCopyTextToClipboard(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;

  // Avoid scrolling to bottom
  textArea.style.top = '0';
  textArea.style.left = '0';
  textArea.style.position = 'fixed';

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    document.execCommand('copy');
// ...
```

---

### <a id="copytexttoclipboard"></a>copyTextToClipboard

- **Type**: `function`
- **Parameters**: `text`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function copyTextToClipboard(text) {
  return new Promise((resolve, reject) => {
    if (!navigator.clipboard) {
      fallbackCopyTextToClipboard(text);
      resolve(true);
      return;
    }
    navigator.clipboard
      .writeText(text)
      .then(() => {
        resolve(true);
      })
      .catch((error) => {
        reject(error);
      });
// ...
```

---

