# EditWorkflowState.vue

**Path**: `components/newtab/workflow/edit/EditWorkflowState.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [updateData](#updatedata) | function | ❌ | `value` |
| [onItemSelected](#onitemselected) | function | ❌ | `{}` |
| [removeSelectedItem](#removeselecteditem) | function | ❌ | `itemId` |

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

### <a id="onitemselected"></a>onItemSelected

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function onItemSelected({ item }) {
  const copy = [...props.data.workflowsToStop];
  copy.push(item.id);

  selectedWorkflows.value[item.id] = item.name;

  updateData({ workflowsToStop: copy });

  query.value = '';
}
```

---

### <a id="removeselecteditem"></a>removeSelectedItem

- **Type**: `function`
- **Parameters**: `itemId`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function removeSelectedItem(itemId) {
  const copy = [...props.data.workflowsToStop];
  const index = props.data.workflowsToStop.indexOf(itemId);
  copy.splice(index, 1);

  updateData({ workflowsToStop: copy });

  delete selectedWorkflows.value[itemId];
}
```

---

