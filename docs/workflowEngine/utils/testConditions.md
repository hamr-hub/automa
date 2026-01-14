# testConditions.js

**Path**: `workflowEngine/utils/testConditions.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [isBoolStr](#isboolstr) | arrow_function | ❌ | `str` |
| [isNumStr](#isnumstr) | arrow_function | ❌ | `str` |
| [eq](#eq) | object_property_method | ❌ | `a, b` |
| [eqi](#eqi) | object_property_method | ❌ | `a, b` |
| [nq](#nq) | object_property_method | ❌ | `a, b` |
| [gt](#gt) | object_property_method | ❌ | `a, b` |
| [gte](#gte) | object_property_method | ❌ | `a, b` |
| [lt](#lt) | object_property_method | ❌ | `a, b` |
| [lte](#lte) | object_property_method | ❌ | `a, b` |
| [cnt](#cnt) | object_property_method | ❌ | `a, b` |
| [cni](#cni) | object_property_method | ❌ | `a, b` |
| [nct](#nct) | object_property_method | ❌ | `a, b` |
| [nci](#nci) | object_property_method | ❌ | `a, b` |
| [stw](#stw) | object_property_method | ❌ | `a, b` |
| [enw](#enw) | object_property_method | ❌ | `a, b` |
| [rgx](#rgx) | object_property_method | ❌ | `a, b` |
| [itr](#itr) | object_property_method | ❌ | `a` |
| [ifl](#ifl) | object_property_method | ❌ | `a` |
| [string](#string) | object_property_method | ❌ | `val` |
| [number](#number) | object_property_method | ❌ | `val` |
| [json](#json) | object_property_method | ❌ | `val` |
| [boolean](#boolean) | object_property_method | ❌ | `val` |
| [anonymous](#anonymous) | function | ✅ | `conditionsArr, workflowData` |
| [getConditionItemValue](#getconditionitemvalue) | function | ✅ | `{}` |
| [checkConditions](#checkconditions) | function | ✅ | `items` |

## Detailed Description

### <a id="isboolstr"></a>isBoolStr

- **Type**: `arrow_function`
- **Parameters**: `str`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(str) => {
  if (str === 'true') return true;
  if (str === 'false') return false;

  return str;
}
```

---

### <a id="isnumstr"></a>isNumStr

- **Type**: `arrow_function`
- **Parameters**: `str`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(str) => (Number.isNaN(+str) ? str : +str)
```

---

### <a id="eq"></a>eq

- **Type**: `object_property_method`
- **Parameters**: `a, b`
- **Description**: *No description provided.*

**Implementation**:
```javascript
eq: (a, b) => a === b
```

---

### <a id="eqi"></a>eqi

- **Type**: `object_property_method`
- **Parameters**: `a, b`
- **Description**: *No description provided.*

**Implementation**:
```javascript
eqi: (a, b) => a?.toLocaleLowerCase() === b?.toLocaleLowerCase()
```

---

### <a id="nq"></a>nq

- **Type**: `object_property_method`
- **Parameters**: `a, b`
- **Description**: *No description provided.*

**Implementation**:
```javascript
nq: (a, b) => a !== b
```

---

### <a id="gt"></a>gt

- **Type**: `object_property_method`
- **Parameters**: `a, b`
- **Description**: *No description provided.*

**Implementation**:
```javascript
gt: (a, b) => isNumStr(a) > isNumStr(b)
```

---

### <a id="gte"></a>gte

- **Type**: `object_property_method`
- **Parameters**: `a, b`
- **Description**: *No description provided.*

**Implementation**:
```javascript
gte: (a, b) => isNumStr(a) >= isNumStr(b)
```

---

### <a id="lt"></a>lt

- **Type**: `object_property_method`
- **Parameters**: `a, b`
- **Description**: *No description provided.*

**Implementation**:
```javascript
lt: (a, b) => isNumStr(a) < isNumStr(b)
```

---

### <a id="lte"></a>lte

- **Type**: `object_property_method`
- **Parameters**: `a, b`
- **Description**: *No description provided.*

**Implementation**:
```javascript
lte: (a, b) => isNumStr(a) <= isNumStr(b)
```

---

### <a id="cnt"></a>cnt

- **Type**: `object_property_method`
- **Parameters**: `a, b`
- **Description**: *No description provided.*

**Implementation**:
```javascript
cnt: (a, b) => a?.includes(b) ?? false
```

---

### <a id="cni"></a>cni

- **Type**: `object_property_method`
- **Parameters**: `a, b`
- **Description**: *No description provided.*

**Implementation**:
```javascript
cni: (a, b) =>
    a?.toLocaleLowerCase().includes(b?.toLocaleLowerCase()) ?? false
```

---

### <a id="nct"></a>nct

- **Type**: `object_property_method`
- **Parameters**: `a, b`
- **Description**: *No description provided.*

**Implementation**:
```javascript
nct: (a, b) => !comparisons.cnt(a, b)
```

---

### <a id="nci"></a>nci

- **Type**: `object_property_method`
- **Parameters**: `a, b`
- **Description**: *No description provided.*

**Implementation**:
```javascript
nci: (a, b) => !comparisons.cni(a, b)
```

---

### <a id="stw"></a>stw

- **Type**: `object_property_method`
- **Parameters**: `a, b`
- **Description**: *No description provided.*

**Implementation**:
```javascript
stw: (a, b) => a?.startsWith(b) ?? false
```

---

### <a id="enw"></a>enw

- **Type**: `object_property_method`
- **Parameters**: `a, b`
- **Description**: *No description provided.*

**Implementation**:
```javascript
enw: (a, b) => a?.endsWith(b) ?? false
```

---

### <a id="rgx"></a>rgx

- **Type**: `object_property_method`
- **Parameters**: `a, b`
- **Description**: *No description provided.*

**Implementation**:
```javascript
rgx: (a, b) => {
    const match = b.match(/^\/(.*?)\/([gimy]*)$/);
    const regex = match ? new RegExp(match[1], match[2]) : new RegExp(b);

    return regex.test(a);
  }
```

---

### <a id="itr"></a>itr

- **Type**: `object_property_method`
- **Parameters**: `a`
- **Description**: *No description provided.*

**Implementation**:
```javascript
itr: (a) => Boolean(isBoolStr(a))
```

---

### <a id="ifl"></a>ifl

- **Type**: `object_property_method`
- **Parameters**: `a`
- **Description**: *No description provided.*

**Implementation**:
```javascript
ifl: (a) => !isBoolStr(a)
```

---

### <a id="string"></a>string

- **Type**: `object_property_method`
- **Parameters**: `val`
- **Description**: *No description provided.*

**Implementation**:
```javascript
string: (val) => `${val}`
```

---

### <a id="number"></a>number

- **Type**: `object_property_method`
- **Parameters**: `val`
- **Description**: *No description provided.*

**Implementation**:
```javascript
number: (val) => +val
```

---

### <a id="json"></a>json

- **Type**: `object_property_method`
- **Parameters**: `val`
- **Description**: *No description provided.*

**Implementation**:
```javascript
json: (val) => parseJSON(val, null)
```

---

### <a id="boolean"></a>boolean

- **Type**: `object_property_method`
- **Parameters**: `val`
- **Description**: *No description provided.*

**Implementation**:
```javascript
boolean: (val) => Boolean(isBoolStr(val))
```

---

### <a id="anonymous"></a>anonymous

- **Type**: `function`
- **Parameters**: `conditionsArr, workflowData`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function (conditionsArr, workflowData) {
  const result = {
    isMatch: false,
    replacedValue: {},
  };

  async function getConditionItemValue({ type, data }) {
    if (type.startsWith('data')) {
      let dataPath = data.dataPath.trim().replace('@', '.');
      const isInsideBrackets =
        dataPath.startsWith('{{') && dataPath.endsWith('}}');

      if (!isInsideBrackets) {
        dataPath = `{{${dataPath}}}`;
      }
// ...
```

---

### <a id="getconditionitemvalue"></a>getConditionItemValue

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function getConditionItemValue({ type, data }) {
    if (type.startsWith('data')) {
      let dataPath = data.dataPath.trim().replace('@', '.');
      const isInsideBrackets =
        dataPath.startsWith('{{') && dataPath.endsWith('}}');

      if (!isInsideBrackets) {
        dataPath = `{{${dataPath}}}`;
      }

      let dataExists = await renderString(
        dataPath,
        workflowData.refData,
        workflowData.isPopup,
        {
// ...
```

---

### <a id="checkconditions"></a>checkConditions

- **Type**: `function`
- **Parameters**: `items`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function checkConditions(items) {
    let conditionResult = true;
    const condition = {
      value: '',
      operator: '',
    };

    for (const { category, data, type } of items) {
      if (!conditionResult) return conditionResult;

      if (category === 'compare') {
        const { needValue } = conditionBuilder.compareTypes.find(
          ({ id }) => id === type
        );

// ...
```

---

