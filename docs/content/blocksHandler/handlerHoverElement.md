# handlerHoverElement.js

**Path**: `content/blocksHandler/handlerHoverElement.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [eventClick](#eventclick) | function | ❌ | `block` |
| [onSelected](#onselected) | object_method | ✅ | `element` |
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
        const { x, y } = await getElementPosition(element);
        const payload = {
          tabId: block.activeTabId,
          method: 'Input.dispatchMouseEvent',
          params: {
            x,
            y,
            clickCount: 1,
            button: 'left',
            type: 'mousePressed',
          },
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
        const { x, y } = await getElementPosition(element);
        const payload = {
          tabId: block.activeTabId,
          method: 'Input.dispatchMouseEvent',
          params: {
            x,
            y,
            clickCount: 1,
            button: 'left',
            type: 'mousePressed',
          },
        };

        await sendMessage('debugger:send-command', payload, 'background');
// ...
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

