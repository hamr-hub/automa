# handlerLoopData.js

**Path**: `workflowEngine/blocksHandler/handlerLoopData.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [loopData](#loopdata) | function | ✅ | `{}, {}` |
| [numbers](#numbers) | object_property_method | ❌ | `` |
| [table](#table) | object_property_method | ❌ | `` |
| [[computed]](#-computed-) | object_property_method | ❌ | `` |
| [[computed]](#-computed-) | object_property_method | ❌ | `` |
| [[computed]](#-computed-) | object_property_method | ❌ | `` |
| [variable](#variable) | object_property_method | ❌ | `` |
| [elements](#elements) | object_property_method | ✅ | `` |

## Detailed Description

### <a id="loopdata"></a>loopData

- **Type**: `function`
- **Parameters**: `{}, {}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function loopData({ data, id }, { refData }) {
  try {
    if (this.loopList[data.loopId]) {
      const index = this.loopList[data.loopId].index + 1;

      this.loopList[data.loopId].index = index;

      let currentLoopData;

      if (data.loopThrough === 'numbers') {
        currentLoopData = refData.loopData[data.loopId].data + 1;
      } else {
        currentLoopData = this.loopList[data.loopId].data[index];
      }

// ...
```

---

### <a id="numbers"></a>numbers

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
numbers: () => data.fromNumber
```

---

### <a id="table"></a>table

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
table: () => refData.table
```

---

### <a id="-computed-"></a>[computed]

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
'custom-data': () => JSON.parse(data.loopData)
```

---

### <a id="-computed-"></a>[computed]

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
'data-columns': () => refData.table
```

---

### <a id="-computed-"></a>[computed]

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
'google-sheets': () => refData.googleSheets[data.referenceKey]
```

---

### <a id="variable"></a>variable

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
variable: () => {
          let variableVal = objectPath.get(
            refData.variables,
            data.variableName
          );

          if (Array.isArray(variableVal)) return variableVal;

          variableVal = parseJSON(variableVal, variableVal);

          switch (typeof variableVal) {
            case 'string':
              variableVal = variableVal.split('');
              break;
            case 'number':
// ...
```

---

### <a id="elements"></a>elements

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
elements: async () => {
          const findBy = isXPath(data.elementSelector)
            ? 'xpath'
            : 'cssSelector';
          const { elements, url, loopId } = await this._sendMessageToTab({
            id,
            label: 'loop-data',
            data: {
              findBy,
              max: maxLoop,
              multiple: true,
              reverseLoop: data.reverseLoop,
              selector: data.elementSelector,
              waitForSelector: data.waitForSelector ?? false,
              waitSelectorTimeout: data.waitSelectorTimeout ?? 5000,
// ...
```

---

