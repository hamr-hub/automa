# LogsHistory.vue

**Path**: `components/newtab/logs/LogsHistory.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [default](#default) | object_property_method | ❌ | `` |
| [getDataSnapshot](#getdatasnapshot) | function | ❌ | `refData` |
| [getData](#getdata) | arrow_function | ❌ | `key` |
| [exportLogs](#exportlogs) | function | ❌ | `type` |
| [[computed]](#-computed-) | object_property_method | ❌ | `[]` |
| [json](#json) | object_property_method | ❌ | `[]` |
| [csv](#csv) | object_property_method | ❌ | `item, index` |
| [xlsx](#xlsx) | object_property_method | ❌ | `item, index` |
| [clearActiveItem](#clearactiveitem) | function | ❌ | `` |
| [translateLog](#translatelog) | function | ❌ | `log` |
| [getTranslatation](#gettranslatation) | arrow_function | ❌ | `path, def` |
| [setActiveLog](#setactivelog) | function | ❌ | `item` |
| [getBlockPath](#getblockpath) | function | ❌ | `blockId` |
| [jumpToError](#jumptoerror) | function | ❌ | `` |

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

### <a id="default"></a>default

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
default: () => ({})
```

---

### <a id="getdatasnapshot"></a>getDataSnapshot

- **Type**: `function`
- **Parameters**: `refData`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function getDataSnapshot(refData) {
  if (!props.ctxData?.dataSnapshot) return;

  const data = props.ctxData.dataSnapshot;
  const getData = (key) => {
    const currentData = refData[key];
    if (typeof currentData !== 'string') return currentData;

    return data[currentData] ?? {};
  };

  refData.loopData = getData('loopData');
  refData.variables = getData('variables');
}
```

---

### <a id="getdata"></a>getData

- **Type**: `arrow_function`
- **Parameters**: `key`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(key) => {
    const currentData = refData[key];
    if (typeof currentData !== 'string') return currentData;

    return data[currentData] ?? {};
  }
```

---

### <a id="exportlogs"></a>exportLogs

- **Type**: `function`
- **Parameters**: `type`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function exportLogs(type) {
  let data = type === 'plain-text' ? '' : [];
  const getItemData = {
    'plain-text': ([
      timestamp,
      status,
      name,
      description,
      message,
      ctxData,
    ]) => {
      data += `${timestamp} - ${status} - ${name} - ${description} - ${message} - ${JSON.stringify(
        ctxData
      )} \n`;
    },
// ...
```

---

### <a id="-computed-"></a>[computed]

- **Type**: `object_property_method`
- **Parameters**: `[]`
- **Description**: *No description provided.*

**Implementation**:
```javascript
'plain-text': ([
      timestamp,
      status,
      name,
      description,
      message,
      ctxData,
    ]) => {
      data += `${timestamp} - ${status} - ${name} - ${description} - ${message} - ${JSON.stringify(
        ctxData
      )} \n`;
    }
```

---

### <a id="json"></a>json

- **Type**: `object_property_method`
- **Parameters**: `[]`
- **Description**: *No description provided.*

**Implementation**:
```javascript
json: ([timestamp, status, name, description, message, ctxData]) => {
      data.push({
        timestamp,
        status,
        name,
        description,
        message,
        data: ctxData,
      });
    }
```

---

### <a id="csv"></a>csv

- **Type**: `object_property_method`
- **Parameters**: `item, index`
- **Description**: *No description provided.*

**Implementation**:
```javascript
csv: (item, index) => {
      if (index === 0) {
        data.unshift([
          'timestamp',
          'status',
          'name',
          'description',
          'message',
          'data',
        ]);
      }

      item[item.length - 1] = JSON.stringify(item[item.length - 1]);

      data.push(item);
// ...
```

---

### <a id="xlsx"></a>xlsx

- **Type**: `object_property_method`
- **Parameters**: `item, index`
- **Description**: *No description provided.*

**Implementation**:
```javascript
xlsx: (item, index) => {
      if (index === 0) {
        data.unshift([
          'Timestamp',
          'Status',
          'Name',
          'Description',
          'Message',
          'Data',
        ]);
      }

      item[item.length - 1] = JSON.stringify(item[item.length - 1]);
      data.push(item);
    }
```

---

### <a id="clearactiveitem"></a>clearActiveItem

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function clearActiveItem() {
  state.itemId = '';
  activeLog.value = null;
}
```

---

### <a id="translatelog"></a>translateLog

- **Type**: `function`
- **Parameters**: `log`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function translateLog(log) {
  const copyLog = { ...log };
  const getTranslatation = (path, def) => {
    const params = typeof path === 'string' ? { path } : path;

    return te(params.path) ? t(params.path, params.params) : def;
  };

  if (['finish', 'stop'].includes(log.type)) {
    copyLog.name = t(`log.types.${log.type}`);
  } else {
    copyLog.name = getTranslatation(
      `workflow.blocks.${log.name}.name`,
      blocks[log.name].name
    );
// ...
```

---

### <a id="gettranslatation"></a>getTranslatation

- **Type**: `arrow_function`
- **Parameters**: `path, def`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(path, def) => {
    const params = typeof path === 'string' ? { path } : path;

    return te(params.path) ? t(params.path, params.params) : def;
  }
```

---

### <a id="setactivelog"></a>setActiveLog

- **Type**: `function`
- **Parameters**: `item`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function setActiveLog(item) {
  state.itemId = item.id;
  activeLog.value = item;
}
```

---

### <a id="getblockpath"></a>getBlockPath

- **Type**: `function`
- **Parameters**: `blockId`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function getBlockPath(blockId) {
  const { workflowId, teamId } = props.currentLog;
  let path = `/workflows/${workflowId}`;

  if (workflowId.startsWith('team') && teamId) {
    path = `/teams/${teamId}/workflows/${workflowId}`;
  }

  return `${path}?blockId=${blockId}`;
}
```

---

### <a id="jumptoerror"></a>jumpToError

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function jumpToError() {
  pagination.currentPage = Math.ceil(errorBlock.value.id / pagination.perPage);

  const element = document.querySelector('#log-history');
  if (!element) return;

  element.scrollTo(0, element.scrollHeight);
  document.documentElement.scrollTo(0, document.documentElement.scrollHeight);
}
```

---

