# elementObserver.js

**Path**: `content/elementObserver.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [matchPatternToRegex](#matchpatterntoregex) | function | ❌ | `str` |
| [tryObserve](#tryobserve) | function | ❌ | `{}` |
| [findElement](#findelement) | arrow_function | ❌ | `` |
| [anonymous](#anonymous) | function | ✅ | `` |

## Detailed Description

### <a id="matchpatterntoregex"></a>matchPatternToRegex

- **Type**: `function`
- **Parameters**: `str`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function matchPatternToRegex(str) {
  const regexStr = str.replace(/[*?^$]/g, (char) => {
    if (char === '*') return '[a-zA-Z0-9]*';

    return `\\${char}`;
  });
  const regex = new RegExp(regexStr);

  return regex;
}
```

---

### <a id="tryobserve"></a>tryObserve

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function tryObserve({ selector, observer, options, id }) {
  let tryCount = 0;

  const findElement = () => {
    if (tryCount > 10) return;

    const selectorType = isXPath(selector) ? 'xpath' : 'cssSelector';
    const element = FindElement[selectorType]({ selector });

    if (!element) {
      tryCount += 1;
      setTimeout(findElement, 1000);
      return;
    }

// ...
```

---

### <a id="findelement"></a>findElement

- **Type**: `arrow_function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
() => {
    if (tryCount > 10) return;

    const selectorType = isXPath(selector) ? 'xpath' : 'cssSelector';
    const element = FindElement[selectorType]({ selector });

    if (!element) {
      tryCount += 1;
      setTimeout(findElement, 1000);
      return;
    }

    if (id) element.setAttribute('automa-id', id);

    if (!options.attributes || options.attributeFilter.length === 0)
// ...
```

---

### <a id="anonymous"></a>anonymous

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function () {
  const { workflows } = await browser.storage.local.get('workflows');
  workflows.forEach(({ trigger, id, ...workflowDetail }) => {
    if (
      !trigger ||
      trigger.type !== 'element-change' ||
      !trigger.observeElement?.selector ||
      !trigger.observeElement?.matchPattern
    )
      return;

    const {
      baseSelector,
      baseElOptions,
      selector,
// ...
```

---

