# SharedElementSelector.vue

**Path**: `components/content/shared/SharedElementSelector.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [default](#default) | object_property_method | ❌ | `` |
| [getElementRectWithOffset](#getelementrectwithoffset) | function | ❌ | `element, ?` |
| [removeElementsList](#removeelementslist) | function | ❌ | `` |
| [resetFramesElements](#resetframeselements) | function | ❌ | `options?` |
| [retrieveElementsRect](#retrieveelementsrect) | function | ❌ | `{}, type` |
| [onMousemove](#onmousemove) | function | ❌ | `event` |
| [onKeydown](#onkeydown) | function | ❌ | `event` |
| [onMousedown](#onmousedown) | function | ❌ | `event` |
| [onMessage](#onmessage) | function | ❌ | `{}` |
| [tagName](#tagname) | object_property_method | ❌ | `` |
| [attachListeners](#attachlisteners) | function | ❌ | `` |
| [detachListeners](#detachlisteners) | function | ❌ | `` |

## Detailed Description

### <a id="default"></a>default

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
default: () => []
```

---

### <a id="default"></a>default

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
default: () => ({})
```

---

### <a id="getelementrectwithoffset"></a>getElementRectWithOffset

- **Type**: `function`
- **Parameters**: `element, ?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function getElementRectWithOffset(
  element,
  { withAttribute, withElOptions } = {}
) {
  const rect = getElementRect(element, withAttribute);

  if (frameElementRect) {
    rect.y += frameElementRect.top;
    rect.x += frameElementRect.left;
  }
  if (withElOptions && element.tagName === 'SELECT') {
    rect.options = Array.from(element.querySelectorAll('option')).map((el) => ({
      value: el.value,
      name: el.innerText,
    }));
// ...
```

---

### <a id="removeelementslist"></a>removeElementsList

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function removeElementsList() {
  const prevSelectedList = document.querySelectorAll('[automa-el-list]');
  prevSelectedList.forEach((el) => {
    el.removeAttribute('automa-el-list');
  });
}
```

---

### <a id="resetframeselements"></a>resetFramesElements

- **Type**: `function`
- **Parameters**: `options?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function resetFramesElements(options = {}) {
  const elements = document.querySelectorAll('iframe, frame');

  elements.forEach((element) => {
    element.contentWindow.postMessage(
      {
        ...options,
        type: 'automa:reset-element-selector',
      },
      '*'
    );
  });
}
```

---

### <a id="retrieveelementsrect"></a>retrieveElementsRect

- **Type**: `function`
- **Parameters**: `{}, type`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function retrieveElementsRect({ clientX, clientY, target: eventTarget }, type) {
  const isAutomaContainer = eventTarget.classList.contains(
    'automa-element-selector'
  );
  if (props.disabled || isAutomaContainer) return;

  const isSelectList = props.list && props.selectorType === 'css';

  let { 1: target } = document.elementsFromPoint(clientX, clientY);
  if (!target) return;

  const onlyInList = props.onlyInList && elementsState.selected.length > 0;
  const framesEl = ['IFRAME', 'FRAME'];

  if (framesEl.includes(target.tagName)) {
// ...
```

---

### <a id="onmousemove"></a>onMousemove

- **Type**: `function`
- **Parameters**: `event`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function onMousemove(event) {
  if (props.pause) return;

  mousePosition.x = event.clientX;
  mousePosition.y = event.clientY;
  retrieveElementsRect(event, 'hovered');
}
```

---

### <a id="onkeydown"></a>onKeydown

- **Type**: `function`
- **Parameters**: `event`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function onKeydown(event) {
  if (props.pause || event.repeat || event.code !== 'Space') return;

  const { 1: selectedElement } = document.elementsFromPoint(
    mousePosition.x,
    mousePosition.y
  );
  if (selectedElement.id === 'automa-selector-overlay') return;

  event.preventDefault();
  event.stopPropagation();

  retrieveElementsRect(
    {
      target: selectedElement,
// ...
```

---

### <a id="onmousedown"></a>onMousedown

- **Type**: `function`
- **Parameters**: `event`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function onMousedown(event) {
  if (event.target.id === 'automa-selector-overlay') {
    event.preventDefault();
    event.stopPropagation();
  }
  retrieveElementsRect(event, 'selected');
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
  if (data.type !== 'automa:iframe-element-rect') return;
  if (data.click) {
    const frameSelector =
      props.selectorType === 'css'
        ? finder(frameElement, { tagName: () => true })
        : generateXPath(frameElement);

    emit('selected', {
      elements: data.elements,
      selector: `${frameSelector} |> ${data.selector}`,
    });
  }

  const key = data.click ? 'selected' : 'hovered';
// ...
```

---

### <a id="tagname"></a>tagName

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
tagName: () => true
```

---

### <a id="attachlisteners"></a>attachListeners

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function attachListeners() {
  window.addEventListener('scroll', onScroll);
  window.addEventListener('message', onMessage);
  document.addEventListener('keydown', onKeydown);
  window.addEventListener('mousemove', onMousemove);
  document.addEventListener('mousedown', onMousedown);
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
  window.removeEventListener('scroll', onScroll);
  window.removeEventListener('message', onMessage);
  document.removeEventListener('keydown', onKeydown);
  window.removeEventListener('mousemove', onMousemove);
  document.removeEventListener('mousedown', onMousedown);
}
```

---

