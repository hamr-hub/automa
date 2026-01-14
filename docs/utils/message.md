# message.js

**Path**: `utils/message.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [nameBuilder](#namebuilder) | arrow_function | ❌ | `prefix, name` |
| [sendMessage](#sendmessage) | function | ❌ | `name?, data?, prefix?` |
| [constructor](#constructor) | method | ❌ | `prefix?` |
| [on](#on) | method | ❌ | `name, listener` |
| [listener](#listener) | method | ❌ | `message, sender` |
| [sendMessage](#sendmessage) | method | ❌ | `name, data` |

## Detailed Description

### <a id="namebuilder"></a>nameBuilder

- **Type**: `arrow_function`
- **Parameters**: `prefix, name`
- **Description**: *No description provided.*

**Implementation**:
```javascript
(prefix, name) => (prefix ? `${prefix}--${name}` : name)
```

---

### <a id="sendmessage"></a>sendMessage

- **Type**: `function`
- **Parameters**: `name?, data?, prefix?`
- **Description**:

@param {string=} name

@param {*=} data

@param {string=} prefix

@returns {Promise<*>}

**Implementation**:
```javascript
function sendMessage(name = '', data = {}, prefix = '') {
  let payload = {
    name: nameBuilder(prefix, name),
    data,
  };

  if (isFirefox) {
    payload = JSON.stringify(payload);
  }

  return browser.runtime.sendMessage(payload);
}
```

---

### <a id="constructor"></a>constructor

- **Type**: `method`
- **Parameters**: `prefix?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
constructor(prefix = '') {
    this.listeners = {};
    this.prefix = prefix;

    this.listener = this.listener.bind(this);
  }
```

---

### <a id="on"></a>on

- **Type**: `method`
- **Parameters**: `name, listener`
- **Description**: *No description provided.*

**Implementation**:
```javascript
on(name, listener) {
    if (Object.hasOwn(this.listeners, name)) {
      console.error(`You already added ${name}`);
      return this.on;
    }

    this.listeners[nameBuilder(this.prefix, name)] = listener;

    return this.on;
  }
```

---

### <a id="listener"></a>listener

- **Type**: `method`
- **Parameters**: `message, sender`
- **Description**: *No description provided.*

**Implementation**:
```javascript
listener(message, sender) {
    try {
      if (isFirefox) message = JSON.parse(message);

      const listener = this.listeners[message.name];
      const response =
        listener && listener.call({ message, sender }, message.data, sender);

      const _prefix = message.name.split('--')[0];
      // 如果消息有明确的前缀
      if (_prefix && _prefix !== message.name) {
        // 只有当前缀匹配时才处理
        if (_prefix === this.prefix) {
          if (!response) return Promise.resolve();
          if (!(response instanceof Promise)) return Promise.resolve(response);
// ...
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
sendMessage(name, data) {
    return sendMessage(name, data, this.prefix);
  }
```

---

