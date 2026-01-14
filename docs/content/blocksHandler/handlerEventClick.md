# handlerEventClick.js

**Path**: `content/blocksHandler/handlerEventClick.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [eventClick](#eventclick) | function | ❌ | `block` |
| [onSelected](#onselected) | object_method | ✅ | `element` |
| [executeCommand](#executecommand) | arrow_function | ❌ | `type` |
| [onError](#onerror) | object_method | ❌ | `error` |
| [onSuccess](#onsuccess) | object_method | ❌ | `` |

## Detailed Description

### <a id="eventclick"></a>eventClick

- **Type**: `function`
- **Parameters**: `block`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function eventClick(block) {
  return new Promise((resolve, reject) => {
    handleSelector(block, {
      async onSelected(element) {
        if (block.debugMode) {
          const { x, y } = await getElementPosition(element);
          const payload = {
            tabId: block.activeTabId,
            method: 'Input.dispatchMouseEvent',
            params: {
              x,
              y,
              button: 'left',
            },
          };
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
        if (block.debugMode) {
          const { x, y } = await getElementPosition(element);
          const payload = {
            tabId: block.activeTabId,
            method: 'Input.dispatchMouseEvent',
            params: {
              x,
              y,
              button: 'left',
            },
          };
          const executeCommand = (type) => {
            payload.params.type = type;

// ...
```

---

### <a id="executecommand"></a>executeCommand

- **Type**: `arrow_function`
- **Parameters**: `type`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(type) => {
            payload.params.type = type;

            if (type === 'mousePressed') {
              payload.params.clickCount = 1;
            }

            return sendMessage('debugger:send-command', payload, 'background');
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

### <a id="onsuccess"></a>onSuccess

- **Type**: `object_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
onSuccess() {
        resolve('');
      }
```

---

