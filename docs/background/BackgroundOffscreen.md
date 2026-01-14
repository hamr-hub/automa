# BackgroundOffscreen.js

**Path**: `background/BackgroundOffscreen.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [instance](#instance) | method | ❌ | `` |
| [constructor](#constructor) | method | ❌ | `` |
| [isOpened](#isopened) | method | ✅ | `` |
| [sendMessage](#sendmessage) | method | ✅ | `name, data` |

## Detailed Description

### <a id="instance"></a>instance

- **Type**: `method`
- **Parameters**: ``
- **Description**:

OffscreenService singleton

@returns {BackgroundOffscreen}

**Implementation**:
```javascript
static get instance() {
    if (!this.#_instance) {
      this.#_instance = new BackgroundOffscreen();
    }

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
    this.#messageListener = new MessageListener('offscreen');

    this.on = this.#messageListener.on;
  }
```

---

### <a id="isopened"></a>isOpened

- **Type**: `method`
- **Parameters**: ``
- **Description**:

@returns {Promise<boolean>}

**Implementation**:
```javascript
async isOpened() {
    if (IS_FIREFOX) return false;

    const contexts = await chrome.runtime.getContexts({
      documentUrls: [OFFSCREEN_URL],
      contextTypes: ['OFFSCREEN_DOCUMENT'],
    });

    return Boolean(contexts.length);
  }
```

---

### <a id="sendmessage"></a>sendMessage

- **Type**: `method`
- **Parameters**: `name, data`
- **Description**:

@param {string} name

@param {*} data

@returns {Promise<*>}

**Implementation**:
```javascript
async sendMessage(name, data) {
    await this.#ensureDocument();

    return this.#messageListener.sendMessage(name, data);
  }
```

---

