# recordEvents.js

**Path**: `content/services/recordWorkflow/recordEvents.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [isAutomaInstance](#isautomainstance) | arrow_function | ❌ | `target` |
| [isTextFieldEl](#istextfieldel) | arrow_function | ❌ | `el` |
| [addBlock](#addblock) | function | ✅ | `detail` |
| [onChange](#onchange) | function | ❌ | `{}` |
| [onKeydown](#onkeydown) | function | ✅ | `event` |
| [onClick](#onclick) | function | ❌ | `event` |
| [onFocusIn](#onfocusin) | function | ❌ | `{}` |
| [onFocusOut](#onfocusout) | function | ❌ | `{}` |
| [cleanUp](#cleanup) | function | ❌ | `` |
| [anonymous](#anonymous) | function | ✅ | `mainFrame` |

## Detailed Description

### <a id="isautomainstance"></a>isAutomaInstance

- **Type**: `arrow_function`
- **Parameters**: `target`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(target) =>
  target.id === 'automa-recording' ||
  document.body.hasAttribute('automa-selecting')
```

---

### <a id="istextfieldel"></a>isTextFieldEl

- **Type**: `arrow_function`
- **Parameters**: `el`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(el) => ['INPUT', 'TEXTAREA'].includes(el.tagName)
```

---

### <a id="addblock"></a>addBlock

- **Type**: `function`
- **Parameters**: `detail`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function addBlock(detail) {
  try {
    const data = await addBlockToFlow(detail, isMainFrame);

    if (!isMainFrame || !data || !data.addedBlock) {
      let frameSelector = null;

      if (window.frameElement) {
        frameSelector = finder(window.frameElement, {
          root: window.frameElement.ownerDocument,
        });
      }

      window.top.postMessage(
        {
// ...
```

---

### <a id="onchange"></a>onChange

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function onChange({ target }) {
  if (isAutomaInstance(target)) return;

  const isInputEl = target.tagName === 'INPUT';
  const inputType = target.getAttribute('type');
  const execludeInput = isInputEl && ['checkbox', 'radio'].includes(inputType);

  if (execludeInput) return;

  let block = null;
  const selector = findSelector(target);
  const isSelectEl = target.tagName === 'SELECT';
  const elementName = target.ariaLabel || target.name;

  if (isInputEl && inputType === 'file') {
// ...
```

---

### <a id="onkeydown"></a>onKeydown

- **Type**: `function`
- **Parameters**: `event`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function onKeydown(event) {
  if (isAutomaInstance(event.target) || event.repeat) return;

  const isTextField = isTextFieldEl(event.target);
  const enterKey = event.key === 'Enter';
  let isSubmitting = false;

  if (isTextField) {
    const inputInForm = event.target.form && event.target.tagName === 'INPUT';
    if (enterKey && inputInForm) {
      event.preventDefault();

      await addBlock({
        id: 'forms',
        data: {
// ...
```

---

### <a id="onclick"></a>onClick

- **Type**: `function`
- **Parameters**: `event`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function onClick(event) {
  const { target } = event;
  if (isAutomaInstance(target)) return;

  const isTextField =
    (target.tagName === 'INPUT' && target.getAttribute('type') === 'text') ||
    ['SELECT', 'TEXTAREA'].includes(target.tagName);

  if (isTextField) return;

  let isClickLink = false;
  const selector = findSelector(target);

  if (target.tagName === 'A') {
    if (event.ctrlKey || event.metaKey) return;
// ...
```

---

### <a id="onfocusin"></a>onFocusIn

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function onFocusIn({ target }) {
  if (!isTextFieldEl(target)) return;

  target.setAttribute('data-automa-el-selector', findSelector(target));
  target.addEventListener('input', onInputTextField);
}
```

---

### <a id="onfocusout"></a>onFocusOut

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function onFocusOut({ target }) {
  if (!isTextFieldEl(target)) return;

  target.removeEventListener('input', onInputTextField);
}
```

---

### <a id="cleanup"></a>cleanUp

- **Type**: `function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
function cleanUp() {
  if (isMainFrame) {
    window.removeEventListener('message', onMessage);
    document.removeEventListener('scroll', onScroll, true);
  }

  document.removeEventListener('click', onClick, true);
  document.removeEventListener('change', onChange, true);
  document.removeEventListener('focusin', onFocusIn, true);
  document.removeEventListener('keydown', onKeydown, true);
  document.removeEventListener('focusout', onFocusOut, true);
}
```

---

### <a id="anonymous"></a>anonymous

- **Type**: `function`
- **Parameters**: `mainFrame`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function (mainFrame) {
  const { isRecording } = await browser.storage.local.get('isRecording');

  isMainFrame = mainFrame;

  if (isRecording) {
    if (isMainFrame) {
      window.addEventListener('message', onMessage);
      document.addEventListener('scroll', onScroll, true);
    }

    if (isTextFieldEl(document.activeElement)) {
      onFocusIn({ target: document.activeElement });
    }

// ...
```

---

