# BrowserAPIService.js

**Path**: `service/browser-api/BrowserAPIService.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [sendBrowserApiMessage](#sendbrowserapimessage) | function | ❌ | `name, ...args` |
| [isContentScriptInjected](#iscontentscriptinjected) | method | ✅ | `target, messageId` |
| [inject](#inject) | method | ✅ | `{}` |
| [checkIfInjected](#checkifinjected) | arrow_function | ✅ | `` |
| [isInjected](#isinjected) | method | ✅ | `{}, messageId` |
| [runtimeMessageHandler](#runtimemessagehandler) | method | ❌ | `{}` |

## Detailed Description

### <a id="sendbrowserapimessage"></a>sendBrowserApiMessage

- **Type**: `function`
- **Parameters**: `name, ...args`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function sendBrowserApiMessage(name, ...args) {
  const serializedArgs = serializeFunctions(args);

  return MessageListener.sendMessage(
    'browser-api',
    {
      name,
      args: serializedArgs,
    },
    'background'
  );
}
```

---

### <a id="iscontentscriptinjected"></a>isContentScriptInjected

- **Type**: `method`
- **Parameters**: `target, messageId`
- **Description**:

Check if content script injected

@param {ScriptInjectTarget} target

@param {string=} messageId

**Implementation**:
```javascript
static async isContentScriptInjected(target, messageId) {
    if (!IS_BROWSER_API_AVAILABLE) {
      return sendBrowserApiMessage(
        'contentScript.isContentScriptInjected',
        ...arguments
      );
    }

    try {
      // 发送测试消息到目标标签页
      await Browser.tabs.sendMessage(
        target.tabId,
        { type: messageId || 'content-script-exists' },
        {
          frameId: target.allFrames ? undefined : target.frameId,
// ...
```

---

### <a id="inject"></a>inject

- **Type**: `method`
- **Parameters**: `{}`
- **Description**:

Inject content script into targeted tab

@param {Object} script

@param {ScriptInjectTarget} script.target

@param {string} script.file

@param {boolean=} script.injectImmediately

@param {(boolean|{timeoutMs?: number, maxTry?: number, messageId?: string})=} script.waitUntilInjected

@returns {Promise<boolean>}

**Implementation**:
```javascript
static async inject({ file, target, injectImmediately, waitUntilInjected }) {
    if (!IS_BROWSER_API_AVAILABLE) {
      return sendBrowserApiMessage('contentScript.inject', ...arguments);
    }

    const frameId =
      Object.hasOwn(target, 'frameId') && !target.allFrames
        ? target.frameId
        : undefined;

    // MV2 or firefox
    if (Browser.tabs.injectContentScript) {
      await Browser.tabs.executeScript(target.tabId, {
        file,
        frameId,
// ...
```

---

### <a id="checkifinjected"></a>checkIfInjected

- **Type**: `arrow_function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async () => {
        try {
          if (tryCount > maxTryCount) {
            resolve(false);
            return;
          }

          tryCount += 1;

          const isInjected = await BrowserContentScript.isContentScriptInjected(
            target,
            waitUntilInjected.messageId
          );
          if (isInjected) {
            resolve(true);
// ...
```

---

### <a id="isinjected"></a>isInjected

- **Type**: `method`
- **Parameters**: `{}, messageId`
- **Description**:

Check if content script injected

@param {ScriptInjectTarget} target

@param {string=} messageId

**Implementation**:
```javascript
static async isInjected({ tabId, allFrames, frameId }, messageId) {
    if (!IS_BROWSER_API_AVAILABLE) {
      return sendBrowserApiMessage('contentScript.isInjected', ...arguments);
    }

    try {
      await Browser.tabs.sendMessage(
        tabId,
        { type: messageId || 'content-script-exists' },
        { frameId: allFrames ? undefined : frameId }
      );

      return true;
    } catch (error) {
      return false;
// ...
```

---

### <a id="runtimemessagehandler"></a>runtimeMessageHandler

- **Type**: `method`
- **Parameters**: `{}`
- **Description**:

Handle runtime message that send by BrowserAPIService when API is not available

@param {{ name: string; args: any[] }} payload;

**Implementation**:
```javascript
static runtimeMessageHandler({ args, name }) {
    const deserializedArgs = deserializeFunctions(args);
    const apiHandler = objectPath.get(this, name);
    if (!apiHandler) throw new Error(`"${name}" is invalid method`);

    return deserializedArgs ? apiHandler(...deserializedArgs) : apiHandler();
  }
```

---

