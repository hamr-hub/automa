# SettingsBackup.vue

**Path**: `newtab/pages/settings/SettingsBackup.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [registerScheduleBackup](#registerschedulebackup) | function | ✅ | `` |
| [getBackupScheduleCron](#getbackupschedulecron) | function | ❌ | `` |
| [formatDate](#formatdate) | function | ❌ | `date` |
| [syncBackupWorkflows](#syncbackupworkflows) | function | ✅ | `` |
| [backupWorkflows](#backupworkflows) | function | ✅ | `` |
| [downloadFile](#downloadfile) | arrow_function | ❌ | `data` |
| [onConfirm](#onconfirm) | object_property_method | ❌ | `password` |
| [restoreWorkflows](#restoreworkflows) | function | ✅ | `` |
| [insertWorkflows](#insertworkflows) | arrow_function | ❌ | `workflows` |
| [showMessage](#showmessage) | arrow_function | ❌ | `event` |
| [onConfirm](#onconfirm) | object_property_method | ❌ | `password` |

## Detailed Description

### <a id="registerschedulebackup"></a>registerScheduleBackup

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function registerScheduleBackup() {
  try {
    if (!localBackupSchedule.schedule.trim()) {
      await browser.alarms.clear('schedule-local-backup');
    } else {
      const expression =
        localBackupSchedule.schedule === 'custom'
          ? localBackupSchedule.customSchedule
          : localBackupSchedule.schedule;
      const parsedExpression = cronParser.parseExpression(expression).next();
      if (!parsedExpression) return;

      await browser.alarms.create('schedule-local-backup', {
        when: parsedExpression.getTime(),
      });
// ...
```

---

### <a id="getbackupschedulecron"></a>getBackupScheduleCron

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function getBackupScheduleCron() {
  try {
    const expression = localBackupSchedule.customSchedule;

    return `${readableCron(expression)}`;
  } catch (error) {
    return error.message;
  }
}
```

---

### <a id="formatdate"></a>formatDate

- **Type**: `function`
- **Parameters**: `date`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function formatDate(date) {
  if (!date) return 'null';

  return dayjs(date).format('DD MMMM YYYY, hh:mm A');
}
```

---

### <a id="syncbackupworkflows"></a>syncBackupWorkflows

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function syncBackupWorkflows() {
  try {
    state.loadingSync = true;
    const { backup, hosted } = await getUserWorkflows(false);
    const backupIds = backup.map(({ id }) => id);

    userStore.backupIds = backupIds;
    userStore.hostedWorkflows = hosted;

    await browser.storage.local.set({
      backupIds,
      lastBackup: new Date().toISOString(),
    });

    await workflowStore.insertOrUpdate(backup, { checkUpdateDate: true });
// ...
```

---

### <a id="backupworkflows"></a>backupWorkflows

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function backupWorkflows() {
  try {
    const workflows = workflowStore.getWorkflows.reduce((acc, workflow) => {
      if (workflow.isProtected) return acc;

      delete workflow.$id;
      delete workflow.createdAt;
      delete workflow.data;
      delete workflow.isDisabled;
      delete workflow.isProtected;

      acc.push(workflow);

      return acc;
    }, []);
// ...
```

---

### <a id="downloadfile"></a>downloadFile

- **Type**: `arrow_function`
- **Parameters**: `data`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(data) => {
      const fileName = `automa-${dayjs().format('DD-MM-YYYY')}.json`;
      const blob = new Blob([JSON.stringify(data)], {
        type: 'application/json',
      });
      const objectUrl = URL.createObjectURL(blob);

      fileSaver(fileName, objectUrl);

      URL.revokeObjectURL(objectUrl);
    }
```

---

### <a id="onconfirm"></a>onConfirm

- **Type**: `object_property_method`
- **Parameters**: `password`
- **Description**: *No description provided.*

**Implementation**:
```javascript
onConfirm: (password) => {
          const encryptedWorkflows = AES.encrypt(
            payload.workflows,
            password
          ).toString();
          const hmac = hmacSHA256(encryptedWorkflows, password).toString();

          payload.workflows = hmac + encryptedWorkflows;

          downloadFile(payload);
        }
```

---

### <a id="restoreworkflows"></a>restoreWorkflows

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function restoreWorkflows() {
  try {
    const [file] = await openFilePicker('application/json');
    const reader = new FileReader();
    const insertWorkflows = (workflows) => {
      const newWorkflows = workflows.map((workflow) => {
        if (!state.updateIfExists) {
          workflow.createdAt = Date.now();
          delete workflow.id;
        }

        return workflow;
      });
      const showMessage = (event) => {
        toast(
// ...
```

---

### <a id="insertworkflows"></a>insertWorkflows

- **Type**: `arrow_function`
- **Parameters**: `workflows`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(workflows) => {
      const newWorkflows = workflows.map((workflow) => {
        if (!state.updateIfExists) {
          workflow.createdAt = Date.now();
          delete workflow.id;
        }

        return workflow;
      });
      const showMessage = (event) => {
        toast(
          t('settings.backupWorkflows.workflowsAdded', {
            count: Object.values(event).length,
          })
        );
// ...
```

---

### <a id="showmessage"></a>showMessage

- **Type**: `arrow_function`
- **Parameters**: `event`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(event) => {
        toast(
          t('settings.backupWorkflows.workflowsAdded', {
            count: Object.values(event).length,
          })
        );
      }
```

---

### <a id="onconfirm"></a>onConfirm

- **Type**: `object_property_method`
- **Parameters**: `password`
- **Description**: *No description provided.*

**Implementation**:
```javascript
onConfirm: (password) => {
            const hmac = payload.workflows.substring(0, 64);
            const encryptedWorkflows = payload.workflows.substring(64);
            const decryptedHmac = hmacSHA256(
              encryptedWorkflows,
              password
            ).toString();

            if (hmac !== decryptedHmac) {
              toast.error(t('settings.backupWorkflows.invalidPassword'));

              return;
            }

            const decryptedWorkflows = AES.decrypt(
// ...
```

---

