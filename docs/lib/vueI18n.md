# vueI18n.js

**Path**: `lib/vueI18n.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [setI18nLanguage](#seti18nlanguage) | function | ❌ | `locale` |
| [loadLocaleMessages](#loadlocalemessages) | function | ✅ | `locale, location` |
| [importLocale](#importlocale) | arrow_function | ✅ | `path, merge?` |

## Detailed Description

### <a id="seti18nlanguage"></a>setI18nLanguage

- **Type**: `function`
- **Parameters**: `locale`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function setI18nLanguage(locale) {
  i18n.global.locale.value = locale;

  document.querySelector('html').setAttribute('lang', locale);
}
```

---

### <a id="loadlocalemessages"></a>loadLocaleMessages

- **Type**: `function`
- **Parameters**: `locale, location`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function loadLocaleMessages(locale, location) {
  const isLocaleSupported = supportLocales.some(({ id }) => id === locale);

  if (!isLocaleSupported) {
    console.error(`${locale} locale is not supported`);

    return null;
  }

  const importLocale = async (path, merge = false) => {
    try {
      const messages = await import(
        /* webpackChunkName: "locales/locale-[request]" */ `../locales/${locale}/${path}`
      );

// ...
```

---

### <a id="importlocale"></a>importLocale

- **Type**: `arrow_function`
- **Parameters**: `path, merge?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async (path, merge = false) => {
    try {
      const messages = await import(
        /* webpackChunkName: "locales/locale-[request]" */ `../locales/${locale}/${path}`
      );

      if (merge) {
        i18n.global.mergeLocaleMessage(locale, messages.default);
      } else {
        i18n.global.setLocaleMessage(locale, messages.default);
      }
    } catch (error) {
      console.error(error);
    }
  }
```

---

