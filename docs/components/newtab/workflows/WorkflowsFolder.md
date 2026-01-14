# WorkflowsFolder.vue

**Path**: `components/newtab/workflows/WorkflowsFolder.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [exportFolderWorkflows](#exportfolderworkflows) | function | ❌ | `folderId` |
| [onDragover](#ondragover) | function | ❌ | `event, toggle` |
| [newFolder](#newfolder) | function | ❌ | `` |
| [onConfirm](#onconfirm) | object_method | ❌ | `value` |
| [deleteFolder](#deletefolder) | function | ❌ | `{}` |
| [onConfirm](#onconfirm) | object_method | ❌ | `` |
| [renameFolder](#renamefolder) | function | ❌ | `{}` |
| [onConfirm](#onconfirm) | object_method | ❌ | `newName` |
| [onWorkflowsDrop](#onworkflowsdrop) | function | ✅ | `{}, folderId` |

## Detailed Description

### <a id="exportfolderworkflows"></a>exportFolderWorkflows

- **Type**: `function`
- **Parameters**: `folderId`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function exportFolderWorkflows(folderId) {
  const workflows = workflowStore.getWorkflows.filter(
    (item) => item.folderId === folderId
  );
  workflows.forEach((workflow) => {
    exportWorkflow(workflow);
  });
}
```

---

### <a id="ondragover"></a>onDragover

- **Type**: `function`
- **Parameters**: `event, toggle`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function onDragover(event, toggle) {
  const parent = event.target.closest('.ui-list-item');
  if (!parent) return;

  event.preventDefault();
  parent.classList.toggle('ring-2', toggle);
}
```

---

### <a id="newfolder"></a>newFolder

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function newFolder() {
  dialog.prompt({
    title: t('workflows.folder.new'),
    placeholder: t('workflows.folder.name'),
    okText: t('common.add'),
    onConfirm(value) {
      if (!value || !value.trim()) return false;

      folderStore.addFolder(value);

      return true;
    },
  });
}
```

---

### <a id="onconfirm"></a>onConfirm

- **Type**: `object_method`
- **Parameters**: `value`
- **Description**: *No description provided.*

**Implementation**:
```javascript
onConfirm(value) {
      if (!value || !value.trim()) return false;

      folderStore.addFolder(value);

      return true;
    }
```

---

### <a id="deletefolder"></a>deleteFolder

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function deleteFolder({ name, id }) {
  dialog.confirm({
    title: t('workflows.folder.delete'),
    body: t('message.delete', { name }),
    okText: t('common.delete'),
    okVariant: 'danger',
    onConfirm() {
      folderStore.deleteFolder(id);

      emit('update:modelValue', '');
    },
  });
}
```

---

### <a id="onconfirm"></a>onConfirm

- **Type**: `object_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
onConfirm() {
      folderStore.deleteFolder(id);

      emit('update:modelValue', '');
    }
```

---

### <a id="renamefolder"></a>renameFolder

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function renameFolder({ id, name }) {
  dialog.prompt({
    inputValue: name,
    okText: t('common.rename'),
    title: t('workflows.folder.rename'),
    placeholder: t('workflows.folder.name'),
    onConfirm(newName) {
      if (!newName || !newName.trim()) return false;

      folderStore.updateFolder(id, { name: newName });

      return true;
    },
  });
}
```

---

### <a id="onconfirm"></a>onConfirm

- **Type**: `object_method`
- **Parameters**: `newName`
- **Description**: *No description provided.*

**Implementation**:
```javascript
onConfirm(newName) {
      if (!newName || !newName.trim()) return false;

      folderStore.updateFolder(id, { name: newName });

      return true;
    }
```

---

### <a id="onworkflowsdrop"></a>onWorkflowsDrop

- **Type**: `function`
- **Parameters**: `{}, folderId`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function onWorkflowsDrop({ dataTransfer }, folderId) {
  const ids = parseJSON(dataTransfer.getData('workflows'), null);
  if (!ids || !Array.isArray(ids)) return;

  try {
    for (const id of ids) {
      await workflowStore.update({
        id,
        data: { folderId },
      });
    }
  } catch (error) {
    console.error(error);
  }
}
```

---

