# commandManager.js

**Path**: `composable/commandManager.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [useCommandManager](#usecommandmanager) | function | ❌ | `?` |
| [add](#add) | object_method | ❌ | `command` |
| [undo](#undo) | object_method | ❌ | `` |
| [redo](#redo) | object_method | ❌ | `` |

## Detailed Description

### <a id="usecommandmanager"></a>useCommandManager

- **Type**: `function`
- **Parameters**: `?`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function useCommandManager({ maxHistory = 100 } = {}) {
  const position = shallowRef(0);
  let history = [null];

  const state = computed(() => ({
    position: position.value,
    historyLen: history.length,
    canUndo: position.value > 0,
    canRedo: position.value < history.length - 1,
  }));

  return {
    state,
    add(command) {
      if (position.value < history.length - 1) {
// ...
```

---

### <a id="add"></a>add

- **Type**: `object_method`
- **Parameters**: `command`
- **Description**: *No description provided.*

**Implementation**:
```javascript
add(command) {
      if (position.value < history.length - 1) {
        history = history.slice(0, position.value + 1);
      }
      if (history.length > maxHistory) {
        history.shift();
      }

      history.push(command);
      position.value += 1;
    }
```

---

### <a id="undo"></a>undo

- **Type**: `object_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
undo() {
      if (position.value > 0) {
        history[position.value].undo();
        position.value -= 1;
      }
    }
```

---

### <a id="redo"></a>redo

- **Type**: `object_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
redo() {
      if (position.value < history.length - 1) {
        position.value += 1;
        history[position.value].execute();
      }
    }
```

---

