# BlockRepeatTask.vue

**Path**: `components/block/BlockRepeatTask.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [handleInput](#handleinput) | function | ❌ | `{}` |

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

### <a id="handleinput"></a>handleInput

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function handleInput({ target }) {
  emit('update', { repeatFor: target.value });
}
```

---

