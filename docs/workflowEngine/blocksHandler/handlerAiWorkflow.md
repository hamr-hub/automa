# handlerAiWorkflow.js

**Path**: `workflowEngine/blocksHandler/handlerAiWorkflow.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [aiWorkflow](#aiworkflow) | function | ✅ | `block, {}` |

## Detailed Description

### <a id="aiworkflow"></a>aiWorkflow

- **Type**: `function`
- **Parameters**: `block, {}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function aiWorkflow(block, { refData }) {
  const {
    flowUuid,
    inputs,
    assignVariable,
    variableName,
    saveData,
    dataColumn,
    provider,
    ollamaHost,
    model,
    prompt,
    systemPrompt,
    temperature,
  } = block.data;
// ...
```

---

