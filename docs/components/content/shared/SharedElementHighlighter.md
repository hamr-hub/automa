# SharedElementHighlighter.vue

**Path**: `components/content/shared/SharedElementHighlighter.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [getNumber](#getnumber) | function | ❌ | `num` |
| [getFillColor](#getfillcolor) | function | ❌ | `item` |
| [getStrokeColor](#getstrokecolor) | function | ❌ | `item` |

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

### <a id="getnumber"></a>getNumber

- **Type**: `function`
- **Parameters**: `num`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function getNumber(num) {
  if (Number.isNaN(num) || !num) return 0;

  return num;
}
```

---

### <a id="getfillcolor"></a>getFillColor

- **Type**: `function`
- **Parameters**: `item`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function getFillColor(item) {
  if (!item) return null;
  if (item.outline) return null;

  return item.highlight ? props.fill : props.activeFill || props.fill;
}
```

---

### <a id="getstrokecolor"></a>getStrokeColor

- **Type**: `function`
- **Parameters**: `item`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function getStrokeColor(item) {
  if (!item) return null;

  return item.highlight ? props.stroke : props.activeStroke || props.stroke;
}
```

---

