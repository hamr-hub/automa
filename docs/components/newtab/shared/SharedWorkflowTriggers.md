# SharedWorkflowTriggers.vue

**Path**: `components/newtab/shared/SharedWorkflowTriggers.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [addTrigger](#addtrigger) | function | ❌ | `type` |
| [updateTriggerData](#updatetriggerdata) | function | ❌ | `index, data` |

## Detailed Description

### <a id="default"></a>default

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
default: () => []
```

---

### <a id="addtrigger"></a>addTrigger

- **Type**: `function`
- **Parameters**: `type`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function addTrigger(type) {
  if (triggersData[type].onlyOne) {
    const trigerExists = triggersList.value.some(
      (trigger) => trigger.type === type
    );
    if (trigerExists) return;
  }

  triggersList.value.push({
    id: nanoid(5),
    type,
    data: cloneDeep(triggersData[type].data),
  });
}
```

---

### <a id="updatetriggerdata"></a>updateTriggerData

- **Type**: `function`
- **Parameters**: `index, data`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function updateTriggerData(index, data) {
  Object.assign(triggersList.value[index].data, data);
}
```

---

