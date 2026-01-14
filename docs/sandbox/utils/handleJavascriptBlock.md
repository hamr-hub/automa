# handleJavascriptBlock.js

**Path**: `sandbox/utils/handleJavascriptBlock.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [anonymous](#anonymous) | function | ❌ | `data` |
| [cleanUp](#cleanup) | function | ❌ | `` |
| [nextBlock](#nextblock) | object_property_method | ❌ | `result` |
| [resetTimeout](#resettimeout) | object_property_method | ❌ | `` |
| [fetch](#fetch) | object_property_method | ❌ | `type, resource` |
| [eventListener](#eventlistener) | arrow_function | ❌ | `{}` |

## Detailed Description

### <a id="anonymous"></a>anonymous

- **Type**: `function`
- **Parameters**: `data`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function (data) {
  let timeout;
  const instanceId = nanoid();
  const scriptId = `script${data.id}`;
  const propertyName = `automa${data.id}`;

  const isScriptExists = document.querySelector(`#${scriptId}`);
  if (isScriptExists) {
    window.top.postMessage(
      {
        id: data.id,
        type: 'sandbox',
        result: {
          columns: {},
          variables: {},
// ...
```

---

### <a id="cleanup"></a>cleanUp

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function cleanUp() {
    script.remove();
    preloadScripts.forEach((preloadScript) => {
      preloadScript.remove();
    });

    delete window[propertyName];
  }
```

---

### <a id="nextblock"></a>nextBlock

- **Type**: `object_property_method`
- **Parameters**: `result`
- **Description**: *No description provided.*

**Implementation**:
```javascript
nextBlock: (result) => {
      cleanUp();
      window.top.postMessage(
        {
          id: data.id,
          type: 'sandbox',
          result: {
            variables: data?.refData?.variables,
            columns: {
              data: result?.data,
              insert: result?.insert,
            },
          },
        },
        '*'
// ...
```

---

### <a id="resettimeout"></a>resetTimeout

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
resetTimeout: () => {
      clearTimeout(timeout);
      timeout = setTimeout(cleanUp, data.blockData.timeout);
    }
```

---

### <a id="fetch"></a>fetch

- **Type**: `object_property_method`
- **Parameters**: `type, resource`
- **Description**: *No description provided.*

**Implementation**:
```javascript
fetch: (type, resource) => {
      return new Promise((resolve, reject) => {
        const types = ['json', 'text'];
        if (!type || !types.includes(type)) {
          reject(new Error('The "type" must be "text" or "json"'));
          return;
        }

        window.top.postMessage(
          {
            type: 'automa-fetch',
            data: { id: instanceId, type, resource },
          },
          '*'
        );
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
          window.removeEventListener(eventName, eventListener);

          if (detail.isError) {
            reject(new Error(detail.result));
          } else {
            resolve(detail.result);
          }
        }
```

---

