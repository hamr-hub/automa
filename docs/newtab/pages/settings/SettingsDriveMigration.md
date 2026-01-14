# SettingsDriveMigration.vue

**Path**: `newtab/pages/settings/SettingsDriveMigration.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [log](#log) | function | ❌ | `message, type?` |
| [startMigration](#startmigration) | function | ✅ | `` |

## Detailed Description

### <a id="log"></a>log

- **Type**: `function`
- **Parameters**: `message, type?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function log(message, type = 'info') {
  logs.value.push({ message, type });
}
```

---

### <a id="startmigration"></a>startMigration

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function startMigration() {
  loading.value = true;
  statusMessage.value = 'Fetching files from Google Drive...';
  logs.value = [];
  processedFiles.value = 0;
  
  try {
    // List files
    let files = [];
    let pageToken = null;
    
    do {
      const url = new URL('https://www.googleapis.com/drive/v3/files');
      url.searchParams.set('q', "trashed = false and mimeType != 'application/vnd.google-apps.folder'");
      url.searchParams.set('fields', 'nextPageToken, files(id, name, mimeType)');
// ...
```

---

