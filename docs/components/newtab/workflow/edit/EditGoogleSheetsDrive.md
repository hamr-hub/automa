# EditGoogleSheetsDrive.vue

**Path**: `components/newtab/workflow/edit/EditGoogleSheetsDrive.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [updateData](#updatedata) | function | ❌ | `value` |
| [connectSheet](#connectsheet) | function | ✅ | `` |

## Detailed Description

### <a id="default"></a>default

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
default: () => ({})
```

---

### <a id="updatedata"></a>updateData

- **Type**: `function`
- **Parameters**: `value`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function updateData(value) {
  emit('update:data', { ...props.data, ...value });
}
```

---

### <a id="connectsheet"></a>connectSheet

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function connectSheet() {
  // 1. 获取当前 access_token
  const { sessionToken } = await browser.storage.local.get('sessionToken');
  if (!sessionToken?.access) {
    toast.error('未获取到 Google 授权');
    return;
  }
  try {
    // 2. 弹出 Picker 让用户选择文件
    const file = await openGDrivePickerPopup(sessionToken.access);
    if (!file) return;
    if (file.mimeType !== 'application/vnd.google-apps.spreadsheet') {
      toast.error('File is not a google spreadsheet');
      return;
    }
// ...
```

---

