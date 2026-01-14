# Host.vue

**Path**: `newtab/pages/workflows/Host.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [title](#title) | object_property_method | ❌ | `` |
| [openLogs](#openlogs) | function | ❌ | `` |
| [syncWorkflow](#syncworkflow) | function | ❌ | `` |
| [deleteWorkflowHost](#deleteworkflowhost) | function | ✅ | `` |
| [onConfirm](#onconfirm) | object_property_method | ✅ | `` |
| [executeCurrWorkflow](#executecurrworkflow) | function | ❌ | `` |
| [retrieveTriggerText](#retrievetriggertext) | function | ✅ | `` |
| [onEditorInit](#oneditorinit) | function | ❌ | `editor` |

## Detailed Description

### <a id="title"></a>title

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
title: () =>
    workflow.value?.name
      ? `${workflow.value.name} workflow`
      : 'Hosted workflow'
```

---

### <a id="openlogs"></a>openLogs

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function openLogs() {
  emitter.emit('ui:logs', {
    workflowId,
    show: true,
  });
}
```

---

### <a id="syncworkflow"></a>syncWorkflow

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function syncWorkflow() {
  state.loadingSync = true;
  const hostId = {
    hostId: workflow.value.hostId,
    updatedAt: null,
  };

  hostedWorkflowStore
    .fetchWorkflows([hostId])
    .then(() => {
      if (!workflow.value) {
        router.replace('/workflows');
      }
      /* eslint-disable-next-line */
      retrieveTriggerText();
// ...
```

---

### <a id="deleteworkflowhost"></a>deleteWorkflowHost

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function deleteWorkflowHost() {
  dialog.confirm({
    title: t('workflow.delete'),
    okVariant: 'danger',
    body: t('message.delete', { name: workflow.value.name }),
    onConfirm: async () => {
      try {
        await hostedWorkflowStore.delete(workflowId);

        router.replace('/workflows');
      } catch (error) {
        console.error(error);
      }
    },
  });
// ...
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
        await hostedWorkflowStore.delete(workflowId);

        router.replace('/workflows');
      } catch (error) {
        console.error(error);
      }
    }
```

---

### <a id="executecurrworkflow"></a>executeCurrWorkflow

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function executeCurrWorkflow() {
  const payload = {
    ...workflow.value,
    id: workflowId,
  };

  RendererWorkflowService.executeWorkflow(payload);
}
```

---

### <a id="retrievetriggertext"></a>retrieveTriggerText

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function retrieveTriggerText() {
  const triggerBlock = findTriggerBlock(workflow.value.drawflow);
  if (!triggerBlock) return;

  state.triggerText = await getTriggerText(
    triggerBlock.data,
    t,
    workflowId,
    true
  );
}
```

---

### <a id="oneditorinit"></a>onEditorInit

- **Type**: `function`
- **Parameters**: `editor`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function onEditorInit(editor) {
  editor.setInteractive(false);
}
```

---

