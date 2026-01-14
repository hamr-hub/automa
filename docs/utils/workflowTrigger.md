# workflowTrigger.js

**Path**: `utils/workflowTrigger.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [registerContextMenu](#registercontextmenu) | function | ❌ | `triggerId, data` |
| [removeFromWorkflowQueue](#removefromworkflowqueue) | function | ✅ | `workflowId` |
| [cleanWorkflowTriggers](#cleanworkflowtriggers) | function | ✅ | `workflowId, triggers` |
| [removeFromContextMenu](#removefromcontextmenu) | arrow_function | ✅ | `` |
| [registerSpecificDay](#registerspecificday) | function | ❌ | `workflowId, data` |
| [getDate](#getdate) | arrow_function | ❌ | `dayId, time` |
| [registerInterval](#registerinterval) | function | ❌ | `workflowId, data` |
| [registerSpecificDate](#registerspecificdate) | function | ✅ | `workflowId, data` |
| [registerVisitWeb](#registervisitweb) | function | ✅ | `workflowId, data` |
| [registerKeyboardShortcut](#registerkeyboardshortcut) | function | ✅ | `workflowId, data` |
| [registerOnStartup](#registeronstartup) | function | ✅ | `` |
| [registerCronJob](#registercronjob) | function | ✅ | `workflowId, data` |
| [registerWorkflowTrigger](#registerworkflowtrigger) | function | ✅ | `workflowId, {}` |

## Detailed Description

### <a id="registercontextmenu"></a>registerContextMenu

- **Type**: `function`
- **Parameters**: `triggerId, data`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function registerContextMenu(triggerId, data) {
  return new Promise((resolve, reject) => {
    const documentUrlPatterns = ['https://*/*', 'http://*/*'];
    const contextTypes =
      !data.contextTypes || data.contextTypes.length === 0
        ? ['all']
        : data.contextTypes;

    const isFirefox = BROWSER_TYPE === 'firefox';
    const browserContext = isFirefox ? browser.menus : browser.contextMenus;

    if (!browserContext) {
      resolve();
      return;
    }
// ...
```

---

### <a id="removefromworkflowqueue"></a>removeFromWorkflowQueue

- **Type**: `function`
- **Parameters**: `workflowId`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function removeFromWorkflowQueue(workflowId) {
  const { workflowQueue } = await browser.storage.local.get('workflowQueue');
  const queueIndex = (workflowQueue || []).findIndex((id) =>
    id.includes(workflowId)
  );

  if (!workflowQueue || queueIndex === -1) return;

  workflowQueue.splice(queueIndex, 1);

  await browser.storage.local.set({ workflowQueue });
}
```

---

### <a id="cleanworkflowtriggers"></a>cleanWorkflowTriggers

- **Type**: `function`
- **Parameters**: `workflowId, triggers`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function cleanWorkflowTriggers(workflowId, triggers) {
  try {
    const alarms = await browser.alarms.getAll();
    for (const alarm of alarms) {
      if (alarm.name.includes(workflowId)) {
        await browser.alarms.clear(alarm.name);
      }
    }

    const { visitWebTriggers, onStartupTriggers, shortcuts } =
      await browser.storage.local.get([
        'shortcuts',
        'visitWebTriggers',
        'onStartupTriggers',
      ]);
// ...
```

---

### <a id="removefromcontextmenu"></a>removeFromContextMenu

- **Type**: `arrow_function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async () => {
      try {
        let promises = [];

        if (triggers) {
          promises = triggers.map(async (trigger) => {
            if (trigger.type !== 'context-menu') return;

            const triggerId = `trigger:${workflowId}:${trigger.id}`;
            await browserContextMenu.remove(triggerId);
          });
        }

        promises.push(browserContextMenu.remove(workflowId));

// ...
```

---

### <a id="registerspecificday"></a>registerSpecificDay

- **Type**: `function`
- **Parameters**: `workflowId, data`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function registerSpecificDay(workflowId, data) {
  if (data.days.length === 0) return null;

  const getDate = (dayId, time) => {
    const [hour, minute, seconds] = time.split(':');
    const date = dayjs()
      .day(dayId)
      .hour(hour)
      .minute(minute)
      .second(seconds || 0);

    return date.valueOf();
  };

  const dates = data.days
// ...
```

---

### <a id="getdate"></a>getDate

- **Type**: `arrow_function`
- **Parameters**: `dayId, time`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(dayId, time) => {
    const [hour, minute, seconds] = time.split(':');
    const date = dayjs()
      .day(dayId)
      .hour(hour)
      .minute(minute)
      .second(seconds || 0);

    return date.valueOf();
  }
```

---

### <a id="registerinterval"></a>registerInterval

- **Type**: `function`
- **Parameters**: `workflowId, data`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function registerInterval(workflowId, data) {
  const alarmInfo = {
    periodInMinutes: data.interval,
  };

  if (data.delay > 0 && !data.fixedDelay) alarmInfo.delayInMinutes = data.delay;

  return browser.alarms.create(workflowId, alarmInfo);
}
```

---

### <a id="registerspecificdate"></a>registerSpecificDate

- **Type**: `function`
- **Parameters**: `workflowId, data`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function registerSpecificDate(workflowId, data) {
  let date = Date.now() + 60000;

  if (data.date) {
    const [hour, minute, second] = data.time.split(':');
    date = dayjs(data.date)
      .hour(hour)
      .minute(minute)
      .second(second || 0)
      .valueOf();
  }

  if (Date.now() > date) return;

  await browser.alarms.create(workflowId, {
// ...
```

---

### <a id="registervisitweb"></a>registerVisitWeb

- **Type**: `function`
- **Parameters**: `workflowId, data`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function registerVisitWeb(workflowId, data) {
  try {
    if (data.url.trim() === '') return;

    const visitWebTriggers =
      (await browser.storage.local.get('visitWebTriggers'))?.visitWebTriggers ||
      [];

    const index = visitWebTriggers.findIndex((item) => item.id === workflowId);
    const payload = {
      id: workflowId,
      url: data.url,
      isRegex: data.isUrlRegex,
      supportSPA: data.supportSPA ?? false,
    };
// ...
```

---

### <a id="registerkeyboardshortcut"></a>registerKeyboardShortcut

- **Type**: `function`
- **Parameters**: `workflowId, data`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function registerKeyboardShortcut(workflowId, data) {
  try {
    const { shortcuts } = await browser.storage.local.get('shortcuts');
    const keyboardShortcuts = Array.isArray(shortcuts) ? {} : shortcuts || {};

    keyboardShortcuts[workflowId] = data.shortcut;

    await browser.storage.local.set({ shortcuts: keyboardShortcuts });
  } catch (error) {
    console.error(error);
  }
}
```

---

### <a id="registeronstartup"></a>registerOnStartup

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function registerOnStartup() {
  // Do nothing
}
```

---

### <a id="registercronjob"></a>registerCronJob

- **Type**: `function`
- **Parameters**: `workflowId, data`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function registerCronJob(workflowId, data) {
  try {
    const cronExpression = cronParser.parseExpression(data.expression);
    const nextSchedule = cronExpression.next();

    await browser.alarms.create(workflowId, { when: nextSchedule.getTime() });
  } catch (error) {
    console.error(error);
  }
}
```

---

### <a id="registerworkflowtrigger"></a>registerWorkflowTrigger

- **Type**: `function`
- **Parameters**: `workflowId, {}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function registerWorkflowTrigger(workflowId, { data }) {
  try {
    await cleanWorkflowTriggers(workflowId, data && data?.triggers);

    if (data.triggers) {
      for (const trigger of data.triggers) {
        const handler = workflowTriggersMap[trigger.type];
        if (handler)
          await handler(`trigger:${workflowId}:${trigger.id}`, trigger.data);
      }
    } else if (workflowTriggersMap[data.type]) {
      await workflowTriggersMap[data.type](workflowId, data);
    }
  } catch (error) {
    console.error(error);
// ...
```

---

