# handlerWhileLoop.js

**Path**: `workflowEngine/blocksHandler/handlerWhileLoop.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [whileLoop](#whileloop) | function | ✅ | `{}, {}` |
| [checkCodeCondition](#checkcodecondition) | object_property_method | ❌ | `payload` |
| [sendMessage](#sendmessage) | object_property_method | ❌ | `payload` |

## Detailed Description

### <a id="whileloop"></a>whileLoop

- **Type**: `function`
- **Parameters**: `{}, {}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function whileLoop({ data, id }, { refData }) {
  const { debugMode } = this.engine.workflow?.settings || {};
  const conditionPayload = {
    refData,
    isMV2: this.engine.isMV2,
    isPopup: this.engine.isPopup,
    activeTab: this.activeTab.id,
    checkCodeCondition: (payload) => {
      payload.debugMode = debugMode;
      return checkCodeCondition(this.activeTab, payload);
    },
    sendMessage: (payload) =>
      this._sendMessageToTab({ ...payload.data, label: 'conditions', id }),
  };
  const result = await testConditions(data.conditions, conditionPayload);
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

