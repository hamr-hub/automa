# injectAppStyles.js

**Path**: `content/injectAppStyles.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [generateStyleEl](#generatestyleel) | function | ❌ | `css, classes?` |
| [anonymous](#anonymous) | function | ✅ | `appRoot, customCss?` |

## Detailed Description

### <a id="generatestyleel"></a>generateStyleEl

- **Type**: `function`
- **Parameters**: `css, classes?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function generateStyleEl(css, classes = true) {
  const style = document.createElement('style');
  style.textContent = css;

  if (classes) {
    style.classList.add('automa-element-selector');
  }

  return style;
}
```

---

### <a id="anonymous"></a>anonymous

- **Type**: `function`
- **Parameters**: `appRoot, customCss?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function (appRoot, customCss = '') {
  try {
    const response = await fetch(
      browser.runtime.getURL('/elementSelector.css')
    );
    const mainCSS = await response.text();
    const appStyleEl = generateStyleEl(mainCSS + customCss, false);
    appRoot.appendChild(appStyleEl);

    const fontStyleExists = document.head.querySelector(
      '.automa-element-selector'
    );

    if (!fontStyleExists) {
      const commonCSS =
// ...
```

---

