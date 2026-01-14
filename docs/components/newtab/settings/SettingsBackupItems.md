# SettingsBackupItems.vue

**Path**: `components/newtab/settings/SettingsBackupItems.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [default](#default) | object_property_method | ❌ | `` |
| [toggleDeleteWorkflow](#toggledeleteworkflow) | function | ❌ | `selected, workflowId` |
| [isActive](#isactive) | function | ❌ | `workflowId` |

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

### <a id="toggledeleteworkflow"></a>toggleDeleteWorkflow

- **Type**: `function`
- **Parameters**: `selected, workflowId`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function toggleDeleteWorkflow(selected, workflowId) {
  const workflows = [...props.modelValue];

  if (selected) {
    workflows.push(workflowId);
  } else {
    const index = workflows.indexOf(workflowId);

    if (index !== -1) workflows.splice(index, 1);
  }

  emit('update:modelValue', workflows);
}
```

---

### <a id="isactive"></a>isActive

- **Type**: `function`
- **Parameters**: `workflowId`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function isActive(workflowId) {
  return props.modelValue.includes(workflowId);
}
```

---

