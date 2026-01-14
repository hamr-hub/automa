# App.vue

**Path**: `params/App.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [flattenTeamWorkflows](#flattenteamworkflows) | arrow_function | ❌ | `items` |
| [findWorkflow](#findworkflow) | function | ✅ | `workflowId` |
| [deleteWorkflow](#deleteworkflow) | function | ❌ | `index` |
| [addWorkflow](#addworkflow) | function | ✅ | `workflowId` |
| [getParamsValues](#getparamsvalues) | function | ❌ | `params` |
| [string](#string) | object_property_method | ❌ | `str` |
| [number](#number) | object_property_method | ❌ | `num` |
| [json](#json) | object_property_method | ❌ | `value` |
| [default](#default) | object_property_method | ❌ | `value` |
| [runWorkflow](#runworkflow) | function | ❌ | `index, {}` |
| [cancelParamBlock](#cancelparamblock) | function | ❌ | `index, {}, message` |
| [continueWorkflow](#continueworkflow) | function | ❌ | `index, {}` |
| [isValidParams](#isvalidparams) | function | ❌ | `params` |

## Detailed Description

### <a id="flattenteamworkflows"></a>flattenTeamWorkflows

- **Type**: `arrow_function`
- **Parameters**: `items`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(items) => Object.values(Object.values(items)[0])
```

---

### <a id="findworkflow"></a>findWorkflow

- **Type**: `function`
- **Parameters**: `workflowId`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function findWorkflow(workflowId) {
  if (!workflowId) return null;

  if (workflowId.startsWith('hosted')) {
    const { workflowHosts } = await browser.storage.local.get('workflowHosts');
    if (!workflowHosts) return null;
    const _hostId = workflowId.split(':')[1];
    return workflowHosts[_hostId] || undefined;
  }

  if (workflowId.startsWith('team')) {
    const { teamWorkflows } = await browser.storage.local.get('teamWorkflows');
    if (!teamWorkflows) return null;

    const teamWorkflowsArr = flattenTeamWorkflows(teamWorkflows);
// ...
```

---

### <a id="deleteworkflow"></a>deleteWorkflow

- **Type**: `function`
- **Parameters**: `index`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function deleteWorkflow(index) {
  workflows.value.splice(index, 1);

  if (workflows.value.length === 0) {
    window.close();
  }
}
```

---

### <a id="addworkflow"></a>addWorkflow

- **Type**: `function`
- **Parameters**: `workflowId`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function addWorkflow(workflowId) {
  console.log('🚀 ~ addWorkflow ~ workflowId:', workflowId);
  try {
    const workflow =
      typeof workflowId === 'string'
        ? await findWorkflow(workflowId)
        : workflowId;
    console.log('🚀 ~ addWorkflow ~ workflow:', workflow);
    const triggerBlock = workflow.drawflow.nodes.find(
      (node) => node.label === 'trigger'
    );
    if (!triggerBlock) return;

    const params = triggerBlock.data.parameters.map((param) => ({
      ...param,
// ...
```

---

### <a id="getparamsvalues"></a>getParamsValues

- **Type**: `function`
- **Parameters**: `params`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function getParamsValues(params) {
  const getParamVal = {
    string: (str) => str,
    number: (num) => (Number.isNaN(+num) ? 0 : +num),
    json: (value) => parseJSON(value, null),
    default: (value) => value,
  };

  return params.reduce((acc, param) => {
    const valueFunc =
      getParamVal[param.type] ||
      paramsList[param.type]?.getValue ||
      getParamVal.default;
    const value = valueFunc(param.value || param.defaultValue);
    acc[param.name] = value;
// ...
```

---

### <a id="string"></a>string

- **Type**: `object_property_method`
- **Parameters**: `str`
- **Description**: *No description provided.*

**Implementation**:
```javascript
string: (str) => str
```

---

### <a id="number"></a>number

- **Type**: `object_property_method`
- **Parameters**: `num`
- **Description**: *No description provided.*

**Implementation**:
```javascript
number: (num) => (Number.isNaN(+num) ? 0 : +num)
```

---

### <a id="json"></a>json

- **Type**: `object_property_method`
- **Parameters**: `value`
- **Description**: *No description provided.*

**Implementation**:
```javascript
json: (value) => parseJSON(value, null)
```

---

### <a id="default"></a>default

- **Type**: `object_property_method`
- **Parameters**: `value`
- **Description**: *No description provided.*

**Implementation**:
```javascript
default: (value) => value
```

---

### <a id="runworkflow"></a>runWorkflow

- **Type**: `function`
- **Parameters**: `index, {}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function runWorkflow(index, { data, params }) {
  /* eslint-disable-next-line */
  const isParamsValid = isValidParams(params);
  if (!isParamsValid) return;

  const variables = getParamsValues(params);
  let payload = {
    name: 'background--workflow:execute',
    data: {
      ...data,
      options: {
        checkParams: false,
        data: { variables },
      },
    },
// ...
```

---

### <a id="cancelparamblock"></a>cancelParamBlock

- **Type**: `function`
- **Parameters**: `index, {}, message`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function cancelParamBlock(index, { data }, message) {
  browser.storage.local
    .set({
      [data.promptId]: {
        message,
        $isError: true,
      },
    })
    .then(() => {
      deleteWorkflow(index);
    });
}
```

---

### <a id="continueworkflow"></a>continueWorkflow

- **Type**: `function`
- **Parameters**: `index, {}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function continueWorkflow(index, { data, params }) {
  /* eslint-disable-next-line */
  const isParamsValid = isValidParams(params);
  if (!isParamsValid) return;

  const timeout = data.timeoutMs > 0 ? Date.now() > data.timeout : false;

  browser.storage.local
    .set({
      [data.promptId]: timeout ? { $timeout: true } : getParamsValues(params),
    })
    .then(() => {
      deleteWorkflow(index);
    });
}
```

---

### <a id="isvalidparams"></a>isValidParams

- **Type**: `function`
- **Parameters**: `params`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function isValidParams(params) {
  const isValid = params.every((param) => {
    if (!param.data?.required) return true;

    return param.value;
  });

  return isValid;
}
```

---

