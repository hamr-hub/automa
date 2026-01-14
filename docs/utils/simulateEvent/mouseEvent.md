# mouseEvent.js

**Path**: `utils/simulateEvent/mouseEvent.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [anonymous](#anonymous) | function | ❌ | `{}` |
| [mousedown](#mousedown) | function | ✅ | `` |
| [mouseup](#mouseup) | function | ✅ | `` |
| [click](#click) | function | ✅ | `` |
| [dblclick](#dblclick) | function | ✅ | `` |
| [mousemove](#mousemove) | function | ✅ | `` |
| [mouseenter](#mouseenter) | function | ✅ | `` |
| [mouseleave](#mouseleave) | function | ✅ | `` |

## Detailed Description

### <a id="anonymous"></a>anonymous

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function ({ sendCommand, commandParams }) {
  async function mousedown() {
    commandParams.type = 'mousePressed';
    await sendCommand('Input.dispatchMouseEvent', commandParams);
  }
  async function mouseup() {
    commandParams.type = 'mouseReleased';
    await sendCommand('Input.dispatchMouseEvent', commandParams);
  }
  async function click() {
    if (!commandParams.clickCount) commandParams.clickCount = 1;

    await mousedown();
    await mouseup();
  }
// ...
```

---

### <a id="mousedown"></a>mousedown

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function mousedown() {
    commandParams.type = 'mousePressed';
    await sendCommand('Input.dispatchMouseEvent', commandParams);
  }
```

---

### <a id="mouseup"></a>mouseup

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function mouseup() {
    commandParams.type = 'mouseReleased';
    await sendCommand('Input.dispatchMouseEvent', commandParams);
  }
```

---

### <a id="click"></a>click

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function click() {
    if (!commandParams.clickCount) commandParams.clickCount = 1;

    await mousedown();
    await mouseup();
  }
```

---

### <a id="dblclick"></a>dblclick

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function dblclick() {
    commandParams.clickCount = 2;
    await click();
  }
```

---

### <a id="mousemove"></a>mousemove

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function mousemove() {
    commandParams.type = 'mouseMoved';
    await sendCommand('Input.dispatchMouseEvent', commandParams);
  }
```

---

### <a id="mouseenter"></a>mouseenter

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function mouseenter() {
    await mousemove();
  }
```

---

### <a id="mouseleave"></a>mouseleave

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function mouseleave() {
    await mousemove();

    commandParams.x = -100;
    commandParams.y = -100;
    await mousemove();
  }
```

---

