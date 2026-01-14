# SettingsBlocks.vue

**Path**: `components/newtab/workflow/settings/SettingsBlocks.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
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

