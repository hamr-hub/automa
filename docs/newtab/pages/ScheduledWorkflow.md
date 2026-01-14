# ScheduledWorkflow.vue

**Path**: `newtab/pages/ScheduledWorkflow.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [scheduleText](#scheduletext) | function | ❌ | `data` |
| [getTriggersData](#gettriggersdata) | function | ✅ | `triggerData, {}` |
| [getTrigger](#gettrigger) | arrow_function | ✅ | `trigger` |
| [refreshSchedule](#refreshschedule) | function | ✅ | `id` |
| [getWorkflowTrigger](#getworkflowtrigger) | function | ✅ | `workflow, {}` |
| [iterateWorkflows](#iterateworkflows) | function | ❌ | `{}` |
| [onSelectedWorkflow](#onselectedworkflow) | function | ❌ | `{}` |
| [clearAddWorkflowSchedule](#clearaddworkflowschedule) | function | ❌ | `` |
| [updateWorkflowTrigger](#updateworkflowtrigger) | function | ✅ | `` |
| [path](#path) | object_property_method | ❌ | `{}` |
| [path](#path) | object_property_method | ❌ | `{}` |
| [path](#path) | object_property_method | ❌ | `{}` |

## Detailed Description

### <a id="scheduletext"></a>scheduleText

- **Type**: `function`
- **Parameters**: `data`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function scheduleText(data) {
  const text = {
    schedule: '',
    scheduleDetail: '',
  };

  switch (data.type) {
    case 'specific-day': {
      let rows = '';

      const days = data.days.map((item) => {
        const day = t(`workflow.blocks.trigger.days.${item.id}`);
        rows += `<tr><td>${day}</td> <td>${item.times.join(', ')}</td></tr>`;

        return day;
// ...
```

---

### <a id="gettriggersdata"></a>getTriggersData

- **Type**: `function`
- **Parameters**: `triggerData, {}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function getTriggersData(triggerData, { id, name }) {
  try {
    const alarms = await browser.alarms.getAll();
    const getTrigger = async (trigger) => {
      try {
        if (!trigger || !scheduledTypes.includes(trigger.type)) return null;

        rowId += 1;
        const triggerObj = {
          name,
          id: rowId,
          nextRun: '-',
          schedule: '',
          active: false,
          type: trigger.type,
// ...
```

---

### <a id="gettrigger"></a>getTrigger

- **Type**: `arrow_function`
- **Parameters**: `trigger`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async (trigger) => {
      try {
        if (!trigger || !scheduledTypes.includes(trigger.type)) return null;

        rowId += 1;
        const triggerObj = {
          name,
          id: rowId,
          nextRun: '-',
          schedule: '',
          active: false,
          type: trigger.type,
          workflowId: id,
          triggerId: trigger.id || null,
        };
// ...
```

---

### <a id="refreshschedule"></a>refreshSchedule

- **Type**: `function`
- **Parameters**: `id`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function refreshSchedule(id) {
  try {
    const triggerData = triggersData[id] ? cloneDeep(triggersData[id]) : null;
    if (!triggerData) return;

    const handler = workflowTriggersMap[triggerData.type];
    if (!handler) return;

    if (triggerData.id) {
      triggerData.workflow.id = `trigger:${triggerData.workflow.id}:${triggerData.id}`;
    }

    await registerWorkflowTrigger(triggerData.workflow.id, {
      data: triggerData,
    });
// ...
```

---

### <a id="getworkflowtrigger"></a>getWorkflowTrigger

- **Type**: `function`
- **Parameters**: `workflow, {}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function getWorkflowTrigger(workflow, { location, path }) {
  if (workflow.isDisabled) return;

  let { trigger } = workflow;

  if (!trigger) {
    const drawflow =
      typeof workflow.drawflow === 'string'
        ? JSON.parse(workflow.drawflow)
        : workflow.drawflow;
    trigger = findTriggerBlock(drawflow)?.data;
  }

  const triggersList = await getTriggersData(trigger, workflow);
  if (triggersList.length !== 0) {
// ...
```

---

### <a id="iterateworkflows"></a>iterateWorkflows

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function iterateWorkflows({ workflows, path, location }) {
  const promises = workflows.map(async (workflow) => {
    const workflowPath = path(workflow);

    await getWorkflowTrigger(workflow, { path: workflowPath, location });
  });

  return Promise.allSettled(promises);
}
```

---

### <a id="onselectedworkflow"></a>onSelectedWorkflow

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function onSelectedWorkflow({ item }) {
  if (!item.drawflow?.nodes) return;

  const triggerBlock = findTriggerBlock(item.drawflow);
  if (!triggerBlock) return;

  let { triggersList } = triggerBlock.data;
  if (!triggersList) {
    triggersList = [
      {
        data: { ...triggerBlock.data },
        type: triggerBlock.data.type,
        id: nanoid(5),
      },
    ];
// ...
```

---

### <a id="clearaddworkflowschedule"></a>clearAddWorkflowSchedule

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function clearAddWorkflowSchedule() {
  Object.assign(scheduleState, {
    query: '',
    showModal: false,
    selectedWorkflow: {
      id: '',
      name: '',
      triggers: [],
    },
  });
}
```

---

### <a id="updateworkflowtrigger"></a>updateWorkflowTrigger

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function updateWorkflowTrigger() {
  try {
    const {
      triggers: workflowTriggers,
      id,
      name,
    } = scheduleState.selectedWorkflow;
    const workflowData = workflowStore.getById(id);
    if (!workflowData || !workflowData?.drawflow?.nodes) return;

    const triggerBlockIndex = workflowData.drawflow.nodes.findIndex(
      (node) => node.label === 'trigger'
    );
    if (triggerBlockIndex === -1) return;

// ...
```

---

### <a id="path"></a>path

- **Type**: `object_property_method`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
path: ({ id }) => `/workflows/${id}`
```

---

### <a id="path"></a>path

- **Type**: `object_property_method`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
path: ({ id }) => `/workflows/${id}/hosted`
```

---

### <a id="path"></a>path

- **Type**: `object_property_method`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
path: ({ id }) =>
          teamExist ? null : `/teams/${teamId}/workflows/${id}`
```

---

