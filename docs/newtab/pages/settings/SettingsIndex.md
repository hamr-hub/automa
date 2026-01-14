# SettingsIndex.vue

**Path**: `newtab/pages/settings/SettingsIndex.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [updateSetting](#updatesetting) | function | ❌ | `path, value` |
| [updateLanguage](#updatelanguage) | function | ❌ | `value` |

## Detailed Description

### <a id="updatesetting"></a>updateSetting

- **Type**: `function`
- **Parameters**: `path, value`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function updateSetting(path, value) {
  store.updateSettings({ [path]: value });
}
```

---

### <a id="updatelanguage"></a>updateLanguage

- **Type**: `function`
- **Parameters**: `value`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function updateLanguage(value) {
  isLangChange.value = true;

  updateSetting('locale', value);
}
```

---

