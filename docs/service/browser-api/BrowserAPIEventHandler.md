# BrowserAPIEventHandler.js

**Path**: `service/browser-api/BrowserAPIEventHandler.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [onBrowserAPIEvent](#onbrowserapievent) | function | ❌ | `name, ...args` |
| [instance](#instance) | method | ❌ | `` |
| [constructor](#constructor) | method | ❌ | `` |
| [createEventListener](#createeventlistener) | method | ❌ | `name` |
| [addListener](#addlistener) | arrow_function | ❌ | `callback` |
| [removeListener](#removelistener) | arrow_function | ❌ | `callback` |
| [hasListeners](#haslisteners) | arrow_function | ❌ | `` |
| [hasListener](#haslistener) | arrow_function | ❌ | `callback` |
| [onBrowserEventListener](#onbrowsereventlistener) | method | ❌ | `event` |
| [onToggleBrowserEventListener](#ontogglebrowsereventlistener) | method | ❌ | `{}` |

## Detailed Description

### <a id="onbrowserapievent"></a>onBrowserAPIEvent

- **Type**: `function`
- **Parameters**: `name, ...args`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function onBrowserAPIEvent(name, ...args) {
  MessageListener.sendMessage(
    BROWSER_API_EVENTS.ON_EVENT,
    { name, args },
    'offscreen'
  );
}
```

---

### <a id="instance"></a>instance

- **Type**: `method`
- **Parameters**: ``
- **Description**:

BrowserAPIEventHandler singleton

@type {BrowserAPIEventHandler}

**Implementation**:
```javascript
static get instance() {
    if (!this.#_instance) this.#_instance = new BrowserAPIEventHandler();

    return this.#_instance;
  }
```

---

### <a id="constructor"></a>constructor

- **Type**: `method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
constructor() {
    this.#events = {};
    this.#browserEvents = {};
    this.#eventsHandler = {};

    this.#isEventAdded = new Set();
  }
```

---

### <a id="createeventlistener"></a>createEventListener

- **Type**: `method`
- **Parameters**: `name`
- **Description**:

@param {BrowserAPIEventsName} name

@param {*} browserAPI

**Implementation**:
```javascript
createEventListener(name) {
    if (this.#eventsHandler[name]) return this.#eventsHandler[name];

    if (!this.#events[name]) this.#events[name] = [];

    /**
     * This callback is displayed as a global member.
     * @callback eventListenerCallback
     * @param {...*} args
     */

    /**
     * @param {eventListenerCallback} callback
     */
    const addListener = (callback) => {
// ...
```

---

### <a id="addlistener"></a>addListener

- **Type**: `arrow_function`
- **Parameters**: `callback`
- **Description**:

This callback is displayed as a global member.

@callback eventListenerCallback

@param {...*} args

@param {eventListenerCallback} callback

**Implementation**:
```javascript
(callback) => {
      this.#events[name].push(callback);

      if (this.#isEventAdded.has(name)) return;

      MessageListener.sendMessage(
        BROWSER_API_EVENTS.TOGGLE,
        {
          name,
          type: 'add',
        },
        'background'
      ).then(() => {
        this.#isEventAdded.add(name);
      });
// ...
```

---

### <a id="removelistener"></a>removeListener

- **Type**: `arrow_function`
- **Parameters**: `callback`
- **Description**:

@param {eventListenerCallback} callback

**Implementation**:
```javascript
(callback) => {
      const index = this.#events[name].indexOf(callback);
      if (index === -1) return;

      this.#events[name].splice(index, 1);

      if (this.#events[name].length > 0) return;

      MessageListener.sendMessage(
        BROWSER_API_EVENTS.TOGGLE,
        {
          name,
          type: 'remove',
        },
        'background'
// ...
```

---

### <a id="haslisteners"></a>hasListeners

- **Type**: `arrow_function`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
() => {
      return this.#events[name].length > 0;
    }
```

---

### <a id="haslistener"></a>hasListener

- **Type**: `arrow_function`
- **Parameters**: `callback`
- **Description**:

@param {eventListenerCallback} callback

**Implementation**:
```javascript
(callback) => {
      return this.#events[name].includes(callback);
    }
```

---

### <a id="onbrowsereventlistener"></a>onBrowserEventListener

- **Type**: `method`
- **Parameters**: `event`
- **Description**:

@param {{ name: BrowserAPIEventsName, args: unknown[] }} event

**Implementation**:
```javascript
onBrowserEventListener(event) {
    if (!event.name || !this.#events[event.name]) return;

    this.#events[event.name].forEach((listener) => listener(...event.args));
  }
```

---

### <a id="ontogglebrowsereventlistener"></a>onToggleBrowserEventListener

- **Type**: `method`
- **Parameters**: `{}`
- **Description**:

@param {{ name: BrowserAPIEventsName, type: 'add' | 'remove' }} data

**Implementation**:
```javascript
onToggleBrowserEventListener({ name, type }) {
    const isAddListener = type === 'add';

    if (isAddListener && this.#browserEvents[name]) return;
    if (!isAddListener && !this.#browserEvents[name]) return;

    const browserEventAPI = browserAPIMap
      .find((item) => item.path === name && item.isEvent)
      ?.api();
    if (!browserAPIMap) return;

    const eventType = isAddListener ? 'addListener' : 'removeListener';
    const listener = isAddListener
      ? onBrowserAPIEvent.bind(null, name)
      : this.#browserEvents[name];
// ...
```

---

