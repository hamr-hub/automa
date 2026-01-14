# WorkflowSharedActions.vue

**Path**: `components/newtab/workflow/WorkflowSharedActions.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [default](#default) | object_property_method | ❌ | `` |
| [onDescriptionUpdated](#ondescriptionupdated) | function | ❌ | `{}` |
| [updateDescription](#updatedescription) | function | ❌ | `` |

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

### <a id="ondescriptionupdated"></a>onDescriptionUpdated

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function onDescriptionUpdated({ name, description, content, category }) {
  state.isChanged = true;

  state.name = name;
  state.content = content;
  state.category = category;
  state.description = description;
}
```

---

### <a id="updatedescription"></a>updateDescription

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function updateDescription() {
  if (!state.isChanged) return;

  emit('update', {
    name: state.name,
    content: state.content,
    description: state.description,
  });
  state.isChanged = false;
}
```

---

