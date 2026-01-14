# WorkflowsLocal.vue

**Path**: `components/newtab/workflows/WorkflowsLocal.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [onPerPageChange](#onperpagechange) | function | ❌ | `event` |
| [toggleDisableWorkflow](#toggledisableworkflow) | function | ❌ | `{}` |
| [clearRenameModal](#clearrenamemodal) | function | ❌ | `` |
| [initRenameWorkflow](#initrenameworkflow) | function | ❌ | `{}` |
| [renameWorkflow](#renameworkflow) | function | ❌ | `` |
| [deleteWorkflow](#deleteworkflow) | function | ❌ | `{}` |
| [onConfirm](#onconfirm) | object_property_method | ❌ | `` |
| [deleteSelectedWorkflows](#deleteselectedworkflows) | function | ❌ | `{}` |
| [onConfirm](#onconfirm) | object_property_method | ✅ | `` |
| [duplicateWorkflow](#duplicateworkflow) | function | ❌ | `workflow` |
| [onDragStart](#ondragstart) | function | ❌ | `{}` |
| [clearSelectedWorkflows](#clearselectedworkflows) | function | ❌ | `` |
| [togglePinWorkflow](#togglepinworkflow) | function | ❌ | `workflow` |
| [action](#action) | object_property_method | ❌ | `workflow` |

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

### <a id="onperpagechange"></a>onPerPageChange

- **Type**: `function`
- **Parameters**: `event`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function onPerPageChange(event) {
  const { value } = event.target;
  pagination.perPage = +value;
  emit('update:perPage', +value);
}
```

---

### <a id="toggledisableworkflow"></a>toggleDisableWorkflow

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function toggleDisableWorkflow({ id, isDisabled }) {
  workflowStore.update({
    id,
    data: {
      isDisabled: !isDisabled,
    },
  });
}
```

---

### <a id="clearrenamemodal"></a>clearRenameModal

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function clearRenameModal() {
  Object.assign(renameState, {
    id: '',
    name: '',
    show: false,
    description: '',
  });
}
```

---

### <a id="initrenameworkflow"></a>initRenameWorkflow

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function initRenameWorkflow({ name, description, id }) {
  Object.assign(renameState, {
    id,
    name,
    show: true,
    description,
  });
}
```

---

### <a id="renameworkflow"></a>renameWorkflow

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function renameWorkflow() {
  workflowStore.update({
    id: renameState.id,
    data: {
      name: renameState.name,
      description: renameState.description,
    },
  });
  clearRenameModal();
}
```

---

### <a id="deleteworkflow"></a>deleteWorkflow

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function deleteWorkflow({ name, id }) {
  dialog.confirm({
    title: t('workflow.delete'),
    okVariant: 'danger',
    body: t('message.delete', { name }),
    onConfirm: () => {
      workflowStore.delete(id);
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
onConfirm: () => {
      workflowStore.delete(id);
    }
```

---

### <a id="deleteselectedworkflows"></a>deleteSelectedWorkflows

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function deleteSelectedWorkflows({ target, key }) {
  const excludeTags = ['INPUT', 'TEXTAREA', 'SELECT'];
  if (
    excludeTags.includes(target.tagName) ||
    key !== 'Delete' ||
    state.selectedWorkflows.length === 0
  )
    return;

  if (state.selectedWorkflows.length === 1) {
    const [workflowId] = state.selectedWorkflows;
    const workflow = workflowStore.getById(workflowId);
    deleteWorkflow(workflow);
  } else {
    dialog.confirm({
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
        await workflowStore.delete(state.selectedWorkflows);
      }
```

---

### <a id="duplicateworkflow"></a>duplicateWorkflow

- **Type**: `function`
- **Parameters**: `workflow`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function duplicateWorkflow(workflow) {
  const clonedWorkflow = cloneDeep(workflow);
  const delKeys = ['$id', 'data', 'id', 'isDisabled'];

  delKeys.forEach((key) => {
    delete clonedWorkflow[key];
  });

  clonedWorkflow.createdAt = Date.now();
  clonedWorkflow.name += ' - copy';

  workflowStore.insert(clonedWorkflow);
}
```

---

### <a id="ondragstart"></a>onDragStart

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function onDragStart({ dataTransfer, target }) {
  const payload = [...state.selectedWorkflows];

  const targetId = target.dataset?.workflow;
  if (targetId && !payload.includes(targetId)) payload.push(targetId);

  dataTransfer.setData('workflows', JSON.stringify(payload));
}
```

---

### <a id="clearselectedworkflows"></a>clearSelectedWorkflows

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function clearSelectedWorkflows() {
  state.selectedWorkflows = [];

  selection.getSelection().forEach((el) => {
    el.classList.remove('ring-2');
  });
  selection.clearSelection();
}
```

---

### <a id="togglepinworkflow"></a>togglePinWorkflow

- **Type**: `function`
- **Parameters**: `workflow`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function togglePinWorkflow(workflow) {
  const index = state.pinnedWorkflows.indexOf(workflow.id);
  const copyData = [...state.pinnedWorkflows];

  if (index === -1) {
    copyData.push(workflow.id);
  } else {
    copyData.splice(index, 1);
  }

  state.pinnedWorkflows = copyData;
  browser.storage.local.set({
    pinnedWorkflows: copyData,
  });
}
```

---

### <a id="action"></a>action

- **Type**: `object_property_method`
- **Parameters**: `workflow`
- **Description**: *No description provided.*

**Implementation**:
```javascript
action: (workflow) => {
      navigator.clipboard.writeText(workflow.id).catch((error) => {
        console.error(error);

        const textarea = document.createElement('textarea');
        textarea.value = workflow.id;
        textarea.select();
        document.execCommand('copy');
        textarea.blur();
      });
    }
```

---

