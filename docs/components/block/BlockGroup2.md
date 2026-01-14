# BlockGroup2.vue

**Path**: `components/block/BlockGroup2.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [default](#default) | object_property_method | ❌ | `` |
| [default](#default) | object_property_method | ❌ | `` |
| [default](#default) | object_property_method | ❌ | `` |
| [onMousemove](#onmousemove) | function | ❌ | `event` |
| [onMouseup](#onmouseup) | function | ❌ | `` |
| [initDragging](#initdragging) | function | ❌ | `event` |

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

### <a id="default"></a>default

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
default: () => ({})
```

---

### <a id="onmousemove"></a>onMousemove

- **Type**: `function`
- **Parameters**: `event`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function onMousemove(event) {
  event.preventDefault();
  event.stopPropagation();

  const width = initialRect.width + event.clientX - initialRect.x;
  const height = initialRect.height + event.clientY - initialRect.y;

  parent.style.width = `${width}px`;
  parent.style.height = `${height}px`;

  emit('update', { height, width });
}
```

---

### <a id="onmouseup"></a>onMouseup

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function onMouseup() {
  document.documentElement.removeEventListener('mouseup', onMouseup);
  document.documentElement.removeEventListener('mousemove', onMousemove);
}
```

---

### <a id="initdragging"></a>initDragging

- **Type**: `function`
- **Parameters**: `event`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function initDragging(event) {
  event.preventDefault();
  event.stopPropagation();

  const { height, width } = getComputedStyle(parent);

  initialRect.x = event.clientX;
  initialRect.y = event.clientY;
  initialRect.width = parseInt(width, 10);
  initialRect.height = parseInt(height, 10);

  document.documentElement.addEventListener('mouseup', onMouseup);
  document.documentElement.addEventListener('mousemove', onMousemove);
}
```

---

