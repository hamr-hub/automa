# LogsFilters.vue

**Path**: `components/newtab/logs/LogsFilters.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [default](#default) | object_property_method | ❌ | `` |
| [default](#default) | object_property_method | ❌ | `` |
| [updateFilters](#updatefilters) | function | ❌ | `key, value` |
| [updateSorts](#updatesorts) | function | ❌ | `key, value` |

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
default: () => []
```

---

### <a id="updatefilters"></a>updateFilters

- **Type**: `function`
- **Parameters**: `key, value`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function updateFilters(key, value) {
  emit('updateFilters', { key, value });
}
```

---

### <a id="updatesorts"></a>updateSorts

- **Type**: `function`
- **Parameters**: `key, value`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function updateSorts(key, value) {
  emit('updateSorts', { key, value });
}
```

---

