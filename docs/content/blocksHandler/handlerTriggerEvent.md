# handlerTriggerEvent.js

**Path**: `content/blocksHandler/handlerTriggerEvent.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [[computed]](#-computed-) | object_property_method | ✅ | `{}` |
| [[computed]](#-computed-) | object_property_method | ✅ | `{}` |
| [triggerEvent](#triggerevent) | function | ❌ | `{}` |
| [onSelected](#onselected) | object_method | ✅ | `element` |
| [sendCommand](#sendcommand) | arrow_function | ❌ | `method, params?` |
| [onSuccess](#onsuccess) | object_method | ❌ | `` |
| [onError](#onerror) | object_method | ❌ | `error` |

## Detailed Description

### <a id="-computed-"></a>[computed]

- **Type**: `object_property_method`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
'mouse-event': async ({ params, sendCommand, name }) => {
    const mouseButtons = {
      0: { id: 1, name: 'left' },
      1: { id: 4, name: 'middle' },
      2: { id: 2, name: 'right' },
    };
    const commandParams = {
      button: mouseButtons[params.button]?.name || 'left',
    };

    if (params.clientX) commandParams.x = +params.clientX;
    if (params.clientY) commandParams.y = +params.clientY;

    Object.keys(modifiers).forEach((key) => {
      if (commandParams.modifiers) return;
// ...
```

---

### <a id="-computed-"></a>[computed]

- **Type**: `object_property_method`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
'keyboard-event': async ({ name, params, sendCommand }) => {
    const definition = keyDefinitions[params?.key];

    const commandParams = {
      key: params.key ?? '',
      code: params.code ?? '',
      autoRepeat: params.repeat,
      windowsVirtualKeyCode: params.keyCode ?? 0,
      type: name === 'keyup' ? 'keyUp' : 'keyDown',
    };

    if (definition.text || params.key.length === 1) {
      commandParams.text = definition.text || params.key;
    }

// ...
```

---

### <a id="triggerevent"></a>triggerEvent

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function triggerEvent({ data, id, frameSelector, debugMode, activeTabId }) {
  return new Promise((resolve, reject) => {
    handleSelector(
      { data, id, frameSelector },
      {
        async onSelected(element) {
          const eventHandler = eventHandlers[data.eventType];

          if (debugMode && eventHandler) {
            let elCoordinate = {};

            if (data.eventType === 'mouse-event') {
              const { x, y } = await getElementPosition(element);
              elCoordinate = { x, y };
            }
// ...
```

---

### <a id="onselected"></a>onSelected

- **Type**: `object_method`
- **Parameters**: `element`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async onSelected(element) {
          const eventHandler = eventHandlers[data.eventType];

          if (debugMode && eventHandler) {
            let elCoordinate = {};

            if (data.eventType === 'mouse-event') {
              const { x, y } = await getElementPosition(element);
              elCoordinate = { x, y };
            }

            const sendCommand = (method, params = {}) => {
              const payload = {
                method,
                params: {
// ...
```

---

### <a id="sendcommand"></a>sendCommand

- **Type**: `arrow_function`
- **Parameters**: `method, params?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(method, params = {}) => {
              const payload = {
                method,
                params: {
                  ...elCoordinate,
                  ...params,
                },
                tabId: activeTabId,
              };

              return sendMessage(
                'debugger:send-command',
                payload,
                'background'
              );
// ...
```

---

### <a id="onsuccess"></a>onSuccess

- **Type**: `object_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
onSuccess() {
          resolve(data.eventName);
        }
```

---

### <a id="onerror"></a>onError

- **Type**: `object_method`
- **Parameters**: `error`
- **Description**: *No description provided.*

**Implementation**:
```javascript
onError(error) {
          reject(error);
        }
```

---

