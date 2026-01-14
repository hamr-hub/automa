# handlerGoogleSheets.js

**Path**: `workflowEngine/blocksHandler/handlerGoogleSheets.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [getSpreadsheetValues](#getspreadsheetvalues) | function | ✅ | `{}` |
| [getSpreadsheetRange](#getspreadsheetrange) | function | ✅ | `{}` |
| [clearSpreadsheetValues](#clearspreadsheetvalues) | function | ✅ | `{}` |
| [updateSpreadsheetValues](#updatespreadsheetvalues) | function | ✅ | `{}, columns` |
| [anonymous](#anonymous) | function | ✅ | `{}, {}` |
| [handleUpdate](#handleupdate) | arrow_function | ✅ | `append?` |
| [get](#get) | object_property_method | ✅ | `` |
| [getRange](#getrange) | object_property_method | ✅ | `` |
| [update](#update) | object_property_method | ❌ | `` |
| [append](#append) | object_property_method | ❌ | `` |
| [clear](#clear) | object_property_method | ✅ | `` |
| [create](#create) | object_property_method | ✅ | `` |
| [[computed]](#-computed-) | object_property_method | ✅ | `` |

## Detailed Description

### <a id="getspreadsheetvalues"></a>getSpreadsheetValues

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function getSpreadsheetValues({
  spreadsheetId,
  range,
  firstRowAsKey,
  isDriveSheet,
}) {
  const response = await googleSheetsApi(isDriveSheet).getValues({
    spreadsheetId,
    range,
  });

  const result = isDriveSheet ? response : await response.json();
  if (!isDriveSheet && !response.ok) {
    throw new Error(result.message);
  }
// ...
```

---

### <a id="getspreadsheetrange"></a>getSpreadsheetRange

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function getSpreadsheetRange({ spreadsheetId, range, isDriveSheet }) {
  const response = await googleSheetsApi(isDriveSheet).getRange({
    spreadsheetId,
    range,
  });

  const result = isDriveSheet ? response : await response.json();
  if (!isDriveSheet && !response.ok) {
    throw new Error(result.message);
  }

  const data = {
    tableRange: result.tableRange || null,
    lastRange: result.updates.updatedRange,
  };
// ...
```

---

### <a id="clearspreadsheetvalues"></a>clearSpreadsheetValues

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function clearSpreadsheetValues({ spreadsheetId, range, isDriveSheet }) {
  const response = await googleSheetsApi(isDriveSheet).clearValues({
    spreadsheetId,
    range,
  });

  const result = isDriveSheet ? response : await response.json();
  if (!isDriveSheet && !response.ok) {
    throw new Error(result.message);
  }

  return result;
}
```

---

### <a id="updatespreadsheetvalues"></a>updateSpreadsheetValues

- **Type**: `function`
- **Parameters**: `{}, columns`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function updateSpreadsheetValues(
  {
    range,
    append,
    dataFrom,
    customData,
    isDriveSheet,
    spreadsheetId,
    keysAsFirstRow,
    insertDataOption,
    valueInputOption,
  },
  columns
) {
  let values = [];
// ...
```

---

### <a id="anonymous"></a>anonymous

- **Type**: `function`
- **Parameters**: `{}, {}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function ({ data, id }, { refData }) {
  const isNotCreateAction = !['create', 'add-sheet'].includes(data.type);

  if (isWhitespace(data.spreadsheetId) && isNotCreateAction)
    throw new Error('empty-spreadsheet-id');
  if (isWhitespace(data.range) && isNotCreateAction)
    throw new Error('empty-spreadsheet-range');

  let result = [];
  const handleUpdate = async (append = false) => {
    result = await updateSpreadsheetValues(
      {
        ...data,
        append,
      },
// ...
```

---

### <a id="handleupdate"></a>handleUpdate

- **Type**: `arrow_function`
- **Parameters**: `append?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async (append = false) => {
    result = await updateSpreadsheetValues(
      {
        ...data,
        append,
      },
      refData.table
    );
  }
```

---

### <a id="get"></a>get

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
get: async () => {
      const spreadsheetValues = await getSpreadsheetValues(data);

      result = spreadsheetValues;

      if (data.refKey && !isWhitespace(data.refKey)) {
        refData.googleSheets[data.refKey] = spreadsheetValues;
      }
    }
```

---

### <a id="getrange"></a>getRange

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
getRange: async () => {
      result = await getSpreadsheetRange(data);

      if (data.assignVariable) {
        await this.setVariable(data.variableName, result);
      }
      if (data.saveData) {
        this.addDataToColumn(data.dataColumn, result);
      }
    }
```

---

### <a id="update"></a>update

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
update: () => handleUpdate()
```

---

### <a id="append"></a>append

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
append: () => handleUpdate(true)
```

---

### <a id="clear"></a>clear

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
clear: async () => {
      result = await clearSpreadsheetValues(data);
    }
```

---

### <a id="create"></a>create

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
create: async () => {
      const { spreadsheetId } = await googleSheetsApi(true).create(
        data.sheetName
      );
      result = spreadsheetId;

      if (data.assignVariable) {
        await this.setVariable(data.variableName, result);
      }
      if (data.saveData) {
        this.addDataToColumn(data.dataColumn, result);
      }
    }
```

---

### <a id="-computed-"></a>[computed]

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
'add-sheet': async () => {
      result = await googleSheetsApi(true).addSheet(data);
      result = result.replies[0].addSheet.properties;
    }
```

---

