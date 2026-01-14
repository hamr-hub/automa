# openGDriveFilePicker.js

**Path**: `utils/openGDriveFilePicker.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [fetchGDriveSheets](#fetchgdrivesheets) | function | ✅ | `` |
| [openGDrivePickerPopup](#opengdrivepickerpopup) | function | ❌ | `accessToken` |
| [handleMessage](#handlemessage) | function | ❌ | `event` |

## Detailed Description

### <a id="fetchgdrivesheets"></a>fetchGDriveSheets

- **Type**: `function`
- **Parameters**: ``
- **Description**:

get all google sheets files in current user's google drive

@returns {Promise<Array>} file list [{ id, name, mimeType }]

**Implementation**:
```javascript
async function fetchGDriveSheets() {
  const { sessionToken, session } = await browser.storage.local.get([
    'sessionToken',
    'session',
  ]);
  if (!sessionToken || !sessionToken.access) return [];

  const isGoogleProvider =
    session?.user?.user_metadata?.iss.includes('google.com');
  if (!isGoogleProvider) return [];

  const accessToken = sessionToken.access;
  const endpoint =
    'https://www.googleapis.com/drive/v3/files?fields=files(id%2Cname%2CmimeType)&q=mimeType%3D%27application%2Fvnd.google-apps.spreadsheet%27&spaces=drive&pageSize=1000';

// ...
```

---

### <a id="opengdrivepickerpopup"></a>openGDrivePickerPopup

- **Type**: `function`
- **Parameters**: `accessToken`
- **Description**:

open google picker popup to get user authorized file

@param {string} accessToken

@returns {Promise<{id, name, mimeType}>}

**Implementation**:
```javascript
function openGDrivePickerPopup(accessToken) {
  return new Promise((resolve, reject) => {
    const pickerUrl = `https://extension.automa.site/picker?access_token=${accessToken}`;
    const popup = window.open(pickerUrl, '_blank', 'width=600,height=600');
    function handleMessage(event) {
      if (!event.origin.startsWith('https://extension.automa.site')) return;
      if (event.data && event.data.type === 'GDRIVE_PICKER_RESULT') {
        window.removeEventListener('message', handleMessage);
        popup.close();
        resolve(event.data.file);
      }
    }
    window.addEventListener('message', handleMessage);
    const timer = setInterval(() => {
      if (popup.closed) {
// ...
```

---

### <a id="handlemessage"></a>handleMessage

- **Type**: `function`
- **Parameters**: `event`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function handleMessage(event) {
      if (!event.origin.startsWith('https://extension.automa.site')) return;
      if (event.data && event.data.type === 'GDRIVE_PICKER_RESULT') {
        window.removeEventListener('message', handleMessage);
        popup.close();
        resolve(event.data.file);
      }
    }
```

---

