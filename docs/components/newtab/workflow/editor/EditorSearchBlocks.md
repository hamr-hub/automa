# EditorSearchBlocks.vue

**Path**: `components/newtab/workflow/editor/EditorSearchBlocks.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [searchNodes](#searchnodes) | function | ❌ | `{}` |
| [isMatch](#ismatch) | arrow_function | ❌ | `str` |
| [toggleActiveSearch](#toggleactivesearch) | function | ❌ | `` |
| [extractBlocks](#extractblocks) | function | ❌ | `` |
| [clearHighlightedNodes](#clearhighlightednodes) | function | ❌ | `` |
| [clearState](#clearstate) | function | ❌ | `` |
| [blurInput](#blurinput) | function | ❌ | `` |
| [onSelectItem](#onselectitem) | function | ❌ | `{}` |
| [onItemSelected](#onitemselected) | function | ❌ | `event` |

## Detailed Description

### <a id="default"></a>default

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
default: () => ({})
```

---

### <a id="searchnodes"></a>searchNodes

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function searchNodes({ item, text }) {
  const isMatch = (str) =>
    str.toLocaleLowerCase().includes(text.toLocaleLowerCase());

  return isMatch(item.id) || isMatch(item.name) || isMatch(item.description);
}
```

---

### <a id="ismatch"></a>isMatch

- **Type**: `arrow_function`
- **Parameters**: `str`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(str) =>
    str.toLocaleLowerCase().includes(text.toLocaleLowerCase())
```

---

### <a id="toggleactivesearch"></a>toggleActiveSearch

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function toggleActiveSearch() {
  state.active = !state.active;

  if (state.active) {
    document.querySelector('#search-blocks')?.focus();
  }
}
```

---

### <a id="extractblocks"></a>extractBlocks

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function extractBlocks() {
  const editorContainer = document.querySelector('.vue-flow');
  editorContainer.classList.add('add-transition');
  const { width, height } = editorContainer.getBoundingClientRect();

  initialState.rectX = width / 2;
  initialState.rectY = height / 2;
  initialState.position = props.editor.getTransform();

  state.autocompleteItems = props.editor.getNodes.value.map(
    ({ computedPosition, id, data, label }) => ({
      id,
      position: computedPosition,
      description: data.description || '',
      name: t(`workflow.blocks.${label}.name`),
// ...
```

---

### <a id="clearhighlightednodes"></a>clearHighlightedNodes

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function clearHighlightedNodes() {
  document.querySelectorAll('.search-select-node').forEach((el) => {
    el.classList.remove('search-select-node');
  });
}
```

---

### <a id="clearstate"></a>clearState

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function clearState() {
  if (!state.selected) {
    props.editor.setTransform(initialState.position);
  }

  state.query = '';
  state.active = false;
  state.selected = false;

  Object.assign(initialState, {
    rectX: 0,
    rectY: 0,
    position: {
      x: 0,
      y: 0,
// ...
```

---

### <a id="blurinput"></a>blurInput

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function blurInput() {
  document.querySelector('#search-blocks')?.blur();
}
```

---

### <a id="onselectitem"></a>onSelectItem

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function onSelectItem({ item }) {
  const { x, y } = item.position;
  const { rectX, rectY } = initialState;

  clearHighlightedNodes();
  document
    .querySelector(`[data-id="${item.id}"]`)
    ?.classList.add('search-select-node');

  props.editor.setTransform({
    zoom: 1,
    x: -(x - rectX),
    y: -(y - rectY),
  });
}
```

---

### <a id="onitemselected"></a>onItemSelected

- **Type**: `function`
- **Parameters**: `event`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function onItemSelected(event) {
  state.selected = true;

  const node = props.editor.getNode.value(event.item.id);
  props.editor.addSelectedNodes([node]);

  onSelectItem(event);
  blurInput();
}
```

---

