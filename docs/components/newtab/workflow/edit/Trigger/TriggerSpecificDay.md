# TriggerSpecificDay.vue

**Path**: `components/newtab/workflow/edit/Trigger/TriggerSpecificDay.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [formatTime](#formattime) | function | ❌ | `time` |
| [removeDay](#removeday) | function | ❌ | `dayId` |
| [removeDayTime](#removedaytime) | function | ❌ | `dayId, timeIndex` |
| [addTime](#addtime) | function | ❌ | `` |
| [onSelectDayChange](#onselectdaychange) | function | ❌ | `value, id` |
| [getDaysText](#getdaystext) | function | ❌ | `dayIds` |

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

### <a id="formattime"></a>formatTime

- **Type**: `function`
- **Parameters**: `time`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function formatTime(time) {
  const [hour, minute, seconds] = time.split(':');

  return dayjs()
    .hour(hour)
    .minute(minute)
    .second(seconds || 0)
    .format('hh:mm:ss A');
}
```

---

### <a id="removeday"></a>removeDay

- **Type**: `function`
- **Parameters**: `dayId`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function removeDay(dayId) {
  const dayIndex = daysArr.value.findIndex((day) => day.id === dayId);
  if (dayIndex === -1) return;

  daysArr.value.splice(dayIndex, 1);
}
```

---

### <a id="removedaytime"></a>removeDayTime

- **Type**: `function`
- **Parameters**: `dayId, timeIndex`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function removeDayTime(dayId, timeIndex) {
  const dayIndex = daysArr.value.findIndex((day) => day.id === dayId);
  if (dayIndex === -1) return;

  daysArr.value[dayIndex].times.splice(timeIndex, 1);

  if (daysArr.value[dayIndex].times.length === 0) {
    daysArr.value.splice(dayIndex, 1);
  }
}
```

---

### <a id="addtime"></a>addTime

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function addTime() {
  tempDate.days.forEach((dayId) => {
    const dayIndex = daysArr.value.findIndex(({ id }) => id === dayId);

    if (dayIndex === -1) {
      daysArr.value.push({
        id: dayId,
        times: [tempDate.time],
      });
    } else {
      const isTimeExist = daysArr.value[dayIndex].times.includes(tempDate.time);

      if (isTimeExist) {
        const message = t('workflow.blocks.trigger.timeExist', {
          time: formatTime(tempDate.time),
// ...
```

---

### <a id="onselectdaychange"></a>onSelectDayChange

- **Type**: `function`
- **Parameters**: `value, id`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function onSelectDayChange(value, id) {
  if (value) tempDate.days.push(+id);
  else tempDate.days.splice(tempDate.days.indexOf(+id), 1);
}
```

---

### <a id="getdaystext"></a>getDaysText

- **Type**: `function`
- **Parameters**: `dayIds`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function getDaysText(dayIds) {
  return dayIds
    .map((day) => t(`workflow.blocks.trigger.days.${day}`))
    .join(', ');
}
```

---

