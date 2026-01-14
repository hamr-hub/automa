# SettingsCloudBackup.vue

**Path**: `components/newtab/settings/SettingsCloudBackup.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [formatDate](#formatdate) | function | ❌ | `workflow, format` |
| [syncCloudToLocal](#synccloudtolocal) | function | ✅ | `workflow` |
| [selectAllCloud](#selectallcloud) | function | ❌ | `value` |
| [selectAllLocal](#selectalllocal) | function | ❌ | `` |
| [deleteBackup](#deletebackup) | function | ✅ | `workflowId` |
| [fetchCloudWorkflows](#fetchcloudworkflows) | function | ✅ | `` |
| [updateCloudBackup](#updatecloudbackup) | function | ✅ | `workflow` |
| [backupWorkflowsToCloud](#backupworkflowstocloud) | function | ✅ | `workflowId` |

## Detailed Description

### <a id="formatdate"></a>formatDate

- **Type**: `function`
- **Parameters**: `workflow, format`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function formatDate(workflow, format) {
  return dayjs(workflow.updatedAt || Date.now()).format(format);
}
```

---

### <a id="synccloudtolocal"></a>syncCloudToLocal

- **Type**: `function`
- **Parameters**: `workflow`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function syncCloudToLocal(workflow) {
  try {
    backupState.uploading = true;
    backupState.workflowId = workflow.id;

    const data = await getWorkflowById(workflow.id);
    if (!data) throw new Error('Workflow not found');

    await workflowStore.insertOrUpdate([data]);

    const index = state.cloudWorkflows.findIndex(
      (item) => item.id === workflow.id
    );
    if (index !== -1) {
      state.cloudWorkflows[index].hasLocalCopy = true;
// ...
```

---

### <a id="selectallcloud"></a>selectAllCloud

- **Type**: `function`
- **Parameters**: `value`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function selectAllCloud(value) {
  if (value) {
    state.deleteIds = state.cloudWorkflows.map(({ id }) => id);
  } else {
    state.deleteIds = [];
  }
}
```

---

### <a id="selectalllocal"></a>selectAllLocal

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function selectAllLocal() {
  let limit = state.selectedWorkflows.length;

  if (limit >= workflowLimit.value) {
    state.selectedWorkflows = [];
    return;
  }

  workflows.value.forEach(({ id, isInCloud }) => {
    if (
      limit >= workflowLimit.value ||
      isInCloud ||
      state.selectedWorkflows.includes(id)
    )
      return;
// ...
```

---

### <a id="deletebackup"></a>deleteBackup

- **Type**: `function`
- **Parameters**: `workflowId`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function deleteBackup(workflowId) {
  try {
    backupState.deleting = true;

    if (workflowId) backupState.workflowId = workflowId;

    const ids = workflowId ? [workflowId] : state.deleteIds;

    // Supabase delete is one by one in current implementation
    await Promise.all(ids.map((id) => deleteWorkflow(id)));

    ids.forEach((id) => {
      const index = state.cloudWorkflows.findIndex((item) => item.id === id);

      if (index !== -1) state.cloudWorkflows.splice(index, 1);
// ...
```

---

### <a id="fetchcloudworkflows"></a>fetchCloudWorkflows

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function fetchCloudWorkflows() {
  if (state.backupRetrieved) return;

  state.deleteIds = [];

  try {
    const data = await cacheApi('backup-workflows', async () => {
      const result = await getUserWorkflows(false);
      return result.backup || [];
    });

    state.cloudWorkflows = data.map((item) => {
      const hasLocalCopy = Boolean(workflowStore.workflows[item.id]);
      item.hasLocalCopy = hasLocalCopy;

// ...
```

---

### <a id="updatecloudbackup"></a>updateCloudBackup

- **Type**: `function`
- **Parameters**: `workflow`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function updateCloudBackup(workflow) {
  try {
    backupState.loading = true;
    backupState.workflowId = workflow.id;

    const keys = [
      'description',
      'drawflow',
      'globalData',
      'icon',
      'name',
      'settings',
      'table',
    ];
    const payload = {};
// ...
```

---

### <a id="backupworkflowstocloud"></a>backupWorkflowsToCloud

- **Type**: `function`
- **Parameters**: `workflowId`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function backupWorkflowsToCloud(workflowId) {
  if (backupState.uploading) return;

  try {
    backupState.uploading = true;

    if (workflowId) backupState.workflowId = workflowId;

    const workflowIds = workflowId ? [workflowId] : state.selectedWorkflows;
    const workflowsPayload = workflowIds.reduce((acc, id) => {
      const findWorkflow = workflowStore.getById(id);

      if (!findWorkflow) return acc;

      const workflow = convertWorkflow(findWorkflow, ['dataColumns', 'id']);
// ...
```

---

