# user.js

**Path**: `stores/user.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [state](#state) | object_property_method | ❌ | `` |
| [getHostedWorkflows](#gethostedworkflows) | object_property_method | ❌ | `state` |
| [validateTeamAccess](#validateteamaccess) | object_property_method | ❌ | `state` |
| [loadUser](#loaduser) | object_method | ✅ | `options?` |

## Detailed Description

### <a id="state"></a>state

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
state: () => ({
    user: null,
    backupIds: [],
    retrieved: false,
    hostedWorkflows: {},
    sharedPackages: [],
  })
```

---

### <a id="gethostedworkflows"></a>getHostedWorkflows

- **Type**: `object_property_method`
- **Parameters**: `state`
- **Description**: *No description provided.*

**Implementation**:
```javascript
getHostedWorkflows: (state) => Object.values(state.hostedWorkflows)
```

---

### <a id="validateteamaccess"></a>validateTeamAccess

- **Type**: `object_property_method`
- **Parameters**: `state`
- **Description**: *No description provided.*

**Implementation**:
```javascript
validateTeamAccess:
      (state) =>
      (teamId, access = []) => {
        const currentTeam = state.user?.teams?.find(
          ({ id }) => teamId === id || +teamId === id
        );
        if (!currentTeam) return false;

        return access.some((item) => currentTeam.access.includes(item));
      }
```

---

### <a id="loaduser"></a>loadUser

- **Type**: `object_method`
- **Parameters**: `options?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async loadUser(options = false) {
      try {
        const user = await cacheApi(
          'user-profile',
          async () => {
            try {
              // 离线/未登录模式：getUser() 可能返回 null，这不应该阻断 popup/newtab 正常使用本地工作流
              const result = await apiAdapter.getUser();

              return result || null;
            } catch (error) {
              console.error(error);
              return null;
            }
          },
// ...
```

---

