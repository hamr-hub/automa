# EditWhileLoop.vue

**Path**: `components/newtab/workflow/edit/EditWhileLoop.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [defaultConditions](#defaultconditions) | arrow_function | ❌ | `` |
| [updateData](#updatedata) | function | ❌ | `value` |

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

### <a id="defaultconditions"></a>defaultConditions

- **Type**: `arrow_function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
() => [
  {
    id: nanoid(),
    conditions: [
      {
        id: nanoid(),
        items: [
          {
            id: nanoid(),
            type: 'value',
            category: 'value',
            data: { value: '' },
          },
          { id: nanoid(), category: 'compare', type: 'eq' },
          {
// ...
```

---

### <a id="updatedata"></a>updateData

- **Type**: `function`
- **Parameters**: `value`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function updateData(value) {
  emit('update:data', { ...props.data, ...value });
}
```

---

