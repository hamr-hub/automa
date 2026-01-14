# compsUi.js

**Path**: `content/commandPalette/compsUi.js`

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
  app.component('UiCard', UiCard);
  app.component('UiList', UiList);
  app.component('UiInput', UiInput);
  app.component('UiButton', UiButton);
  app.component('UiSelect', UiSelect);
  app.component('UiPopover', UiPopover);
  app.component('UiSpinner', UiSpinner);
  app.component('UiTextarea', UiTextarea);
  app.component('UiListItem', UiListItem);
  app.component('TransitionExpand', TransitionExpand);

  app.directive('autofocus', VAutofocus);
}
```

---

