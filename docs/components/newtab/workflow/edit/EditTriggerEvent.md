# EditTriggerEvent.vue

**Path**: `components/newtab/workflow/edit/EditTriggerEvent.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [getEventDetailsUrl](#geteventdetailsurl) | function | ❌ | `` |
| [updateData](#updatedata) | function | ❌ | `value` |
| [updateParams](#updateparams) | function | ❌ | `value` |
| [handleSelectChange](#handleselectchange) | function | ❌ | `value` |

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

### <a id="geteventdetailsurl"></a>getEventDetailsUrl

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function getEventDetailsUrl() {
  const eventType = toCamelCase(props.data.eventType);

  return `https://developer.mozilla.org/en-US/docs/Web/API/${eventType}/${eventType}`;
}
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

### <a id="updateparams"></a>updateParams

- **Type**: `function`
- **Parameters**: `value`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function updateParams(value) {
  params.value = value;
  updateData({ eventParams: value });
}
```

---

### <a id="handleselectchange"></a>handleSelectChange

- **Type**: `function`
- **Parameters**: `value`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function handleSelectChange(value) {
  const eventType = eventList.find(({ id }) => id === value).type;
  const payload = { eventName: value, eventType };

  if (eventType !== props.eventType) {
    const defaultParams = { bubbles: true, cancelable: true };

    payload.eventParams = defaultParams;
    params.value = defaultParams;
  }

  updateData(payload);
}
```

---

