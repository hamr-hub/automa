# WorkflowsHosted.vue

**Path**: `components/newtab/workflows/WorkflowsHosted.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [deleteWorkflow](#deleteworkflow) | function | ✅ | `workflow` |
| [onConfirm](#onconfirm) | object_property_method | ✅ | `` |

## Detailed Description

### <a id="default"></a>default

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
default: () => ({
      by: '',
      order: '',
    })
```

---

### <a id="deleteworkflow"></a>deleteWorkflow

- **Type**: `function`
- **Parameters**: `workflow`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function deleteWorkflow(workflow) {
  dialog.confirm({
    title: t('workflow.delete'),
    okVariant: 'danger',
    body: t('message.delete', { name: workflow.name }),
    onConfirm: async () => {
      try {
        await hostedWorkflowStore.delete(workflow.hostId);
      } catch (error) {
        console.error(error);
      }
    },
  });
}
```

---

### <a id="onconfirm"></a>onConfirm

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
onConfirm: async () => {
      try {
        await hostedWorkflowStore.delete(workflow.hostId);
      } catch (error) {
        console.error(error);
      }
    }
```

---

