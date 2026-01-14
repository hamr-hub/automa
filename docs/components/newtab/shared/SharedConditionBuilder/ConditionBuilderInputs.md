# ConditionBuilderInputs.vue

**Path**: `components/newtab/shared/SharedConditionBuilder/ConditionBuilderInputs.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [default](#default) | object_property_method | ❌ | `` |
| [getConditionDataList](#getconditiondatalist) | function | ❌ | `inputData` |
| [getDefaultValues](#getdefaultvalues) | function | ❌ | `items` |
| [filterValueTypes](#filtervaluetypes) | function | ❌ | `index` |
| [updateValueType](#updatevaluetype) | function | ❌ | `newType, index` |
| [updateCompareType](#updatecomparetype) | function | ❌ | `newType, index` |

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

### <a id="default"></a>default

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
default: () => []
```

---

### <a id="getconditiondatalist"></a>getConditionDataList

- **Type**: `function`
- **Parameters**: `inputData`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function getConditionDataList(inputData) {
  const keys = Object.keys(inputData.data);
  const filteredKeys = keys.filter((item) => !excludeData.includes(item));

  return filteredKeys;
}
```

---

### <a id="getdefaultvalues"></a>getDefaultValues

- **Type**: `function`
- **Parameters**: `items`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function getDefaultValues(items) {
  const defaultValues = {
    value: {
      id: nanoid(),
      type: 'value',
      category: 'value',
      data: { value: '' },
    },
    compare: { id: nanoid(), category: 'compare', type: 'eq' },
  };

  if (typeof items === 'string') return defaultValues[items];

  return items.map((item) => defaultValues[item]);
}
```

---

### <a id="filtervaluetypes"></a>filterValueTypes

- **Type**: `function`
- **Parameters**: `index`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function filterValueTypes(index) {
  return conditionBuilder.valueTypes.reduce((acc, item) => {
    if (index < 1 || item.compareable) {
      (acc[item.category] = acc[item.category] || []).push(item);
    }

    return acc;
  }, {});
}
```

---

### <a id="updatevaluetype"></a>updateValueType

- **Type**: `function`
- **Parameters**: `newType, index`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function updateValueType(newType, index) {
  const type = conditionBuilder.valueTypes.find(({ id }) => id === newType);

  if (index === 0 && !type.compareable) {
    inputsData.value.splice(index + 1);
  } else if (inputsData.value.length === 1) {
    inputsData.value.push(...getDefaultValues(['compare', 'value']));
  }

  inputsData.value[index].type = newType;
  inputsData.value[index].data = { ...type.data };
}
```

---

### <a id="updatecomparetype"></a>updateCompareType

- **Type**: `function`
- **Parameters**: `newType, index`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function updateCompareType(newType, index) {
  const { needValue } = conditionBuilder.compareTypes.find(
    ({ id }) => id === newType
  );

  if (!needValue) {
    inputsData.value.splice(index + 1);
  } else if (inputsData.value.length === 2) {
    inputsData.value.push(getDefaultValues('value'));
  }

  inputsData.value[index].type = newType;
}
```

---

