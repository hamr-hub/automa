# getAIPoweredInfo.js

**Path**: `utils/getAIPoweredInfo.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [getAPWorkflowDetail](#getapworkflowdetail) | arrow_function | ✅ | `flowUuid, token` |
| [getAPFlowList](#getapflowlist) | arrow_function | ✅ | `params, token` |
| [getAPFlowStatus](#getapflowstatus) | arrow_function | ✅ | `runRecordId, token` |
| [postRunAPWorkflow](#postrunapworkflow) | arrow_function | ✅ | `{}, token` |
| [postUploadFile](#postuploadfile) | arrow_function | ✅ | `file, token` |

## Detailed Description

### <a id="getapworkflowdetail"></a>getAPWorkflowDetail

- **Type**: `arrow_function`
- **Parameters**: `flowUuid, token`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async (flowUuid, token) => {
  const url = new URL(`${BASE_URL}/oapi/power/v1/flow/detail`);
  url.searchParams.append('flowUuid', flowUuid);

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('Failed to fetch AI Power detail:', {
// ...
```

---

### <a id="getapflowlist"></a>getAPFlowList

- **Type**: `arrow_function`
- **Parameters**: `params, token`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async (params, token) => {
  const { page, size, name } = params;
  const url = new URL(`${BASE_URL}/oapi/power/v1/flow/page`);
  url.searchParams.append('page', String(page));
  url.searchParams.append('size', String(size));
  if (name) {
    url.searchParams.append('name', name);
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Bearer ${token}`,
    },
// ...
```

---

### <a id="getapflowstatus"></a>getAPFlowStatus

- **Type**: `arrow_function`
- **Parameters**: `runRecordId, token`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async (runRecordId, token) => {
  const url = new URL(`${BASE_URL}/oapi/power/v1/rest/flow/execute/result`);
  url.searchParams.append('runRecordId', String(runRecordId));

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('Failed to fetch AI Power flow status:', {
// ...
```

---

### <a id="postrunapworkflow"></a>postRunAPWorkflow

- **Type**: `arrow_function`
- **Parameters**: `{}, token`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async ({ flowUuid, input }, token) => {
  const url = `${BASE_URL}/oapi/power/v1/rest/flow/${flowUuid}/execute`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      input,
      source: 'automa_extension',
    }),
  });

// ...
```

---

### <a id="postuploadfile"></a>postUploadFile

- **Type**: `arrow_function`
- **Parameters**: `file, token`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async (file, token) => {
  const url = `${BASE_URL}/oapi/power/v1/file/upload`;

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
// ...
```

---

