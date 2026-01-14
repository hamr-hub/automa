# WorkflowDetailsCard.vue

**Path**: `components/newtab/workflow/WorkflowDetailsCard.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [updateWorkflowIcon](#updateworkflowicon) | function | ❌ | `value` |
| [pinBlock](#pinblock) | function | ❌ | `{}` |

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

### <a id="updateworkflowicon"></a>updateWorkflowIcon

- **Type**: `function`
- **Parameters**: `value`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function updateWorkflowIcon(value) {
  if (!value.startsWith('http')) return;

  const iconUrl = value.slice(0, 1024);

  emit('update', { icon: iconUrl });
}
```

---

### <a id="pinblock"></a>pinBlock

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function pinBlock({ id }) {
  const index = pinnedBlocks.value.indexOf(id);

  if (index !== -1) pinnedBlocks.value.splice(index, 1);
  else pinnedBlocks.value.push(id);
}
```

---

