# hasPermissions.js

**Path**: `composable/hasPermissions.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [useHasPermissions](#usehaspermissions) | function | ❌ | `permissions` |
| [handlePermission](#handlepermission) | function | ❌ | `name, status` |
| [request](#request) | function | ❌ | `needReload?` |

## Detailed Description

### <a id="usehaspermissions"></a>useHasPermissions

- **Type**: `function`
- **Parameters**: `permissions`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function useHasPermissions(permissions) {
  const hasPermissions = shallowReactive({});

  function handlePermission(name, status) {
    hasPermissions[name] = status;
  }
  function request(needReload = false) {
    const reqPermissions = permissions.filter(
      (permission) => !hasPermissions[permission]
    );

    browser.permissions
      .request({ permissions: reqPermissions })
      .then((status) => {
        if (!status) return;
// ...
```

---

### <a id="handlepermission"></a>handlePermission

- **Type**: `function`
- **Parameters**: `name, status`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function handlePermission(name, status) {
    hasPermissions[name] = status;
  }
```

---

### <a id="request"></a>request

- **Type**: `function`
- **Parameters**: `needReload?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function request(needReload = false) {
    const reqPermissions = permissions.filter(
      (permission) => !hasPermissions[permission]
    );

    browser.permissions
      .request({ permissions: reqPermissions })
      .then((status) => {
        if (!status) return;

        reqPermissions.forEach((permission) => {
          handlePermission(permission, true);
        });

        if (typeof needReload === 'boolean' && needReload) {
// ...
```

---

