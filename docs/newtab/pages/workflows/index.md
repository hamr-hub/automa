# index.vue

**Path**: `newtab/pages/workflows/index.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [clearAddWorkflowModal](#clearaddworkflowmodal) | function | ❌ | `` |
| [initRecordWorkflow](#initrecordworkflow) | function | ❌ | `` |
| [startRecordWorkflow](#startrecordworkflow) | function | ❌ | `` |
| [updateActiveTab](#updateactivetab) | function | ✅ | `data?` |
| [addWorkflow](#addworkflow) | function | ❌ | `` |
| [checkWorkflowPermissions](#checkworkflowpermissions) | function | ✅ | `workflows` |
| [addHostedWorkflow](#addhostedworkflow) | function | ❌ | `` |
| [onConfirm](#onconfirm) | object_property_method | ✅ | `value` |
| [openImportDialog](#openimportdialog) | function | ✅ | `` |

## Detailed Description

### <a id="clearaddworkflowmodal"></a>clearAddWorkflowModal

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function clearAddWorkflowModal() {
  Object.assign(addWorkflowModal, {
    name: '',
    show: false,
    type: 'manual',
    description: '',
  });
}
```

---

### <a id="initrecordworkflow"></a>initRecordWorkflow

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function initRecordWorkflow() {
  addWorkflowModal.show = true;
  addWorkflowModal.type = 'recording';
}
```

---

### <a id="startrecordworkflow"></a>startRecordWorkflow

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function startRecordWorkflow() {
  recordWorkflow({
    name: addWorkflowModal.name,
    description: addWorkflowModal.description,
  }).then(() => {
    router.push('/recording');
  });
}
```

---

### <a id="updateactivetab"></a>updateActiveTab

- **Type**: `function`
- **Parameters**: `data?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function updateActiveTab(data = {}) {
  if (data.activeTab !== 'team') {
    data.teamId = '';
  }

  const query = {
    ...router.currentRoute.value.query,
    active: data.activeTab,
  };

  if (data.teamId) {
    query.teamId = data.teamId;
  } else {
    delete query.teamId;
  }
// ...
```

---

### <a id="addworkflow"></a>addWorkflow

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function addWorkflow() {
  workflowStore
    .insert({
      name: addWorkflowModal.name,
      folderId: state.activeFolder,
      description: addWorkflowModal.description,
    })
    .then((workflows) => {
      console.log('Workflow created:', workflows);
      const workflowId = Object.keys(workflows)[0];
      if (!workflowId) {
        console.error('Workflow ID not found in result:', workflows);
        return;
      }
      router.push(`/workflows/${workflowId}`);
// ...
```

---

### <a id="checkworkflowpermissions"></a>checkWorkflowPermissions

- **Type**: `function`
- **Parameters**: `workflows`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function checkWorkflowPermissions(workflows) {
  let requiredPermissions = [];

  for (const workflow of workflows) {
    if (workflow.drawflow) {
      const permissions = await getWorkflowPermissions(workflow.drawflow);
      requiredPermissions.push(...permissions);
    }
  }

  requiredPermissions = Array.from(new Set(requiredPermissions));
  if (requiredPermissions.length === 0) return;

  permissionState.items = requiredPermissions;
  permissionState.showModal = true;
// ...
```

---

### <a id="addhostedworkflow"></a>addHostedWorkflow

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function addHostedWorkflow() {
  dialog.prompt({
    async: true,
    inputType: 'url',
    okText: t('common.add'),
    title: t('workflow.host.add'),
    label: t('workflow.host.id'),
    placeholder: 'abcd123',
    onConfirm: async (value) => {
      if (isWhitespace(value)) return false;
      const hostId = value.replace(/\s/g, '');

      try {
        if (!userStore.user && hostedWorkflowStore.toArray.length >= 3)
          throw new Error('rate-exceeded');
// ...
```

---

### <a id="onconfirm"></a>onConfirm

- **Type**: `object_property_method`
- **Parameters**: `value`
- **Description**: *No description provided.*

**Implementation**:
```javascript
onConfirm: async (value) => {
      if (isWhitespace(value)) return false;
      const hostId = value.replace(/\s/g, '');

      try {
        if (!userStore.user && hostedWorkflowStore.toArray.length >= 3)
          throw new Error('rate-exceeded');

        const isTheUserHost = userStore.getHostedWorkflows.some(
          (host) => hostId === host.hostId
        );
        if (isTheUserHost) throw new Error('exist');

        const result = await getWorkflowById(hostId);

// ...
```

---

### <a id="openimportdialog"></a>openImportDialog

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function openImportDialog() {
  try {
    const workflows = await importWorkflow({ multiple: true });
    await checkWorkflowPermissions(Object.values(workflows));
  } catch (error) {
    console.error(error);
  }
}
```

---

