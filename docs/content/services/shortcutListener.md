# shortcutListener.js

**Path**: `content/services/shortcutListener.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [automaCustomEventListener](#automacustomeventlistener) | function | ❌ | `findWorkflow` |
| [customEventListener](#customeventlistener) | function | ❌ | `{}` |
| [workflowShortcutsListener](#workflowshortcutslistener) | function | ❌ | `findWorkflow, shortcutsObj` |
| [getWorkflows](#getworkflows) | function | ✅ | `` |
| [anonymous](#anonymous) | function | ✅ | `` |
| [findWorkflow](#findworkflow) | arrow_function | ❌ | `id, publicId?` |

## Detailed Description

### <a id="automacustomeventlistener"></a>automaCustomEventListener

- **Type**: `function`
- **Parameters**: `findWorkflow`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function automaCustomEventListener(findWorkflow) {
  function customEventListener({ detail }) {
    if (!detail || (!detail.id && !detail.publicId)) return;

    const workflowId = detail.id || detail.publicId;
    const workflow = findWorkflow(workflowId, Boolean(detail.publicId));

    if (!workflow) return;

    workflow.options = {
      data: detail.data || {},
    };
    sendMessage('workflow:execute', workflow, 'background');
  }

// ...
```

---

### <a id="customeventlistener"></a>customEventListener

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function customEventListener({ detail }) {
    if (!detail || (!detail.id && !detail.publicId)) return;

    const workflowId = detail.id || detail.publicId;
    const workflow = findWorkflow(workflowId, Boolean(detail.publicId));

    if (!workflow) return;

    workflow.options = {
      data: detail.data || {},
    };
    sendMessage('workflow:execute', workflow, 'background');
  }
```

---

### <a id="workflowshortcutslistener"></a>workflowShortcutsListener

- **Type**: `function`
- **Parameters**: `findWorkflow, shortcutsObj`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function workflowShortcutsListener(findWorkflow, shortcutsObj) {
  const shortcuts = Object.entries(shortcutsObj);

  if (shortcuts.length === 0) return;

  const keyboardShortcuts = shortcuts.reduce((acc, [id, value]) => {
    let workflowId = id;
    if (id.startsWith('trigger')) {
      const { 1: triggerWorkflowId } = id.split(':');
      workflowId = triggerWorkflowId;
    }

    const workflow = findWorkflow(workflowId);
    if (!workflow) return acc;

// ...
```

---

### <a id="getworkflows"></a>getWorkflows

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function getWorkflows() {
  const {
    workflows: localWorkflows,
    workflowHosts,
    teamWorkflows,
  } = await browser.storage.local.get([
    'workflows',
    'workflowHosts',
    'teamWorkflows',
  ]);

  return [
    ...Object.values(workflowHosts || {}),
    ...Object.values(localWorkflows || {}),
    ...Object.values(Object.values(teamWorkflows || {})[0] || {}),
// ...
```

---

### <a id="anonymous"></a>anonymous

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function () {
  try {
    const storage = await browser.storage.local.get('shortcuts');
    let workflows = await getWorkflows();

    const findWorkflow = (id, publicId = false) => {
      const workflow = workflows.find((item) => {
        if (publicId) {
          return item.settings.publicId === id;
        }

        return item.id === id;
      });

      return workflow;
// ...
```

---

### <a id="findworkflow"></a>findWorkflow

- **Type**: `arrow_function`
- **Parameters**: `id, publicId?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(id, publicId = false) => {
      const workflow = workflows.find((item) => {
        if (publicId) {
          return item.settings.publicId === id;
        }

        return item.id === id;
      });

      return workflow;
    }
```

---

