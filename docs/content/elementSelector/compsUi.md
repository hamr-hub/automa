# compsUi.js

**Path**: `content/elementSelector/compsUi.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [anonymous](#anonymous) | function | ❌ | `app` |

## Detailed Description

### <a id="anonymous"></a>anonymous

- **Type**: `function`
- **Parameters**: `app`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function (app) {
  app.component('UiTab', UiTab);
  app.component('UiTabs', UiTabs);
  app.component('UiInput', UiInput);
  app.component('UiButton', UiButton);
  app.component('UiSelect', UiSelect);
  app.component('UiSwitch', UiSwitch);
  app.component('UiExpand', UiExpand);
  app.component('UiTextarea', UiTextarea);
  app.component('UiCheckbox', UiCheckbox);
  app.component('UiTabPanel', UiTabPanel);
  app.component('UiTabPanels', UiTabPanels);
  app.component('TransitionExpand', TransitionExpand);

  app.directive('autofocus', VAutofocus);
// ...
```

---

