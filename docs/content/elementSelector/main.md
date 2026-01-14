# main.js

**Path**: `content/elementSelector/main.js`

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

  rootElement.shadowRoot.appendChild(appRoot);

  createApp(App)
    .provide('rootElement', rootElement)
    .use(vueI18n)
    .use(vRemixicon, icons)
    .use(compsUi)
    .mount(appRoot);
}
```

---

