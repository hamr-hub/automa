# api.js

**Path**: `utils/api.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [getUserWorkflows](#getuserworkflows) | function | ✅ | `useCache?` |
| [getSharedWorkflows](#getsharedworkflows) | function | ✅ | `useCache?` |
| [getWorkflowById](#getworkflowbyid) | function | ✅ | `id` |
| [createWorkflow](#createworkflow) | function | ✅ | `workflow` |
| [updateWorkflow](#updateworkflow) | function | ✅ | `id, updates` |
| [deleteWorkflow](#deleteworkflow) | function | ✅ | `id` |
| [batchInsertWorkflows](#batchinsertworkflows) | function | ✅ | `workflows` |
| [getPackages](#getpackages) | function | ✅ | `` |
| [createPackage](#createpackage) | function | ✅ | `pkg` |
| [updatePackage](#updatepackage) | function | ✅ | `id, updates` |
| [deletePackage](#deletepackage) | function | ✅ | `id` |
| [fetchApi](#fetchapi) | function | ✅ | `path, options?` |
| [cacheApi](#cacheapi) | function | ✅ | `key, callback, useCache?` |
| [validateOauthToken](#validateoauthtoken) | function | ❌ | `` |
| [fetchGapi](#fetchgapi) | function | ✅ | `url, resource?, options?` |
| [startFetch](#startfetch) | arrow_function | ✅ | `` |

## Detailed Description

### <a id="getuserworkflows"></a>getUserWorkflows

- **Type**: `function`
- **Parameters**: `useCache?`
- **Description**:

============================================

API Methods

============================================

Get User Workflows

**Implementation**:
```javascript
async function getUserWorkflows(useCache = true) {
  try {
    return await supabaseAdapter.getUserWorkflows(useCache);
  } catch (error) {
    console.warn('Supabase getUserWorkflows failed:', error);
    return { hosted: {}, backup: [] };
  }
}
```

---

### <a id="getsharedworkflows"></a>getSharedWorkflows

- **Type**: `function`
- **Parameters**: `useCache?`
- **Description**:

Get Shared Workflows

**Implementation**:
```javascript
async function getSharedWorkflows(useCache = true) {
  try {
    return await supabaseAdapter.getSharedWorkflows(useCache);
  } catch (error) {
    console.warn('Supabase getSharedWorkflows failed:', error);
    return {};
  }
}
```

---

### <a id="getworkflowbyid"></a>getWorkflowById

- **Type**: `function`
- **Parameters**: `id`
- **Description**:

Get Workflow By ID

**Implementation**:
```javascript
async function getWorkflowById(id) {
  return await supabaseAdapter.getWorkflowById(id);
}
```

---

### <a id="createworkflow"></a>createWorkflow

- **Type**: `function`
- **Parameters**: `workflow`
- **Description**:

Create Workflow

**Implementation**:
```javascript
async function createWorkflow(workflow) {
  return await supabaseAdapter.createWorkflow(workflow);
}
```

---

### <a id="updateworkflow"></a>updateWorkflow

- **Type**: `function`
- **Parameters**: `id, updates`
- **Description**:

Update Workflow

**Implementation**:
```javascript
async function updateWorkflow(id, updates) {
  return await supabaseAdapter.updateWorkflow(id, updates);
}
```

---

### <a id="deleteworkflow"></a>deleteWorkflow

- **Type**: `function`
- **Parameters**: `id`
- **Description**:

Delete Workflow

**Implementation**:
```javascript
async function deleteWorkflow(id) {
  return await supabaseAdapter.deleteWorkflow(id);
}
```

---

### <a id="batchinsertworkflows"></a>batchInsertWorkflows

- **Type**: `function`
- **Parameters**: `workflows`
- **Description**:

Batch Insert Workflows

**Implementation**:
```javascript
async function batchInsertWorkflows(workflows) {
  return await supabaseAdapter.batchInsertWorkflows(workflows);
}
```

---

### <a id="getpackages"></a>getPackages

- **Type**: `function`
- **Parameters**: ``
- **Description**:

Get Packages

**Implementation**:
```javascript
async function getPackages() {
  return await supabaseAdapter.getPackages();
}
```

---

### <a id="createpackage"></a>createPackage

- **Type**: `function`
- **Parameters**: `pkg`
- **Description**:

Create Package

**Implementation**:
```javascript
async function createPackage(pkg) {
  return await supabaseAdapter.createPackage(pkg);
}
```

---

### <a id="updatepackage"></a>updatePackage

- **Type**: `function`
- **Parameters**: `id, updates`
- **Description**:

Update Package

**Implementation**:
```javascript
async function updatePackage(id, updates) {
  return await supabaseAdapter.updatePackage(id, updates);
}
```

---

### <a id="deletepackage"></a>deletePackage

- **Type**: `function`
- **Parameters**: `id`
- **Description**:

Delete Package

**Implementation**:
```javascript
async function deletePackage(id) {
  return await supabaseAdapter.deletePackage(id);
}
```

---

### <a id="fetchapi"></a>fetchApi

- **Type**: `function`
- **Parameters**: `path, options?`
- **Description**:

============================================

Core Fetch Logic (Deprecated / Adapted)

============================================

@deprecated Use supabaseAdapter for backend calls. This function is kept for legacy compatibility but may not work as expected for Automa backend endpoints.

**Implementation**:
```javascript
async function fetchApi(path, options = {}) {
  const urlPath = path.startsWith('/') ? path : `/${path}`;
  
  // If calling Automa Backend, we should intercept or warn.
  // But for now, we'll try to execute it using fetch, hoping it's not needed or the backend URL in secrets is updated to something else (unlikely).
  // Actually, if we are fully migrating, calls to the old backend will fail.
  
  console.warn(`[Deprecation] fetchApi called for ${path}. This should be migrated to Supabase.`);

  const headers = {
    'Content-Type': 'application/json',
    ...(options?.headers || {}),
  };

  // Attempt to attach Supabase token if auth is requested?
// ...
```

---

### <a id="cacheapi"></a>cacheApi

- **Type**: `function`
- **Parameters**: `key, callback, useCache?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function cacheApi(key, callback, useCache = true) {
  const isBoolOpts = typeof useCache === 'boolean';
  const options = {
    ttl: 10000 * 10,
    storage: sessionStorage,
    useCache: isBoolOpts ? useCache : true,
  };
  if (!isBoolOpts && isObject(useCache)) {
    Object.assign(options, useCache);
  }

  const timeToLive = options.ttl;
  const currentTime = Date.now() - timeToLive;

  const timerKey = `cache-time:${key}`;
// ...
```

---

### <a id="validateoauthtoken"></a>validateOauthToken

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function validateOauthToken() {
  // This function was used to refresh Google tokens via the old backend.
  // With Supabase, we need a new strategy.
  // For now, we return null to disable this flow until a replacement is implemented.
  console.warn('[Supabase Migration] validateOauthToken is not fully supported yet.');
  return Promise.resolve(null);
}
```

---

### <a id="fetchgapi"></a>fetchGapi

- **Type**: `function`
- **Parameters**: `url, resource?, options?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function fetchGapi(url, resource = {}, options = {}) {
  // Try to use the old token from storage first
  const { sessionToken } = await BrowserAPIService.storage.local.get(
    'sessionToken'
  );
  
  // If no legacy token, maybe we can check Supabase session for provider token?
  // (Not implemented here yet as it requires 'provider_token' scope config)
  
  if (!sessionToken) throw new Error('unauthorized');

  const { search, origin, pathname } = new URL(url);
  const searchParams = new URLSearchParams(search);
  searchParams.set('access_token', sessionToken.access);

// ...
```

---

### <a id="startfetch"></a>startFetch

- **Type**: `arrow_function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async () => {
    const response = await fetch(
      `${origin}${pathname}?${searchParams.toString()}`,
      resource
    );

    const result = parseJSON(await response.text(), null);
    
    // Logic to refresh token is removed because we don't have the backend endpoint anymore.
    // If token is expired, it will just fail.
    
    if (!response.ok) {
      throw new Error(result?.error?.message, { cause: result });
    }

// ...
```

---

