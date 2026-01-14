# theme.js

**Path**: `composable/theme.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [isPreferDark](#ispreferdark) | arrow_function | ❌ | `` |
| [useTheme](#usetheme) | function | ❌ | `` |
| [setTheme](#settheme) | function | ✅ | `theme` |
| [getTheme](#gettheme) | function | ✅ | `` |
| [init](#init) | function | ✅ | `` |

## Detailed Description

### <a id="ispreferdark"></a>isPreferDark

- **Type**: `arrow_function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
() =>
  window.matchMedia('(prefers-color-scheme: dark)').matches
```

---

### <a id="usetheme"></a>useTheme

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function useTheme() {
  const activeTheme = ref('system');

  async function setTheme(theme) {
    const isValidTheme = themes.some(({ id }) => id === theme);

    if (!isValidTheme) return;

    let isDarkTheme = theme === 'dark';

    if (theme === 'system') isDarkTheme = isPreferDark();

    document.documentElement.classList.toggle('dark', isDarkTheme);
    activeTheme.value = theme;

// ...
```

---

### <a id="settheme"></a>setTheme

- **Type**: `function`
- **Parameters**: `theme`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function setTheme(theme) {
    const isValidTheme = themes.some(({ id }) => id === theme);

    if (!isValidTheme) return;

    let isDarkTheme = theme === 'dark';

    if (theme === 'system') isDarkTheme = isPreferDark();

    document.documentElement.classList.toggle('dark', isDarkTheme);
    activeTheme.value = theme;

    await browser.storage.local.set({ theme });
  }
```

---

### <a id="gettheme"></a>getTheme

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function getTheme() {
    let { theme } = await browser.storage.local.get('theme');

    if (!theme) theme = 'system';

    return theme;
  }
```

---

### <a id="init"></a>init

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function init() {
    const theme = await getTheme();

    await setTheme(theme);
  }
```

---

