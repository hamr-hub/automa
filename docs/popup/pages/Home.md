# Home.vue

**Path**: `popup/pages/Home.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [openDocs](#opendocs) | function | ❌ | `` |
| [openAIGenerator](#openaigenerator) | function | ❌ | `` |
| [closeSettingsPopup](#closesettingspopup) | function | ❌ | `` |
| [togglePinWorkflow](#togglepinworkflow) | function | ❌ | `workflow` |
| [executeWorkflow](#executeworkflow) | function | ✅ | `workflow` |
| [updateWorkflow](#updateworkflow) | function | ❌ | `id, data` |
| [renameWorkflow](#renameworkflow) | function | ❌ | `{}` |
| [onConfirm](#onconfirm) | object_property_method | ❌ | `newName` |
| [deleteWorkflow](#deleteworkflow) | function | ❌ | `{}` |
| [onConfirm](#onconfirm) | object_property_method | ❌ | `` |
| [openDashboard](#opendashboard) | function | ❌ | `url` |
| [initElementSelector](#initelementselector) | function | ✅ | `` |
| [openWorkflowPage](#openworkflowpage) | function | ❌ | `{}` |
| [onTabChange](#ontabchange) | function | ❌ | `value` |

## Detailed Description

### <a id="opendocs"></a>openDocs

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function openDocs() {
  window.open(
    'https://docs.extension.automa.site/guide/quick-start.html#recording-actions',
    '_blank'
  );
}
```

---

### <a id="openaigenerator"></a>openAIGenerator

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function openAIGenerator() {
  openDashboard('/ai-workflow-generator');
}
```

---

### <a id="closesettingspopup"></a>closeSettingsPopup

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function closeSettingsPopup() {
  state.showSettingsPopup = false;
  localStorage.setItem('settingsPopup', false);
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

### <a id="executeworkflow"></a>executeWorkflow

- **Type**: `function`
- **Parameters**: `workflow`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function executeWorkflow(workflow) {
  try {
    await RendererWorkflowService.executeWorkflow(workflow, workflow.options);
    window.close();
  } catch (error) {
    console.error(error);
  }
}
```

---

### <a id="updateworkflow"></a>updateWorkflow

- **Type**: `function`
- **Parameters**: `id, data`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function updateWorkflow(id, data) {
  return workflowStore.update({
    id,
    data,
  });
}
```

---

### <a id="renameworkflow"></a>renameWorkflow

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function renameWorkflow({ id, name }) {
  dialog.prompt({
    title: t('home.workflow.rename'),
    placeholder: t('common.name'),
    okText: t('common.rename'),
    inputValue: name,
    onConfirm: (newName) => {
      updateWorkflow(id, { name: newName });
    },
  });
}
```

---

### <a id="onconfirm"></a>onConfirm

- **Type**: `object_property_method`
- **Parameters**: `newName`
- **Description**: *No description provided.*

**Implementation**:
```javascript
onConfirm: (newName) => {
      updateWorkflow(id, { name: newName });
    }
```

---

### <a id="deleteworkflow"></a>deleteWorkflow

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function deleteWorkflow({ id, hostId, name }) {
  dialog.confirm({
    title: t('home.workflow.delete'),
    okVariant: 'danger',
    body: t('message.delete', { name }),
    onConfirm: () => {
      if (state.activeTab === 'local') {
        workflowStore.delete(id);
      } else {
        hostedWorkflowStore.delete(hostId);
      }
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
      if (state.activeTab === 'local') {
        workflowStore.delete(id);
      } else {
        hostedWorkflowStore.delete(hostId);
      }
    }
```

---

### <a id="opendashboard"></a>openDashboard

- **Type**: `function`
- **Parameters**: `url`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function openDashboard(url) {
  BackgroundUtils.openDashboard(url);
}
```

---

### <a id="initelementselector"></a>initElementSelector

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function initElementSelector() {
  const [tab] = await browser.tabs.query({
    url: '*://*/*',
    active: true,
    currentWindow: true,
  });
  if (!tab) return;
  initElementSelectorFunc(tab).then(() => {
    window.close();
  });
}
```

---

### <a id="openworkflowpage"></a>openWorkflowPage

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function openWorkflowPage({ id, hostId }) {
  let url = `/workflows/${id}`;

  if (state.activeTab === 'host') {
    url = `/workflows/${hostId}/host`;
  }

  openDashboard(url);
}
```

---

### <a id="ontabchange"></a>onTabChange

- **Type**: `function`
- **Parameters**: `value`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function onTabChange(value) {
  localStorage.setItem('popup-tab', value);
}
```

---

