# Shared.vue

**Path**: `newtab/pages/workflows/Shared.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [title](#title) | object_property_method | ❌ | `` |
| [updateSharedWorkflow](#updatesharedworkflow) | function | ❌ | `data?` |
| [initEditWorkflow](#initeditworkflow) | function | ❌ | `` |
| [onEditWorkflowChange](#oneditworkflowchange) | function | ❌ | `{}` |
| [unpublishSharedWorkflow](#unpublishsharedworkflow) | function | ❌ | `` |
| [onConfirm](#onconfirm) | object_method | ✅ | `` |
| [saveUpdatedSharedWorkflow](#saveupdatedsharedworkflow) | function | ✅ | `` |
| [fetchLocalWorkflow](#fetchlocalworkflow) | function | ❌ | `` |
| [insertToLocal](#inserttolocal) | function | ❌ | `` |
| [onEditorInit](#oneditorinit) | function | ❌ | `instance` |
| [copyLink](#copylink) | function | ❌ | `e` |

## Detailed Description

### <a id="title"></a>title

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
title: () =>
    workflow.value?.name
      ? `${workflow.value.name} workflow`
      : 'Shared workflow'
```

---

### <a id="updatesharedworkflow"></a>updateSharedWorkflow

- **Type**: `function`
- **Parameters**: `data?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function updateSharedWorkflow(data = {}) {
  Object.keys(data).forEach((key) => {
    changingKeys.add(key);
  });

  sharedWorkflowStore.update({
    data,
    id: workflowId,
  });

  if (data.drawflow) {
    editor.value.setNodes(data.drawflow.nodes);
    editor.value.setEdges(data.drawflow.edges);
    editor.value.fitView();
  }
// ...
```

---

### <a id="initeditworkflow"></a>initEditWorkflow

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function initEditWorkflow() {
  ['name', 'content', 'category', 'description'].forEach((key) => {
    editState.data[key] = workflow.value[key];
  });
  editState.showModal = true;
}
```

---

### <a id="oneditworkflowchange"></a>onEditWorkflowChange

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function onEditWorkflowChange({ name, content, category, description }) {
  editState.data.name = name;
  editState.data.content = content;
  editState.data.category = category;
  editState.data.description = description;
}
```

---

### <a id="unpublishsharedworkflow"></a>unpublishSharedWorkflow

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function unpublishSharedWorkflow() {
  dialog.confirm({
    title: t('workflow.unpublish.title'),
    body: t('workflow.unpublish.body', { name: workflow.value.name }),
    okVariant: 'danger',
    okText: t('workflow.unpublish.button'),
    async onConfirm() {
      try {
        state.isUnpublishing = true;

        await supabaseAdapter.unshareWorkflow(workflowId);

        sharedWorkflowStore.delete(workflowId);
        sessionStorage.setItem(
          'shared-workflows',
// ...
```

---

### <a id="onconfirm"></a>onConfirm

- **Type**: `object_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async onConfirm() {
      try {
        state.isUnpublishing = true;

        await supabaseAdapter.unshareWorkflow(workflowId);

        sharedWorkflowStore.delete(workflowId);
        sessionStorage.setItem(
          'shared-workflows',
          JSON.stringify(workflowStore.workflows)
        );

        router.push('/');

        state.isUnpublishing = false;
// ...
```

---

### <a id="saveupdatedsharedworkflow"></a>saveUpdatedSharedWorkflow

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function saveUpdatedSharedWorkflow() {
  try {
    state.isUpdating = true;

    const payload = {};
    changingKeys.forEach((key) => {
      if (key === 'drawflow') {
        const flow = workflow.value.drawflow;
        payload.drawflow = typeof flow === 'string' ? JSON.parse(flow) : flow;
      } else {
        payload[key] = workflow.value[key];
      }
    });

    await supabaseAdapter.updateWorkflow(workflowId, payload);
// ...
```

---

### <a id="fetchlocalworkflow"></a>fetchLocalWorkflow

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function fetchLocalWorkflow() {
  const workflowData = {};
  const keys = [
    'drawflow',
    'name',
    'description',
    'icon',
    'globalData',
    'dataColumns',
    'table',
    'settings',
  ];
  const localWorkflow = workflowStore.getById(workflowId);

  keys.forEach((key) => {
// ...
```

---

### <a id="inserttolocal"></a>insertToLocal

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function insertToLocal() {
  const copy = {
    ...workflow.value,
    createdAt: Date.now(),
    version: browser.runtime.getManifest().version,
  };

  workflowStore.insert(copy, { duplicateId: true }).then(() => {
    state.hasLocalCopy = true;
  });
}
```

---

### <a id="oneditorinit"></a>onEditorInit

- **Type**: `function`
- **Parameters**: `instance`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function onEditorInit(instance) {
  instance.setInteractive(false);
  editor.value = instance;
}
```

---

### <a id="copylink"></a>copyLink

- **Type**: `function`
- **Parameters**: `e`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function copyLink(e) {
  e.target.select();
  navigator.clipboard.writeText(
    `https://extension.automa.site/workflow/${workflow.value.id}`
  );
  toast.success(t('workflow.share.linkCopied'));
}
```

---

