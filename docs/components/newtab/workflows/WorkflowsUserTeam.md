# WorkflowsUserTeam.vue

**Path**: `components/newtab/workflows/WorkflowsUserTeam.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [onMenuSelected](#onmenuselected) | function | ❌ | `{}` |
| [onConfirm](#onconfirm) | object_property_method | ❌ | `` |
| [onConfirm](#onconfirm) | object_property_method | ✅ | `` |
| [openWorkflowPage](#openworkflowpage) | function | ❌ | `{}` |

## Detailed Description

### <a id="default"></a>default

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
default: () => ({
      by: '',
      order: '',
    })
```

---

### <a id="onmenuselected"></a>onMenuSelected

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function onMenuSelected({ id, data }) {
  if (id === 'delete') {
    dialog.confirm({
      title: t('workflow.delete'),
      okVariant: 'danger',
      body: t('message.delete', { name: data.name }),
      onConfirm: () => {
        teamWorkflowStore.delete(data.teamId, data.id);
      },
    });
  } else if (id === 'delete-team') {
    dialog.confirm({
      async: true,
      title: 'Delete workflow from team',
      okVariant: 'danger',
// ...
```

---

### <a id="onconfirm"></a>onConfirm

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
onConfirm: () => {
        teamWorkflowStore.delete(data.teamId, data.id);
      }
```

---

### <a id="onconfirm"></a>onConfirm

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
onConfirm: async () => {
        try {
          await supabaseAdapter.deleteTeamWorkflow(props.teamId, data.id);

          await teamWorkflowStore.delete(props.teamId, data.id);

          return true;
        } catch (error) {
          toast.error('Something went wrong');
          console.error(error);
          return false;
        }
      }
```

---

### <a id="openworkflowpage"></a>openWorkflowPage

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function openWorkflowPage({ id }) {
  if (isUnknownTeam.value) return;

  router.push(`/teams/${props.teamId}/workflows/${id}`);
}
```

---

