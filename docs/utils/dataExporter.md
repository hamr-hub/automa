# dataExporter.js

**Path**: `utils/dataExporter.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [generateJSON](#generatejson) | function | ❌ | `keys, data` |
| [anonymous](#anonymous) | function | ❌ | `data, {}, converted` |
| [extractObj](#extractobj) | arrow_function | ❌ | `obj` |

## Detailed Description

### <a id="generatejson"></a>generateJSON

- **Type**: `function`
- **Parameters**: `keys, data`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function generateJSON(keys, data) {
  if (Array.isArray(data)) return data;

  const result = [];

  keys.forEach((key) => {
    for (let index = 0; index < data[key].length; index += 1) {
      const currData = data[key][index];

      if (typeof result[index] === 'undefined') {
        result.push({ [key]: currData });
      } else {
        result[index][key] = currData;
      }
    }
// ...
```

---

### <a id="anonymous"></a>anonymous

- **Type**: `function`
- **Parameters**: `data, {}, converted`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function (
  data,
  { name, type, addBOMHeader, csvOptions, returnUrl, returnBlob },
  converted
) {
  let result = data;

  if (type === 'csv' || type === 'json' || type === 'xlsx') {
    const jsonData = converted ? data : generateJSON(Object.keys(data), data);

    if (type === 'csv') {
      result = Papa.unparse(jsonData, csvOptions || {});
    } else if (type === 'json') {
      result = JSON.stringify(jsonData, null, 2);
    } else if (type === 'xlsx') {
// ...
```

---

### <a id="extractobj"></a>extractObj

- **Type**: `arrow_function`
- **Parameters**: `obj`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(obj) => {
      if (typeof obj !== 'object') return [obj];

      // 需要处理深层对象 不然会返回:[object Object]
      const kes = Object.keys(obj);
      kes.forEach((key) => {
        const itemValue = obj[key];
        if (typeof itemValue === 'object') {
          obj[key] = JSON.stringify(itemValue);
        }
      });

      return Object.values(obj);
    }
```

---

