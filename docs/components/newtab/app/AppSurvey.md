# AppSurvey.vue

**Path**: `components/newtab/app/AppSurvey.vue`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [closeModal](#closemodal) | function | ❌ | `` |
| [checkModal](#checkmodal) | function | ✅ | `` |

## Detailed Description

### <a id="closemodal"></a>closeModal

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function closeModal() {
  let value = true;

  if (modalState.type === 'survey') {
    value = new Date().toString();
  }

  modalState.show = false;
  localStorage.setItem(`has-${modalState.type}`, value);
}
```

---

### <a id="checkmodal"></a>checkModal

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function checkModal() {
  try {
    const { isFirstTime } = await browser.storage.local.get('isFirstTime');

    if (isFirstTime) {
      modalState.show = false;
      localStorage.setItem('has-testimonial', true);
      localStorage.setItem('has-survey', Date.now());
      return;
    }

    const survey = localStorage.getItem('has-survey');

    if (!survey) return;

// ...
```

---

