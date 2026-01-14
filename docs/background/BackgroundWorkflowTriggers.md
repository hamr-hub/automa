# BackgroundWorkflowTriggers.js

**Path**: `background/BackgroundWorkflowTriggers.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [visitWebTriggers](#visitwebtriggers) | method | ✅ | `tabId, tabUrl, spa?` |
| [scheduleWorkflow](#scheduleworkflow) | method | ✅ | `{}` |
| [contextMenu](#contextmenu) | method | ✅ | `{}, tab` |
| [reRegisterTriggers](#reregistertriggers) | method | ✅ | `isStartup?` |
| [convertToArr](#converttoarr) | arrow_function | ❌ | `value` |

## Detailed Description

### <a id="visitwebtriggers"></a>visitWebTriggers

- **Type**: `method`
- **Parameters**: `tabId, tabUrl, spa?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
static async visitWebTriggers(tabId, tabUrl, spa = false) {
    const { visitWebTriggers } = await browser.storage.local.get(
      'visitWebTriggers'
    );
    if (!visitWebTriggers || visitWebTriggers.length === 0) return;

    const triggeredWorkflow = visitWebTriggers.find(
      ({ url, isRegex, supportSPA }) => {
        if (!url.trim() || (spa && !supportSPA)) return false;

        return tabUrl.match(isRegex ? new RegExp(url, 'g') : url);
      }
    );

    if (triggeredWorkflow) {
// ...
```

---

### <a id="scheduleworkflow"></a>scheduleWorkflow

- **Type**: `method`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
static async scheduleWorkflow({ name }) {
    try {
      let workflowId = name;
      let triggerId = null;

      if (name.startsWith('trigger')) {
        const { 1: triggerWorkflowId, 2: triggerItemId } = name.split(':');
        triggerId = triggerItemId;
        workflowId = triggerWorkflowId;
      }

      const currentWorkflow = await BackgroundWorkflowUtils.getWorkflow(
        workflowId
      );
      if (!currentWorkflow) return;
// ...
```

---

### <a id="contextmenu"></a>contextMenu

- **Type**: `method`
- **Parameters**: `{}, tab`
- **Description**: *No description provided.*

**Implementation**:
```javascript
static async contextMenu({ parentMenuItemId, menuItemId, frameId }, tab) {
    try {
      if (parentMenuItemId !== 'automaContextMenu') return;
      const message = await browser.tabs.sendMessage(
        tab.id,
        {
          type: 'context-element',
        },
        { frameId }
      );

      let workflowId = menuItemId;
      if (menuItemId.startsWith('trigger')) {
        const { 1: triggerWorkflowId } = menuItemId.split(':');
        workflowId = triggerWorkflowId;
// ...
```

---

### <a id="reregistertriggers"></a>reRegisterTriggers

- **Type**: `method`
- **Parameters**: `isStartup?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
static async reRegisterTriggers(isStartup = false) {
    const { workflows, workflowHosts, teamWorkflows } =
      await browser.storage.local.get([
        'workflows',
        'workflowHosts',
        'teamWorkflows',
      ]);
    const convertToArr = (value) =>
      Array.isArray(value) ? value : Object.values(value);

    const workflowsArr = convertToArr(workflows);

    if (workflowHosts) {
      workflowsArr.push(...convertToArr(workflowHosts));
    }
// ...
```

---

### <a id="converttoarr"></a>convertToArr

- **Type**: `arrow_function`
- **Parameters**: `value`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(value) =>
      Array.isArray(value) ? value : Object.values(value)
```

---

