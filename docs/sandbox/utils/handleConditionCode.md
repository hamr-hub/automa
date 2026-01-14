# handleConditionCode.js

**Path**: `sandbox/utils/handleConditionCode.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [anonymous](#anonymous) | function | ❌ | `data` |
| [done](#done) | object_property_method | ❌ | `result` |

## Detailed Description

### <a id="anonymous"></a>anonymous

- **Type**: `function`
- **Parameters**: `data`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function (data) {
  const propertyName = `automa${data.id}`;

  const script = document.createElement('script');
  script.textContent = `
    (async () => {
      function automaRefData(keyword, path = '') {
        if (!keyword) return null;
        if (!path) return ${propertyName}.refData[keyword];

        return window.$getNestedProperties(${propertyName}.refData, keyword + '.' + path);
      }

      try {
        ${data.data.code}
// ...
```

---

### <a id="done"></a>done

- **Type**: `object_property_method`
- **Parameters**: `result`
- **Description**: *No description provided.*

**Implementation**:
```javascript
done: (result) => {
      script.remove();
      delete window[propertyName];

      window.top.postMessage(
        {
          result,
          id: data.id,
          type: 'sandbox',
        },
        '*'
      );
    }
```

---

