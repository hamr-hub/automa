# UiDialog.vue

**Path**: `components/ui/UiDialog.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [setup](#setup) | object_method | ❌ | `` |
| [handleShowDialog](#handleshowdialog) | function | ❌ | `{}` |
| [destroy](#destroy) | function | ❌ | `` |
| [keyupHandler](#keyuphandler) | function | ❌ | `{}` |

## Detailed Description

### <a id="setup"></a>setup

- **Type**: `object_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
setup() {
    const { t } = useI18n();

    const defaultOptions = {
      body: '',
      title: '',
      label: '',
      html: false,
      onCancel: null,
      onConfirm: null,
      placeholder: '',
      inputType: 'text',
      showLoading: false,
      okVariant: 'accent',
      okText: t('common.confirm'),
// ...
```

---

### <a id="handleshowdialog"></a>handleShowDialog

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function handleShowDialog({ type, options }) {
      state.type = type;
      state.input = options?.inputValue ?? '';
      state.options = defu(options, defaultOptions);

      state.show = true;
    }
```

---

### <a id="destroy"></a>destroy

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function destroy() {
      state.input = '';
      state.show = false;
      state.showPassword = false;
      state.options = defaultOptions;
    }
```

---

### <a id="keyuphandler"></a>keyupHandler

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function keyupHandler({ code }) {
      if (code === 'Enter') {
        fireCallback('onConfirm');
      } else if (code === 'Escape') {
        fireCallback('onCancel');
      }
    }
```

---

