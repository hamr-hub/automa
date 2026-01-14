# auth.js

**Path**: `utils/auth.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [isAuthenticated](#isauthenticated) | function | ✅ | `` |
| [getCurrentUser](#getcurrentuser) | function | ✅ | `` |
| [signOut](#signout) | function | ✅ | `` |
| [onAuthStateChange](#onauthstatechange) | function | ❌ | `callback` |

## Detailed Description

### <a id="isauthenticated"></a>isAuthenticated

- **Type**: `function`
- **Parameters**: ``
- **Description**:

检查用户是否已登录

@returns {Promise<boolean>}

**Implementation**:
```javascript
async function isAuthenticated() {
  try {
    const session = await supabaseClient.getSession();
    return !!session;
  } catch (error) {
    console.error('[Auth] Check authentication failed:', error);
    return false;
  }
}
```

---

### <a id="getcurrentuser"></a>getCurrentUser

- **Type**: `function`
- **Parameters**: ``
- **Description**:

获取当前用户信息

@returns {Promise<object|null>}

**Implementation**:
```javascript
async function getCurrentUser() {
  try {
    return await supabaseClient.getCurrentUser();
  } catch (error) {
    console.error('[Auth] Get current user failed:', error);
    return null;
  }
}
```

---

### <a id="signout"></a>signOut

- **Type**: `function`
- **Parameters**: ``
- **Description**:

登出用户

@returns {Promise<void>}

**Implementation**:
```javascript
async function signOut() {
  try {
    await supabaseClient.signOut();
    console.log('[Auth] User signed out successfully');
  } catch (error) {
    console.error('[Auth] Sign out failed:', error);
    throw error;
  }
}
```

---

### <a id="onauthstatechange"></a>onAuthStateChange

- **Type**: `function`
- **Parameters**: `callback`
- **Description**:

监听认证状态变化

@param {Function} callback - 状态变化回调函数

@returns {object} - 取消订阅的函数

**Implementation**:
```javascript
function onAuthStateChange(callback) {
  return supabaseClient.onAuthStateChange((event, session) => {
    console.log('[Auth] State changed:', event, session?.user?.email);
    callback(event, session);
  });
}
```

---

