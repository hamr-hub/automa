# googleSheetsApi.js

**Path**: `utils/googleSheetsApi.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [getGoogleAccessToken](#getgoogleaccesstoken) | function | ✅ | `` |
| [callSupabaseEdgeFunction](#callsupabaseedgefunction) | function | ✅ | `method, params, accessToken?` |
| [getValues](#getvalues) | object_method | ✅ | `{}` |
| [getRange](#getrange) | object_method | ✅ | `{}` |
| [clearValues](#clearvalues) | object_method | ✅ | `{}` |
| [updateValues](#updatevalues) | object_method | ✅ | `{}` |
| [create](#create) | object_method | ✅ | `name` |
| [addSheet](#addsheet) | object_method | ✅ | `{}` |
| [checkPermission](#checkpermission) | object_method | ✅ | `spreadsheetId` |
| [getUrl](#geturl) | object_method | ❌ | `spreadsheetId, range` |
| [checkPermission](#checkpermission) | object_method | ✅ | `spreadsheetId` |
| [getValues](#getvalues) | object_method | ✅ | `{}` |
| [getRange](#getrange) | object_method | ❌ | `params` |
| [clearValues](#clearvalues) | object_method | ✅ | `{}` |
| [updateValues](#updatevalues) | object_method | ✅ | `{}` |
| [anonymous](#anonymous) | function | ❌ | `isDriveSheet?` |

## Detailed Description

### <a id="getgoogleaccesstoken"></a>getGoogleAccessToken

- **Type**: `function`
- **Parameters**: ``
- **Description**:

获取Google Sheets访问令牌

从localStorage中获取存储的sessionToken

**Implementation**:
```javascript
async function getGoogleAccessToken() {
  const { sessionToken } = await BrowserAPIService.storage.local.get('sessionToken');
  if (!sessionToken?.access) {
    throw new Error('No Google access token found. Please authenticate first.');
  }
  return sessionToken.access;
}
```

---

### <a id="callsupabaseedgefunction"></a>callSupabaseEdgeFunction

- **Type**: `function`
- **Parameters**: `method, params, accessToken?`
- **Description**:

Call Supabase Edge Function to proxy Google Sheets API

@param {string} method - The method to call on the proxy (e.g. 'getValues')

@param {object} params - Parameters for the method

@param {string} [accessToken] - Optional Google Access Token (for user-context calls)

**Implementation**:
```javascript
async function callSupabaseEdgeFunction(method, params, accessToken = null) {
  if (!supabaseClient.client) {
    throw new Error('Supabase not initialized');
  }
  
  const body = { method, params };
  if (accessToken) {
    body.accessToken = accessToken;
  }

  const { data, error } = await supabaseClient.client.functions.invoke(
    'google-sheets-proxy',
    { body }
  );
  
// ...
```

---

### <a id="getvalues"></a>getValues

- **Type**: `object_method`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async getValues({ spreadsheetId, range }) {
    const accessToken = await getGoogleAccessToken();
    return callSupabaseEdgeFunction('getValues', { spreadsheetId, range }, accessToken);
  }
```

---

### <a id="getrange"></a>getRange

- **Type**: `object_method`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async getRange({ spreadsheetId, range }) {
    const accessToken = await getGoogleAccessToken();
    // Map to updateValues with append=true, matching googleSheets behavior
    return callSupabaseEdgeFunction('updateValues', {
      spreadsheetId,
      range,
      append: true,
      options: {
        body: JSON.stringify({ values: [] }),
        queries: {
          valueInputOption: 'RAW',
          includeValuesInResponse: false,
          insertDataOption: 'INSERT_ROWS',
        },
      }
// ...
```

---

### <a id="clearvalues"></a>clearValues

- **Type**: `object_method`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async clearValues({ spreadsheetId, range }) {
    const accessToken = await getGoogleAccessToken();
    return callSupabaseEdgeFunction('clearValues', { spreadsheetId, range }, accessToken);
  }
```

---

### <a id="updatevalues"></a>updateValues

- **Type**: `object_method`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async updateValues({ spreadsheetId, range, options, append }) {
    const accessToken = await getGoogleAccessToken();
    return callSupabaseEdgeFunction('updateValues', {
      spreadsheetId,
      range,
      options,
      append
    }, accessToken);
  }
```

---

### <a id="create"></a>create

- **Type**: `object_method`
- **Parameters**: `name`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async create(name) {
    const accessToken = await getGoogleAccessToken();
    // Map to 'create' method on proxy
    return callSupabaseEdgeFunction('create', { title: name }, accessToken);
  }
```

---

### <a id="addsheet"></a>addSheet

- **Type**: `object_method`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async addSheet({ sheetName, spreadsheetId }) {
    const accessToken = await getGoogleAccessToken();
    // Map to 'addSheet' method on proxy
    return callSupabaseEdgeFunction('addSheet', { title: sheetName, spreadsheetId }, accessToken);
  }
```

---

### <a id="checkpermission"></a>checkPermission

- **Type**: `object_method`
- **Parameters**: `spreadsheetId`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async checkPermission(spreadsheetId) {
    try {
      await this.getValues({ spreadsheetId, range: 'A1' });
      return true;
    } catch (error) {
      return false;
    }
  }
```

---

### <a id="geturl"></a>getUrl

- **Type**: `object_method`
- **Parameters**: `spreadsheetId, range`
- **Description**:

Legacy helper, might be used by UI components

**Implementation**:
```javascript
getUrl(spreadsheetId, range) {
    return `/services/google-sheets?spreadsheetId=${spreadsheetId}&range=${range}`;
  }
```

---

### <a id="checkpermission"></a>checkPermission

- **Type**: `object_method`
- **Parameters**: `spreadsheetId`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async checkPermission(spreadsheetId) {
    try {
      await this.getValues({ spreadsheetId, range: 'A1' });
      return true;
    } catch (error) {
      return false;
    }
  }
```

---

### <a id="getvalues"></a>getValues

- **Type**: `object_method`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async getValues({ spreadsheetId, range }) {
    try {
      // Try with user token first (parity with existing behavior)
      return await googleSheetNative.getValues({ spreadsheetId, range });
    } catch (error) {
      console.warn('User auth failed, trying System Proxy:', error);
      return callSupabaseEdgeFunction('getValues', { spreadsheetId, range });
    }
  }
```

---

### <a id="getrange"></a>getRange

- **Type**: `object_method`
- **Parameters**: `params`
- **Description**: *No description provided.*

**Implementation**:
```javascript
getRange(params) {
    return this.updateValues({
      ...params,
      append: true,
      options: {
        body: JSON.stringify({ values: [] }),
        queries: {
          valueInputOption: 'RAW',
          includeValuesInResponse: false,
          insertDataOption: 'INSERT_ROWS',
        },
      },
    });
  }
```

---

### <a id="clearvalues"></a>clearValues

- **Type**: `object_method`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async clearValues({ spreadsheetId, range }) {
    try {
      return await googleSheetNative.clearValues({ spreadsheetId, range });
    } catch (error) {
      console.warn('User auth failed, trying System Proxy:', error);
      return callSupabaseEdgeFunction('clearValues', { spreadsheetId, range });
    }
  }
```

---

### <a id="updatevalues"></a>updateValues

- **Type**: `object_method`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async updateValues({ spreadsheetId, range, options = {}, append }) {
    try {
      return await googleSheetNative.updateValues({ spreadsheetId, range, options, append });
    } catch (error) {
      console.warn('User auth failed, trying System Proxy:', error);
      return callSupabaseEdgeFunction('updateValues', { 
        spreadsheetId, 
        range, 
        options, 
        append 
      });
    }
  }
```

---

### <a id="anonymous"></a>anonymous

- **Type**: `function`
- **Parameters**: `isDriveSheet?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function (isDriveSheet = false) {
  return isDriveSheet ? googleSheetNative : googleSheets;
}
```

---

