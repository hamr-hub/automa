# SharedWysiwyg.vue

**Path**: `components/newtab/shared/SharedWysiwyg.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [setLink](#setlink) | function | ❌ | `` |
| [insertImage](#insertimage) | function | ❌ | `` |
| [onUpdate](#onupdate) | object_property_method | ❌ | `` |

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

### <a id="setlink"></a>setLink

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function setLink() {
  const previousUrl = editor.value.getAttributes('link').href;
  const url = window.prompt('URL', previousUrl);

  if (url === null) return;

  if (url === '') {
    editor.value.chain().focus().extendMarkRange('link').unsetLink().run();

    return;
  }

  editor.value
    .chain()
    .focus()
// ...
```

---

### <a id="insertimage"></a>insertImage

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function insertImage() {
  const url = window.prompt('URL');

  if (url) {
    editor.value.chain().focus().setImage({ src: url }).run();
  }
}
```

---

### <a id="onupdate"></a>onUpdate

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
onUpdate: () => {
      const editorValue = editor.value.getJSON();

      emit('count', editor.value.storage.characterCount.characters());
      emit('change', editorValue);
      emit('update:modelValue', editorValue);
    }
```

---

