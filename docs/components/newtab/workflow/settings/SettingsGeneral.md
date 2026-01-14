# SettingsGeneral.vue

**Path**: `components/newtab/workflow/settings/SettingsGeneral.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [onClearCacheClick](#onclearcacheclick) | function | ✅ | `` |
| [updateSetting](#updatesetting) | function | ❌ | `key, value` |

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

### <a id="onclearcacheclick"></a>onClearCacheClick

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function onClearCacheClick() {
  const cacheCleared = await clearCache(props.workflow);
  if (cacheCleared) toast(t('workflow.settings.clearCache.info'));
}
```

---

### <a id="updatesetting"></a>updateSetting

- **Type**: `function`
- **Parameters**: `key, value`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function updateSetting(key, value) {
  emit('update', { key, value });
}
```

---

