# blocksValidation.js

**Path**: `newtab/utils/blocksValidation.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [checkPermissions](#checkpermissions) | arrow_function | ❌ | `permissions` |
| [isEmptyStr](#isemptystr) | arrow_function | ❌ | `str` |
| [validateTrigger](#validatetrigger) | function | ✅ | `data` |
| [checkValue](#checkvalue) | arrow_function | ❌ | `value, {}` |
| [[computed]](#-computed-) | object_property_method | ❌ | `triggerData` |
| [[computed]](#-computed-) | object_property_method | ✅ | `triggerData` |
| [date](#date) | object_property_method | ❌ | `triggerData` |
| [[computed]](#-computed-) | object_property_method | ❌ | `triggerData` |
| [[computed]](#-computed-) | object_property_method | ❌ | `triggerData` |
| [validateExecuteWorkflow](#validateexecuteworkflow) | function | ✅ | `data` |
| [validateNewTab](#validatenewtab) | function | ✅ | `data` |
| [validateSwitchTab](#validateswitchtab) | function | ✅ | `data` |
| [[computed]](#-computed-) | object_property_method | ❌ | `` |
| [[computed]](#-computed-) | object_property_method | ❌ | `` |
| [validateProxy](#validateproxy) | function | ✅ | `data` |
| [validateCloseTab](#validateclosetab) | function | ✅ | `data` |
| [validateTakeScreenshot](#validatetakescreenshot) | function | ✅ | `data` |
| [validateInteractionBasic](#validateinteractionbasic) | function | ✅ | `data` |
| [validateExportData](#validateexportdata) | function | ✅ | `data` |
| [validateAttributeValue](#validateattributevalue) | function | ✅ | `data` |
| [validateGoogleSheets](#validategooglesheets) | function | ✅ | `data` |
| [validateWebhook](#validatewebhook) | function | ✅ | `data` |
| [validateLoopData](#validateloopdata) | function | ✅ | `data` |
| [[computed]](#-computed-) | object_property_method | ❌ | `` |
| [variable](#variable) | object_property_method | ❌ | `` |
| [validateLoopElements](#validateloopelements) | function | ✅ | `data` |
| [validateClipboard](#validateclipboard) | function | ✅ | `` |
| [validateSwitchTo](#validateswitchto) | function | ✅ | `data` |
| [validateUploadFile](#validateuploadfile) | function | ✅ | `data` |
| [validateSaveAssets](#validatesaveassets) | function | ✅ | `data` |
| [validatePressKey](#validatepresskey) | function | ✅ | `data` |
| [validateNotification](#validatenotification) | function | ✅ | `` |
| [validateCookie](#validatecookie) | function | ✅ | `` |

## Detailed Description

### <a id="checkpermissions"></a>checkPermissions

- **Type**: `arrow_function`
- **Parameters**: `permissions`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(permissions) =>
  browser.permissions.contains({ permissions })
```

---

### <a id="isemptystr"></a>isEmptyStr

- **Type**: `arrow_function`
- **Parameters**: `str`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(str) => !str.trim()
```

---

### <a id="validatetrigger"></a>validateTrigger

- **Type**: `function`
- **Parameters**: `data`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function validateTrigger(data) {
  const errors = [];
  const checkValue = (value, { name, location }) => {
    if (value && value.trim()) return;

    errors.push(`"${name}" is empty in the ${location}`);
  };
  const triggersValidation = {
    'cron-job': (triggerData) => {
      checkValue(triggerData.expression, {
        name: 'Expression',
        location: 'Cron job trigger',
      });
    },
    'context-menu': async (triggerData) => {
// ...
```

---

### <a id="checkvalue"></a>checkValue

- **Type**: `arrow_function`
- **Parameters**: `value, {}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(value, { name, location }) => {
    if (value && value.trim()) return;

    errors.push(`"${name}" is empty in the ${location}`);
  }
```

---

### <a id="-computed-"></a>[computed]

- **Type**: `object_property_method`
- **Parameters**: `triggerData`
- **Description**: *No description provided.*

**Implementation**:
```javascript
'cron-job': (triggerData) => {
      checkValue(triggerData.expression, {
        name: 'Expression',
        location: 'Cron job trigger',
      });
    }
```

---

### <a id="-computed-"></a>[computed]

- **Type**: `object_property_method`
- **Parameters**: `triggerData`
- **Description**: *No description provided.*

**Implementation**:
```javascript
'context-menu': async (triggerData) => {
      const permission = isFirefox ? 'menus' : 'contextMenus';
      const hasPermission = await checkPermissions([permission]);

      if (!hasPermission) {
        errors.push(
          "Doesn't have permission for the Context menu trigger (ignore if you already grant the permissions)"
        );
      } else {
        checkValue(triggerData.contextMenuName, {
          name: 'Context menu name',
          location: 'Context menu trigger',
        });
      }
    }
```

---

### <a id="date"></a>date

- **Type**: `object_property_method`
- **Parameters**: `triggerData`
- **Description**: *No description provided.*

**Implementation**:
```javascript
date: (triggerData) => {
      checkValue(triggerData.date, {
        name: 'Date',
        location: 'On a specific date tigger',
      });
    }
```

---

### <a id="-computed-"></a>[computed]

- **Type**: `object_property_method`
- **Parameters**: `triggerData`
- **Description**: *No description provided.*

**Implementation**:
```javascript
'visit-web': (triggerData) => {
      checkValue(triggerData.url, {
        name: 'URL',
        location: 'Visit web trigger',
      });
    }
```

---

### <a id="-computed-"></a>[computed]

- **Type**: `object_property_method`
- **Parameters**: `triggerData`
- **Description**: *No description provided.*

**Implementation**:
```javascript
'keyboard-shortcut': (triggerData) => {
      checkValue(triggerData.shortcut, {
        name: 'Shortcut',
        location: 'Shortcut trigger',
      });
    }
```

---

### <a id="validateexecuteworkflow"></a>validateExecuteWorkflow

- **Type**: `function`
- **Parameters**: `data`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function validateExecuteWorkflow(data) {
  if (isEmptyStr(data.workflowId)) return ['No workflow selected'];

  return [];
}
```

---

### <a id="validatenewtab"></a>validateNewTab

- **Type**: `function`
- **Parameters**: `data`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function validateNewTab(data) {
  if (isEmptyStr(data.url)) return ['URL is empty'];

  return [];
}
```

---

### <a id="validateswitchtab"></a>validateSwitchTab

- **Type**: `function`
- **Parameters**: `data`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function validateSwitchTab(data) {
  const errors = [];
  const validateItems = {
    'match-patterns': () => {
      if (isEmptyStr(data.matchPattern))
        errors.push('The Match patterns is empty');
    },
    'tab-title': () => {
      if (isEmptyStr(data.tabTitle)) errors.push('The Tab title is empty');
    },
  };

  if (validateItems[data.findTabBy]) validateItems[data.findTabBy]();

  return errors;
// ...
```

---

### <a id="-computed-"></a>[computed]

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
'match-patterns': () => {
      if (isEmptyStr(data.matchPattern))
        errors.push('The Match patterns is empty');
    }
```

---

### <a id="-computed-"></a>[computed]

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
'tab-title': () => {
      if (isEmptyStr(data.tabTitle)) errors.push('The Tab title is empty');
    }
```

---

### <a id="validateproxy"></a>validateProxy

- **Type**: `function`
- **Parameters**: `data`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function validateProxy(data) {
  if (isEmptyStr(data.host)) return ['The Host is empty'];

  return [];
}
```

---

### <a id="validateclosetab"></a>validateCloseTab

- **Type**: `function`
- **Parameters**: `data`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function validateCloseTab(data) {
  if (data.closeType === 'tab' && !data.activeTab && isEmptyStr(data.url)) {
    return ['The Match patterns is empty'];
  }

  return [];
}
```

---

### <a id="validatetakescreenshot"></a>validateTakeScreenshot

- **Type**: `function`
- **Parameters**: `data`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function validateTakeScreenshot(data) {
  if (data.type === 'element' && isEmptyStr(data.selector)) {
    return ['The CSS selector is empty'];
  }

  return [];
}
```

---

### <a id="validateinteractionbasic"></a>validateInteractionBasic

- **Type**: `function`
- **Parameters**: `data`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function validateInteractionBasic(data) {
  if (isEmptyStr(data.selector)) return ['The Selector is empty'];

  return [];
}
```

---

### <a id="validateexportdata"></a>validateExportData

- **Type**: `function`
- **Parameters**: `data`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function validateExportData(data) {
  const errors = [];

  const hasPermission = await checkPermissions(['downloads']);
  if (!hasPermission)
    errors.push(
      "Don't have download permission (ignore if you already grant the permissions)"
    );

  if (data.dataToExport === 'variable' && isEmptyStr(data.variableName)) {
    errors.push('The Variable name is empty');
  } else if (data.dataToExport === 'google-sheets' && isEmptyStr(data.refKey)) {
    errors.push('The Reference key is empty');
  }

// ...
```

---

### <a id="validateattributevalue"></a>validateAttributeValue

- **Type**: `function`
- **Parameters**: `data`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function validateAttributeValue(data) {
  const errors = [];

  if (isEmptyStr(data.selector)) errors.push('The Selector is empty');
  if (isEmptyStr(data.attributeName))
    errors.push('The Attribute name is empty');

  return errors;
}
```

---

### <a id="validategooglesheets"></a>validateGoogleSheets

- **Type**: `function`
- **Parameters**: `data`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function validateGoogleSheets(data) {
  const errors = [];

  if (isEmptyStr(data.spreadsheetId))
    errors.push('The Spreadsheet Id is empty');
  if (isEmptyStr(data.range)) errors.push('The Range is empty');

  return errors;
}
```

---

### <a id="validatewebhook"></a>validateWebhook

- **Type**: `function`
- **Parameters**: `data`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function validateWebhook(data) {
  if (isEmptyStr(data.url)) return ['The URL is empty'];

  return [];
}
```

---

### <a id="validateloopdata"></a>validateLoopData

- **Type**: `function`
- **Parameters**: `data`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function validateLoopData(data) {
  const errors = [];
  if (isEmptyStr(data.loopId)) errors.push('The Loop id is empty');

  const loopThroughItems = {
    'google-sheets': () => {
      if (isEmptyStr(data.referenceKey))
        errors.push('The Reference key is empty');
    },
    variable: () => {
      if (isEmptyStr(data.variableName))
        errors.push('The Variable name is empty');
    },
  };
  const validateItem = loopThroughItems[data.loopThrough];
// ...
```

---

### <a id="-computed-"></a>[computed]

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
'google-sheets': () => {
      if (isEmptyStr(data.referenceKey))
        errors.push('The Reference key is empty');
    }
```

---

### <a id="variable"></a>variable

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
variable: () => {
      if (isEmptyStr(data.variableName))
        errors.push('The Variable name is empty');
    }
```

---

### <a id="validateloopelements"></a>validateLoopElements

- **Type**: `function`
- **Parameters**: `data`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function validateLoopElements(data) {
  const errors = [];
  if (isEmptyStr(data.loopId)) errors.push('The Loop id is empty');
  if (isEmptyStr(data.selector)) errors.push('The Selector is empty');

  if (
    ['click-element', 'click-link'].includes(data.loadMoreAction) &&
    isEmptyStr(data.actionElSelector)
  ) {
    errors.push('The Selector for loading more elements is empty');
  }

  return errors;
}
```

---

### <a id="validateclipboard"></a>validateClipboard

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function validateClipboard() {
  const permissions = isFirefox
    ? ['clipboardRead', 'clipboardWrite']
    : ['clipboardRead'];
  const hasPermission = await checkPermissions(permissions);

  if (!hasPermission)
    return [
      "Don't have permission to access the clipboard (ignore if you already grant the permissions)",
    ];

  return [];
}
```

---

### <a id="validateswitchto"></a>validateSwitchTo

- **Type**: `function`
- **Parameters**: `data`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function validateSwitchTo(data) {
  if (data.windowType === 'iframe' && isEmptyStr(data.selector)) {
    return ['The Selector for Iframe is empty'];
  }

  return [];
}
```

---

### <a id="validateuploadfile"></a>validateUploadFile

- **Type**: `function`
- **Parameters**: `data`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function validateUploadFile(data) {
  const errors = [];

  if (isEmptyStr(data.selector)) errors.push('The Selector is empty');

  const someInputsEmpty = data.filePaths.some((path) => isEmptyStr(path));
  if (someInputsEmpty) errors.push('Some of the file paths is empty');

  return errors;
}
```

---

### <a id="validatesaveassets"></a>validateSaveAssets

- **Type**: `function`
- **Parameters**: `data`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function validateSaveAssets(data) {
  const errors = [];

  const hasPermission = await checkPermissions(['downloads']);
  if (!hasPermission)
    errors.push(
      "Don't have download permission (ignore if you already grant the permissions)"
    );
  else if (isEmptyStr(data.selector) && data.type === 'element')
    errors.push('The Selector is empty');

  return errors;
}
```

---

### <a id="validatepresskey"></a>validatePressKey

- **Type**: `function`
- **Parameters**: `data`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function validatePressKey(data) {
  const errors = [];

  const isKeyEmpty =
    !data.action || (data.action === 'press-key' && isEmptyStr(data.keys));
  const isMultipleKeysEmpty =
    data.action === 'multiple-keys' && isEmptyStr(data.keysToPress);
  if (isKeyEmpty || isMultipleKeysEmpty)
    errors.push('The Keys to press is empty');

  return errors;
}
```

---

### <a id="validatenotification"></a>validateNotification

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function validateNotification() {
  const hasPermission = await checkPermissions(['notifications']);
  if (!hasPermission) return ["Don't have notifications permissions"];

  return [];
}
```

---

### <a id="validatecookie"></a>validateCookie

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function validateCookie() {
  const hasPermission = await checkPermissions(['cookies']);
  if (!hasPermission) return ["Don't have cookies permissions"];

  return [];
}
```

---

