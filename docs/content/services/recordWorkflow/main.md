# main.js

**Path**: `content/services/recordWorkflow/main.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [anonymous](#anonymous) | function | ❌ | `` |

## Detailed Description

### <a id="anonymous"></a>anonymous

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function () {
  const rootElement = document.createElement('div');
  rootElement.attachShadow({ mode: 'open' });
  rootElement.setAttribute('id', 'automa-recording');
  rootElement.classList.add('automa-element-selector');
  document.body.appendChild(rootElement);

  return injectAppStyles(rootElement.shadowRoot, customCSS).then(() => {
    const appRoot = document.createElement('div');
    appRoot.setAttribute('id', 'app');
    rootElement.shadowRoot.appendChild(appRoot);

    const app = createApp(App).use(vRemixicon, icons);
    app.mount(appRoot);

// ...
```

---

