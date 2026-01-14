# App.vue

**Path**: `content/commandPalette/App.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [getReadableShortcut](#getreadableshortcut) | function | ❌ | `str` |
| [clearParamsState](#clearparamsstate) | function | ❌ | `` |
| [sendExecuteCommand](#sendexecutecommand) | function | ❌ | `workflow, options?` |
| [executeWorkflow](#executeworkflow) | function | ❌ | `workflow` |
| [getParamsValues](#getparamsvalues) | function | ❌ | `params` |
| [string](#string) | object_property_method | ❌ | `str` |
| [number](#number) | object_property_method | ❌ | `num` |
| [json](#json) | object_property_method | ❌ | `value` |
| [default](#default) | object_property_method | ❌ | `value` |
| [executeWorkflowWithParams](#executeworkflowwithparams) | function | ❌ | `` |
| [onKeydown](#onkeydown) | function | ❌ | `event` |
| [onInputKeydown](#oninputkeydown) | function | ❌ | `event` |
| [checkInView](#checkinview) | function | ❌ | `container, element, partial?` |
| [onInput](#oninput) | function | ❌ | `event` |
| [openDashboard](#opendashboard) | function | ❌ | `` |

## Detailed Description

### <a id="getreadableshortcut"></a>getReadableShortcut

- **Type**: `function`
- **Parameters**: `str`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function getReadableShortcut(str) {
  const list = {
    option: {
      win: 'alt',
      mac: 'option',
    },
    mod: {
      win: 'ctrl',
      mac: '⌘',
    },
  };
  const regex = /option|mod/g;
  const replacedStr = str.replace(regex, (match) => {
    return list[match][os];
  });
// ...
```

---

### <a id="clearparamsstate"></a>clearParamsState

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function clearParamsState() {
  Object.assign(paramsState, {
    items: [],
    workflow: {},
    active: false,
    activeIndex: 0,
    inputtedVal: '',
  });
}
```

---

### <a id="sendexecutecommand"></a>sendExecuteCommand

- **Type**: `function`
- **Parameters**: `workflow, options?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function sendExecuteCommand(workflow, options = {}) {
  const workflowData = {
    ...workflow,
    includeTabId: true,
    options: { ...options, checkParams: false },
  };
  RendererWorkflowService.executeWorkflow(workflowData);

  state.active = false;
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
  if (!workflow) return;

  let triggerData = workflow.trigger;
  if (!triggerData) {
    const triggerNode = workflow.drawflow?.nodes?.find(
      (node) => node.label === 'trigger'
    );
    triggerData = triggerNode?.data;
  }

  if (triggerData?.parameters?.length > 0) {
    const keys = new Set();
    const params = [];
    triggerData.parameters.forEach((param) => {
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

### <a id="executeworkflowwithparams"></a>executeWorkflowWithParams

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function executeWorkflowWithParams() {
  const variables = getParamsValues(paramsState.items);
  sendExecuteCommand(paramsState.workflow, { data: { variables } });

  clearParamsState();
}
```

---

### <a id="onkeydown"></a>onKeydown

- **Type**: `function`
- **Parameters**: `event`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function onKeydown(event) {
  const { ctrlKey, altKey, metaKey, key, shiftKey } = event;

  if (key === 'Escape') {
    if (paramsState.active) {
      clearParamsState();
    } else {
      state.active = false;
    }
    return;
  }

  const shortcuts = window._automaShortcuts;
  if (!shortcuts || shortcuts.length < 1) return;

// ...
```

---

### <a id="oninputkeydown"></a>onInputKeydown

- **Type**: `function`
- **Parameters**: `event`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function onInputKeydown(event) {
  const { key } = event;

  if (key !== 'Escape') {
    event.stopPropagation();
  }

  if (['ArrowDown', 'ArrowUp'].includes(key)) {
    let nextIndex = state.selectedIndex;
    const maxIndex = workflows.value.length - 1;

    if (key === 'ArrowDown') {
      nextIndex += 1;
      if (nextIndex > maxIndex) nextIndex = 0;
    } else if (key === 'ArrowUp') {
// ...
```

---

### <a id="checkinview"></a>checkInView

- **Type**: `function`
- **Parameters**: `container, element, partial?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function checkInView(container, element, partial = false) {
  const cTop = container.scrollTop;
  const cBottom = cTop + container.clientHeight;

  const eTop = element.offsetTop;
  const eBottom = eTop + element.clientHeight;

  const isTotal = eTop >= cTop && eBottom <= cBottom;
  const isPartial =
    partial &&
    ((eTop < cTop && eBottom > cTop) || (eBottom > cBottom && eTop < cBottom));

  return isTotal || isPartial;
}
```

---

### <a id="oninput"></a>onInput

- **Type**: `function`
- **Parameters**: `event`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function onInput(event) {
  const { value } = event.target;

  if (paramsState.active) {
    paramsState.inputtedVal = value;
    paramsState.activeIndex = value.split(';').length - 1;
  } else {
    state.query = value;
  }
}
```

---

### <a id="opendashboard"></a>openDashboard

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function openDashboard() {
  sendMessage('open:dashboard', '', 'background');
}
```

---

