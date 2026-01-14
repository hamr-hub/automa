# handlerForms.js

**Path**: `content/blocksHandler/handlerForms.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [forms](#forms) | function | ✅ | `block` |
| [typeText](#typetext) | function | ✅ | `element` |

## Detailed Description

### <a id="forms"></a>forms

- **Type**: `function`
- **Parameters**: `block`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function forms(block) {
  const { data } = block;
  const elements = await handleSelector(block, { returnElement: true });

  if (!elements) {
    throw new Error('element-not-found');
  }

  if (data.getValue) {
    let result = '';

    if (data.multiple) {
      result = elements.map((element) => element.value || '');
    } else {
      result = elements.value || '';
// ...
```

---

### <a id="typetext"></a>typeText

- **Type**: `function`
- **Parameters**: `element`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function typeText(element) {
    if (block.debugMode && data.type === 'text-field') {
      // get lock
      await synchronizedLock.getLock();
      element.focus?.();

      try {
        if (data.clearValue) {
          const backspaceCommands = new Array(element.value?.length ?? 0).fill({
            type: 'rawKeyDown',
            unmodifiedText: 'Delete',
            text: 'Delete',
            windowsVirtualKeyCode: 46,
          });

// ...
```

---

