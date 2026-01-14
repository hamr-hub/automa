# WorkflowShare.vue

**Path**: `components/newtab/workflow/WorkflowShare.vue`

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
    workflow.content = state.workflow.content || null;
    workflow.drawflow = parseJSON(workflow.drawflow, workflow.drawflow);
    workflow.description = state.workflow.description.slice(0, 300);

    delete workflow.extVersion;

    const result = await supabaseAdapter.createWorkflow(workflow);

    workflow.drawflow = props.workflow.drawflow;
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
  const key = `draft:${props.workflow.id}`;
  browser.storage.local.set({
    [key]: {
      content: state.workflow.content,
      category: state.workflow.category,
      description: state.workflow.description,
    },
  });
}
```

---

