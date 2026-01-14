# BlockSettingOnError.vue

**Path**: `components/newtab/workflow/edit/BlockSetting/BlockSettingOnError.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [addDataToInsert](#adddatatoinsert) | function | ❌ | `` |

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

### <a id="adddatatoinsert"></a>addDataToInsert

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function addDataToInsert() {
  if (!state.dataToInsert) state.dataToInsert = [];

  state.dataToInsert.push({
    type: 'table',
    name: '',
    value: '',
  });
}
```

---

