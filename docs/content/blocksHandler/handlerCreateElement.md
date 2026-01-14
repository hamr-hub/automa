# handlerCreateElement.js

**Path**: `content/blocksHandler/handlerCreateElement.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [createNode](#createnode) | function | ❌ | `tag, attrs?, content?` |
| [createElement](#createelement) | function | ✅ | `block` |

## Detailed Description

### <a id="createnode"></a>createNode

- **Type**: `function`
- **Parameters**: `tag, attrs?, content?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function createNode(tag, attrs = {}, content = '') {
  const element = document.createElement(tag);

  Object.keys(attrs).forEach((attr) => {
    element.setAttribute(attr, attrs[attr]);
  });
  element.innerHTML = content;

  return element;
}
```

---

### <a id="createelement"></a>createElement

- **Type**: `function`
- **Parameters**: `block`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function createElement(block) {
  const targetElement = await handleSelector(block);
  if (!targetElement) throw new Error('element-not-found');

  const { data, id } = block;
  const baseId = `automa-${id}`;

  if (data.insertAt === 'replace') {
    const fragments = createNode('template', {}, data.html);
    targetElement.replaceWith(fragments.content);
  } else {
    targetElement.insertAdjacentHTML(positions[data.insertAt], data.html);
  }

  if (data.css) {
// ...
```

---

