# TriggerDate.vue

**Path**: `components/newtab/workflow/edit/Trigger/TriggerDate.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [updateDate](#updatedate) | function | ❌ | `value` |

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

### <a id="updatedate"></a>updateDate

- **Type**: `function`
- **Parameters**: `value`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function updateDate(value) {
  if (!value) return;

  let date = value?.date ?? minDate;

  if (dayjs(minDate).isAfter(date)) date = minDate;
  else if (dayjs(maxDate).isBefore(date)) date = maxDate;

  emit('update', { date });
}
```

---

