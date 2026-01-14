# UiTable.vue

**Path**: `components/ui/UiTable.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [default](#default) | object_property_method | ❌ | `` |
| [updateSort](#updatesort) | function | ❌ | `{}` |

## Detailed Description

### <a id="default"></a>default

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
default: () => []
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

### <a id="updatesort"></a>updateSort

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function updateSort({ sortable, value }) {
  if (!sortable) return;

  if (sortState.id !== value) {
    sortState.id = value;
    sortState.order = 'asc';
    return;
  }

  if (sortState.order === 'asc') {
    sortState.order = 'desc';
  } else {
    sortState.id = '';
  }
}
```

---

