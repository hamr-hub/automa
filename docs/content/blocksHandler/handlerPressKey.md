# handlerPressKey.js

**Path**: `content/blocksHandler/handlerPressKey.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [pressKeyWithJs](#presskeywithjs) | function | ✅ | `{}` |
| [dispatchEvent](#dispatchevent) | arrow_function | ❌ | `` |
| [pressKeyWithCommand](#presskeywithcommand) | function | ✅ | `{}` |
| [pressKey](#presskey) | function | ✅ | `{}` |

## Detailed Description

### <a id="presskeywithjs"></a>pressKeyWithJs

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function pressKeyWithJs({ element, keys, pressTime }) {
  const details = {
    key: '',
    code: '',
    keyCode: '',
    bubbles: true,
    altKey: false,
    metaKey: false,
    ctrlKey: false,
    shiftKey: false,
    cancelable: true,
  };

  for (const event of ['keydown', 'keyup']) {
    for (const key of keys) {
// ...
```

---

### <a id="dispatchevent"></a>dispatchEvent

- **Type**: `arrow_function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
() => {
        const keyDefinition = keyDefinitions[key] || {
          key,
          keyCode: 0,
          code: isLetter ? `Key${key}` : key,
        };
        const keyboardEvent = new KeyboardEvent(event, {
          ...details,
          ...keyDefinition,
        });

        element.dispatchEvent(keyboardEvent);
      }
```

---

### <a id="presskeywithcommand"></a>pressKeyWithCommand

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function pressKeyWithCommand({
  keys,
  pressTime,
  actionType,
  activeTabId,
}) {
  const commands = [];
  const events =
    actionType === 'multiple-keys' ? ['keyDown'] : ['keyDown', 'keyUp'];

  for (const event of events) {
    let modifierKey = 0;

    for (const key of keys) {
      const command = {
// ...
```

---

### <a id="presskey"></a>pressKey

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function pressKey({ data, debugMode, activeTabId }) {
  let element = document.activeElement;

  if (data.selector) {
    const customElement = await queryElements({
      selector: data.selector,
      findBy: isXPath(data.selector) ? 'xpath' : 'cssSelector',
    });

    element = customElement || element;
  }

  const keys =
    !data.action || data.action === 'press-key'
      ? data.keys.split('+')
// ...
```

---

