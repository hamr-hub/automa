# cronstrue.js

**Path**: `lib/cronstrue.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [readableCron](#readablecron) | function | ❌ | `expression` |

## Detailed Description

### <a id="readablecron"></a>readableCron

- **Type**: `function`
- **Parameters**: `expression`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function readableCron(expression) {
  const currentLang = document.documentElement.lang;
  const locale = supportedLocales.includes(currentLang)
    ? altLocaleId[currentLang] || currentLang
    : 'en';

  return cronstrue.toString(expression, { locale });
}
```

---

