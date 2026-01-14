# TransitionSlide.vue

**Path**: `components/transitions/TransitionSlide.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [validator](#validator) | object_property_method | ❌ | `value` |
| [setup](#setup) | object_method | ❌ | `props, {}` |
| [getTranslateStyle](#gettranslatestyle) | function | ❌ | `key?` |
| [enter](#enter) | function | ❌ | `element` |
| [leave](#leave) | function | ❌ | `element` |
| [afterEnter](#afterenter) | function | ❌ | `element` |

## Detailed Description

### <a id="validator"></a>validator

- **Type**: `object_property_method`
- **Parameters**: `value`
- **Description**: *No description provided.*

**Implementation**:
```javascript
validator: (value) => ['top', 'left', 'right', 'bottom'].includes(value)
```

---

### <a id="setup"></a>setup

- **Type**: `object_method`
- **Parameters**: `props, {}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
setup(props, { slots, attrs }) {
    const translateValues = {
      0: '-100%',
      1: '100%',
    };
    const directionsKey = {
      top: 0,
      left: 0,
      right: 1,
      bottom: 1,
    };

    function getTranslateStyle(key = 0) {
      const isHorizontal = ['left', 'right'].includes(props.direction);
      const value = translateValues[directionsKey[props.direction] + key];
// ...
```

---

### <a id="gettranslatestyle"></a>getTranslateStyle

- **Type**: `function`
- **Parameters**: `key?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function getTranslateStyle(key = 0) {
      const isHorizontal = ['left', 'right'].includes(props.direction);
      const value = translateValues[directionsKey[props.direction] + key];

      if (isHorizontal) return `translateX(${value})`;

      return `translateY(${value})`;
    }
```

---

### <a id="enter"></a>enter

- **Type**: `function`
- **Parameters**: `element`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function enter(element) {
      element.style.transform = getTranslateStyle();
    }
```

---

### <a id="leave"></a>leave

- **Type**: `function`
- **Parameters**: `element`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function leave(element) {
      element.style.transform = getTranslateStyle(1);
    }
```

---

### <a id="afterenter"></a>afterEnter

- **Type**: `function`
- **Parameters**: `element`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function afterEnter(element) {
      element.style.transform = 'translate(0, 0)';
    }
```

---

