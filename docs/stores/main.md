# main.js

**Path**: `stores/main.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [state](#state) | object_property_method | ❌ | `` |
| [loadSettings](#loadsettings) | object_method | ❌ | `` |
| [updateSettings](#updatesettings) | object_method | ✅ | `settings?` |
| [checkGDriveIntegration](#checkgdriveintegration) | object_method | ✅ | `force?, retryCount?` |
| [getConnectedSheets](#getconnectedsheets) | object_method | ✅ | `` |

## Detailed Description

### <a id="state"></a>state

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
state: () => ({
    tabs: [],
    copiedEls: {
      edges: [],
      nodes: [],
    },
    settings: {
      locale: 'en',
      deleteLogAfter: 30,
      logsLimit: 1000,
      editor: {
        minZoom: 0.3,
        maxZoom: 1.3,
        arrow: true,
        snapToGrid: false,
// ...
```

---

### <a id="loadsettings"></a>loadSettings

- **Type**: `object_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
loadSettings() {
      if (!browser?.storage?.local) return Promise.resolve();
      return browser.storage.local.get('settings').then(({ settings }) => {
        this.settings = defu(settings || {}, this.settings);
        this.retrieved = true;
      });
    }
```

---

### <a id="updatesettings"></a>updateSettings

- **Type**: `object_method`
- **Parameters**: `settings?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async updateSettings(settings = {}) {
      this.settings = deepmerge(this.settings, settings);
      await this.saveToStorage('settings');
    }
```

---

### <a id="checkgdriveintegration"></a>checkGDriveIntegration

- **Type**: `object_method`
- **Parameters**: `force?, retryCount?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async checkGDriveIntegration(force = false, retryCount = 0) {
      try {
        if (this.integrationsRetrieved.googleDrive && !force) return;

        const result = await fetchGapi(
          `https://www.googleapis.com/oauth2/v1/tokeninfo`
        );
        if (!result) return;

        const isIntegrated = result.scope.includes('auth/drive.file');
        const { sessionToken } = await browser.storage.local.get(
          'sessionToken'
        );

        if (!isIntegrated && sessionToken?.refresh && retryCount < 3) {
// ...
```

---

### <a id="getconnectedsheets"></a>getConnectedSheets

- **Type**: `object_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async getConnectedSheets() {
      try {
        if (this.connectedSheetsRetrieved) return;

        const result = await fetchGapi(
          'https://www.googleapis.com/drive/v3/files'
        );

        this.integrations.googleDrive = true;
        this.connectedSheets = result.files.filter(
          (file) => file.mimeType === 'application/vnd.google-apps.spreadsheet'
        );
      } catch (error) {
        if (
          error.message === 'no-scope' ||
// ...
```

---

