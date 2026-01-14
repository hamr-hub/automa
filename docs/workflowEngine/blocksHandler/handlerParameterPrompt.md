# handlerParameterPrompt.js

**Path**: `workflowEngine/blocksHandler/handlerParameterPrompt.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [getInputtedParams](#getinputtedparams) | function | ❌ | `promptId, ms?` |
| [storageListener](#storagelistener) | arrow_function | ❌ | `event` |
| [renderParamValue](#renderparamvalue) | function | ✅ | `param, refData, isPopup` |
| [anonymous](#anonymous) | function | ✅ | `{}, {}` |

## Detailed Description

### <a id="getinputtedparams"></a>getInputtedParams

- **Type**: `function`
- **Parameters**: `promptId, ms?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function getInputtedParams(promptId, ms = 10000) {
  return new Promise((resolve, reject) => {
    const timeout = null;

    const storageListener = (event) => {
      if (!event[promptId]) return;

      clearTimeout(timeout);
      BrowserAPIService.storage.onChanged.removeListener(storageListener);
      BrowserAPIService.storage.local.remove(promptId);

      const { newValue } = event[promptId];
      if (newValue.$isError) {
        reject(new Error(newValue.message));
        return;
// ...
```

---

### <a id="storagelistener"></a>storageListener

- **Type**: `arrow_function`
- **Parameters**: `event`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(event) => {
      if (!event[promptId]) return;

      clearTimeout(timeout);
      BrowserAPIService.storage.onChanged.removeListener(storageListener);
      BrowserAPIService.storage.local.remove(promptId);

      const { newValue } = event[promptId];
      if (newValue.$isError) {
        reject(new Error(newValue.message));
        return;
      }

      resolve(newValue);
    }
```

---

### <a id="renderparamvalue"></a>renderParamValue

- **Type**: `function`
- **Parameters**: `param, refData, isPopup`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function renderParamValue(param, refData, isPopup) {
  const renderedVals = {};

  const keys = ['defaultValue', 'description', 'placeholder'];
  await Promise.allSettled(
    keys.map(async (key) => {
      if (!param[key]) return;
      renderedVals[key] = (
        await renderString(param[key], refData, isPopup)
      ).value;
    })
  );

  return { ...param, ...renderedVals };
}
```

---

### <a id="anonymous"></a>anonymous

- **Type**: `function`
- **Parameters**: `{}, {}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function ({ data, id }, { refData }) {
  const paramURL = BrowserAPIService.runtime.getURL('/params.html');
  let tab = (await BrowserAPIService.tabs.query({})).find((item) =>
    item.url.includes(paramURL)
  );

  if (!tab) {
    const { tabs } = await BrowserAPIService.windows.create({
      type: 'popup',
      width: 480,
      height: 600,
      url: BrowserAPIService.runtime.getURL('/params.html'),
    });
    [tab] = tabs;
    await sleep(1000);
// ...
```

---

