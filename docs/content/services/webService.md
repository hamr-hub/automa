# webService.js

**Path**: `content/services/webService.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [initWebListener](#initweblistener) | function | ❌ | `` |
| [on](#on) | function | ❌ | `name, callback` |
| [sendMessageBack](#sendmessageback) | function | ❌ | `type, payload?` |
| [upgrade](#upgrade) | object_method | ❌ | `event` |
| [setUserSession](#setusersession) | arrow_function | ✅ | `` |

## Detailed Description

### <a id="initweblistener"></a>initWebListener

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function initWebListener() {
  const listeners = {};

  function on(name, callback) {
    (listeners[name] = listeners[name] || []).push(callback);
  }

  window.addEventListener('__automa-ext__', ({ detail }) => {
    if (!detail || !objectHasKey(listeners, detail.type)) return;

    listeners[detail.type].forEach((listener) => {
      listener(detail.data);
    });
  });

// ...
```

---

### <a id="on"></a>on

- **Type**: `function`
- **Parameters**: `name, callback`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function on(name, callback) {
    (listeners[name] = listeners[name] || []).push(callback);
  }
```

---

### <a id="sendmessageback"></a>sendMessageBack

- **Type**: `function`
- **Parameters**: `type, payload?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function sendMessageBack(type, payload = {}) {
  const event = new CustomEvent(`__automa-ext__${type}`, {
    detail: payload,
  });

  window.dispatchEvent(event);
}
```

---

### <a id="upgrade"></a>upgrade

- **Type**: `object_method`
- **Parameters**: `event`
- **Description**: *No description provided.*

**Implementation**:
```javascript
upgrade(event) {
        event.createObjectStore('store');
      }
```

---

### <a id="setusersession"></a>setUserSession

- **Type**: `arrow_function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async () => {
      const saveToStorage = { session: webStorageAuthData };

      const isGoogleProvider =
        webStorageAuthData?.user?.user_metadata?.iss.includes('google.com');
      const { session: currSession, sessionToken: currSessionToken } =
        await browser.storage.local.get(['session', 'sessionToken']);
      if (
        isGoogleProvider &&
        ((webStorageAuthData &&
          webStorageAuthData.user.id === currSession?.user.id) ||
          !currSessionToken)
      ) {
        saveToStorage.sessionToken = {
          access: webStorageAuthData.provider_token,
// ...
```

---

