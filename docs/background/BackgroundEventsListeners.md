# BackgroundEventsListeners.js

**Path**: `background/BackgroundEventsListeners.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [handleScheduleBackup](#handleschedulebackup) | function | ✅ | `` |
| [onActionClicked](#onactionclicked) | method | ❌ | `` |
| [onCommand](#oncommand) | method | ❌ | `name` |
| [onAlarms](#onalarms) | method | ❌ | `event` |
| [onWebNavigationCompleted](#onwebnavigationcompleted) | method | ❌ | `{}` |
| [onContextMenuClicked](#oncontextmenuclicked) | method | ❌ | `event, tab` |
| [onNotificationClicked](#onnotificationclicked) | method | ✅ | `notificationId` |
| [onRuntimeStartup](#onruntimestartup) | method | ❌ | `` |
| [onHistoryStateUpdated](#onhistorystateupdated) | method | ❌ | `{}` |
| [onRuntimeInstalled](#onruntimeinstalled) | method | ✅ | `{}` |

## Detailed Description

### <a id="handleschedulebackup"></a>handleScheduleBackup

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function handleScheduleBackup() {
  try {
    const { localBackupSettings, workflows } = await browser.storage.local.get([
      'localBackupSettings',
      'workflows',
    ]);
    if (!localBackupSettings) return;

    const workflowsData = Object.values(workflows || []).reduce(
      (acc, workflow) => {
        if (workflow.isProtected) return acc;

        delete workflow.$id;
        delete workflow.createdAt;
        delete workflow.data;
// ...
```

---

### <a id="onactionclicked"></a>onActionClicked

- **Type**: `method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
static onActionClicked() {
    BackgroundUtils.openDashboard();
  }
```

---

### <a id="oncommand"></a>onCommand

- **Type**: `method`
- **Parameters**: `name`
- **Description**: *No description provided.*

**Implementation**:
```javascript
static onCommand(name) {
    if (name === 'open-dashboard') {
      BackgroundUtils.openDashboard();
    } else if (name === 'element-picker') {
      initElementSelector();
    }
  }
```

---

### <a id="onalarms"></a>onAlarms

- **Type**: `method`
- **Parameters**: `event`
- **Description**: *No description provided.*

**Implementation**:
```javascript
static onAlarms(event) {
    if (event.name === 'schedule-local-backup') {
      handleScheduleBackup();
      return;
    }

    BackgroundWorkflowTriggers.scheduleWorkflow(event);
  }
```

---

### <a id="onwebnavigationcompleted"></a>onWebNavigationCompleted

- **Type**: `method`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
static onWebNavigationCompleted({ tabId, url, frameId }) {
    if (frameId > 0) return;

    BackgroundWorkflowTriggers.visitWebTriggers(tabId, url);
  }
```

---

### <a id="oncontextmenuclicked"></a>onContextMenuClicked

- **Type**: `method`
- **Parameters**: `event, tab`
- **Description**: *No description provided.*

**Implementation**:
```javascript
static onContextMenuClicked(event, tab) {
    BackgroundWorkflowTriggers.contextMenu(event, tab);
  }
```

---

### <a id="onnotificationclicked"></a>onNotificationClicked

- **Type**: `method`
- **Parameters**: `notificationId`
- **Description**: *No description provided.*

**Implementation**:
```javascript
static async onNotificationClicked(notificationId) {
    if (notificationId.startsWith('logs')) {
      const { 1: logId } = notificationId.split(':');

      const [tab] = await browser.tabs.query({
        url: browser.runtime.getURL('/newtab.html'),
      });
      if (!tab) await BackgroundUtils.openDashboard('');

      await BackgroundUtils.sendMessageToDashboard('open-logs', { logId });
    }
  }
```

---

### <a id="onruntimestartup"></a>onRuntimeStartup

- **Type**: `method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
static onRuntimeStartup() {
    browser.storage.local.remove('workflowStates');
    (browser.action || browser.browserAction).setBadgeText({ text: '' });
    BackgroundWorkflowTriggers.reRegisterTriggers(true);
  }
```

---

### <a id="onhistorystateupdated"></a>onHistoryStateUpdated

- **Type**: `method`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
static onHistoryStateUpdated({ frameId, url, tabId }) {
    if (frameId !== 0) return;

    BackgroundWorkflowTriggers.visitWebTriggers(tabId, url, true);
  }
```

---

### <a id="onruntimeinstalled"></a>onRuntimeInstalled

- **Type**: `method`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
static async onRuntimeInstalled({ reason }) {
    try {
      if (reason === 'install') {
        await browser.storage.local.set({
          logs: [],
          shortcuts: {},
          workflows: [],
          collections: [],
          workflowState: {},
          isFirstTime: true,
          visitWebTriggers: [],
        });
        await browser.windows.create({
          type: 'popup',
          state: 'maximized',
// ...
```

---

