# UiFileInput.vue

**Path**: `components/ui/UiFileInput.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [isFileTypeValid](#isfiletypevalid) | arrow_function | ❌ | `file` |
| [resetState](#resetstate) | arrow_function | ❌ | `` |
| [handleError](#handleerror) | arrow_function | ❌ | `message` |
| [handleFileChange](#handlefilechange) | arrow_function | ✅ | `event` |

## Detailed Description

### <a id="isfiletypevalid"></a>isFileTypeValid

- **Type**: `arrow_function`
- **Parameters**: `file`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(file) => {
  if (props.accept === '*') return true;

  const acceptedTypes = props.accept.split(',').map((type) => type.trim());
  const { name: fName, type: fileType } = file;

  return acceptedTypes.some((acceptedType) => {
    if (acceptedType.startsWith('.')) {
      return fName.endsWith(acceptedType);
    }
    if (acceptedType.endsWith('/*')) {
      return fileType.startsWith(acceptedType.slice(0, -1));
    }
    return fileType === acceptedType;
  });
// ...
```

---

### <a id="resetstate"></a>resetState

- **Type**: `arrow_function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
() => {
  fileInput.value.value = '';
  fileName.value = '';
}
```

---

### <a id="handleerror"></a>handleError

- **Type**: `arrow_function`
- **Parameters**: `message`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(message) => {
  toast.error(message);
  hasError.value = true;
  resetState();
}
```

---

### <a id="handlefilechange"></a>handleFileChange

- **Type**: `arrow_function`
- **Parameters**: `event`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async (event) => {
  hasError.value = false;
  const file = event.target.files[0];

  if (!file) {
    resetState();
    return;
  }

  fileName.value = file.name;

  if (!isFileTypeValid(file)) {
    handleError('Invalid file type.');
    return;
  }
// ...
```

---

