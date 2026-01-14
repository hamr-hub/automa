# App.vue

**Path**: `content/services/recordWorkflow/App.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [stopRecording](#stoprecording) | function | ❌ | `` |
| [getElementBlocks](#getelementblocks) | function | ❌ | `element` |
| [onElementsSelected](#onelementsselected) | function | ❌ | `{}` |
| [addFlowItem](#addflowitem) | function | ❌ | `` |
| [selectElementPath](#selectelementpath) | function | ❌ | `type` |
| [clearSelectState](#clearselectstate) | function | ❌ | `` |
| [saveElementListId](#saveelementlistid) | function | ❌ | `` |
| [toggleDragging](#toggledragging) | function | ❌ | `value, event` |
| [onKeyup](#onkeyup) | function | ❌ | `{}` |
| [startSelecting](#startselecting) | function | ❌ | `list?` |
| [onMousemove](#onmousemove) | function | ❌ | `{}` |
| [attachListeners](#attachlisteners) | function | ❌ | `` |
| [detachListeners](#detachlisteners) | function | ❌ | `` |

## Detailed Description

### <a id="stoprecording"></a>stopRecording

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function stopRecording() {
  browser.runtime.sendMessage({
    type: 'background--recording:stop',
  });
}
```

---

### <a id="getelementblocks"></a>getElementBlocks

- **Type**: `function`
- **Parameters**: `element`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function getElementBlocks(element) {
  if (!element) return;

  const elTag = element.tagName;
  const blocks = [...(blocksList[elTag] || blocksList.default)];
  const attrBlockIndex = blocks.indexOf('attribute-value');

  if (attrBlockIndex !== -1) {
    addBlockState.attributes = element.attributes;
  }

  addBlockState.blocks = blocks;
}
```

---

### <a id="onelementsselected"></a>onElementsSelected

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function onElementsSelected({ selector, elements, path }) {
  if (path) {
    elementsPath.path = path;
    selectState.pathIndex = 0;
  }

  getElementBlocks(elements[0]);
  selectState.selectedElements = elements;

  if (selectState.list) {
    if (!selectState.listSelector) {
      selectState.isInList = false;
      selectState.listSelector = selector;
      selectState.childSelector = selector;
      return;
// ...
```

---

### <a id="addflowitem"></a>addFlowItem

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function addFlowItem() {
  const saveData = Boolean(addBlockState.column);
  const assignVariable = Boolean(addBlockState.varName);
  const block = {
    id: addBlockState.activeBlock,
    data: {
      saveData,
      assignVariable,
      waitForSelector: true,
      dataColumn: addBlockState.column,
      variableName: addBlockState.varName,
      selector: selectState.list
        ? selectState.listSelector
        : selectState.childSelector,
    },
// ...
```

---

### <a id="selectelementpath"></a>selectElementPath

- **Type**: `function`
- **Parameters**: `type`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function selectElementPath(type) {
  let pathIndex =
    type === 'up' ? selectState.pathIndex + 1 : selectState.pathIndex - 1;
  let element = elementsPath.path[pathIndex];

  if ((type === 'up' && !element) || element?.tagName === 'BODY') return;

  if (type === 'down' && !element) {
    const previousElement = elementsPath.path[selectState.pathIndex];
    const childEl = Array.from(previousElement.children).find(
      (el) => !['STYLE', 'SCRIPT'].includes(el.tagName)
    );

    if (!childEl) return;

// ...
```

---

### <a id="clearselectstate"></a>clearSelectState

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function clearSelectState() {
  if (selectState.list && selectState.listId) {
    addBlock({
      id: 'loop-breakpoint',
      description: selectState.listId,
      data: {
        loopId: selectState.listId,
      },
    });
  }

  selectState.listId = '';
  selectState.list = false;
  selectState.status = 'idle';
  selectState.listSelector = '';
// ...
```

---

### <a id="saveelementlistid"></a>saveElementListId

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function saveElementListId() {
  if (!tempListId.value) return;

  selectState.listId = toCamelCase(tempListId.value);
  tempListId.value = '';

  addBlock({
    id: 'loop-data',
    description: selectState.listId,
    data: {
      loopThrough: 'elements',
      loopId: selectState.listId,
      elementSelector: selectState.listSelector,
    },
  });
// ...
```

---

### <a id="toggledragging"></a>toggleDragging

- **Type**: `function`
- **Parameters**: `value, event`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function toggleDragging(value, event) {
  if (value) {
    const bounds = rootEl.value.getBoundingClientRect();
    const y = event.clientY - bounds.top;
    const x = event.clientX - bounds.left;

    mouseRelativePos.x = x;
    mouseRelativePos.y = y;
  } else {
    mouseRelativePos.x = 0;
    mouseRelativePos.y = 0;
  }

  draggingState.dragging = value;
}
```

---

### <a id="onkeyup"></a>onKeyup

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function onKeyup({ key }) {
  if (key !== 'Escape') return;

  clearSelectState();

  window.removeEventListener('keyup', onKeyup);
}
```

---

### <a id="startselecting"></a>startSelecting

- **Type**: `function`
- **Parameters**: `list?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function startSelecting(list = false) {
  selectState.list = list;
  selectState.isSelecting = true;
  selectState.status = 'selecting';

  document.body.setAttribute('automa-selecting', '');

  window.addEventListener('keyup', onKeyup);
}
```

---

### <a id="onmousemove"></a>onMousemove

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function onMousemove({ clientX, clientY }) {
  if (!draggingState.dragging) return;

  draggingState.xPos = clientX - mouseRelativePos.x;
  draggingState.yPos = clientY - mouseRelativePos.y;
}
```

---

### <a id="attachlisteners"></a>attachListeners

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function attachListeners() {
  window.addEventListener('mousemove', onMousemove);
}
```

---

### <a id="detachlisteners"></a>detachListeners

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function detachListeners() {
  window.removeEventListener('keyup', onKeyup);
  window.removeEventListener('mousemove', onMousemove);
}
```

---

