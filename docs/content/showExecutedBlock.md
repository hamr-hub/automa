# showExecutedBlock.js

**Path**: `content/showExecutedBlock.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [generateElement](#generateelement) | function | ❌ | `block` |
| [anonymous](#anonymous) | function | ❌ | `data, enable` |

## Detailed Description

### <a id="generateelement"></a>generateElement

- **Type**: `function`
- **Parameters**: `block`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function generateElement(block) {
  return `
    <div style="display: flex; align-items: center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        id="spinner"
        fill="transparent"
        width="24"
        height="24"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
// ...
```

---

### <a id="anonymous"></a>anonymous

- **Type**: `function`
- **Parameters**: `data, enable`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function (data, enable) {
  if (!enable) {
    return () => {};
  }

  const block = tasks[data.label];
  if (!block) return () => {};
  let container = document.querySelector('.automa-executed-block');

  if (!container) {
    container = document.createElement('div');
    container.classList.add('automa-executed-block');
    document.body.appendChild(container);

    const style = document.createElement('style');
// ...
```

---

