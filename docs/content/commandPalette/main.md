# main.js

**Path**: `content/commandPalette/main.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [anonymous](#anonymous) | function | ❌ | `rootElement` |

## Detailed Description

### <a id="anonymous"></a>anonymous

- **Type**: `function`
- **Parameters**: `rootElement`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function (rootElement) {
  const appRoot = document.createElement('div');
  appRoot.setAttribute('id', 'app');

  const style = document.createElement('style');
  style.textContent = additionalStyle;

  rootElement.shadowRoot.appendChild(style);
  rootElement.shadowRoot.appendChild(appRoot);

  createApp(App)
    .use(compsUi)
    .use(vRemixicon, icons)
    .provide('rootElement', rootElement)
    .mount(appRoot);
// ...
```

---

