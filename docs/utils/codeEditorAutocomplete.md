# codeEditorAutocomplete.js

**Path**: `utils/codeEditorAutocomplete.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [completeProperties](#completeproperties) | function | ❌ | `from, object` |
| [completeFromGlobalScope](#completefromglobalscope) | function | ❌ | `context` |
| [automaFuncsCompletion](#automafuncscompletion) | function | ❌ | `snippets` |
| [info](#info) | object_property_method | ❌ | `` |
| [info](#info) | object_property_method | ❌ | `` |
| [info](#info) | object_property_method | ❌ | `` |
| [info](#info) | object_property_method | ❌ | `` |
| [info](#info) | object_property_method | ❌ | `` |

## Detailed Description

### <a id="completeproperties"></a>completeProperties

- **Type**: `function`
- **Parameters**: `from, object`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function completeProperties(from, object) {
  const options = [];
  /* eslint-disable-next-line */
  for (const name in object) {
    if (
      !name.startsWith('__') &&
      !name.startsWith('webpack') &&
      !excludeProps.includes(name)
    )
      options.push({
        label: name,
        type: typeof object[name] === 'function' ? 'function' : 'variable',
      });
  }
  return {
// ...
```

---

### <a id="completefromglobalscope"></a>completeFromGlobalScope

- **Type**: `function`
- **Parameters**: `context`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function completeFromGlobalScope(context) {
  const nodeBefore = syntaxTree(context.state).resolveInner(context.pos, -1);

  if (
    completePropertyAfter.includes(nodeBefore.name) &&
    nodeBefore.parent?.name === 'MemberExpression'
  ) {
    const object = nodeBefore.parent.getChild('Expression');
    if (object?.name === 'VariableName') {
      const from = /\./.test(nodeBefore.name) ? nodeBefore.to : nodeBefore.from;
      const variableName = context.state.sliceDoc(object.from, object.to);
      if (typeof window[variableName] === 'object')
        return completeProperties(from, window[variableName]);
    }
  } else if (nodeBefore.name === 'VariableName') {
// ...
```

---

### <a id="automafuncscompletion"></a>automaFuncsCompletion

- **Type**: `function`
- **Parameters**: `snippets`
- **Description**: *No description provided.*

**Implementation**:
```javascript
function automaFuncsCompletion(snippets) {
  return function (context) {
    const word = context.matchBefore(/\w*/);
    const nodeBefore = syntaxTree(context.state).resolveInner(context.pos, -1);

    if (
      (word.from === word.to && !context.explicit) ||
      dontCompleteIn.includes(nodeBefore.name)
    )
      return null;

    return {
      from: word.from,
      options: snippets,
    };
// ...
```

---

### <a id="info"></a>info

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
info: () => {
      const container = document.createElement('div');

      container.innerHTML = `
        <code>automaNextBlock(<i>data</i>, <i>insert?</i>)</code>
        <p class="mt-2">
          Execute the next block
          <a href="https://docs.extension.automa.site/blocks/javascript-code.html#automanextblock-data" target="_blank" class="underline">
            Read more
          </a>
        </p>
      `;

      return container;
    }
```

---

### <a id="info"></a>info

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
info: () => {
      const container = document.createElement('div');

      container.innerHTML = `
        <code>automaRefData(<i>name</i>, <i>value</i>)</code>
        <p class="mt-2">
          Set the value of a variable
        </p>
      `;

      return container;
    }
```

---

### <a id="info"></a>info

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
info: () => {
      const container = document.createElement('div');

      container.innerHTML = `
        <code>automaFetch(<i>type</i>, <i>resource</i>)</code>
      `;

      return container;
    }
```

---

### <a id="info"></a>info

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
info: () => {
      const container = document.createElement('div');

      container.innerHTML = `
        <code>automaRefData(<i>keyword</i>, <i>path</i>)</code>
        <p class="mt-2">
          Use this function to
          <a href="https://docs.extension.automa.site/workflow/expressions.html" target="_blank" class="underline">
            reference data
          </a>
        </p>
      `;

      return container;
    }
```

---

### <a id="info"></a>info

- **Type**: `object_property_method`
- **Parameters**: ``
- **Description**: *No description provided.*

**Implementation**:
```javascript
info: () => {
      const container = document.createElement('div');

      container.innerHTML = `
        <code>automaRefData(<i>options</i>)</code>
        <p class="mt-2">
          Execute a workflow
        </p>
      `;

      return container;
    }
```

---

