# index.js

**Path**: `background/index.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [executeCommands](#executecommands) | function | ✅ | `` |
| [func](#func) | object_property_method | ❌ | `` |
| [escapePolicy](#escapepolicy) | arrow_function | ❌ | `script` |
| [createHTML](#createhtml) | object_property_method | ❌ | `to_escape` |
| [createScript](#createscript) | object_property_method | ❌ | `to_escape` |
| [eventListener](#eventlistener) | arrow_function | ❌ | `{}` |
| [getAutomaScript](#getautomascript) | arrow_function | ❌ | `{}` |
| [func](#func) | object_property_method | ❌ | `$blockData, $preloadScripts, $automaScript` |
| [cleanUp](#cleanup) | arrow_function | ❌ | `` |
| [func](#func) | object_property_method | ❌ | `$callbackFn` |
| [getFileExtension](#getfileextension) | arrow_function | ❌ | `str` |
| [determineFilenameListener](#determinefilenamelistener) | function | ❌ | `item, suggest` |
| [handleDownloadChanged](#handledownloadchanged) | function | ❌ | `downloadDelta` |
| [handleDownloadCreated](#handledownloadcreated) | function | ✅ | `downloadItem` |
| [cleanupDownloadListeners](#cleanupdownloadlisteners) | function | ❌ | `` |
| [registerBackgroundDownloadListeners](#registerbackgrounddownloadlisteners) | function | ✅ | `` |
| [safeCallback](#safecallback) | arrow_function | ❌ | `response` |

## Detailed Description

### <a id="executecommands"></a>executeCommands

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function executeCommands() {
      const command = commands[index];
      if (!command) {
        resolve();
        return;
      }

      chrome.debugger.sendCommand(
        { tabId },
        'Input.dispatchKeyEvent',
        command,
        async () => {
          if (delay > 0) await sleep(delay);

          index += 1;
// ...
```

---

### <a id="func"></a>func

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**:

eslint-disable-next-line object-shorthand

**Implementation**:
```javascript
func: function () {
          return new Promise((resolve) => {
            const escapePolicy = (script) => {
              if (window?.trustedTypes?.createPolicy) {
                try {
                  // 尝试使用可能在CSP白名单中的名称
                  const policyNames = [
                    'default',
                    'dompurify',
                    'jSecure',
                    'forceInner',
                  ];
                  let escapeElPolicy = null;

                  // 尝试创建策略，如果一个名称失败，尝试下一个
// ...
```

---

### <a id="escapepolicy"></a>escapePolicy

- **Type**: `arrow_function`
- **Parameters**: `script`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(script) => {
              if (window?.trustedTypes?.createPolicy) {
                try {
                  // 尝试使用可能在CSP白名单中的名称
                  const policyNames = [
                    'default',
                    'dompurify',
                    'jSecure',
                    'forceInner',
                  ];
                  let escapeElPolicy = null;

                  // 尝试创建策略，如果一个名称失败，尝试下一个
                  for (const policyName of policyNames) {
                    try {
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

### <a id="eventlistener"></a>eventListener

- **Type**: `arrow_function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
({ srcElement }) => {
              if (!srcElement || srcElement.id !== 'automa-csp') return;
              srcElement.remove();
              resolve(true);
            }
```

---

### <a id="getautomascript"></a>getAutomaScript

- **Type**: `arrow_function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
({ varName, refData, everyNewTab, isEval = false }) => {
  let str = `
const ${varName} = ${JSON.stringify(refData)};
${automaRefDataStr(varName)}
function automaSetVariable(name, value) {
  const variables = ${varName}.variables;
  if (!variables) ${varName}.variables = {}

  ${varName}.variables[name] = value;
}
function automaNextBlock(data, insert = true) {
  if (${isEval}) {
    Promise.resolve({
      columns: {
        data,
// ...
```

---

### <a id="func"></a>func

- **Type**: `object_property_method`
- **Parameters**: `$blockData, $preloadScripts, $automaScript`
- **Description**: *No description provided.*

**Implementation**:
```javascript
func: ($blockData, $preloadScripts, $automaScript) => {
          return new Promise((resolve, reject) => {
            try {
              const $documentCtx = document;

              // fixme: 需要处理iframe的情况
              // if ($blockData.frameSelector) {
              //   const iframeCtx = getDocumentCtx($blockData.frameSelector);
              //   if (!iframeCtx) {
              //     reject(new Error('iframe-not-found'));
              //     return;
              //   }
              //   $documentCtx = iframeCtx;
              // }

// ...
```

---

### <a id="cleanup"></a>cleanUp

- **Type**: `arrow_function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
() => {
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

### <a id="func"></a>func

- **Type**: `object_property_method`
- **Parameters**: `$callbackFn`
- **Description**: *No description provided.*

**Implementation**:
```javascript
func: ($callbackFn) => {
        try {
          const script = document.createElement('script');
          script.textContent = `
          (() => {
            ${$callbackFn}
          })()
          `;
          document.body.appendChild(script);
          return { success: true };
        } catch (error) {
          console.error('执行脚本时出错:', error);
          return { success: false, error: error.message };
        }
      }
```

---

### <a id="getfileextension"></a>getFileExtension

- **Type**: `arrow_function`
- **Parameters**: `str`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(str) => /(?:\.([^.]+))?$/.exec(str)[1]
```

---

### <a id="determinefilenamelistener"></a>determineFilenameListener

- **Type**: `function`
- **Parameters**: `item, suggest`
- **Description**:

@param {Object} item

@param {Function} suggest

@returns {boolean}

**Implementation**:
```javascript
function determineFilenameListener(item, suggest) {
  const downloadKey = `download-${item.id}`;

  if (downloadListeners.suggestCalled.has(downloadKey)) {
    return true;
  }

  downloadListeners.suggestCalled.add(downloadKey);

  setTimeout(async () => {
    try {
      let suggestion = null;
      if (downloadListeners.downloadDataCache.has(item.id)) {
        suggestion = downloadListeners.downloadDataCache.get(item.id);
      } else {
// ...
```

---

### <a id="handledownloadchanged"></a>handleDownloadChanged

- **Type**: `function`
- **Parameters**: `downloadDelta`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function handleDownloadChanged(downloadDelta) {
  const { id, state, filename } = downloadDelta;

  if (!id || !downloadListeners.changedCallbacks.has(id)) return;

  if (!downloadListeners.downloadInfo.has(id)) {
    downloadListeners.downloadInfo.set(id, {
      downloadId: id,
      state: null,
      filename: null,
    });
  }

  const downloadInfo = downloadListeners.downloadInfo.get(id);

// ...
```

---

### <a id="handledownloadcreated"></a>handleDownloadCreated

- **Type**: `function`
- **Parameters**: `downloadItem`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function handleDownloadCreated(downloadItem) {
  try {
    let isHandled = false;
    const pendingDownloads = downloadListeners.pendingRequests || [];

    if (pendingDownloads.length > 0) {
      const pendingRequest = pendingDownloads.shift();
      const { downloadData, callback } = pendingRequest;

      // save to memory cache immediately to avoid race condition
      downloadListeners.downloadDataCache.set(downloadItem.id, downloadData);

      // save to storage
      const result = await browser.storage.session.get(DOWNLOADS_STORAGE_KEY);
      const filesData = result[DOWNLOADS_STORAGE_KEY] || {};
// ...
```

---

### <a id="cleanupdownloadlisteners"></a>cleanupDownloadListeners

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function cleanupDownloadListeners() {
  const MAX_AGE = 60 * 60 * 1000; // 1 hour
  const now = Date.now();

  if (downloadListeners.handledFilenameCallbacksTimestamp) {
    if (now - downloadListeners.handledFilenameCallbacksTimestamp > MAX_AGE) {
      downloadListeners.handledFilenameCallbacks.clear();
    }
  }

  downloadListeners.handledFilenameCallbacksTimestamp = now;
}
```

---

### <a id="registerbackgrounddownloadlisteners"></a>registerBackgroundDownloadListeners

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function registerBackgroundDownloadListeners() {
  if (!browser?.downloads) return;

  try {
    if (browser.downloads.onCreated.hasListener(handleDownloadCreated)) {
      browser.downloads.onCreated.removeListener(handleDownloadCreated);
    }

    if (
      !IS_FIREFOX &&
      browser.downloads.onDeterminingFilename &&
      browser.downloads.onDeterminingFilename.hasListener(
        determineFilenameListener
      )
    ) {
// ...
```

---

### <a id="safecallback"></a>safeCallback

- **Type**: `arrow_function`
- **Parameters**: `response`
- **Description**:

安全地包装回调函数

**Implementation**:
```javascript
(response) => {
      try {
        onComplete(response);
      } catch (callbackError) {
        console.error(
          '❌ failed to call download changed callback:',
          callbackError
        );
      }
    }
```

---

