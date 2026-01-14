# handlerCookie.js

**Path**: `workflowEngine/blocksHandler/handlerCookie.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [getValues](#getvalues) | function | ❌ | `data, keys` |
| [cookie](#cookie) | function | ✅ | `{}` |

## Detailed Description

### <a id="getvalues"></a>getValues

- **Type**: `function`
- **Parameters**: `data, keys`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function getValues(data, keys) {
  const values = {};
  keys.forEach((key) => {
    const value = data[key];

    if (!value) return;

    values[key] = value;
  });

  return values;
}
```

---

### <a id="cookie"></a>cookie

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function cookie({ data, id }) {
  const hasPermission = await BrowserAPIService.permissions.contains({
    permissions: ['cookies'],
  });

  if (!hasPermission) {
    const error = new Error('no-permission');
    error.data = { permission: 'cookies' };

    throw error;
  }

  let key = data.type;
  if (key === 'get' && data.getAll) key = 'getAll';

// ...
```

---

