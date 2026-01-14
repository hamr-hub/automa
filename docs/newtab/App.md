# App.vue

**Path**: `newtab/App.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [fetchUserData](#fetchuserdata) | function | ✅ | `` |
| [autoDeleteLogs](#autodeletelogs) | function | ❌ | `` |
| [syncHostedWorkflows](#synchostedworkflows) | function | ✅ | `` |
| [stopRecording](#stoprecording) | function | ❌ | `` |
| [[computed]](#-computed-) | object_property_method | ❌ | `` |
| [[computed]](#-computed-) | object_property_method | ❌ | `data` |
| [[computed]](#-computed-) | object_property_method | ❌ | `data` |
| [sendResponse](#sendresponse) | arrow_function | ❌ | `result` |

## Detailed Description

### <a id="fetchuserdata"></a>fetchUserData

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function fetchUserData() {
  try {
    if (!userStore.user) return;

    const { backup, hosted } = await getUserWorkflows();
    userStore.hostedWorkflows = hosted || {};

    if (backup && backup.length > 0) {
      const { lastBackup } = browser.storage.local.get('lastBackup');
      if (!lastBackup) {
        const backupIds = backup.map(({ id }) => id);

        userStore.backupIds = backupIds;
        await browser.storage.local.set({
          backupIds,
// ...
```

---

### <a id="autodeletelogs"></a>autoDeleteLogs

- **Type**: `function`
- **Parameters**: ``
- **Description**:

eslint-disable-next-line

**Implementation**:
```javascript
function autoDeleteLogs() {
  const deleteAfter = store.settings.deleteLogAfter;
  if (deleteAfter === 'never') return;

  const lastCheck =
    +localStorage.getItem('checkDeleteLogs') || Date.now() - 8.64e7;
  const dayDiff = dayjs().diff(dayjs(lastCheck), 'day');

  if (dayDiff < 1) return;

  const aDayInMs = 8.64e7;
  const maxLogAge = Date.now() - aDayInMs * deleteAfter;

  dbLogs.items
    .where('endedAt')
// ...
```

---

### <a id="synchostedworkflows"></a>syncHostedWorkflows

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function syncHostedWorkflows() {
  const hostIds = [];
  const userHosted = userStore.getHostedWorkflows;
  const hostedWorkflows = hostedWorkflowStore.workflows;

  Object.keys(hostedWorkflows).forEach((hostId) => {
    const isItsOwn = userHosted.find((item) => item.hostId === hostId);
    if (isItsOwn) return;

    hostIds.push({ hostId, updatedAt: hostedWorkflows[hostId].updatedAt });
  });

  if (hostIds.length === 0) return;

  await hostedWorkflowStore.fetchWorkflows(hostIds);
// ...
```

---

### <a id="stoprecording"></a>stopRecording

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function stopRecording() {
  if (!window.stopRecording) return;

  window.stopRecording();
}
```

---

### <a id="-computed-"></a>[computed]

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
'refresh-packages': function () {
    packageStore.loadData(true);
  }
```

---

### <a id="-computed-"></a>[computed]

- **Type**: `object_property_method`
- **Parameters**: `data`
- **Description**: *No description provided.*

**Implementation**:
```javascript
'open-logs': function (data) {
    emitter.emit('ui:logs', {
      show: true,
      logId: data.logId,
    });
  }
```

---

### <a id="-computed-"></a>[computed]

- **Type**: `object_property_method`
- **Parameters**: `data`
- **Description**: *No description provided.*

**Implementation**:
```javascript
'workflow:added': function (data) {
    if (data.source === 'team') {
      teamWorkflowStore.loadData().then(() => {
        router.push(
          `/teams/${data.teamId}/workflows/${data.workflowId}?permission=true`
        );
      });
    } else if (data.workflowData) {
      workflowStore
        .insert(data.workflowData, { duplicateId: true })
        .then(async () => {
          try {
            const permissions = await getWorkflowPermissions(data.workflowData);
            if (permissions.length === 0) return;

// ...
```

---

### <a id="sendresponse"></a>sendResponse

- **Type**: `arrow_function`
- **Parameters**: `result`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(result) => {
    const sandbox = document.getElementById('sandbox');
    sandbox.contentWindow.postMessage(
      {
        type: 'fetchResponse',
        data: result,
        id: data.data.id,
      },
      '*'
    );
  }
```

---

