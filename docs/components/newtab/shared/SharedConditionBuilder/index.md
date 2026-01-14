# index.vue

**Path**: `components/newtab/shared/SharedConditionBuilder/index.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [default](#default) | object_property_method | ❌ | `` |
| [getDefaultValues](#getdefaultvalues) | function | ❌ | `items?` |
| [selectValue](#selectvalue) | arrow_function | ❌ | `type` |
| [getConditionText](#getconditiontext) | function | ❌ | `{}` |
| [addOrCondition](#addorcondition) | function | ❌ | `` |
| [addAndCondition](#addandcondition) | function | ❌ | `index` |
| [deleteCondition](#deletecondition) | function | ❌ | `index, itemIndex` |
| [onDragEnd](#ondragend) | function | ❌ | `` |

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

### <a id="getdefaultvalues"></a>getDefaultValues

- **Type**: `function`
- **Parameters**: `items?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function getDefaultValues(items = ['value', 'compare', 'value']) {
  const defaultValues = {
    value: {
      type: 'value',
      category: 'value',
      data: { value: '' },
    },
    compare: { category: 'compare', type: 'eq' },
  };
  const selectValue = (type) =>
    cloneDeep({
      ...defaultValues[type],
      id: nanoid(),
    });

// ...
```

---

### <a id="selectvalue"></a>selectValue

- **Type**: `arrow_function`
- **Parameters**: `type`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(type) =>
    cloneDeep({
      ...defaultValues[type],
      id: nanoid(),
    })
```

---

### <a id="getconditiontext"></a>getConditionText

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function getConditionText({ category, type, data }) {
  if (category === 'compare') {
    return conditionBuilder.compareTypes.find(({ id }) => id === type).name;
  }

  let text = '';

  if (type === 'value') {
    text = data.value || 'Empty';
  } else if (type.startsWith('code')) {
    text = 'JS Code';
  } else if (type.startsWith('element')) {
    text = type;

    const textDetail = data.attrName || data.selector;
// ...
```

---

### <a id="addorcondition"></a>addOrCondition

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function addOrCondition() {
  const newOrCondition = getDefaultValues();

  conditions.value.push({
    id: nanoid(),
    conditions: [{ id: nanoid(), items: newOrCondition }],
  });
}
```

---

### <a id="addandcondition"></a>addAndCondition

- **Type**: `function`
- **Parameters**: `index`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function addAndCondition(index) {
  const newAndCondition = getDefaultValues();

  conditions.value[index].conditions.push({
    id: nanoid(),
    items: newAndCondition,
  });
}
```

---

### <a id="deletecondition"></a>deleteCondition

- **Type**: `function`
- **Parameters**: `index, itemIndex`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function deleteCondition(index, itemIndex) {
  const condition = conditions.value[index].conditions;

  condition.splice(itemIndex, 1);

  if (condition.length === 0) conditions.value.splice(index, 1);
}
```

---

### <a id="ondragend"></a>onDragEnd

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function onDragEnd() {
  conditions.value.forEach((item, index) => {
    if (item.conditions.length > 0) return;

    conditions.value.splice(index, 1);
  });
}
```

---

