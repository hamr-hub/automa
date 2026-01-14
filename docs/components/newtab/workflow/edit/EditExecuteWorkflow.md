# EditExecuteWorkflow.vue

**Path**: `components/newtab/workflow/edit/EditExecuteWorkflow.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [filterWorkflows](#filterworkflows) | arrow_function | ❌ | `workflows` |
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

### <a id="filterworkflows"></a>filterWorkflows

- **Type**: `arrow_function`
- **Parameters**: `workflows`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(workflows) =>
  workflows
    .filter(({ id, drawflow }) => {
      const flow =
        typeof drawflow === 'string' ? drawflow : JSON.stringify(drawflow);

      return id !== route.params.id && !flow.includes(route.params.id);
    })
    .sort((a, b) => (a.name > b.name ? 1 : -1))
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

