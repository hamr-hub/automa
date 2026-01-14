# BlockNote.vue

**Path**: `components/block/BlockNote.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [onMouseup](#onmouseup) | function | ❌ | `{}` |

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

### <a id="onmouseup"></a>onMouseup

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function onMouseup({ target }) {
  let { height, width } = target.style;
  width = parseInt(width, 10);
  height = parseInt(height, 10);

  if (width === props.data.width && height === props.data.height) return;

  updateData({ height, width });
}
```

---

