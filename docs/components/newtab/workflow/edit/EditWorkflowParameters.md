# EditWorkflowParameters.vue

**Path**: `components/newtab/workflow/edit/EditWorkflowParameters.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [addParameter](#addparameter) | function | ❌ | `` |
| [updateParam](#updateparam) | function | ❌ | `index, value` |
| [updateParamType](#updateparamtype) | function | ❌ | `index, type` |

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

### <a id="addparameter"></a>addParameter

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function addParameter() {
  state.parameters.push({
    name: 'param',
    type: 'string',
    description: '',
    defaultValue: '',
    placeholder: 'Text',
    data: paramTypes.string.data,
  });
}
```

---

### <a id="updateparam"></a>updateParam

- **Type**: `function`
- **Parameters**: `index, value`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function updateParam(index, value) {
  state.parameters[index].name = value.replace(/\s/g, '_');
}
```

---

### <a id="updateparamtype"></a>updateParamType

- **Type**: `function`
- **Parameters**: `index, type`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function updateParamType(index, type) {
  const param = state.parameters[index];

  param.type = type;
  param.data = paramTypes[type].data || {};
}
```

---

