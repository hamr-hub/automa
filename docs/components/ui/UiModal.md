# UiModal.vue

**Path**: `components/ui/UiModal.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [setup](#setup) | object_method | ❌ | `props, {}` |
| [toggleBodyOverflow](#togglebodyoverflow) | function | ❌ | `value` |
| [closeModal](#closemodal) | function | ❌ | `` |
| [keyupHandler](#keyuphandler) | function | ❌ | `{}` |

## Detailed Description

### <a id="setup"></a>setup

- **Type**: `object_method`
- **Parameters**: `props, {}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
setup(props, { emit }) {
    const positions = {
      center: 'items-center',
      start: 'items-start',
    };

    const show = ref(false);
    const modalContent = ref(null);

    function toggleBodyOverflow(value) {
      document.body.classList.toggle('overflow-hidden', value);
    }
    function closeModal() {
      if (props.persist) return;

// ...
```

---

### <a id="togglebodyoverflow"></a>toggleBodyOverflow

- **Type**: `function`
- **Parameters**: `value`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function toggleBodyOverflow(value) {
      document.body.classList.toggle('overflow-hidden', value);
    }
```

---

### <a id="closemodal"></a>closeModal

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function closeModal() {
      if (props.persist) return;

      show.value = false;
      emit('close', false);
      emit('update:modelValue', false);

      toggleBodyOverflow(false);
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
      if (code === 'Escape') closeModal();
    }
```

---

