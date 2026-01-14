# WorkflowState.js

**Path**: `workflowEngine/WorkflowState.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [constructor](#constructor) | method | ❌ | `{}` |
| [_updateBadge](#-updatebadge) | method | ❌ | `` |
| [_saveToStorage](#-savetostorage) | method | ❌ | `` |
| [dispatchEvent](#dispatchevent) | method | ❌ | `name, params` |
| [on](#on) | method | ❌ | `name, listener` |
| [off](#off) | method | ❌ | `name, listener` |
| [getAll](#getall) | method | ❌ | `` |
| [get](#get) | method | ✅ | `stateId` |
| [add](#add) | method | ✅ | `id, data?` |
| [stop](#stop) | method | ✅ | `id` |
| [resume](#resume) | method | ✅ | `id, nextBlock` |
| [update](#update) | method | ✅ | `id, data?` |
| [delete](#delete) | method | ✅ | `id` |

## Detailed Description

### <a id="constructor"></a>constructor

- **Type**: `method`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
constructor({ storage, key = 'workflowState' }) {
    this.key = key;
    this.storage = storage;

    this.states = new Map();
    this.eventListeners = {};

    this.storageTimeout = null;
  }
```

---

### <a id="-updatebadge"></a>_updateBadge

- **Type**: `method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
_updateBadge() {
    BrowserAPIService.browserAction.setBadgeText({
      text: (this.states.size || '').toString(),
    });
  }
```

---

### <a id="-savetostorage"></a>_saveToStorage

- **Type**: `method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
_saveToStorage() {
    if (this.storageTimeout) return;

    this.storageTimeout = setTimeout(() => {
      this.storageTimeout = null;

      const states = Object.fromEntries(this.states);
      this.storage.set(this.key, states);
    }, 1000);
  }
```

---

### <a id="dispatchevent"></a>dispatchEvent

- **Type**: `method`
- **Parameters**: `name, params`
- **Description**: *No description provided.*

**Implementation**:
```javascript
dispatchEvent(name, params) {
    const listeners = this.eventListeners[name];

    if (!listeners) return;

    listeners.forEach((callback) => {
      callback(params);
    });
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
    (this.eventListeners[name] = this.eventListeners[name] || []).push(
      listener
    );
  }
```

---

### <a id="off"></a>off

- **Type**: `method`
- **Parameters**: `name, listener`
- **Description**: *No description provided.*

**Implementation**:
```javascript
off(name, listener) {
    const listeners = this.eventListeners[name];
    if (!listeners) return;

    const index = listeners.indexOf(listener);
    if (index !== -1) listeners.splice(index, 1);
  }
```

---

### <a id="getall"></a>getAll

- **Type**: `method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
get getAll() {
    return this.states;
  }
```

---

### <a id="get"></a>get

- **Type**: `method`
- **Parameters**: `stateId`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async get(stateId) {
    let { states } = this;

    if (typeof stateId === 'function') {
      states = Array.from(states.entries()).find(({ 1: state }) =>
        stateId(state)
      );
    } else if (stateId) {
      states = this.states.get(stateId);
    }

    return states;
  }
```

---

### <a id="add"></a>add

- **Type**: `method`
- **Parameters**: `id, data?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async add(id, data = {}) {
    this.states.set(id, data);
    this._updateBadge();
    this._saveToStorage(this.key);
  }
```

---

### <a id="stop"></a>stop

- **Type**: `method`
- **Parameters**: `id`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async stop(id) {
    const isStateExist = await this.get(id);
    if (!isStateExist) {
      await this.delete(id);
      this.dispatchEvent('stop', id);
      return id;
    }

    await this.update(id, { isDestroyed: true });
    this.dispatchEvent('stop', id);
    return id;
  }
```

---

### <a id="resume"></a>resume

- **Type**: `method`
- **Parameters**: `id, nextBlock`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async resume(id, nextBlock) {
    const state = this.states.get(id);
    if (!state) return;

    this.states.set(id, {
      ...state,
      status: 'running',
    });
    this._saveToStorage();

    this.dispatchEvent('resume', { id, nextBlock });
  }
```

---

### <a id="update"></a>update

- **Type**: `method`
- **Parameters**: `id, data?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async update(id, data = {}) {
    const state = this.states.get(id);
    if (!state) return;

    if (data?.state?.status) {
      state.status = data.state.status;
      delete data.state.status;
    }

    this.states.set(id, { ...state, ...data });
    this.dispatchEvent('update', { id, data });
    this._saveToStorage();
  }
```

---

### <a id="delete"></a>delete

- **Type**: `method`
- **Parameters**: `id`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async delete(id) {
    this.states.delete(id);
    this.dispatchEvent('delete', id);
    this._updateBadge();
    this._saveToStorage();
  }
```

---

