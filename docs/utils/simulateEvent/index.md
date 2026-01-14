# index.js

**Path**: `utils/simulateEvent/index.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [getEventObj](#geteventobj) | function | ❌ | `name, params` |
| [anonymous](#anonymous) | function | ❌ | `element, name, params` |

## Detailed Description

### <a id="geteventobj"></a>getEventObj

- **Type**: `function`
- **Parameters**: `name, params`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function getEventObj(name, params) {
  const eventType = eventList.find(({ id }) => id === name)?.type ?? '';
  let event;

  switch (eventType) {
    case 'mouse-event':
      event = new MouseEvent(name, { ...params, view: window });
      break;
    case 'focus-event':
      event = new FocusEvent(name, params);
      break;
    case 'touch-event':
      event = new TouchEvent(name, params);
      break;
    case 'keyboard-event':
// ...
```

---

### <a id="anonymous"></a>anonymous

- **Type**: `function`
- **Parameters**: `element, name, params`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function (element, name, params) {
  const event = getEventObj(name, params);
  const useNativeMethods = ['focus', 'submit', 'blur'];

  if (useNativeMethods.includes(name) && element[name]) {
    element[name]();
  } else {
    element.dispatchEvent(event);
  }
}
```

---

