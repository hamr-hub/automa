# UiPopover.vue

**Path**: `components/ui/UiPopover.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [default](#default) | object_property_method | ❌ | `` |
| [setup](#setup) | object_method | ❌ | `props, {}` |
| [appendTo](#appendto) | object_property_method | ❌ | `` |
| [onShow](#onshow) | object_property_method | ❌ | `event` |
| [onHide](#onhide) | object_property_method | ❌ | `` |
| [onTrigger](#ontrigger) | object_property_method | ❌ | `` |

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

### <a id="setup"></a>setup

- **Type**: `object_method`
- **Parameters**: `props, {}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
setup(props, { emit }) {
    const targetEl = ref(null);
    const content = ref(null);
    const isShow = ref(false);
    const instance = shallowRef(null);

    watch(
      () => props.options,
      (value) => {
        instance.value.setProps(value);
      },
      { deep: true }
    );
    watch(
      () => props.disabled,
// ...
```

---

### <a id="appendto"></a>appendTo

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
appendTo: () => document.body
```

---

### <a id="onshow"></a>onShow

- **Type**: `object_property_method`
- **Parameters**: `event`
- **Description**: *No description provided.*

**Implementation**:
```javascript
onShow: (event) => {
          if (props.triggerWidth) {
            event.popper.style.width = `${
              event.reference.getBoundingClientRect().width
            }px`;
          }

          emit('show', event);
          isShow.value = true;
        }
```

---

### <a id="onhide"></a>onHide

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
onHide: () => {
          emit('close');
          emit('update:modelValue', false);
          isShow.value = false;
        }
```

---

### <a id="ontrigger"></a>onTrigger

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
onTrigger: () => emit('trigger')
```

---

