# EditorUsedCredentials.vue

**Path**: `components/newtab/workflow/editor/EditorUsedCredentials.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [checkCredentials](#checkcredentials) | function | ❌ | `` |
| [jumpToBlock](#jumptoblock) | function | ❌ | `nodeId` |

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

### <a id="checkcredentials"></a>checkCredentials

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function checkCredentials() {
  const regex = /\{\{\s*secrets@(.*?)\}\}/;
  const tempCreds = [];

  props.editor.getNodes.value.forEach(({ label, id, data }) => {
    const keys = blocks[label]?.refDataKeys;
    if (!keys || !data) return;

    const usedCredentials = new Set();

    keys.forEach((key) => {
      const str = objectPath.get(data, key);
      const match = str?.match?.(regex);
      if (!match || !match[1]) return;

// ...
```

---

### <a id="jumptoblock"></a>jumpToBlock

- **Type**: `function`
- **Parameters**: `nodeId`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function jumpToBlock(nodeId) {
  const node = props.editor.getNode.value(nodeId);
  if (!node) return;

  const { x, y } = node.computedPosition;
  const editorContainer = document.querySelector('.vue-flow');
  const { width, height } = editorContainer.getBoundingClientRect();
  editorContainer.classList.add('add-transition');

  props.editor.setTransform({
    zoom: 1,
    x: -(x - width / 2),
    y: -(y - height / 2),
  });
  node.selected = true;
// ...
```

---

