# EditConditions.vue

**Path**: `components/newtab/workflow/edit/EditConditions.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [default](#default) | object_property_method | ❌ | `` |
| [default](#default) | object_property_method | ❌ | `` |
| [editCondition](#editcondition) | function | ❌ | `index` |
| [addCondition](#addcondition) | function | ❌ | `` |
| [deleteCondition](#deletecondition) | function | ❌ | `index, id` |
| [updateData](#updatedata) | function | ❌ | `value` |
| [generateConditionItem](#generateconditionitem) | arrow_function | ❌ | `type, data` |

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

### <a id="editcondition"></a>editCondition

- **Type**: `function`
- **Parameters**: `index`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function editCondition(index) {
  state.conditionsIndex = index;
  state.showModal = true;
}
```

---

### <a id="addcondition"></a>addCondition

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function addCondition() {
  if (conditions.value.length >= 20) return;

  conditions.value.push({
    id: nanoid(),
    name: `Path ${conditions.value.length + 1}`,
    conditions: [],
  });
}
```

---

### <a id="deletecondition"></a>deleteCondition

- **Type**: `function`
- **Parameters**: `index, id`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function deleteCondition(index, id) {
  conditions.value.splice(index, 1);

  props.editor.removeEdges((edges) => {
    return edges.filter(
      (edge) => edge.sourceHandle === `${props.blockId}-output-${id}`
    );
  });
}
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

### <a id="generateconditionitem"></a>generateConditionItem

- **Type**: `arrow_function`
- **Parameters**: `type, data`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(type, data) => {
    if (type === 'value') {
      return {
        id: nanoid(),
        type: 'value',
        category: 'value',
        data: { value: data },
      };
    }

    return { id: nanoid(), category: 'compare', type: data };
  }
```

---

