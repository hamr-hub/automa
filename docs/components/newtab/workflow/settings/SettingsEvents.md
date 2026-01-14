# SettingsEvents.vue

**Path**: `components/newtab/workflow/settings/SettingsEvents.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [updateModalState](#updatemodalstate) | function | ❌ | `detail` |
| [upsertAction](#upsertaction) | function | ❌ | `` |

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

### <a id="updatemodalstate"></a>updateModalState

- **Type**: `function`
- **Parameters**: `detail`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function updateModalState(detail) {
  Object.assign(actionModal, { ...cloneDeep(defaultActionModal), ...detail });
}
```

---

### <a id="upsertaction"></a>upsertAction

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function upsertAction() {
  let copyEvents = [...(props.settings.events ?? [])];

  if (actionModal.type === 'add') {
    copyEvents.push({
      id: nanoid(),
      ...actionModal.data,
      name: actionModal.data.name || 'Untitled action',
    });
  } else {
    copyEvents = copyEvents.map((event) => {
      if (event.id !== actionModal.data.id) return event;

      return actionModal.data;
    });
// ...
```

---

