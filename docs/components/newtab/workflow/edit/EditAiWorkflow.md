# EditAiWorkflow.vue

**Path**: `components/newtab/workflow/edit/EditAiWorkflow.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [updateData](#updatedata) | function | ❌ | `value` |
| [getComponent](#getcomponent) | arrow_function | ❌ | `type` |
| [handleUploadFile](#handleuploadfile) | arrow_function | ✅ | `file` |
| [createNewWorkflow](#createnewworkflow) | arrow_function | ❌ | `` |
| [clearInputsAndOutputs](#clearinputsandoutputs) | arrow_function | ❌ | `` |
| [loadWorkflows](#loadworkflows) | arrow_function | ✅ | `{}` |
| [goToAIPowerSettings](#gotoaipowersettings) | arrow_function | ❌ | `` |
| [updateAIPowerToken](#updateaipowertoken) | arrow_function | ❌ | `value` |
| [saveAIPowerToken](#saveaipowertoken) | arrow_function | ❌ | `` |
| [onFlowChange](#onflowchange) | arrow_function | ❌ | `value, label` |
| [onInputParamsChange](#oninputparamschange) | arrow_function | ❌ | `item, index, value` |
| [fetchOllamaModels](#fetchollamamodels) | arrow_function | ✅ | `` |
| [onProviderChange](#onproviderchange) | arrow_function | ❌ | `provider` |

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

### <a id="updatedata"></a>updateData

- **Type**: `function`
- **Parameters**: `value`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function updateData(value) {
  emit('update:data', { ...props.data, ...value });
}
```

---

### <a id="getcomponent"></a>getComponent

- **Type**: `arrow_function`
- **Parameters**: `type`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(type) => {
  const uploadTypes = ['VIDEO', 'IMAGE', 'AUDIO', 'FILE'];
  if (uploadTypes.includes(type)) {
    return UiFileInput;
  }
  return UiInput;
}
```

---

### <a id="handleuploadfile"></a>handleUploadFile

- **Type**: `arrow_function`
- **Parameters**: `file`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async (file) => {
  try {
    const res = await postUploadFile(file, aiPowerToken.value);
    if (res.success) {
      return {
        url: res.data.fileReadUrl,
        filename: file.name,
      };
    }
    throw new Error(res.msg || 'File upload failed');
  } catch (error) {
    console.error(error);
    throw error;
  }
}
```

---

### <a id="createnewworkflow"></a>createNewWorkflow

- **Type**: `arrow_function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
() => {
  browser.tabs.create({
    url: secrets.apCreateWorkflowUrl,
  });
}
```

---

### <a id="clearinputsandoutputs"></a>clearInputsAndOutputs

- **Type**: `arrow_function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
() => {
  updateData({
    inputs: [],
    outputs: [],
    flowUuid: '',
    flowLabel: '',
  });
}
```

---

### <a id="loadworkflows"></a>loadWorkflows

- **Type**: `arrow_function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async ({ query, page }) => {
  try {
    const pageSize = 10;
    const res = await getAPFlowList(
      { page, size: pageSize, name: query },
      aiPowerToken.value
    );

    if (res.success) {
      return {
        data: res.data,
        hasMore: res.page.pages > res.page.page,
      };
    }
    toast.error(`Failed to fetch AI Power workflows: ${res.msg}`);
// ...
```

---

### <a id="gotoaipowersettings"></a>goToAIPowerSettings

- **Type**: `arrow_function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
() => {
  const url = `${secrets.apHomeUrl}/authorization`;

  window.open(url, '_blank');
}
```

---

### <a id="updateaipowertoken"></a>updateAIPowerToken

- **Type**: `arrow_function`
- **Parameters**: `value`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(value) => {
  state.aipowerToken = value;
}
```

---

### <a id="saveaipowertoken"></a>saveAIPowerToken

- **Type**: `arrow_function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
() => {
  const oldToken = currentWorkflow.settings.aipowerToken;
  const newToken = state.aipowerToken;

  // Do nothing if token hasn't changed.
  if (newToken === oldToken) {
    state.showAIPowerTokenModal = false;
    return;
  }

  const newSettings = {
    ...currentWorkflow.settings,
    aipowerToken: newToken,
  };

// ...
```

---

### <a id="onflowchange"></a>onFlowChange

- **Type**: `arrow_function`
- **Parameters**: `value, label`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(value, label) => {
  updateData({ flowUuid: value, flowLabel: label });
}
```

---

### <a id="oninputparamschange"></a>onInputParamsChange

- **Type**: `arrow_function`
- **Parameters**: `item, index, value`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(item, index, value) => {
  const newInputs = cloneDeep(props.data.inputs);
  newInputs[index].value = value;
  updateData({ inputs: newInputs });
}
```

---

### <a id="fetchollamamodels"></a>fetchOllamaModels

- **Type**: `arrow_function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async () => {
  const host = props.data.ollamaHost || 'http://localhost:11434';
  isFetchingModels.value = true;
  try {
    const client = new OllamaClient({ baseUrl: host });
    const models = await client.listModels();
    ollamaModels.value = models.map(m => ({ name: m.name }));
    
    // Auto select first model if none selected
    if (!props.data.model && ollamaModels.value.length > 0) {
      updateData({ model: ollamaModels.value[0].name });
    }
  } catch (error) {
    // console.error('Failed to fetch Ollama models', error);
    // Silent fail or toast? Toast might be annoying on load.
// ...
```

---

### <a id="onproviderchange"></a>onProviderChange

- **Type**: `arrow_function`
- **Parameters**: `provider`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(provider) => {
  updateData({ provider });
  if (provider === 'ollama') {
    fetchOllamaModels();
  }
}
```

---

