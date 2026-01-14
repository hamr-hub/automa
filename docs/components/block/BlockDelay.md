# BlockDelay.vue

**Path**: `components/block/BlockDelay.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [handleStartDrag](#handlestartdrag) | function | ❌ | `event` |

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

### <a id="handlestartdrag"></a>handleStartDrag

- **Type**: `function`
- **Parameters**: `event`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function handleStartDrag(event) {
  const payload = {
    id: props.label,
    data: props.data,
    blockId: props.id,
    fromBlockBasic: true,
  };

  event.dataTransfer.setData('block', JSON.stringify(payload));
}
```

---

