# EditorLocalActions.vue

**Path**: `components/newtab/workflow/editor/EditorLocalActions.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [default](#default) | object_property_method | ❌ | `` |
| [default](#default) | object_property_method | ❌ | `` |
| [updateWorkflow](#updateworkflow) | function | ❌ | `data?, changedIndicator?` |
| [toggleTestingMode](#toggletestingmode) | function | ❌ | `` |
| [copyWorkflowId](#copyworkflowid) | function | ❌ | `` |
| [updateWorkflowDescription](#updateworkflowdescription) | function | ❌ | `value` |
| [saveWorkflow](#saveworkflow) | function | ✅ | `` |
| [executeCurrWorkflow](#executecurrworkflow) | function | ✅ | `` |
| [setAsHostWorkflow](#setashostworkflow) | function | ✅ | `isHost` |
| [shareWorkflowWithTeam](#shareworkflowwithteam) | function | ❌ | `` |
| [shareWorkflow](#shareworkflow) | function | ❌ | `disabled?` |
| [deleteFromTeam](#deletefromteam) | function | ❌ | `` |
| [onConfirm](#onconfirm) | object_property_method | ✅ | `` |
| [clearRenameModal](#clearrenamemodal) | function | ❌ | `` |
| [publishWorkflow](#publishworkflow) | function | ✅ | `` |
| [initRenameWorkflow](#initrenameworkflow) | function | ❌ | `` |
| [renameWorkflow](#renameworkflow) | function | ❌ | `` |
| [deleteWorkflow](#deleteworkflow) | function | ❌ | `` |
| [onConfirm](#onconfirm) | object_property_method | ✅ | `` |
| [retrieveTriggerText](#retrievetriggertext) | function | ✅ | `` |
| [fetchSyncWorkflow](#fetchsyncworkflow) | function | ✅ | `` |
| [syncWorkflow](#syncworkflow) | function | ✅ | `` |
| [onConfirm](#onconfirm) | object_property_method | ❌ | `` |
| [action](#action) | object_property_method | ❌ | `` |

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

### <a id="updateworkflow"></a>updateWorkflow

- **Type**: `function`
- **Parameters**: `data?, changedIndicator?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function updateWorkflow(data = {}, changedIndicator = false) {
  let store = null;

  if (props.isTeam) {
    store = teamWorkflowStore.update({
      data,
      teamId,
      id: props.workflow.id,
    });
  } else {
    store = workflowStore.update({
      data,
      id: props.workflow.id,
    });
  }
// ...
```

---

### <a id="toggletestingmode"></a>toggleTestingMode

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function toggleTestingMode() {
  if (props.isDataChanged) return;

  updateWorkflow({ testingMode: !props.workflow.testingMode });
}
```

---

### <a id="copyworkflowid"></a>copyWorkflowId

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function copyWorkflowId() {
  navigator.clipboard.writeText(props.workflow.id).catch((error) => {
    console.error(error);

    const textarea = document.createElement('textarea');
    textarea.value = props.workflow.id;
    textarea.select();
    document.execCommand('copy');
    textarea.blur();
  });
}
```

---

### <a id="updateworkflowdescription"></a>updateWorkflowDescription

- **Type**: `function`
- **Parameters**: `value`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function updateWorkflowDescription(value) {
  const keys = ['description', 'category', 'content', 'tag', 'name'];
  const payload = {};

  keys.forEach((key) => {
    payload[key] = value[key];
  });

  updateWorkflow(payload);
  state.showEditDescription = false;
}
```

---

### <a id="saveworkflow"></a>saveWorkflow

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function saveWorkflow() {
  try {
    const flow = props.editor.toObject();
    flow.edges = flow.edges.map((edge) => {
      delete edge.sourceNode;
      delete edge.targetNode;

      return edge;
    });

    const triggerBlock = flow.nodes.find((node) => node.label === 'trigger');
    if (!triggerBlock) {
      toast.error(t('message.noTriggerBlock'));
      return;
    }
// ...
```

---

### <a id="executecurrworkflow"></a>executeCurrWorkflow

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function executeCurrWorkflow() {
  if (mainStore.settings.editor.saveWhenExecute && props.isDataChanged) {
    saveWorkflow();
  }

  RendererWorkflowService.executeWorkflow({
    ...props.workflow,
    isTesting: props.isDataChanged,
  });
}
```

---

### <a id="setashostworkflow"></a>setAsHostWorkflow

- **Type**: `function`
- **Parameters**: `isHost`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function setAsHostWorkflow(isHost) {
  if (!userStore.user) {
    dialog.custom('auth', {
      title: t('auth.title'),
    });
    return;
  }

  state.isUploadingHost = true;

  try {
    if (isHost) {
      let result;
      try {
        result = await apiAdapter.createWorkflow(props.workflow);
// ...
```

---

### <a id="shareworkflowwithteam"></a>shareWorkflowWithTeam

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function shareWorkflowWithTeam() {
  emit('modal', 'workflow-share-team');
}
```

---

### <a id="shareworkflow"></a>shareWorkflow

- **Type**: `function`
- **Parameters**: `disabled?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function shareWorkflow(disabled = false) {
  if (disabled) return;
  if (shared.value) {
    router.push(`/workflows/${props.workflow.id}/shared`);
    return;
  }

  if (userStore.user) {
    emit('modal', 'workflow-share');
  } else {
    dialog.custom('auth', {
      title: t('auth.title'),
    });
  }
}
```

---

### <a id="deletefromteam"></a>deleteFromTeam

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function deleteFromTeam() {
  dialog.confirm({
    async: true,
    title: 'Delete workflow from team',
    okVariant: 'danger',
    body: `Are you sure want to delete the "${props.workflow.name}" workflow from this team?`,
    onConfirm: async () => {
        try {
          await apiAdapter.deleteTeamWorkflow(teamId, props.workflow.id);

          await teamWorkflowStore.delete(teamId, props.workflow.id);
          router.replace(`/workflows?active=team&teamId=${teamId}`);

          return true;
        } catch (error) {
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
          await apiAdapter.deleteTeamWorkflow(teamId, props.workflow.id);

          await teamWorkflowStore.delete(teamId, props.workflow.id);
          router.replace(`/workflows?active=team&teamId=${teamId}`);

          return true;
        } catch (error) {
        toast.error('Something went wrong');
        console.error(error);
        return false;
      }
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
    description: '',
    showModal: false,
  });
}
```

---

### <a id="publishworkflow"></a>publishWorkflow

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function publishWorkflow() {
  if (!props.canEdit) return;

  state.isPublishing = true;

  try {
    try {
      await apiAdapter.updateWorkflow(props.workflow.id, props.workflow);
    } catch (e) {
      if (e.message.includes('JSON object requested') || e.code === 'PGRST116') {
        await teamWorkflowStore.delete(teamId, props.workflow.id);
        router.replace('/');
        return;
      }
      throw e;
// ...
```

---

### <a id="initrenameworkflow"></a>initRenameWorkflow

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function initRenameWorkflow() {
  if (props.isTeam) {
    state.showEditDescription = true;
    return;
  }

  Object.assign(renameState, {
    showModal: true,
    name: `${props.workflow.name}`,
    description: `${props.workflow.description}`,
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
  updateWorkflow({
    name: renameState.name,
    description: renameState.description,
  });
  clearRenameModal();
}
```

---

### <a id="deleteworkflow"></a>deleteWorkflow

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function deleteWorkflow() {
  dialog.confirm({
    title: props.isPackage ? t('common.delete') : t('workflow.delete'),
    okVariant: 'danger',
    body: props.isPackage
      ? `Are you sure want to delete "${props.workflow.name}" package?`
      : t('message.delete', { name: props.workflow.name }),
    onConfirm: async () => {
      if (props.isPackage) {
        await packageStore.delete(props.workflow.id);
      } else if (props.isTeam) {
        await teamWorkflowStore.delete(teamId, props.workflow.id);
      } else {
        await workflowStore.delete(props.workflow.id);
      }
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
      if (props.isPackage) {
        await packageStore.delete(props.workflow.id);
      } else if (props.isTeam) {
        await teamWorkflowStore.delete(teamId, props.workflow.id);
      } else {
        await workflowStore.delete(props.workflow.id);
      }

      router.replace(props.isPackage ? '/packages' : '/');
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
  if (props.canEdit) return;

  const triggerBlock = findTriggerBlock(props.workflow.drawflow);
  if (!triggerBlock) return;

  state.triggerText = await getTriggerText(
    triggerBlock.data,
    t,
    router.currentRoute.value.params.id,
    true
  );
}
```

---

### <a id="fetchsyncworkflow"></a>fetchSyncWorkflow

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function fetchSyncWorkflow() {
  try {
    let result;
    try {
      result = await apiAdapter.getWorkflowById(props.workflow.id);
    } catch (e) {
      if (e.message.includes('JSON object requested') || e.code === 'PGRST116') {
        await teamWorkflowStore.delete(teamId, props.workflow.id);
        router.replace(`/workflows?active=team&teamId=${teamId}`);
        return;
      }
      throw e;
    }

    await teamWorkflowStore.update({
// ...
```

---

### <a id="syncworkflow"></a>syncWorkflow

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function syncWorkflow() {
  state.loadingSync = true;

  if (props.canEdit) {
    dialog.confirm({
      title: 'Sync workflow',
      okText: 'Sync',
      body: 'This action will overwrite the current workflow with the one that stored in cloud',
      onConfirm: () => {
        fetchSyncWorkflow();
        toast('Syncing workflow...', { timeout: false, id: 'sync' });
      },
    });
  } else {
    fetchSyncWorkflow();
// ...
```

---

### <a id="onconfirm"></a>onConfirm

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
onConfirm: () => {
        fetchSyncWorkflow();
        toast('Syncing workflow...', { timeout: false, id: 'sync' });
      }
```

---

### <a id="action"></a>action

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
action: () => exportWorkflow(props.workflow)
```

---

