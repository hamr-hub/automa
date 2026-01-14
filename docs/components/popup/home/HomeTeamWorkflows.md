# HomeTeamWorkflows.vue

**Path**: `components/popup/home/HomeTeamWorkflows.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [openWorkflowPage](#openworkflowpage) | function | ❌ | `{}` |
| [executeWorkflow](#executeworkflow) | function | ❌ | `workflow` |

## Detailed Description

### <a id="openworkflowpage"></a>openWorkflowPage

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function openWorkflowPage({ teamId, id }) {
  const url = `/teams/${teamId}/workflows/${id}`;
  sendMessage('open:dashboard', url, 'background');
}
```

---

### <a id="executeworkflow"></a>executeWorkflow

- **Type**: `function`
- **Parameters**: `workflow`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function executeWorkflow(workflow) {
  sendMessage('workflow:execute', workflow, 'background');
}
```

---

