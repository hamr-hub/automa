# TransitionExpand.vue

**Path**: `components/transitions/TransitionExpand.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [setup](#setup) | object_method | ❌ | `props, {}` |
| [enter](#enter) | function | ❌ | `element` |
| [afterEnter](#afterenter) | function | ❌ | `element` |
| [leave](#leave) | function | ❌ | `element` |

## Detailed Description

### <a id="setup"></a>setup

- **Type**: `object_method`
- **Parameters**: `props, {}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
setup(props, { slots, attrs }) {
    function enter (element) {
      const { width } = getComputedStyle(element);

      element.style.width = width;
      element.style.position = 'absolute';
      element.style.visibility = 'hidden';
      element.style.height = 'auto';

      const { height } = getComputedStyle(element);

      element.style.width = null;
      element.style.position = null;
      element.style.visibility = null;
      element.style.height = 0;
// ...
```

---

### <a id="enter"></a>enter

- **Type**: `function`
- **Parameters**: `element`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function enter (element) {
      const { width } = getComputedStyle(element);

      element.style.width = width;
      element.style.position = 'absolute';
      element.style.visibility = 'hidden';
      element.style.height = 'auto';

      const { height } = getComputedStyle(element);

      element.style.width = null;
      element.style.position = null;
      element.style.visibility = null;
      element.style.height = 0;

// ...
```

---

### <a id="afterenter"></a>afterEnter

- **Type**: `function`
- **Parameters**: `element`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function afterEnter (element) {
      element.style.height = 'auto';
    }
```

---

### <a id="leave"></a>leave

- **Type**: `function`
- **Parameters**: `element`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function leave (element) {
      const { height } = getComputedStyle(element);

      element.style.height = height;

      getComputedStyle(element).height;

      requestAnimationFrame(() => {
        element.style.height = 0;
      });
    }
```

---

