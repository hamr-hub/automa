# BlockGroup.vue

**Path**: `components/block/BlockGroup.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [default](#default) | object_property_method | ❌ | `` |
| [default](#default) | object_property_method | ❌ | `` |
| [editItemSettings](#edititemsettings) | function | ❌ | `element` |
| [onDragStart](#ondragstart) | function | ❌ | `item, event` |
| [onDragEnd](#ondragend) | function | ❌ | `itemId` |
| [editBlock](#editblock) | function | ❌ | `payload` |
| [deleteItem](#deleteitem) | function | ❌ | `index, itemId` |
| [getTranslation](#gettranslation) | function | ❌ | `key, defText?` |
| [handleDrop](#handledrop) | function | ❌ | `event` |
| [toggleBreakpoint](#togglebreakpoint) | function | ❌ | `item, index` |

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

### <a id="default"></a>default

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
default: () => ({})
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

### <a id="edititemsettings"></a>editItemSettings

- **Type**: `function`
- **Parameters**: `element`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function editItemSettings(element) {
  emit('settings', {
    blockId: props.id,
    data: element.data,
    itemId: element.itemId,
    details: { id: element.id },
  });
}
```

---

### <a id="ondragstart"></a>onDragStart

- **Type**: `function`
- **Parameters**: `item, event`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function onDragStart(item, event) {
  event.dataTransfer.setData(
    'block',
    JSON.stringify({ ...tasks[item.id], ...item, fromGroup: true })
  );
}
```

---

### <a id="ondragend"></a>onDragEnd

- **Type**: `function`
- **Parameters**: `itemId`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function onDragEnd(itemId) {
  setTimeout(() => {
    const blockEl = document.querySelector(`[group-item-id="${itemId}"]`);

    if (blockEl) {
      const blockIndex = blocks.value.findIndex(
        (item) => item.itemId === itemId
      );

      if (blockIndex !== -1) {
        const copyBlocks = [...props.data.blocks];
        copyBlocks.splice(blockIndex, 1);
        emit('update', { blocks: copyBlocks });
      }
    }
// ...
```

---

### <a id="editblock"></a>editBlock

- **Type**: `function`
- **Parameters**: `payload`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function editBlock(payload) {
  emit('edit', payload);
}
```

---

### <a id="deleteitem"></a>deleteItem

- **Type**: `function`
- **Parameters**: `index, itemId`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function deleteItem(index, itemId) {
  const copyBlocks = [...props.data.blocks];

  if (workflow.editState.blockData.itemId === itemId) {
    workflow.editState.editing = false;
    workflow.editState.blockData = false;
  }

  copyBlocks.splice(index, 1);
  emit('update', { blocks: copyBlocks });
}
```

---

### <a id="gettranslation"></a>getTranslation

- **Type**: `function`
- **Parameters**: `key, defText?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function getTranslation(key, defText = '') {
  return te(key) ? t(key) : defText;
}
```

---

### <a id="handledrop"></a>handleDrop

- **Type**: `function`
- **Parameters**: `event`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function handleDrop(event) {
  event.preventDefault();
  event.stopPropagation();

  const droppedBlock = JSON.parse(event.dataTransfer.getData('block') || null);
  if (!droppedBlock || droppedBlock.fromGroup) return;

  const { id, data, blockId } = droppedBlock;

  if (excludeGroupBlocks.includes(id)) {
    toast.error(
      t('workflow.blocks.blocks-group.cantAdd', {
        blockName: t(`workflow.blocks.${id}.name`),
      })
    );
// ...
```

---

### <a id="togglebreakpoint"></a>toggleBreakpoint

- **Type**: `function`
- **Parameters**: `item, index`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function toggleBreakpoint(item, index) {
  const copyBlocks = [...props.data.blocks];
  copyBlocks[index].data = {
    ...copyBlocks[index].data,
    $breakpoint: !item.data.$breakpoint,
  };

  emit('update', { blocks: copyBlocks });
}
```

---

