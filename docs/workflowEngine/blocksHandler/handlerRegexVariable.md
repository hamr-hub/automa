# handlerRegexVariable.js

**Path**: `workflowEngine/blocksHandler/handlerRegexVariable.js`

## Methods Summary

| Name | Type | Async | Params |
|------|------|-------|--------|
| [regexVariable](#regexvariable) | function | ✅ | `{}` |

## Detailed Description

### <a id="regexvariable"></a>regexVariable

- **Type**: `function`
- **Parameters**: `{}`
- **Description**: *No description provided.*

**Implementation**:
```javascript
async function regexVariable({ id, data }) {
  const refVariables = this.engine.referenceData.variables;
  const variableExist = objectPath.has(refVariables, data.variableName);

  if (!variableExist) {
    throw new Error(`Cant find "${data.variableName}" variable`);
  }

  const str = objectPath.get(refVariables, data.variableName);
  if (typeof str !== 'string') {
    throw new Error(
      `The value of the "${data.variableName}" variable is not a string/text`
    );
  }

// ...
```

---

