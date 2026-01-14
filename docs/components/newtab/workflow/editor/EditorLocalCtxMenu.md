# EditorLocalCtxMenu.vue

**Path**: `components/newtab/workflow/editor/EditorLocalCtxMenu.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [event](#event) | object_property_method | ❌ | `` |
| [event](#event) | object_property_method | ❌ | `` |
| [event](#event) | object_property_method | ❌ | `` |
| [event](#event) | object_property_method | ❌ | `` |
| [event](#event) | object_property_method | ❌ | `` |
| [event](#event) | object_property_method | ❌ | `` |
| [event](#event) | object_property_method | ❌ | `` |
| [event](#event) | object_property_method | ❌ | `` |
| [event](#event) | object_property_method | ❌ | `` |
| [event](#event) | object_property_method | ❌ | `` |
| [showCtxMenu](#showctxmenu) | function | ❌ | `items?, event` |
| [getReferenceClientRect](#getreferenceclientrect) | object_property_method | ❌ | `` |
| [clearContextMenu](#clearcontextmenu) | function | ❌ | `` |

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

### <a id="event"></a>event

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
event: () => emit('paste', ctxData?.position)
```

---

### <a id="event"></a>event

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
event: () => {
      props.editor.removeEdges(ctxData.edges);
      props.editor.removeNodes(ctxData.nodes);
    }
```

---

### <a id="event"></a>event

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
event: () => {
      emit('saveBlock', ctxData);
    }
```

---

### <a id="event"></a>event

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
event: () => emit('copy', ctxData)
```

---

### <a id="event"></a>event

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
event: () => emit('group', ctxData)
```

---

### <a id="event"></a>event

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
event: () => emit('ungroup', ctxData)
```

---

### <a id="event"></a>event

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
event: () => emit('duplicate', ctxData)
```

---

### <a id="event"></a>event

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
event: () => emit('recording', ctxData)
```

---

### <a id="event"></a>event

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
event: () => emit('packageIo', { type: 'inputs', ...ctxData })
```

---

### <a id="event"></a>event

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
event: () => emit('packageIo', { type: 'outputs', ...ctxData })
```

---

### <a id="showctxmenu"></a>showCtxMenu

- **Type**: `function`
- **Parameters**: `items?, event`
- **Description**:

eslint-disable-next-line

**Implementation**:
```javascript
function showCtxMenu(items = [], event) {
  event.preventDefault();
  const { clientX, clientY } = event;

  if (props.isPackage && items.includes('saveToFolder')) {
    items.splice(items.indexOf('saveToFolder'), 1);
  }

  state.items = items.map((key) => markRaw(menuItems[key]));
  state.items.unshift(markRaw(menuItems.paste));

  state.position = {
    getReferenceClientRect: () => ({
      width: 0,
      height: 0,
// ...
```

---

### <a id="getreferenceclientrect"></a>getReferenceClientRect

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
getReferenceClientRect: () => ({
      width: 0,
      height: 0,
      top: clientY,
      right: clientX,
      bottom: clientY,
      left: clientX,
    })
```

---

### <a id="clearcontextmenu"></a>clearContextMenu

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function clearContextMenu() {
  state.show = false;
  state.items = [];
  state.position = {};
}
```

---

