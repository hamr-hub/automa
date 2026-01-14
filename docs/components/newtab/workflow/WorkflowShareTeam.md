# WorkflowShareTeam.vue

**Path**: `components/newtab/workflow/WorkflowShareTeam.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [publishWorkflow](#publishworkflow) | function | ✅ | `` |
| [saveDraft](#savedraft) | function | ❌ | `` |

## Detailed Description

### <a id="default"></a>default

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
default: () => ({})
```

---

### <a id="publishworkflow"></a>publishWorkflow

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function publishWorkflow() {
  try {
    state.isPublishing = true;

    const workflow = convertWorkflow(state.workflow, ['id', 'category']);
    workflow.name = workflow.name || 'unnamed';
    workflow.tag = state.workflow.tag || 'stage';
    workflow.content = state.workflow.content || null;
    workflow.description = state.workflow.description.slice(0, 300);
    workflow.drawflow = parseJSON(workflow.drawflow, workflow.drawflow);

    delete workflow.extVersion;

    workflow.teamId = state.activeTeam;
    const result = await createWorkflow(workflow);
// ...
```

---

### <a id="savedraft"></a>saveDraft

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function saveDraft() {
  const key = `draft-team:${props.workflow.id}`;
  browser.storage.local.set({
    [key]: {
      name: state.workflow.name,
      tag: state.tag,
      content: state.workflow.content,
      category: state.workflow.category,
      description: state.workflow.description,
    },
  });
}
```

---

