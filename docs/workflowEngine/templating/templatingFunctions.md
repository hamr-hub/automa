# templatingFunctions.js

**Path**: `workflowEngine/templating/templatingFunctions.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [isAllNums](#isallnums) | arrow_function | ❌ | `...args` |
| [isObject](#isobject) | arrow_function | ❌ | `obj` |
| [parseJSON](#parsejson) | function | ❌ | `data, def` |
| [date](#date) | object_method | ❌ | `...args` |
| [randint](#randint) | object_method | ❌ | `min?, max?` |
| [getLength](#getlength) | object_method | ❌ | `str` |
| [slice](#slice) | object_method | ❌ | `value, start, end` |
| [multiply](#multiply) | object_method | ❌ | `value, multiplyBy` |
| [increment](#increment) | object_method | ❌ | `value, incrementBy` |
| [divide](#divide) | object_method | ❌ | `value, divideBy` |
| [subtract](#subtract) | object_method | ❌ | `value, subtractBy` |
| [randData](#randdata) | object_method | ❌ | `str` |
| [getRand](#getrand) | arrow_function | ❌ | `data` |
| [l](#l) | object_property_method | ❌ | `` |
| [u](#u) | object_property_method | ❌ | `` |
| [d](#d) | object_property_method | ❌ | `` |
| [s](#s) | object_property_method | ❌ | `` |
| [f](#f) | object_method | ❌ | `` |
| [n](#n) | object_method | ❌ | `` |
| [m](#m) | object_method | ❌ | `` |
| [i](#i) | object_method | ❌ | `` |
| [a](#a) | object_method | ❌ | `` |
| [filter](#filter) | object_method | ❌ | `data, exps` |
| [replace](#replace) | object_method | ❌ | `value, search, replace` |
| [replaceAll](#replaceall) | object_method | ❌ | `value, search, replace` |
| [toLowerCase](#tolowercase) | object_method | ❌ | `value` |
| [toUpperCase](#touppercase) | object_method | ❌ | `value` |
| [modulo](#modulo) | object_method | ❌ | `value, divisor` |
| [stringify](#stringify) | object_method | ❌ | `value` |

## Detailed Description

### <a id="isallnums"></a>isAllNums

- **Type**: `arrow_function`
- **Parameters**: `...args`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(...args) => args.every((arg) => !Number.isNaN(+arg))
```

---

### <a id="isobject"></a>isObject

- **Type**: `arrow_function`
- **Parameters**: `obj`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(obj) =>
  typeof obj === 'object' && obj !== null && !Array.isArray(obj)
```

---

### <a id="parsejson"></a>parseJSON

- **Type**: `function`
- **Parameters**: `data, def`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function parseJSON(data, def) {
  try {
    const result = JSON.parse(data);

    return result;
  } catch (error) {
    return def;
  }
}
```

---

### <a id="date"></a>date

- **Type**: `object_method`
- **Parameters**: `...args`
- **Description**: *No description provided.*

**Implementation**:
```javascript
date(...args) {
    let date = new Date();
    let dateFormat = 'DD-MM-YYYY';

    if (args.length === 1) {
      dateFormat = args[0];
    } else if (args.length >= 2) {
      date = new Date(args[0]);
      dateFormat = args[1];
    }

    /* eslint-disable-next-line */
    const isValidDate = date instanceof Date && !isNaN(date);
    const dayjsDate = dayjs(isValidDate ? date : Date.now());

// ...
```

---

### <a id="randint"></a>randint

- **Type**: `object_method`
- **Parameters**: `min?, max?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
randint(min = 0, max = 100) {
    return Math.round(Math.random() * (+max - +min) + +min);
  }
```

---

### <a id="getlength"></a>getLength

- **Type**: `object_method`
- **Parameters**: `str`
- **Description**: *No description provided.*

**Implementation**:
```javascript
getLength(str) {
    const value = parseJSON(str, str);

    return value.length ?? value;
  }
```

---

### <a id="slice"></a>slice

- **Type**: `object_method`
- **Parameters**: `value, start, end`
- **Description**: *No description provided.*

**Implementation**:
```javascript
slice(value, start, end) {
    if (!value || !value.slice) return value;

    const startIndex = Number.isNaN(+start) ? 0 : +start;
    const endIndex = Number.isNaN(+end) ? value.length : +end;

    return value.slice(startIndex, endIndex);
  }
```

---

### <a id="multiply"></a>multiply

- **Type**: `object_method`
- **Parameters**: `value, multiplyBy`
- **Description**: *No description provided.*

**Implementation**:
```javascript
multiply(value, multiplyBy) {
    if (!isAllNums(value, multiplyBy)) return value;

    return +value * +multiplyBy;
  }
```

---

### <a id="increment"></a>increment

- **Type**: `object_method`
- **Parameters**: `value, incrementBy`
- **Description**: *No description provided.*

**Implementation**:
```javascript
increment(value, incrementBy) {
    if (!isAllNums(value, incrementBy)) return value;

    return +value + +incrementBy;
  }
```

---

### <a id="divide"></a>divide

- **Type**: `object_method`
- **Parameters**: `value, divideBy`
- **Description**: *No description provided.*

**Implementation**:
```javascript
divide(value, divideBy) {
    if (!isAllNums(value, divideBy)) return value;

    return +value / +divideBy;
  }
```

---

### <a id="subtract"></a>subtract

- **Type**: `object_method`
- **Parameters**: `value, subtractBy`
- **Description**: *No description provided.*

**Implementation**:
```javascript
subtract(value, subtractBy) {
    if (!isAllNums(value, subtractBy)) return value;

    return +value - +subtractBy;
  }
```

---

### <a id="randdata"></a>randData

- **Type**: `object_method`
- **Parameters**: `str`
- **Description**: *No description provided.*

**Implementation**:
```javascript
randData(str) {
    if (Array.isArray(str)) {
      const index = Math.floor(Math.random() * str.length);
      return str[index];
    }

    const getRand = (data) => data[Math.floor(Math.random() * data.length)];
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const symbols = `!@#$%^&*()-_+={}[]|\;:'"<>,./?"`;
    const mapSamples = {
      l: () => getRand(lowercase),
      u: () => getRand(uppercase),
      d: () => getRand(digits),
// ...
```

---

### <a id="getrand"></a>getRand

- **Type**: `arrow_function`
- **Parameters**: `data`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(data) => data[Math.floor(Math.random() * data.length)]
```

---

### <a id="l"></a>l

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
l: () => getRand(lowercase)
```

---

### <a id="u"></a>u

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
u: () => getRand(uppercase)
```

---

### <a id="d"></a>d

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
d: () => getRand(digits)
```

---

### <a id="s"></a>s

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
s: () => getRand(symbols)
```

---

### <a id="f"></a>f

- **Type**: `object_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
f() {
        return this.l() + this.u();
      }
```

---

### <a id="n"></a>n

- **Type**: `object_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
n() {
        return this.l() + this.d();
      }
```

---

### <a id="m"></a>m

- **Type**: `object_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
m() {
        return this.u() + this.d();
      }
```

---

### <a id="i"></a>i

- **Type**: `object_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
i() {
        return this.l() + this.u() + this.d();
      }
```

---

### <a id="a"></a>a

- **Type**: `object_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
a() {
        return getRand(lowercase + uppercase + digits.join('') + symbols);
      }
```

---

### <a id="filter"></a>filter

- **Type**: `object_method`
- **Parameters**: `data, exps`
- **Description**: *No description provided.*

**Implementation**:
```javascript
filter(data, exps) {
    if (!isObject(data) && !Array.isArray(data)) return data;

    return jsonpath.query(data, exps);
  }
```

---

### <a id="replace"></a>replace

- **Type**: `object_method`
- **Parameters**: `value, search, replace`
- **Description**: *No description provided.*

**Implementation**:
```javascript
replace(value, search, replace) {
    if (!value) return value;

    return value.replace(search, replace);
  }
```

---

### <a id="replaceall"></a>replaceAll

- **Type**: `object_method`
- **Parameters**: `value, search, replace`
- **Description**: *No description provided.*

**Implementation**:
```javascript
replaceAll(value, search, replace) {
    if (!value) return value;

    return value.replaceAll(search, replace);
  }
```

---

### <a id="tolowercase"></a>toLowerCase

- **Type**: `object_method`
- **Parameters**: `value`
- **Description**: *No description provided.*

**Implementation**:
```javascript
toLowerCase(value) {
    if (!value) return value;

    return value.toLowerCase();
  }
```

---

### <a id="touppercase"></a>toUpperCase

- **Type**: `object_method`
- **Parameters**: `value`
- **Description**: *No description provided.*

**Implementation**:
```javascript
toUpperCase(value) {
    if (!value) return value;

    return value.toUpperCase();
  }
```

---

### <a id="modulo"></a>modulo

- **Type**: `object_method`
- **Parameters**: `value, divisor`
- **Description**: *No description provided.*

**Implementation**:
```javascript
modulo(value, divisor) {
    return +value % +divisor;
  }
```

---

### <a id="stringify"></a>stringify

- **Type**: `object_method`
- **Parameters**: `value`
- **Description**: *No description provided.*

**Implementation**:
```javascript
stringify(value) {
    return JSON.stringify(value);
  }
```

---

