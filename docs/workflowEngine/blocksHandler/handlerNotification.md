# handlerNotification.js

**Path**: `workflowEngine/blocksHandler/handlerNotification.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [anonymous](#anonymous) | function | ✅ | `{}` |

## Detailed Description

### <a id="anonymous"></a>anonymous

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function ({ data, id }) {
  const hasPermission = await BrowserAPIService.permissions.contains({
    permissions: ['notifications'],
  });

  if (!hasPermission) {
    const error = new Error('no-permission');
    error.data = { permission: 'notifications' };

    throw error;
  }

  const options = {
    title: data.title,
    message: data.message,
// ...
```

---

