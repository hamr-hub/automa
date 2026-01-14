# compsUi.js

**Path**: `lib/compsUi.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [componentsExtractor](#componentsextractor) | function | ❌ | `app, components` |
| [anonymous](#anonymous) | function | ❌ | `app` |

## Detailed Description

### <a id="componentsextractor"></a>componentsExtractor

- **Type**: `function`
- **Parameters**: `app, components`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function componentsExtractor(app, components) {
  components.keys().forEach((key) => {
    const componentName = key.replace(/(.\/)|\.vue$/g, '');
    const component = components(key)?.default ?? {};

    app.component(componentName, component);
  });
}
```

---

### <a id="anonymous"></a>anonymous

- **Type**: `function`
- **Parameters**: `app`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function (app) {
  app.directive('tooltip', VTooltip);
  app.directive('autofocus', VAutofocus);
  app.directive('close-popover', VClosePopover);

  componentsExtractor(app, uiComponents);
  componentsExtractor(app, transitionComponents);
}
```

---

