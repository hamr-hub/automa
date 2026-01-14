# handlerConditions.js

**Path**: `workflowEngine/blocksHandler/handlerConditions.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [checkConditions](#checkconditions) | function | ❌ | `data, conditionOptions` |
| [testAllConditions](#testallconditions) | arrow_function | ✅ | `` |
| [conditions](#conditions) | function | ✅ | `{}, {}` |
| [checkCodeCondition](#checkcodecondition) | object_property_method | ❌ | `payload` |
| [sendMessage](#sendmessage) | object_property_method | ❌ | `payload` |

## Detailed Description

### <a id="checkconditions"></a>checkConditions

- **Type**: `function`
- **Parameters**: `data, conditionOptions`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function checkConditions(data, conditionOptions) {
  return new Promise((resolve, reject) => {
    let retryCount = 1;
    const replacedValue = {};

    const testAllConditions = async () => {
      try {
        for (let index = 0; index < data.conditions.length; index += 1) {
          const result = await testConditions(
            data.conditions[index].conditions,
            conditionOptions
          );

          Object.assign(replacedValue, result?.replacedValue || {});

// ...
```

---

### <a id="testallconditions"></a>testAllConditions

- **Type**: `arrow_function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async () => {
      try {
        for (let index = 0; index < data.conditions.length; index += 1) {
          const result = await testConditions(
            data.conditions[index].conditions,
            conditionOptions
          );

          Object.assign(replacedValue, result?.replacedValue || {});

          if (result.isMatch) {
            resolve({ match: true, index, replacedValue });
            return;
          }
        }
// ...
```

---

### <a id="conditions"></a>conditions

- **Type**: `function`
- **Parameters**: `{}, {}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function conditions({ data, id }, { prevBlockData, refData }) {
  if (data.conditions.length === 0) {
    throw new Error('conditions-empty');
  }

  let resultData = '';
  let isConditionMet = false;
  let outputId = 'fallback';

  const replacedValue = {};
  const condition = data.conditions[0];
  const prevData = Array.isArray(prevBlockData)
    ? prevBlockData[0]
    : prevBlockData;

// ...
```

---

### <a id="checkcodecondition"></a>checkCodeCondition

- **Type**: `object_property_method`
- **Parameters**: `payload`
- **Description**: *No description provided.*

**Implementation**:
```javascript
checkCodeCondition: (payload) => {
        payload.debugMode = debugMode;
        return checkCodeCondition(this.activeTab, payload);
      }
```

---

### <a id="sendmessage"></a>sendMessage

- **Type**: `object_property_method`
- **Parameters**: `payload`
- **Description**: *No description provided.*

**Implementation**:
```javascript
sendMessage: (payload) =>
        this._sendMessageToTab({ ...payload.data, label: 'conditions', id })
```

---

