# getTranslateLog.js

**Path**: `utils/getTranslateLog.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [translateLog](#translatelog) | function | ❌ | `log` |
| [getTranslatation](#gettranslatation) | arrow_function | ❌ | `path, def` |
| [getDataSnapshot](#getdatasnapshot) | function | ❌ | `propsCtxData, refData` |
| [getData](#getdata) | arrow_function | ❌ | `key` |
| [getLogs](#getlogs) | function | ❌ | `dataType, translatedLog, curStateCtxData` |
| [[computed]](#-computed-) | object_property_method | ❌ | `[]` |
| [json](#json) | object_property_method | ❌ | `[]` |
| [anonymous](#anonymous) | function | ❌ | `curState, dataType?` |

## Detailed Description

### <a id="translatelog"></a>translateLog

- **Type**: `function`
- **Parameters**: `log`
- **Description**:

转换日志

@param {*} log

@returns

**Implementation**:
```javascript
function translateLog(log) {
  const copyLog = { ...log };
  const getTranslatation = (path, def) => {
    const params = typeof path === 'string' ? { path } : path;

    return vueI18n.global.te(params.path)
      ? vueI18n.global.t(params.path, params.params)
      : def;
  };

  if (['finish', 'stop'].includes(log.type)) {
    copyLog.name = vueI18n.global.t(`log.types.${log.type}`);
  } else {
    copyLog.name = getTranslatation(
      `workflow.blocks.${log.name}.name`,
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

    return vueI18n.global.te(params.path)
      ? vueI18n.global.t(params.path, params.params)
      : def;
  }
```

---

### <a id="getdatasnapshot"></a>getDataSnapshot

- **Type**: `function`
- **Parameters**: `propsCtxData, refData`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function getDataSnapshot(propsCtxData, refData) {
  if (!propsCtxData?.dataSnapshot) return;

  const data = propsCtxData.dataSnapshot;
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

### <a id="getlogs"></a>getLogs

- **Type**: `function`
- **Parameters**: `dataType, translatedLog, curStateCtxData`
- **Description**:

获取日志

@param {*} dataType 日志数据类型

@param {*} translatedLog 转换后的日志

@returns

**Implementation**:
```javascript
function getLogs(dataType, translatedLog, curStateCtxData) {
  let data = dataType === 'plain-text' ? '' : [];
  const getItemData = {
    'plain-text': ([
      timestamp,
      duration,
      status,
      name,
      description,
      message,
      ctxData,
    ]) => {
      data += `${timestamp}(${countDuration(
        0,
        duration || 0
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
      duration,
      status,
      name,
      description,
      message,
      ctxData,
    ]) => {
      data += `${timestamp}(${countDuration(
        0,
        duration || 0
      ).trim()}) - ${status} - ${name} - ${description} - ${message} - ${JSON.stringify(
        ctxData
      )} \n`;
// ...
```

---

### <a id="json"></a>json

- **Type**: `object_property_method`
- **Parameters**: `[]`
- **Description**: *No description provided.*

**Implementation**:
```javascript
json: ([
      timestamp,
      duration,
      status,
      name,
      description,
      message,
      ctxData,
    ]) => {
      data.push({
        timestamp,
        duration: countDuration(0, duration || 0).trim(),
        status,
        name,
        description,
// ...
```

---

### <a id="anonymous"></a>anonymous

- **Type**: `function`
- **Parameters**: `curState, dataType?`
- **Description**:

获取日志数据

@param {*} curState 当前工作流状态

@param {*} dataType 日志数据类型 plain-text 和 json

@returns

**Implementation**:
```javascript
function (curState, dataType = 'plain-text') {
  const { logs: curStateHistory, ctxData: curStateCtxData } = curState;
  // 经过转换后的日志
  const translatedLog = curStateHistory.map(translateLog);
  // 获取日志
  const logs = getLogs(dataType, translatedLog, curStateCtxData);
  // 获取日志
  return logs;
}
```

---

