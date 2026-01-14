# normalize.js

**Path**: `lib/query-selector-shadow-dom/normalize.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [normalizeSelector](#normalizeselector) | function | ❌ | `sel` |
| [saveUnmatched](#saveunmatched) | function | ❌ | `` |

## Detailed Description

### <a id="normalizeselector"></a>normalizeSelector

- **Type**: `function`
- **Parameters**: `sel`
- **Description**:

istanbul ignore file

eslint-disable

normalize-selector-rev-02.js

author: kyle simpson (@getify)

original source: https://gist.github.com/getify/9679380

modified for tests by david kaye (@dfkaye)

21 march 2014

rev-02 incorporate kyle's changes 3/2/42014

**Implementation**:
```javascript
function normalizeSelector(sel) {
  // save unmatched text, if any
  function saveUnmatched() {
    if (unmatched) {
      // whitespace needed after combinator?
      if (tokens.length > 0 && /^[~+>]$/.test(tokens[tokens.length - 1])) {
        tokens.push(' ');
      }

      // save unmatched text
      tokens.push(unmatched);
    }
  }

  var tokens = [];
// ...
```

---

### <a id="saveunmatched"></a>saveUnmatched

- **Type**: `function`
- **Parameters**: ``
- **Description**:

save unmatched text, if any

**Implementation**:
```javascript
function saveUnmatched() {
    if (unmatched) {
      // whitespace needed after combinator?
      if (tokens.length > 0 && /^[~+>]$/.test(tokens[tokens.length - 1])) {
        tokens.push(' ');
      }

      // save unmatched text
      tokens.push(unmatched);
    }
  }
```

---

