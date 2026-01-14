# EventCodeHTTP.vue

**Path**: `components/newtab/workflow/settings/event/EventCodeHTTP.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [emitData](#emitdata) | function | ❌ | `data` |

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

### <a id="emitdata"></a>emitData

- **Type**: `function`
- **Parameters**: `data`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function emitData(data) {
  emit('update:data', data);
}
```

---

