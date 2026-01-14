# App.vue

**Path**: `content/elementSelector/App.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [toggleHighlightElement](#togglehighlightelement) | function | ❌ | `{}` |
| [onElementsSelected](#onelementsselected) | function | ❌ | `{}` |
| [onMousemove](#onmousemove) | function | ❌ | `{}` |
| [selectElementPath](#selectelementpath) | function | ❌ | `type` |
| [onMouseup](#onmouseup) | function | ❌ | `` |
| [onMessage](#onmessage) | function | ❌ | `{}` |
| [destroy](#destroy) | function | ❌ | `` |
| [clearConnectedPort](#clearconnectedport) | function | ❌ | `` |
| [onVisibilityChange](#onvisibilitychange) | function | ❌ | `` |
| [saveSelector](#saveselector) | function | ❌ | `` |
| [attachListeners](#attachlisteners) | function | ❌ | `` |
| [detachListeners](#detachlisteners) | function | ❌ | `` |

## Detailed Description

### <a id="togglehighlightelement"></a>toggleHighlightElement

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function toggleHighlightElement({ index, highlight }) {
  state.selectedElements[index].highlight = highlight;
}
```

---

### <a id="onelementsselected"></a>onElementsSelected

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function onElementsSelected({ selector, elements, path, selectElements }) {
  if (path) {
    selectedElement.path = path;
    selectedElement.pathIndex = 0;
  }

  state.elSelector = selector;
  state.selectedElements = elements || [];
  state.selectElements = selectElements || [];
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
  if (!state.isDragging) return;

  const height = window.innerHeight;
  const width = document.documentElement.clientWidth;

  if (clientY < 10) clientY = 10;
  else if (cardRect.height + clientY > height)
    clientY = height - cardRect.height;

  if (clientX < 10) clientX = 10;
  else if (cardRect.width + clientX > width) clientX = width - cardRect.width;

  cardRect.x = clientX;
  cardRect.y = clientY;
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
    type === 'up'
      ? selectedElement.pathIndex + 1
      : selectedElement.pathIndex - 1;
  let element = selectedElement.path[pathIndex];

  if ((type === 'up' && !element) || element?.tagName === 'BODY') return;

  if (type === 'down' && !element) {
    const previousElement = selectedElement.path[selectedElement.pathIndex];
    const childEl = Array.from(previousElement.children).find(
      (el) => !['STYLE', 'SCRIPT'].includes(el.tagName)
    );

// ...
```

---

### <a id="onmouseup"></a>onMouseup

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function onMouseup() {
  if (state.isDragging) state.isDragging = false;
}
```

---

### <a id="onmessage"></a>onMessage

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function onMessage({ data }) {
  if (data.type !== 'automa:selected-elements') return;

  state.selectedElements = data.elements;
}
```

---

### <a id="destroy"></a>destroy

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function destroy() {
  rootElement.style.display = 'none';

  Object.assign(state, {
    hide: true,
    activeTab: '',
    elSelector: '',
    isDragging: false,
    isExecuting: false,
    hoveredElements: [],
    selectedElements: [],
  });

  const prevSelectedList = document.querySelectorAll('[automa-el-list]');
  prevSelectedList.forEach((element) => {
// ...
```

---

### <a id="clearconnectedport"></a>clearConnectedPort

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function clearConnectedPort() {
  if (!connectedPort) return;

  connectedPort = null;
  state.isSelectBlockElement = false;
}
```

---

### <a id="onvisibilitychange"></a>onVisibilityChange

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function onVisibilityChange() {
  if (!connectedPort || document.visibilityState !== 'hidden') return;

  clearConnectedPort();
}
```

---

### <a id="saveselector"></a>saveSelector

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function saveSelector() {
  if (!connectedPort) return;

  connectedPort.postMessage(state.elSelector);
  clearConnectedPort();
  destroy();
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
  cardElementObserver.observe(cardEl.value);

  window.addEventListener('message', onMessage);
  window.addEventListener('mouseup', onMouseup);
  window.addEventListener('mousemove', onMousemove);
  document.addEventListener('visibilitychange', onVisibilityChange);
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
  cardElementObserver.disconnect();

  window.removeEventListener('message', onMessage);
  window.removeEventListener('mouseup', onMouseup);
  window.removeEventListener('mousemove', onMousemove);
  document.removeEventListener('visibilitychange', onVisibilityChange);
}
```

---

